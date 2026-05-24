import { CUSTOMER_EVENTS, DRIVER_EVENTS, RIDE_STATUS, RideStatus, SOCKET_NAMESPACES, SOCKET_ROOMS } from "@cab/shared";
import { getSocketServer } from "../sockets/socket.service";
import { Driver } from "../driver/driver.model";
import { Customer } from "../customer/customer.model";
import { Ride } from "./ride.model";
import { toRideDto } from "./ride.mapper";
import { HttpError } from "../../utils/httpError";
import { env } from "../../config/env";
import { sendMail } from "../notifications/mail.service";
import { generateOtp, hashOtp, verifyOtp } from "../../utils/otp";

function toPoint(input: { lat: number; lng: number }) {
  return { type: "Point" as const, coordinates: [input.lng, input.lat] };
}

export async function createRide(customerId: string, pickup: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  const ride = await Ride.create({
    customerId,
    pickup: toPoint(pickup),
    destination: toPoint(destination),
    status: RIDE_STATUS.requested
  });

  const io = getSocketServer();
  io.of(SOCKET_NAMESPACES.customer).to(SOCKET_ROOMS.ride(ride._id.toString())).emit(CUSTOMER_EVENTS.rideCreated, toRideDto(ride));

  const nearbyDrivers = await Driver.find({
    isOnline: true,
    currentLocation: {
      $near: {
        $geometry: toPoint(pickup),
        $maxDistance: 40000000 // 40,000 km (enables matching anywhere on Earth for this demo)
      }
    }
  }).limit(10);

  nearbyDrivers.forEach((driver) => {
    io.of(SOCKET_NAMESPACES.driver)
      .to(SOCKET_ROOMS.driver(driver._id.toString()))
      .emit(CUSTOMER_EVENTS.rideCreated, toRideDto(ride));
  });

  return ride;
}

export async function acceptRide(rideId: string, driverId: string) {
  const ride = await Ride.findOneAndUpdate(
    { _id: rideId, status: RIDE_STATUS.requested },
    { driverId, status: RIDE_STATUS.accepted },
    { new: true }
  );

  if (!ride) throw new HttpError(409, "Ride is no longer available");

  const customer = await Customer.findById(ride.customerId);
  if (!customer?.email) throw new HttpError(404, "Customer email not found for OTP delivery");

  const startOtp = generateOtp();
  ride.startOtpHash = await hashOtp(startOtp);
  ride.startOtpExpiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);
  ride.startOtp = startOtp;
  ride.endOtpHash = undefined;
  ride.endOtpExpiresAt = undefined;
  ride.endOtp = undefined;
  await ride.save();

  await sendMail({
    to: customer.email,
    subject: "Your ride start OTP",
    text: `Your cab start OTP is ${startOtp}. Share this with your driver to start the trip. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`
  });

  const dto = toRideDto(ride);
  const customerNs = getSocketServer().of(SOCKET_NAMESPACES.customer);
  customerNs.to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.driverAssigned, dto);
  customerNs.to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  return ride;
}

export async function rejectRide(rideId: string, driverId: string) {
  getSocketServer().of(SOCKET_NAMESPACES.driver).to(SOCKET_ROOMS.driver(driverId)).emit(DRIVER_EVENTS.rideReject, { rideId });
}

export async function startRideWithOtp(rideId: string, driverId: string, otp: string) {
  console.log("[DEBUG] startRideWithOtp parameters:", { rideId, driverId, otp });
  const rawRide = await Ride.findById(rideId);
  console.log("[DEBUG] Found raw ride by ID:", rawRide ? {
    id: rawRide._id,
    driverId: rawRide.driverId,
    status: rawRide.status,
    startOtpHash: rawRide.startOtpHash ? "present" : "absent",
    startOtp: rawRide.startOtp
  } : "NOT FOUND");

  const ride = await Ride.findOne({
    _id: rideId,
    driverId,
    status: { $in: [RIDE_STATUS.accepted, RIDE_STATUS.arriving] }
  });
  if (!ride) {
    console.log("[DEBUG] Query failed. Params criteria not met.");
    throw new HttpError(404, "Ride not found for this driver");
  }
  if (!ride.startOtpHash || !ride.startOtpExpiresAt || ride.startOtpExpiresAt.getTime() < Date.now()) {
    throw new HttpError(410, "Start OTP expired. Ask support to resend OTP.");
  }

  const matchesOtp = await verifyOtp(otp, ride.startOtpHash);
  if (!matchesOtp) throw new HttpError(400, "Invalid start OTP");

  const driver = await Driver.findById(driverId);
  if (!driver?.email) throw new HttpError(404, "Driver email not found for OTP delivery");

  const endOtp = generateOtp();
  const endOtpHash = await hashOtp(endOtp);
  const endOtpExpiresAt = new Date(Date.now() + env.OTP_EXPIRY_MINUTES * 60_000);

  await sendMail({
    to: driver.email,
    subject: "Your ride cancellation OTP",
    text: `Your ride cancellation OTP is ${endOtp}. Share this with the customer if they wish to cancel the ride mid-way. It expires in ${env.OTP_EXPIRY_MINUTES} minutes.`
  });

  ride.status = RIDE_STATUS.started;
  ride.startOtpHash = undefined;
  ride.startOtpExpiresAt = undefined;
  ride.startOtp = undefined;
  ride.endOtpHash = endOtpHash;
  ride.endOtpExpiresAt = endOtpExpiresAt;
  ride.endOtp = endOtp;
  await ride.save();

  const dto = toRideDto(ride);
  getSocketServer().of(SOCKET_NAMESPACES.customer).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  getSocketServer().of(SOCKET_NAMESPACES.driver).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  return ride;
}

export async function completeRideByCustomerOtp(rideId: string, customerId: string, otp: string) {
  const ride = await Ride.findOne({ _id: rideId, customerId, status: RIDE_STATUS.started });
  if (!ride) throw new HttpError(404, "Ride not found for this customer");
  if (!ride.endOtpHash || !ride.endOtpExpiresAt || ride.endOtpExpiresAt.getTime() < Date.now()) {
    throw new HttpError(410, "Completion OTP expired. Driver can request a new OTP.");
  }

  const matchesOtp = await verifyOtp(otp, ride.endOtpHash);
  if (!matchesOtp) throw new HttpError(400, "Invalid completion OTP");

  ride.status = RIDE_STATUS.completed;
  ride.endOtpHash = undefined;
  ride.endOtpExpiresAt = undefined;
  await ride.save();

  const dto = toRideDto(ride);
  getSocketServer().of(SOCKET_NAMESPACES.customer).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  getSocketServer().of(SOCKET_NAMESPACES.driver).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  return ride;
}

export async function cancelRideByCustomerOtp(rideId: string, customerId: string, otp: string) {
  const ride = await Ride.findOne({ _id: rideId, customerId, status: RIDE_STATUS.started });
  if (!ride) throw new HttpError(404, "Ride not found for this customer");
  if (!ride.endOtpHash || !ride.endOtpExpiresAt || ride.endOtpExpiresAt.getTime() < Date.now()) {
    throw new HttpError(410, "Cancellation OTP expired. Driver can request a new OTP.");
  }

  const matchesOtp = await verifyOtp(otp, ride.endOtpHash);
  if (!matchesOtp) throw new HttpError(400, "Invalid cancellation OTP");

  ride.status = RIDE_STATUS.cancelled;
  ride.endOtpHash = undefined;
  ride.endOtpExpiresAt = undefined;
  ride.endOtp = undefined;
  await ride.save();

  const dto = toRideDto(ride);
  getSocketServer().of(SOCKET_NAMESPACES.customer).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  getSocketServer().of(SOCKET_NAMESPACES.driver).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  return ride;
}

export async function transitionRide(rideId: string, driverId: string, status: RideStatus) {
  const ride = await Ride.findOneAndUpdate({ _id: rideId, driverId }, { status, endOtpHash: undefined, endOtpExpiresAt: undefined }, { new: true });
  if (!ride) throw new HttpError(404, "Ride not found for this driver");

  const dto = toRideDto(ride);
  getSocketServer().of(SOCKET_NAMESPACES.customer).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  getSocketServer().of(SOCKET_NAMESPACES.driver).to(SOCKET_ROOMS.ride(rideId)).emit(CUSTOMER_EVENTS.rideStatus, dto);
  return ride;
}

export async function getRideForUser(rideId: string, userId: string, role: "customer" | "driver") {
  const query = role === "customer" ? { _id: rideId, customerId: userId } : { _id: rideId, driverId: userId };
  const ride = await Ride.findOne(query);
  if (!ride) throw new HttpError(404, "Ride not found");
  return ride;
}

export async function getDriverRideHistory(driverId: string) {
  return Ride.find({ driverId }).sort({ updatedAt: -1 }).limit(30);
}
