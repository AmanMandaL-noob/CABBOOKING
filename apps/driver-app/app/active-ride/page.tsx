"use client";

import { useEffect } from "react";
import { ActiveTripPanel } from "../../components/ActiveTripPanel";
import { DriverMap } from "../../components/DriverMap";
import { useDriverGuard } from "../../hooks/useDriverGuard";
import { startLocationStreaming, subscribeToActiveRideStatus } from "../../lib/driverSocket";
import { useDriverStore } from "../../stores/driverStore";
import Link from "next/link";

export default function ActiveRidePage() {
  const user = useDriverGuard();
  const { activeRide, liveLocation, setLiveLocation, setActiveRide } = useDriverStore();
  
  // Simulated Target coordinates depending on active ride stage
  const simulateTarget = activeRide?.status === "STARTED" ? activeRide.destination : activeRide?.pickup;

  useEffect(() => {
    if (!user || !activeRide || !simulateTarget) return;
    return startLocationStreaming(user.token, activeRide.id, setLiveLocation, simulateTarget);
  }, [activeRide, setLiveLocation, user, simulateTarget]);

  useEffect(() => {
    if (!user || !activeRide) return;
    return subscribeToActiveRideStatus(user.token, activeRide.id, setActiveRide);
  }, [activeRide, setActiveRide, user]);

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 bg-slate-900 text-slate-100">
      {/* Driver Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <Link href="/dashboard" className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
            ← Back to Fleet Console
          </Link>
          <h1 className="text-2xl font-black tracking-tight mt-1 text-white flex items-center gap-2">
            🚖 Active Ride Operations
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5 uppercase tracking-wide">
            Job ID: <span className="font-mono text-slate-400">{activeRide?.id ?? "Loading..."}</span>
          </p>
        </div>
        {activeRide && (
          <span className="rounded-full bg-blue-500/10 border border-blue-500/25 px-3.5 py-1 text-xs font-bold text-blue-400 uppercase tracking-widest animate-pulse">
            Active Status: {activeRide.status}
          </span>
        )}
      </div>

      {/* Primary Grid */}
      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Navigation Map Card */}
        <div className="rounded-3xl border border-slate-800 bg-slate-950 p-3 shadow-2xl">
          {activeRide && (
            <DriverMap 
              current={liveLocation} 
              pickup={activeRide.pickup} 
              destination={activeRide.destination} 
            />
          )}
        </div>

        {/* Console Panel */}
        <div className="flex flex-col gap-6">
          <ActiveTripPanel />
        </div>
      </div>
    </main>
  );
}
