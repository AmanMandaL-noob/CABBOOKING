"use client";

import { useRouter } from "next/navigation";
import { driverApi } from "../lib/driverApi";
import { useDriverAuthStore } from "../stores/authStore";
import { useDriverStore } from "../stores/driverStore";
import { getDriverSocket } from "../lib/driverSocket";

export function RideRequestPopup() {
  const router = useRouter();
  const user = useDriverAuthStore((state) => state.user);
  const { incomingRide, setIncomingRide, setActiveRide } = useDriverStore();
  if (!incomingRide || !user) return null;

  async function accept() {
    if (!user || !incomingRide) return;
    const ride = await driverApi.acceptRide(user.token, incomingRide.id);
    // Join the ride room immediately after accepting
    getDriverSocket(user.token).emit("ride:join", { rideId: ride.id });
    setActiveRide(ride);
    setIncomingRide(undefined);
    router.push("/active-ride");
  }

  async function reject() {
    if (!user || !incomingRide) return;
    await driverApi.rejectRide(user.token, incomingRide.id);
    setIncomingRide(undefined);
  }

  return (
    <section className="fixed inset-x-4 bottom-4 z-10 rounded-lg border bg-white p-4 shadow-lg md:left-auto md:w-96">
      <h2 className="font-semibold">Incoming ride request</h2>
      <p className="mt-2 text-sm text-slate-600">Pickup: {incomingRide.pickup.lat}, {incomingRide.pickup.lng}</p>
      <div className="mt-4 flex gap-3">
        <button onClick={accept} className="flex-1 rounded-md bg-go px-4 py-3 text-white">Accept</button>
        <button onClick={reject} className="flex-1 rounded-md bg-slate-200 px-4 py-3">Reject</button>
      </div>
    </section>
  );
}
