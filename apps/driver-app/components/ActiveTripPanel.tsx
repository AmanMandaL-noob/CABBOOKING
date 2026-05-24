"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { driverApi } from "../lib/driverApi";
import { useDriverAuthStore } from "../stores/authStore";
import { useDriverStore } from "../stores/driverStore";

export function ActiveTripPanel() {
  const router = useRouter();
  const user = useDriverAuthStore((state) => state.user);
  const { activeRide, setActiveRide } = useDriverStore();
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  if (!user || !activeRide) {
    return (
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-500 font-semibold text-sm">
        No active dispatch job.
      </div>
    );
  }

  const currentUser = user;
  const currentRide = activeRide;

  async function start() {
    setSubmitting(true);
    setError("");
    try {
      const ride = await driverApi.startTrip(currentUser.token, currentRide.id, otp);
      setActiveRide(ride);
      setOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to start trip");
    } finally {
      setSubmitting(false);
    }
  }

  async function complete() {
    setActiveRide(undefined);
    router.push("/dashboard");
  }

  async function completeTripDirectly() {
    setSubmitting(true);
    setError("");
    try {
      const ride = await driverApi.completeTrip(currentUser.token, currentRide.id);
      setActiveRide(ride);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to complete trip");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="rounded-3xl border border-slate-800 bg-slate-950 p-6 shadow-2xl text-slate-100">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h2 className="text-lg font-extrabold tracking-tight text-white flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500"></span>
          </span>
          Active Operations
        </h2>
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Console V1</span>
      </div>

      <div className="mt-6 space-y-4">
        {/* Ride details summary */}
        <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800/80 text-xs text-slate-400 space-y-3">
          <div className="flex justify-between">
            <span className="font-semibold text-slate-500">Status</span>
            <span className="font-extrabold text-blue-400 tracking-wider uppercase">{activeRide.status}</span>
          </div>
          <div className="border-t border-slate-800/60 pt-2 flex flex-col gap-1.5">
            <p>
              📍 <span className="font-semibold text-slate-300">Pickup Coord:</span>{" "}
              <span className="font-mono">{activeRide.pickup.lat.toFixed(5)}, {activeRide.pickup.lng.toFixed(5)}</span>
            </p>
            <p>
              🏁 <span className="font-semibold text-slate-300">Drop Coord:</span>{" "}
              <span className="font-mono">{activeRide.destination.lat.toFixed(5)}, {activeRide.destination.lng.toFixed(5)}</span>
            </p>
          </div>
        </div>

        {/* ACCEPTED State: Driver Heading to Pickup */}
        {activeRide.status === "ACCEPTED" && (
          <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/50 space-y-3.5 shadow-sm text-center">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide">Heading to Pickup</h4>
            <p className="text-[11px] text-slate-400">
              Navigate to the passenger's pickup location coordinates on the map.
            </p>
            <button
              onClick={async () => {
                setSubmitting(true);
                setError("");
                try {
                  const ride = await driverApi.arrive(currentUser.token, currentRide.id);
                  setActiveRide(ride);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Unable to mark as arrived");
                } finally {
                  setSubmitting(false);
                }
              }}
              disabled={submitting}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 text-xs tracking-wide transition-all active:scale-95"
            >
              {submitting ? "Marking..." : "Arrived at Pickup Location"}
            </button>
          </div>
        )}

        {/* ARRIVING State: Driver Arrived at Pickup, Needs start OTP */}
        {activeRide.status === "ARRIVING" && (
          <div className="p-5 border border-slate-800 rounded-2xl bg-slate-900/50 space-y-3.5 shadow-sm">
            <div className="text-center pb-2 border-b border-slate-800">
              <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wide">Arrived at Pickup</h4>
              <p className="text-[10.5px] text-slate-400 mt-1">
                Waiting for passenger. Ask them for their 6-digit **Start Ride OTP** to begin the journey.
              </p>
            </div>
            
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wide mt-2">
              Enter customer start OTP to begin trip
            </label>
            <input
              value={otp}
              onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="6-digit OTP"
              className="w-full text-center font-mono text-lg tracking-widest rounded-xl border border-slate-800 px-4 py-3 bg-slate-950 focus:border-blue-500 focus:outline-none transition-colors font-bold text-white"
            />
            <button
              onClick={start}
              disabled={otp.length !== 6 || submitting}
              className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 text-xs tracking-wide transition-all shadow-md shadow-blue-500/10 active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
            >
              {submitting ? "Verifying Start OTP..." : "Start Trip Operations"}
            </button>
          </div>
        )}

        {/* Started status */}
        {activeRide.status === "STARTED" && (
          <div className="space-y-4">
            <div className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-2xl flex flex-col gap-2 text-center">
              <span className="text-xl">🚖</span>
              <div>
                <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wide">Transit Phase Active</h4>
                <p className="text-[11px] text-slate-400 mt-1">
                  Deliver passenger securely to drop location coordinates. 
                </p>
                <button
                  onClick={completeTripDirectly}
                  disabled={submitting}
                  className="mt-3 w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs tracking-wide transition-all shadow-md active:scale-95"
                >
                  {submitting ? "Completing..." : "Complete Trip (Reached Destination)"}
                </button>
              </div>
            </div>

            <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-2xl text-center">
              <h5 className="text-[11px] font-bold text-rose-400 uppercase tracking-wide">Cancellation Option</h5>
              <p className="text-[10px] text-slate-400 mt-1">
                If the customer wishes to cancel mid-way, share this Cancellation OTP with them:
              </p>
              {activeRide.endOtp && (
                <div className="mt-2.5 bg-slate-900 border border-slate-800 text-white px-4 py-2 rounded-xl font-mono text-base font-black tracking-wider inline-block shadow-inner">
                  {activeRide.endOtp}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Completed status */}
        {activeRide.status === "COMPLETED" && (
          <div className="p-4 bg-emerald-950/20 border border-emerald-900/40 rounded-2xl flex flex-col items-center gap-3 text-center">
            <span className="text-2xl">🎉</span>
            <div>
              <h4 className="text-xs font-bold text-emerald-400 uppercase tracking-wide">Trip completed</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                Fares verified and successfully credited. Return to live queue dashboard.
              </p>
            </div>
            <button
              onClick={complete}
              className="w-full rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 text-xs tracking-wide transition-all shadow-md shadow-emerald-500/10 active:scale-95"
            >
              Return to Active Queue
            </button>
          </div>
        )}

        {/* Cancelled status */}
        {activeRide.status === "CANCELLED" && (
          <div className="p-4 bg-rose-950/20 border border-rose-900/40 rounded-2xl flex flex-col items-center gap-3 text-center">
            <span className="text-2xl">🛑</span>
            <div>
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wide">Trip Cancelled</h4>
              <p className="text-[11px] text-slate-400 mt-1">
                The ride was cancelled mid-way. Return to fleet dashboard.
              </p>
            </div>
            <button
              onClick={complete}
              className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-3 text-xs tracking-wide transition-all shadow-md active:scale-95"
            >
              Return to Dashboard
            </button>
          </div>
        )}

        {error && (
          <p className="mt-3 text-xs font-semibold text-rose-400 bg-rose-950/20 p-2.5 rounded-lg border border-rose-900/40 text-center animate-shake">
            ⚠️ {error}
          </p>
        )}
      </div>
    </section>
  );
}
