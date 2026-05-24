import { z } from "zod";

const coordinatesSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180)
});

export const bookRideSchema = z.object({
  pickup: coordinatesSchema,
  destination: coordinatesSchema
});

export const rideIdParamsSchema = z.object({
  id: z.string().min(1)
});

export const otpSchema = z.object({
  otp: z.string().regex(/^\d{6}$/, "OTP must be a 6-digit number")
});
