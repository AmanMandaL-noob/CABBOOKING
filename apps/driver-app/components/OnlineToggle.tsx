"use client";

import { driverApi } from "../lib/driverApi";
import { emitDriverOffline, emitDriverOnline, startLocationStreaming } from "../lib/driverSocket";
import { useDriverAuthStore } from "../stores/authStore";
import { useDriverStore } from "../stores/driverStore";
import { detectHighPrecisionLocation } from "../lib/locationHelper";

let stopStreaming: (() => void) | undefined;

export function OnlineToggle() {
  const user = useDriverAuthStore((state) => state.user);
  const { isOnline, setOnline, setLiveLocation, activeRide } = useDriverStore();

  async function toggle() {
    if (!user) return;
    if (isOnline) {
      // Stop any active location streaming
      if (stopStreaming) {
        stopStreaming();
        stopStreaming = undefined;
      }
      emitDriverOffline(user.token);
      await driverApi.offline(user.token);
      setOnline(false);
      return;
    }

    const location = await detectHighPrecisionLocation();
    setLiveLocation(location);
    await driverApi.online(user.token, location);
    emitDriverOnline(user.token, location);
    // Stop any previous streaming first
    if (stopStreaming) {
      stopStreaming();
    }
    // Start streaming without rideId (will be handled by active-ride page when a ride is accepted)
    stopStreaming = startLocationStreaming(user.token, undefined, setLiveLocation);
    setOnline(true);
  }

  return (
    <button 
      onClick={toggle} 
      className={`rounded-xl px-5 py-3 font-extrabold text-xs tracking-widest uppercase transition-all duration-300 shadow-md active:scale-95 border ${
        isOnline 
          ? "bg-slate-800 hover:bg-slate-750 border-slate-700/60 text-slate-300 shadow-slate-900/50" 
          : "bg-emerald-600 hover:bg-emerald-500 border-emerald-500 text-white shadow-emerald-500/10"
      }`}
    >
      {isOnline ? "🔴 Switch Offline" : "🟢 Switch Online"}
    </button>
  );
}

