import { Server } from "socket.io";
import { CUSTOMER_EVENTS, DRIVER_EVENTS, RIDE_STATUS, SOCKET_NAMESPACES, SOCKET_ROOMS } from "@cab/shared";
import { Driver } from "../driver/driver.model";
import { acceptRide, rejectRide, startRideWithOtp, transitionRide } from "../rides/ride.service";
import { updateDriverLocation } from "../tracking/tracking.service";
import { socketAuth } from "./socket.auth";
import { Ride } from "../rides/ride.model";
import { toRideDto } from "../rides/ride.mapper";

export function registerDriverNamespace(io: Server) {
  const driverNs = io.of(SOCKET_NAMESPACES.driver);
  driverNs.use(socketAuth("driver"));

  driverNs.on("connection", (socket) => {
    const driverId = socket.data.user.id;
    console.log(`[Socket] Driver ${driverId} connected to /driver namespace`);
    socket.join(SOCKET_ROOMS.driver(driverId));

    socket.on(DRIVER_EVENTS.online, async (payload?: { lat?: number; lng?: number }) => {
      try {
        const update: Record<string, unknown> = { isOnline: true };
        let coordinates = [77.209, 28.6139]; // Default New Delhi seed
        if (payload?.lat !== undefined && payload.lng !== undefined) {
          coordinates = [payload.lng, payload.lat];
          update.currentLocation = { type: "Point", coordinates };
        }
        await Driver.findByIdAndUpdate(driverId, update);
        console.log(`[Socket] Driver ${driverId} came online at [${coordinates[1]}, ${coordinates[0]}]`);

        // Match this newly online driver immediately to any active unassigned "REQUESTED" rides nearby
        const activeRequestedRide = await Ride.findOne({
          status: RIDE_STATUS.requested,
          createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }, // Only match rides created in the last 5 minutes
          pickup: {
            $near: {
              $geometry: { type: "Point", coordinates },
              $maxDistance: 40000000 // 40,000 km (enables matching anywhere on Earth)
            }
          }
        });

        if (activeRequestedRide) {
          console.log(`[Socket] Emitting ride ${activeRequestedRide._id} to driver ${driverId}`);
          socket.emit(CUSTOMER_EVENTS.rideCreated, toRideDto(activeRequestedRide));
        }
      } catch (err) {
        console.error("Error in driver online socket event:", err);
      }
    });

    socket.on(DRIVER_EVENTS.offline, async () => {
      try {
        await Driver.findByIdAndUpdate(driverId, { isOnline: false });
        console.log(`[Socket] Driver ${driverId} went offline`);
      } catch (err) {
        console.error("Error in driver offline socket event:", err);
      }
    });

    socket.on(DRIVER_EVENTS.locationUpdate, async (payload: { lat: number; lng: number; rideId?: string }) => {
      try {
        const result = await updateDriverLocation(driverId, payload);
        if (payload.rideId) {
          console.log(`[Socket] Driver ${driverId} location updated for ride ${payload.rideId}: [${result.coordinates.lat}, ${result.coordinates.lng}]`);
        }
      } catch (err) {
        console.error("Error in driver locationUpdate socket event:", err);
      }
    });

    socket.on(DRIVER_EVENTS.rideAccept, async ({ rideId }: { rideId: string }) => {
      try {
        await acceptRide(rideId, driverId);
        socket.join(SOCKET_ROOMS.ride(rideId));
        console.log(`[Socket] Driver ${driverId} accepted ride ${rideId} and joined room`);
      } catch (err) {
        console.error("Error in driver rideAccept socket event:", err);
      }
    });

    socket.on(DRIVER_EVENTS.rideReject, async ({ rideId }: { rideId: string }) => {
      try {
        await rejectRide(rideId, driverId);
        console.log(`[Socket] Driver ${driverId} rejected ride ${rideId}`);
      } catch (err) {
        console.error("Error in driver rideReject socket event:", err);
      }
    });

    socket.on(DRIVER_EVENTS.tripStart, async ({ rideId, otp }: { rideId: string; otp: string }) => {
      try {
        await startRideWithOtp(rideId, driverId, otp);
        console.log(`[Socket] Driver ${driverId} started trip ${rideId}`);
      } catch (err) {
        console.error("Error in driver tripStart socket event:", err);
      }
    });

    socket.on(DRIVER_EVENTS.tripComplete, async ({ rideId }: { rideId: string }) => {
      try {
        await transitionRide(rideId, driverId, RIDE_STATUS.completed);
        socket.leave(SOCKET_ROOMS.ride(rideId));
        console.log(`[Socket] Driver ${driverId} completed trip ${rideId}`);
      } catch (err) {
        console.error("Error in driver tripComplete socket event:", err);
      }
    });

    socket.on("ride:join", async ({ rideId }: { rideId: string }) => {
      try {
        const ride = await Ride.exists({ _id: rideId, driverId });
        if (ride) {
          socket.join(SOCKET_ROOMS.ride(rideId));
          console.log(`[Socket] Driver ${driverId} joined ride room ${rideId}`);
        } else {
          console.log(`[Socket] Driver ${driverId} cannot join ride ${rideId} - ride not found or not assigned to driver`);
        }
      } catch (err) {
        console.error("Error in driver ride:join socket event:", err);
      }
    });

    socket.on("ride:leave", ({ rideId }: { rideId: string }) => {
      try {
        socket.leave(SOCKET_ROOMS.ride(rideId));
        console.log(`[Socket] Driver ${driverId} left ride room ${rideId}`);
      } catch (err) {
        console.error("Error in driver ride:leave socket event:", err);
      }
    });

    socket.on("disconnect", async () => {
      try {
        await Driver.findByIdAndUpdate(driverId, { isOnline: false });
        console.log(`[Socket] Driver ${driverId} disconnected from /driver namespace`);
      } catch (err) {
        console.error("Error in driver disconnect:", err);
      }
    });
  });
}
