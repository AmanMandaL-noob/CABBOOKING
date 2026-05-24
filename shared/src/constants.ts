export const SOCKET_NAMESPACES = {
  customer: "/customer",
  driver: "/driver"
} as const;

export const SOCKET_ROOMS = {
  ride: (rideId: string) => `ride:${rideId}`,
  driver: (driverId: string) => `driver:${driverId}`
} as const;

export const DRIVER_EVENTS = {
  online: "driver:online",
  offline: "driver:offline",
  locationUpdate: "driver:location:update",
  rideAccept: "ride:accept",
  rideReject: "ride:reject",
  tripStart: "trip:start",
  tripComplete: "trip:complete"
} as const;

export const CUSTOMER_EVENTS = {
  rideCreated: "ride:created",
  driverAssigned: "driver:assigned",
  driverLocation: "driver:location",
  rideStatus: "ride:status"
} as const;

export const RIDE_STATUS = {
  requested: "REQUESTED",
  accepted: "ACCEPTED",
  arriving: "ARRIVING",
  started: "STARTED",
  completed: "COMPLETED",
  rejected: "REJECTED",
  cancelled: "CANCELLED"
} as const;

export const DRIVER_LOCATION_INTERVAL_MS = 5000;
