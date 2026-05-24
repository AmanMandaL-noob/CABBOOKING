"use client";

import { CUSTOMER_EVENTS, DriverLocationDto, RideDto, SOCKET_NAMESPACES } from "@cab/shared";
import { io, Socket } from "socket.io-client";

const getSocketUrl = () => {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    if (hostname && hostname !== "localhost" && hostname !== "127.0.0.1") {
      return `http://${hostname}:5000`;
    }
  }
  return process.env.NEXT_PUBLIC_SOCKET_URL ?? "http://localhost:5000";
};

let socket: Socket | undefined;

export function getCustomerSocket(token: string) {
  if (!socket) {
    const socketUrl = getSocketUrl();
    socket = io(`${socketUrl}${SOCKET_NAMESPACES.customer}`, {
      auth: { token },
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });
  }
  return socket;
}

export function subscribeToCustomerRide(
  token: string,
  rideId: string,
  handlers: {
    onDriverAssigned: (ride: RideDto) => void;
    onDriverLocation: (location: DriverLocationDto) => void;
    onRideStatus: (ride: RideDto) => void;
  }
) {
  const client = getCustomerSocket(token);
  client.emit("ride:join", { rideId });
  client.on(CUSTOMER_EVENTS.driverAssigned, handlers.onDriverAssigned);
  client.on(CUSTOMER_EVENTS.driverLocation, handlers.onDriverLocation);
  client.on(CUSTOMER_EVENTS.rideStatus, handlers.onRideStatus);

  return () => {
    client.emit("ride:leave", { rideId });
    client.off(CUSTOMER_EVENTS.driverAssigned, handlers.onDriverAssigned);
    client.off(CUSTOMER_EVENTS.driverLocation, handlers.onDriverLocation);
    client.off(CUSTOMER_EVENTS.rideStatus, handlers.onRideStatus);
  };
}
