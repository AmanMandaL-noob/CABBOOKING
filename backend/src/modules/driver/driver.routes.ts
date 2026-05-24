import { Router } from "express";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { requireAuth } from "../../middlewares/auth.middleware";
import { getDriverHistory, getDriverProfile, setDriverOffline, setDriverOnline } from "./driver.controller";

export const driverRoutes = Router();

driverRoutes.post("/online", requireAuth("driver"), asyncHandler(setDriverOnline));
driverRoutes.post("/offline", requireAuth("driver"), asyncHandler(setDriverOffline));
driverRoutes.get("/profile", requireAuth("driver"), asyncHandler(getDriverProfile));
driverRoutes.get("/history", requireAuth("driver"), asyncHandler(getDriverHistory));
