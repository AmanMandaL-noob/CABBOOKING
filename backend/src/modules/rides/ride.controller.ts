import { Request, Response } from "express";
import { RIDE_STATUS } from "@cab/shared";
import { HttpError } from "../../utils/httpError";
import { bookRideSchema, otpSchema, rideIdParamsSchema } from "./ride.validation";
import { acceptRide, cancelRideByCustomerOtp, completeRideByCustomerOtp, createRide, getRideForUser, rejectRide, startRideWithOtp, transitionRide } from "./ride.service";
import { toRideDto } from "./ride.mapper";

export async function bookRide(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "customer") throw new HttpError(403, "Customer access required");
  const input = bookRideSchema.parse(req.body);
  const ride = await createRide(req.auth.id, input.pickup, input.destination);
  return res.status(201).json({ success: true, data: toRideDto(ride) });
}

export async function getRide(req: Request, res: Response) {
  if (!req.auth) throw new HttpError(401, "Authentication required");
  const { id } = rideIdParamsSchema.parse(req.params);
  const ride = await getRideForUser(id, req.auth.id, req.auth.role);
  return res.json({ success: true, data: toRideDto(ride) });
}

export async function acceptRideController(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "driver") throw new HttpError(403, "Driver access required");
  const { id } = rideIdParamsSchema.parse(req.params);
  const ride = await acceptRide(id, req.auth.id);
  return res.json({ success: true, data: toRideDto(ride) });
}

export async function rejectRideController(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "driver") throw new HttpError(403, "Driver access required");
  const { id } = rideIdParamsSchema.parse(req.params);
  await rejectRide(id, req.auth.id);
  return res.json({ success: true, data: { rideId: id } });
}

export async function startTrip(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "driver") throw new HttpError(403, "Driver access required");
  const { id } = rideIdParamsSchema.parse(req.params);
  const { otp } = otpSchema.parse(req.body);
  const ride = await startRideWithOtp(id, req.auth.id, otp);
  return res.json({ success: true, data: toRideDto(ride) });
}

export async function completeTrip(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "driver") throw new HttpError(403, "Driver access required");
  const { id } = rideIdParamsSchema.parse(req.params);
  const ride = await transitionRide(id, req.auth.id, RIDE_STATUS.completed);
  return res.json({ success: true, data: toRideDto(ride) });
}

export async function arriveTripController(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "driver") throw new HttpError(403, "Driver access required");
  const { id } = rideIdParamsSchema.parse(req.params);
  const ride = await transitionRide(id, req.auth.id, RIDE_STATUS.arriving);
  return res.json({ success: true, data: toRideDto(ride) });
}

export async function completeTripByCustomerOtp(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "customer") throw new HttpError(403, "Customer access required");
  const { id } = rideIdParamsSchema.parse(req.params);
  const { otp } = otpSchema.parse(req.body);
  const ride = await completeRideByCustomerOtp(id, req.auth.id, otp);
  return res.json({ success: true, data: toRideDto(ride) });
}

export async function cancelTripByCustomerOtp(req: Request, res: Response) {
  if (!req.auth || req.auth.role !== "customer") throw new HttpError(403, "Customer access required");
  const { id } = rideIdParamsSchema.parse(req.params);
  const { otp } = otpSchema.parse(req.body);
  const ride = await cancelRideByCustomerOtp(id, req.auth.id, otp);
  return res.json({ success: true, data: toRideDto(ride) });
}
