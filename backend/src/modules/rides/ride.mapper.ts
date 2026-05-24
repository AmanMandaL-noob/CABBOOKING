import { RideDto } from "@cab/shared";
import { RideDocument } from "./ride.model";

export function toRideDto(ride: RideDocument): RideDto {
  return {
    id: ride._id.toString(),
    customerId: ride.customerId.toString(),
    driverId: ride.driverId?.toString(),
    pickup: { lat: ride.pickup.coordinates[1], lng: ride.pickup.coordinates[0] },
    destination: { lat: ride.destination.coordinates[1], lng: ride.destination.coordinates[0] },
    status: ride.status,
    distanceToPickup: ride.distanceToPickup ?? undefined,
    startOtpRequired: Boolean(ride.startOtpHash),
    endOtpRequired: Boolean(ride.endOtpHash),
    startOtp: ride.startOtp ?? undefined,
    endOtp: ride.endOtp ?? undefined,
    createdAt: ride.createdAt.toISOString(),
    updatedAt: ride.updatedAt.toISOString()
  };
}
