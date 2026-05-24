import { RIDE_STATUS } from "./constants";

export type UserRole = "customer" | "driver";
export type RideStatus = (typeof RIDE_STATUS)[keyof typeof RIDE_STATUS];

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface GeoPoint {
  type: "Point";
  coordinates: [number, number];
}

export interface VehicleInfo {
  make: string;
  model: string;
  plateNumber: string;
  color?: string;
}

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  token: string;
}

export interface RideDto {
  id: string;
  customerId: string;
  driverId?: string;
  pickup: Coordinates;
  destination: Coordinates;
  status: RideStatus;
  distanceToPickup?: number;
  startOtpRequired?: boolean;
  endOtpRequired?: boolean;
  startOtp?: string;
  endOtp?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DriverLocationDto {
  driverId: string;
  rideId?: string;
  coordinates: Coordinates;
  distanceToPickup?: {
    metres: number;
    kilometres: number;
  };
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface DriverProfileDto {
  id: string;
  name: string;
  email: string;
  phone: string;
  vehicleInfo: VehicleInfo;
  isOnline: boolean;
  createdAt: string;
}
