import { Request, Response } from "express";
import { Driver } from "./driver.model";
import { onlineSchema } from "./driver.validation";
import { HttpError } from "../../utils/httpError";
import { Ride } from "../rides/ride.model";
import { toRideDto } from "../rides/ride.mapper";

export async function setDriverOnline(req: Request, res: Response) {
  const input = onlineSchema.parse(req.body);
  const update: Record<string, unknown> = { isOnline: true };
  if (input.lat !== undefined && input.lng !== undefined) {
    update.currentLocation = { type: "Point", coordinates: [input.lng, input.lat] };
  }
  await Driver.findByIdAndUpdate(req.auth!.id, update);
  return res.json({ success: true, data: { isOnline: true } });
}

export async function setDriverOffline(req: Request, res: Response) {
  await Driver.findByIdAndUpdate(req.auth!.id, { isOnline: false });
  return res.json({ success: true, data: { isOnline: false } });
}

export async function getDriverProfile(req: Request, res: Response) {
  const driver = await Driver.findById(req.auth!.id);
  if (!driver) throw new HttpError(404, "Driver not found");

  return res.json({
    success: true,
    data: {
      id: driver._id.toString(),
      name: driver.name,
      email: driver.email,
      phone: driver.phone,
      vehicleInfo: driver.vehicleInfo,
      isOnline: driver.isOnline,
      createdAt: driver.createdAt.toISOString()
    }
  });
}

export async function getDriverHistory(req: Request, res: Response) {
  const rides = await Ride.find({ driverId: req.auth!.id }).sort({ updatedAt: -1 }).limit(30);
  return res.json({ success: true, data: rides.map(toRideDto) });
}
