import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { z } from "zod";

const envPath = [path.resolve(process.cwd(), ".env"), path.resolve(process.cwd(), "backend/.env")].find((candidate) =>
  fs.existsSync(candidate)
);

dotenv.config(envPath ? { path: envPath } : undefined);

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  PORT: z.coerce.number().default(5000),
  MONGO_URI: z.string().min(1),
  JWT_SECRET: z.string().min(24),
  JWT_EXPIRES_IN: z.string().default("1d"),
  CORS_ORIGINS: z.string().default("http://localhost:4000,http://localhost:3001"),
  OTP_EXPIRY_MINUTES: z.coerce.number().default(10),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().default(587),
  SMTP_SECURE: z
    .string()
    .optional()
    .transform((value) => value === "true"),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default("no-reply@cabdemo.local")
});

export const env = envSchema.parse(process.env);

export const corsOrigins = env.CORS_ORIGINS.split(",").map((origin) => origin.trim());

export function isAllowedOrigin(origin?: string) {
  if (!origin) return true;
  if (corsOrigins.includes(origin)) return true;

  if (env.NODE_ENV === "development") {
    return /^http:\/\/(localhost|127\.0\.0\.1|\[::1\]):\d+$/.test(origin) || /^http:\/\/192\.168\.\d{1,3}\.\d{1,3}:\d+$/.test(origin);
  }

  return false;
}

export function corsOriginDelegate(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
  callback(isAllowedOrigin(origin) ? null : new Error(`CORS blocked origin: ${origin}`), true);
}
