import { CUSTOMER_EVENTS, RIDE_STATUS, SOCKET_NAMESPACES, SOCKET_ROOMS } from "@cab/shared";
import { Driver } from "../driver/driver.model";
import { DriverLocation } from "./driverLocation.model";
import { Ride } from "../rides/ride.model";
import { getSocketServer } from "../sockets/socket.service";
import { calculateDistance } from "../../utils/distance";
import { HttpError } from "../../utils/httpError";

export async function updateDriverLocation(driverId: string, input: { lat: number; lng: number; rideId?: string }) {
  const point = { type: "Point" as const, coordinates: [input.lng, input.lat] };
  await Promise.all([
    Driver.findByIdAndUpdate(driverId, { currentLocation: point }),
    DriverLocation.findOneAndUpdate({ driverId }, { driverId, coordinates: point, updatedAt: new Date() }, { upsert: true, new: true })
  ]);

  if (!input.rideId) {
    console.log(`[Tracking] Driver ${driverId} location updated (no active ride): [${input.lat}, ${input.lng}]`);
    return { driverId, coordinates: { lat: input.lat, lng: input.lng }, updatedAt: new Date().toISOString() };
  }

  const ride = await Ride.findOne({
    _id: input.rideId,
    driverId,
    status: { $in: [RIDE_STATUS.accepted, RIDE_STATUS.arriving, RIDE_STATUS.started] }
  });

  if (!ride) {
    console.log(`[Tracking] Driver ${driverId} sent location for ride ${input.rideId} but ride not found or not in active status`);
    return { driverId, coordinates: { lat: input.lat, lng: input.lng }, updatedAt: new Date().toISOString() };
  }

  const targetPoint = ride.status === RIDE_STATUS.started ? ride.destination : ride.pickup;
  const targetLat = targetPoint.coordinates[1];
  const targetLng = targetPoint.coordinates[0];
  const distanceToPickup = calculateDistance(input.lat, input.lng, targetLat, targetLng);
  ride.distanceToPickup = distanceToPickup.metres;
  await ride.save();

  const payload = {
    driverId,
    rideId: input.rideId,
    coordinates: { lat: input.lat, lng: input.lng },
    distanceToPickup,
    updatedAt: new Date().toISOString()
  };

  const room = SOCKET_ROOMS.ride(input.rideId);
  console.log(`[Tracking] Emitting driver location to customers in room ${room}: [${input.lat}, ${input.lng}], distance: ${distanceToPickup.kilometres}km`);
  getSocketServer().of(SOCKET_NAMESPACES.customer).to(room).emit(CUSTOMER_EVENTS.driverLocation, payload);
  return payload;
}
