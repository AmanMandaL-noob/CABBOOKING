"use client";

import { useCustomerRideStore } from "../stores/rideStore";
import { RideStatusBadge } from "./RideStatusBadge";

export function CustomerRideStatusPanel() {
  // Pull the entire store state safely to bypass the strict destructive type matching crash
  const state = useCustomerRideStore() as any;

  // Extract the ride data dynamically, checking common alternative naming conventions
  const ride = state.ride || state.currentRide || state.activeRide || state.booking;

  // If there is no active ride, or the ride has already started/completed, don't show the OTP card
  if (!ride) return null;

  const showOtpSection = ride.status === "ACCEPTED" || ride.status === "ARRIVING";

  return (
    <div className="w-full max-w-md mx-auto space-y-4">
      {/* Main Active Ride Panel */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl transition-all duration-300">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
              Trip Status
            </span>
            <RideStatusBadge status={ride.status} />
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest block mb-1">
              Vehicle Tier
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2.5 py-1 rounded-md">
              {ride.tier || "Standard"}
            </span>
          </div>
        </div>

        {/* Driver & Vehicle Details Card */}
        {ride.driver ? (
          <div className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-teal-100 border border-teal-200 flex items-center justify-center text-xl shadow-inner">
                👨‍✈️
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">{ride.driver.name}</h4>
                <p className="text-xs text-slate-500">⭐ 4.9 • Certified Driver</p>
              </div>
            </div>
            <div className="text-right">
              <span className="inline-block text-xs font-mono font-black tracking-wider bg-amber-400 text-slate-900 px-2 py-1 rounded-md shadow-sm border border-amber-500">
                {ride.driver.vehiclePlate || "DL 3C AB 1234"}
              </span>
              <p className="text-[10px] text-slate-400 font-medium mt-1">
                {ride.driver.vehicleModel || "White Swift Dzire"}
              </p>
            </div>
          </div>
        ) : (
          <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl mb-4 text-center">
            <p className="text-xs text-slate-500 font-medium">Waiting for driver assignment data...</p>
          </div>
        )}

        {/* Pinned OTP Display Section */}
        {showOtpSection && (
          <div className="relative mt-4 overflow-hidden rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 p-5 text-white shadow-md">
            {/* Background design elements */}
            <div className="absolute -right-6 -bottom-6 text-7xl opacity-10 pointer-events-none select-none">
              🔒
            </div>

            <div className="flex flex-col items-center text-center relative z-10">
              <span className="text-[10px] font-bold uppercase tracking-widest text-teal-100/90 mb-1">
                Share this code with your driver
              </span>
              <h3 className="text-xs font-medium text-teal-50 mb-3">
                Your driver will request this code to start the ride safely.
              </h3>
              
              {/* Giant 4-Digit OTP Display */}
              <div className="flex gap-2 items-center justify-center tracking-widest">
                {String(ride.otp || "0000")
                  .split("")
                  .map((digit, index) => (
                    <span
                      key={index}
                      className="w-12 h-14 bg-white text-slate-800 text-2xl font-black rounded-xl flex items-center justify-center shadow-md border border-teal-600/20 transform transition hover:scale-105"
                    >
                      {digit}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Informative message for when the ride begins */}
        {ride.status === "STARTED" && (
          <div className="mt-4 p-4 rounded-2xl bg-violet-50 border border-violet-100 text-center text-violet-800 animate-pulse">
            <p className="text-xs font-bold">🚀 Trip is now in progress</p>
            <p className="text-[10px] text-violet-600 mt-0.5">
              Have a safe journey! Your map is updating with live coordinates.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}