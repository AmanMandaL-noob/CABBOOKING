"use client";

import { CUSTOMER_EVENTS, DRIVER_EVENTS, DRIVER_LOCATION_INTERVAL_MS, RideDto, SOCKET_NAMESPACES } from "@cab/shared";
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
let socketToken: string | undefined;

export function getDriverSocket(token: string) {
  if (socket && socketToken !== token) {
    socket.disconnect();
    socket = undefined;
  }

  if (!socket) {
    const socketUrl = getSocketUrl();
    socket = io(`${socketUrl}${SOCKET_NAMESPACES.driver}`, {
      auth: { token },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      transports: ["websocket", "polling"]
    });
    socketToken = token;
  }
  return socket;
}

export function disconnectDriverSocket() {
  socket?.disconnect();
  socket = undefined;
  socketToken = undefined;
}

export function subscribeToRideRequests(token: string, onRide: (ride: RideDto) => void) {
  const client = getDriverSocket(token);
  client.on(CUSTOMER_EVENTS.rideCreated, onRide);
  return () => {
    client.off(CUSTOMER_EVENTS.rideCreated, onRide);
  };
}

export function subscribeToActiveRideStatus(token: string, rideId: string, onRideStatus: (ride: RideDto) => void) {
  const client = getDriverSocket(token);
  client.emit("ride:join", { rideId });
  client.on(CUSTOMER_EVENTS.rideStatus, onRideStatus);
  return () => {
    client.emit("ride:leave", { rideId });
    client.off(CUSTOMER_EVENTS.rideStatus, onRideStatus);
  };
}

export function emitDriverOnline(token: string, location?: { lat: number; lng: number }) {
  getDriverSocket(token).emit(DRIVER_EVENTS.online, location);
}

export function emitDriverOffline(token: string) {
  getDriverSocket(token).emit(DRIVER_EVENTS.offline);
}

import { detectHighPrecisionLocation } from "./locationHelper";

let lastSimulatedLoc: { lat: number; lng: number } | null = null;

export function startLocationStreaming(
  token: string, 
  rideId?: string, 
  onLocation?: (location: { lat: number; lng: number }) => void,
  simulateTarget?: { lat: number; lng: number }
) {
  const client = getDriverSocket(token);
  const tick = async () => {
    try {
      let location = await detectHighPrecisionLocation();
      
      if (simulateTarget) {
        if (!lastSimulatedLoc) {
          lastSimulatedLoc = location;
        } else {
          const stepLat = (simulateTarget.lat - lastSimulatedLoc.lat) * 0.08;
          const stepLng = (simulateTarget.lng - lastSimulatedLoc.lng) * 0.08;
          if (Math.abs(stepLat) > 0.00001 || Math.abs(stepLng) > 0.00001) {
            lastSimulatedLoc = {
              lat: lastSimulatedLoc.lat + stepLat,
              lng: lastSimulatedLoc.lng + stepLng
            };
          } else {
            lastSimulatedLoc = simulateTarget;
          }
        }
        location = lastSimulatedLoc;
      } else {
        lastSimulatedLoc = null;
      }

      onLocation?.(location);
      client.emit(DRIVER_EVENTS.locationUpdate, { ...location, rideId });
    } catch (err) {
      console.error("Location streaming tick error:", err);
    }
  };
  tick();
  const timer = window.setInterval(tick, DRIVER_LOCATION_INTERVAL_MS);
  return () => {
    window.clearInterval(timer);
    lastSimulatedLoc = null;
  };
}
