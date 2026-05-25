"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { CustomerTrackingMap } from "../../../components/CustomerTrackingMap";
import { LiveTracking } from "../../../components/LiveTracking";
import { RideStatusBadge } from "../../../components/RideStatusBadge";
import { CaptainDetails } from "../../../components/CaptainDetails";
import { LookingForDriver } from "../../../components/LookingForDriver";
import { WaitingForDriver } from "../../../components/WaitingForDriver";
import { FinishRide } from "../../../components/FinishRide";
import { useCustomerGuard } from "../../../hooks/useCustomerGuard";
import { customerApi } from "../../../lib/customerApi";
import { subscribeToCustomerRide } from "../../../lib/customerSocket";
import { useCustomerRideStore } from "../../../stores/rideStore";
import Link from "next/link";

const steps = [
  { label: "Requested", desc: "Finding driver" },
  { label: "Accepted", desc: "Driver assigned" },
  { label: "Driver Arriving", desc: "On the way" },
  { label: "Trip Started", desc: "Heading to destination" },
  { label: "Completed", desc: "Arrived safe" }
];

const getStepIndex = (status?: string): number => {
  switch (status) {
    case "REQUESTED":
      return 0;
    case "ACCEPTED":
      return 1;
    case "ARRIVING":
      return 2;
    case "STARTED":
      return 3;
    case "COMPLETED":
      return 4;
    default:
      return 0;
  }
};

export default function RidePage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useCustomerGuard();
  const { currentRide, latestDriverLocation, setRide, setDriverLocation } = useCustomerRideStore();
  const [completionOtp, setCompletionOtp] = useState("");
  const [completing, setCompleting] = useState(false);
  const [error, setError] = useState("");
  const [mapView, setMapView] = useState<"driver" | "live">("driver");

  // Bypass the internal React element workspace mismatch for building
  const MapComponent = CustomerTrackingMap as any;

  useEffect(() => {
    if (!user || !params.id) return;
    customerApi.getRide(user.token, params.id).then(setRide).catch(console.error);
    return subscribeToCustomerRide(user.token, params.id, {
      onDriverAssigned: setRide,
      onDriverLocation: setDriverLocation,
      onRideStatus: setRide
    });
  }, [params.id, setDriverLocation, setRide, user]);

  const pickup = currentRide?.pickup;
  const driver = latestDriverLocation?.coordinates;
  const distanceLabel = currentRide?.status === "STARTED" ? "Driver distance to destination" : "Driver distance from pickup";

  async function cancelRide() {
    if (!user || !currentRide) return;
    setCompleting(true);
    setError("");
    try {
      const ride = await customerApi.completeRideWithOtp(user.token, currentRide.id, completionOtp);
      setRide(ride);
      setCompletionOtp("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to cancel ride");
    } finally {
      setCompleting(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-4 py-8 bg-slate-50/20">
      {/* Top Header Panel */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard" className="text-xs font-bold text-teal-600 hover:text-teal-700 transition-colors uppercase tracking-wider">
              ← Back to Dashboard
            </Link>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">Live Journey Tracking</h1>
          <p className="text-xs font-semibold text-slate-400 mt-0.5 uppercase tracking-wide">
            Ride Request ID: <span className="font-mono text-slate-500">{params.id}</span>
          </p>
        </div>
        {currentRide && <RideStatusBadge status={currentRide.status} />}
      </div>

      {/* Journey Stepper Card */}
      {currentRide && (
        <div className="mb-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300">
          <div className="flex flex-col md:flex-row justify-between gap-6 md:gap-4 relative">
            {steps.map((step, idx) => {
              const currentStepIdx = getStepIndex(currentRide.status);
              const isCompleted = currentStepIdx > idx || currentRide.status === "COMPLETED";
              const isActive = currentStepIdx === idx;
              const isCancelled = currentRide.status === "CANCELLED" || currentRide.status === "REJECTED";

              return (
                <div key={idx} className="flex-1 flex flex-row md:flex-col items-center gap-4 relative">
                  {/* Horizontal Connection Line for desktop */}
                  {idx < steps.length - 1 && (
                    <div className="hidden md:block absolute top-[20px] left-[calc(50%+20px)] right-[calc(-50%+20px)] h-[3px] bg-slate-100 z-0">
                      <div 
                        className={`h-full transition-all duration-500 ease-in-out bg-teal-500`}
                        style={{ width: isCompleted ? "100%" : "0%" }}
                      />
                    </div>
                  )}

                  {/* Vertical Connection Line for mobile */}
                  {idx < steps.length - 1 && (
                    <div className="md:hidden absolute top-[40px] left-[20px] bottom-[-24px] w-[3px] bg-slate-100 z-0">
                      <div 
                        className={`w-full transition-all duration-500 ease-in-out bg-teal-500`}
                        style={{ height: isCompleted ? "100%" : "0%" }}
                      />
                    </div>
                  )}

                  {/* Step Bubble */}
                  <div 
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-black border-2 transition-all duration-300 z-10 ${
                      isCancelled
                        ? "bg-rose-50 border-rose-200 text-rose-600"
                        : isCompleted
                        ? "bg-teal-500 border-teal-500 text-white shadow-md shadow-teal-100"
                        : isActive
                        ? "bg-teal-5 border-teal-500 text-teal-600 ring-4 ring-teal-100 animate-pulse"
                        : "bg-slate-50 border-slate-200 text-slate-400"
                    }`}
                  >
                    {isCancelled ? "✕" : isCompleted ? "✓" : idx + 1}
                  </div>

                  {/* Labels */}
                  <div className="flex flex-col md:items-center md:text-center">
                    <span className={`text-xs font-black tracking-tight ${
                      isCancelled ? "text-rose-900" : isActive ? "text-teal-600" : isCompleted ? "text-slate-800" : "text-slate-400"
                    }`}>
                      {step.label}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400 mt-0.5 max-w-[150px]">
                      {isCancelled ? "Trip cancelled" : step.desc}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
        {/* Map Viewport Card */}
        <div className="rounded-3xl border border-slate-200 bg-white p-3 shadow-md">
          {/* Map View Toggle */}
          <div className="flex gap-2 mb-3">
            <button
              onClick={() => setMapView("driver")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mapView === "driver"
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Driver Tracking
            </button>
            <button
              onClick={() => setMapView("live")}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                mapView === "live"
                  ? "bg-teal-500 text-white shadow-md"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Live Location
            </button>
          </div>

          {mapView === "driver" ? (
            <>
              {pickup && (
                <MapComponent 
                  pickup={pickup} 
                  driver={driver} 
                  destination={currentRide?.destination} 
                />
              )}
            </>
          ) : (
            <>
              {user && params.id && (
                <LiveTracking 
                  rideId={params.id}
                />
              )}
            </>
          )}
        </div>

        {/* Live Journey Panel */}
        <section className="flex flex-col rounded-3xl border border-slate-200 bg-white p-6 shadow-lg h-fit">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h2 className="text-lg font-extrabold text-slate-800 tracking-tight flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500"></span>
              </span>
              Journey Status
            </h2>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Live Updates</span>
          </div>

          {/* Location details */}
          <div className="mt-6 space-y-4">
            <div className="flex justify-between items-center text-xs border-b border-slate-50 pb-3">
              <span className="font-semibold text-slate-400">{distanceLabel}</span>
              <span className="font-black text-sm text-slate-800">
                {latestDriverLocation?.distanceToPickup !== undefined
                  ? `${latestDriverLocation.distanceToPickup.kilometres.toFixed(2)} km`
                  : "-- km"}
              </span>
            </div>

            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-600 space-y-2">
              <div className="flex items-start gap-2.5">
                <span className="text-emerald-500 font-bold">📍 Pickup:</span>
                <span className="font-medium text-slate-700">
                  {pickup?.lat.toFixed(5)}, {pickup?.lng.toFixed(5)}
                </span>
              </div>
              {currentRide?.destination && (
                <div className="flex items-start gap-2.5 pt-2 border-t border-slate-200/50">
                  <span className="text-rose-500 font-bold">🏁 Drop:</span>
                  <span className="font-medium text-slate-700">
                    {currentRide.destination.lat.toFixed(5)}, {currentRide.destination.lng.toFixed(5)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {currentRide?.status === "REQUESTED" && (
            <LookingForDriver
              estimatedWaitTime={2}
              selectedTier="UberGo"
              pickupLocation={pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : "Detecting location..."}
              onCancel={() => router.push("/dashboard")}
            />
          )}

          {currentRide?.status === "ACCEPTED" && (
            <>
              <LookingForDriver
                estimatedWaitTime={5}
                selectedTier="UberGo"
                pickupLocation={pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : "Detecting location..."}
                onCancel={() => router.push("/dashboard")}
              />
              <div className="mt-6 p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex flex-col items-center gap-2.5 text-center shadow-sm">
                <span className="text-2xl animate-pulse">🔑</span>
                <div>
                  <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Provide Start Ride OTP</h4>
                  <p className="text-[11px] text-amber-700/80 mt-0.5">
                    Share this OTP with your driver to start the trip. It has been sent to your email.
                  </p>
                  <div className="mt-3 bg-white px-5 py-2.5 rounded-xl border border-amber-200 font-mono text-xl font-black text-amber-900 tracking-wider inline-block">
                    {currentRide.startOtp}
                  </div>
                </div>
              </div>
            </>
          )}

          {currentRide?.status === "ARRIVING" && (
            <>
              <WaitingForDriver
                driverName={currentRide.driverId ? "Driver en route" : "Driver"}
                driverRating={4.8}
                driverImage="👨‍💼"
                vehicleNumber="DL 01 AB 1234"
                vehicleType="Maruti Suzuki Swift"
                distanceAway={Math.max(0.1, (latestDriverLocation?.distanceToPickup?.kilometres || 2))}
                estimatedArrival={Math.max(1, Math.ceil(((latestDriverLocation?.distanceToPickup?.kilometres || 2.5) * 2)))}
                pickupLocation={pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : "Detecting location..."}
                onArrive={() => {}}
              />
              {currentRide.startOtp && (
                <div className="mt-6 p-4 bg-amber-50/60 rounded-2xl border border-amber-100 flex flex-col items-center gap-2.5 text-center shadow-sm">
                  <span className="text-2xl animate-pulse">🔑</span>
                  <div>
                    <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wide">Share OTP with Driver</h4>
                    <p className="text-[11px] text-amber-700/80 mt-0.5">
                      Driver has arrived! Share this 6-digit OTP to start the trip.
                    </p>
                    <div className="mt-3 bg-white px-5 py-2.5 rounded-xl border border-amber-200 font-mono text-xl font-black text-amber-900 tracking-wider inline-block">
                      {currentRide.startOtp}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

          {currentRide?.status === "STARTED" && (
            <>
              <CaptainDetails
                driverName={currentRide.driverId ? "Your Driver" : "Driver"}
                driverRating={4.8}
                driverImage="👨‍💼"
                vehicleNumber="DL 01 AB 1234"
                vehicleType="Maruti Suzuki Swift"
                distanceAway={Math.max(0.1, (latestDriverLocation?.distanceToPickup?.kilometres || 2))}
                estimatedArrival={Math.max(1, Math.ceil(((latestDriverLocation?.distanceToPickup?.kilometres || 2.5) * 2)))}
                phoneNumber="+91 98765 43210"
              />

              <div className="mt-4 p-5 border border-slate-200 rounded-2xl bg-white space-y-3.5 shadow-sm">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                  Enter completion OTP shared by driver
                </label>
                <input
                  value={completionOtp}
                  onChange={(event) => setCompletionOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="6-digit OTP"
                  className="w-full text-center font-mono text-lg tracking-widest rounded-xl border border-slate-200 px-4 py-3 focus:border-teal-500 focus:outline-none transition-colors bg-slate-50/30 font-bold"
                />
                <button
                  onClick={cancelRide}
                  disabled={completionOtp.length !== 6 || completing}
                  className="w-full rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-3.5 text-xs tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
                >
                  {completing ? "Completing..." : "Complete Ride"}
                </button>
                {error && (
                  <p className="mt-2 text-xs font-semibold text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-100 text-center">
                    ⚠️ {error}
                  </p>
                )}
              </div>
            </>
          )}

          {currentRide?.status === "COMPLETED" && (
            <FinishRide
              driverName="Your Driver"
              vehicleType="Maruti Suzuki Swift"
              pickupLocation={pickup ? `${pickup.lat.toFixed(4)}, ${pickup.lng.toFixed(4)}` : "Pickup"}
              dropLocation={currentRide.destination ? `${currentRide.destination.lat.toFixed(4)}, ${currentRide.destination.lng.toFixed(4)}` : "Destination"}
              distance={12.5}
              duration={45}
              baseFare={150}
              distanceFare={150}
              taxes={50}
              totalFare={350}
              onPayment={() => {}}
              onRating={(rating) => console.log("Rating:", rating)}
            />
          )}

          {currentRide?.status === "CANCELLED" && (
            <div className="mt-6 p-5 bg-gradient-to-r from-rose-50 to-red-50 rounded-2xl border border-rose-100 flex flex-col items-center gap-3 text-center shadow-sm">
              <span className="text-3xl">🛑</span>
              <div>
                <h4 className="text-sm font-bold text-rose-950">Ride Cancelled Successfully</h4>
                <p className="text-xs text-rose-700/80 mt-1">
                  The trip has been cancelled mid-way.
                </p>
              </div>
              <button
                onClick={() => router.push("/dashboard")}
                className="w-full mt-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold py-2.5 text-xs tracking-wide transition-all shadow-sm"
              >
                Go Back to Dashboard
              </button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
