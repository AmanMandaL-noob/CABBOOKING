import { Request, Response } from "express";
import { updateLocationSchema } from "./tracking.validation";
import { updateDriverLocation } from "./tracking.service";

export async function updateLocation(req: Request, res: Response) {
  const input = updateLocationSchema.parse(req.body);
  const data = await updateDriverLocation(req.auth!.id, input);
  return res.json({ success: true, data });
}
