import { z } from "zod";

export const customerRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8)
});

export const customerLoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const driverLoginSchema = z.object({
  phone: z.string().min(7),
  password: z.string().min(1)
});

export const driverRegisterSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7),
  password: z.string().min(8),
  vehicleInfo: z.object({
    make: z.string().min(1),
    model: z.string().min(1),
    plateNumber: z.string().min(3),
    color: z.string().optional()
  })
});
