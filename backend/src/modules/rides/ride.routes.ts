import { Router } from "express";
import { requireAuth } from "../../middlewares/auth.middleware";
import { asyncHandler } from "../../middlewares/asyncHandler";
import { acceptRideController, arriveTripController, bookRide, cancelTripByCustomerOtp, completeTrip, completeTripByCustomerOtp, getRide, rejectRideController, startTrip } from "./ride.controller";

export const rideRoutes = Router();

rideRoutes.post("/book", requireAuth("customer"), asyncHandler(bookRide));
rideRoutes.get("/:id", requireAuth(), asyncHandler(getRide));
rideRoutes.post("/:id/accept", requireAuth("driver"), asyncHandler(acceptRideController));
rideRoutes.post("/:id/arrive", requireAuth("driver"), asyncHandler(arriveTripController));
rideRoutes.post("/:id/reject", requireAuth("driver"), asyncHandler(rejectRideController));
rideRoutes.post("/:id/start", requireAuth("driver"), asyncHandler(startTrip));
rideRoutes.post("/:id/complete", requireAuth("driver"), asyncHandler(completeTrip));
rideRoutes.post("/:id/complete-by-customer", requireAuth("customer"), asyncHandler(completeTripByCustomerOtp));
rideRoutes.post("/:id/cancel-by-customer", requireAuth("customer"), asyncHandler(cancelTripByCustomerOtp));
