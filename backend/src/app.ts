import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import { corsOriginDelegate } from "./config/env";
import { authRoutes } from "./modules/auth/auth.routes";
import { driverRoutes } from "./modules/driver/driver.routes";
import { rideRoutes } from "./modules/rides/ride.routes";
import { trackingRoutes } from "./modules/tracking/tracking.routes";
import { errorMiddleware } from "./middlewares/error.middleware";

export const app = express();

app.use(cors({ origin: corsOriginDelegate, credentials: true }));
app.use(express.json());
app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/", (_req, res) => res.json({ success: true, data: { message: "CAB Booking API", version: "1.0.0", health: "ok" } }));
app.get("/health", (_req, res) => res.json({ success: true, data: { status: "ok" } }));

app.use("/api/auth", authRoutes);
app.use("/api/driver", driverRoutes);
app.use("/api/rides", rideRoutes);
app.use("/api/tracking", trackingRoutes);

app.use(errorMiddleware);
