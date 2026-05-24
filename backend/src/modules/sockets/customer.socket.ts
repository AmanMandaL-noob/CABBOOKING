import { Server } from "socket.io";
import { SOCKET_NAMESPACES, SOCKET_ROOMS } from "@cab/shared";
import { Ride } from "../rides/ride.model";
import { socketAuth } from "./socket.auth";

export function registerCustomerNamespace(io: Server) {
  const customerNs = io.of(SOCKET_NAMESPACES.customer);
  customerNs.use(socketAuth("customer"));

  customerNs.on("connection", (socket) => {
    const customerId = socket.data.user.id;
    console.log(`[Socket] Customer ${customerId} connected to /customer namespace`);

    socket.on("ride:join", async ({ rideId }: { rideId: string }) => {
      try {
        const ride = await Ride.exists({ _id: rideId, customerId });
        if (ride) {
          socket.join(SOCKET_ROOMS.ride(rideId));
          console.log(`[Socket] Customer ${customerId} joined ride room ${rideId}`);
        } else {
          console.log(`[Socket] Customer ${customerId} cannot join ride ${rideId} - ride not found or not owned by customer`);
        }
      } catch (err) {
        console.error(`[Socket] Error in customer ride:join for ride ${rideId}:`, err);
      }
    });

    socket.on("ride:leave", ({ rideId }: { rideId: string }) => {
      try {
        socket.leave(SOCKET_ROOMS.ride(rideId));
        console.log(`[Socket] Customer ${customerId} left ride room ${rideId}`);
      } catch (err) {
        console.error(`[Socket] Error in customer ride:leave for ride ${rideId}:`, err);
      }
    });

    socket.on("disconnect", () => {
      console.log(`[Socket] Customer ${customerId} disconnected from /customer namespace`);
    });
  });
}

