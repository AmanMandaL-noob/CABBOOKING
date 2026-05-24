import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { updateLocation } from "./tracking.controller";

export const trackingRoutes = Router();

trackingRoutes.post("/location", requireAuth("driver"), asyncHandler(updateLocation));
