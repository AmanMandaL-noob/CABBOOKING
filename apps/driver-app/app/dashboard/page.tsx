"use client";

import { useEffect, useCallback, useState } from "react";
import { DriverMap } from "../../components/DriverMap";
import { DriverProfileCard } from "../../components/DriverProfileCard";
import { DriverRideHistory } from "../../components/DriverRideHistory";
import { OnlineToggle } from "../../components/OnlineToggle";
import { RideRequestPopup } from "../../components/RideRequestPopup";
import { useDriverGuard } from "../../hooks/useDriverGuard";
import { driverApi } from "../../lib/driverApi";
import { subscribeToRideRequests } from "../../lib/driverSocket";
import { useDriverStore } from "../../stores/driverStore";
import { detectHighPrecisionLocation } from "../../lib/locationHelper";

export default function DriverDashboard() {
  const user = useDriverGuard();
  const [gpsError, setGpsError] = useState<string | null>(null);
  
  const { 
    liveLocation, 
    incomingRide, 
    setIncomingRide, 
    rideHistory, 
    setRideHistory, 
    profile, 
    setProfile, 
    setLiveLocation 
  } = useDriverStore();

  // 1. Memoized callback to stream telemetry data back to your server API
  const handleLocationUpdate = useCallback(async (lat: number, lng: number) => {
    if (!user?.id || !user?.token) return; // Prevent firing if pilot isn't fully authenticated
    
    try {
      // Syncing local application state
      setLiveLocation({ lat, lng });

      await driverApi.updateLocation(user.token, { lat, lng });
    } catch (err) {
      console.error("Failed pushing driver telemetry upstream:", err);
    }
  }, [user, setLiveLocation]);

  // 2. High-precision background hardware listener loop
  useEffect(() => {
    if (!user) return;
    let watchId: number | undefined;
    let cancelled = false;

    // Grab the initial location immediately on app mounting setup
    detectHighPrecisionLocation()
      .then((coords) => {
        if (cancelled) return;
        if (coords) {
          setGpsError(null); // Clear errors on successful acquisition
          handleLocationUpdate(coords.lat, coords.lng);
        }
      })
      .catch((err) => {
        console.warn("Initial GPS lock unavailable; using fallback location.", err);
      });

    // Spin up browser geolocation engine watching for hardware shifts
    if (!navigator.geolocation) {
      setGpsError("Geolocation telemetry is not supported by this browser platform.");
      return;
    }

    const startWatching = () => {
      watchId = navigator.geolocation.watchPosition(
      (position) => {
        setGpsError(null); // Clear error state as soon as fresh coordinates hit the pipe
        const { latitude, longitude } = position.coords;
        handleLocationUpdate(latitude, longitude);
      },
      (error) => {
        // Map error codes to understandable UI notification labels
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setGpsError("Location access denied. Please click the padlock/settings icon in your browser address bar and change Location permission to 'Allow'.");
            break;
          case error.POSITION_UNAVAILABLE:
            console.warn("Driver GPS position is unavailable:", error.message);
            setGpsError("Hardware GPS network link is currently unavailable or satellite signals are weak.");
            break;
          case error.TIMEOUT:
            console.warn("Driver GPS request timed out:", error.message);
            setGpsError("GPS telemetry request timed out waiting for active satellite synchronization lock.");
            break;
          default:
            console.warn("Driver GPS tracking warning:", error.message);
            setGpsError(`Telemetry Tracking Error: ${error.message}`);
        }
      },
      {
        enableHighAccuracy: true, // Forces precise hardware GPS tracking rather than Wi-Fi triangulation
        maximumAge: 0,            // Do not use cached telemetry snapshots
        timeout: 10000            // Fail loop if coordinate calculation hangs longer than 10s
      }
      );
    };

    if ("permissions" in navigator && navigator.permissions?.query) {
      navigator.permissions
        .query({ name: "geolocation" as PermissionName })
        .then((permission) => {
          if (cancelled) return;
          if (permission.state === "denied") {
            setGpsError("Location access denied. Please click the padlock/settings icon in your browser address bar and change Location permission to 'Allow'.");
            return;
          }
          startWatching();
        })
        .catch(startWatching);
    } else {
      startWatching();
    }

    // Teardown listener loop if the pilot navigates away from operational dashboard screen
    return () => {
      cancelled = true;
      if (watchId !== undefined) navigator.geolocation.clearWatch(watchId);
    };
  }, [user, handleLocationUpdate]);

  // Existing WebSockets subscription pipeline hook loop
  useEffect(() => {
    if (!user) return;
    return subscribeToRideRequests(user.token, setIncomingRide);
  }, [setIncomingRide, user]);

  // Existing Data API hydration fetch execution loop
  useEffect(() => {
    if (!user) return;
    driverApi.profile(user.token).then(setProfile).catch(console.error);
    driverApi.history(user.token).then(setRideHistory).catch(console.error);
  }, [setProfile, setRideHistory, user]);

  return (
    <main className="min-h-screen bg-slate-900 text-slate-100">
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Fleet Header Terminal */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Fleet Operations Console</p>
            <h1 className="text-2xl font-black tracking-tight text-white mt-1">
              Welcome Back, {user?.name ?? "Pilot"}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <OnlineToggle />
          </div>
        </header>

        {/* GPS Permission Alert Banner Layer */}
        {gpsError && (
          <div className="mb-6 rounded-2xl border border-red-500/20 bg-red-500/10 p-4 text-xs font-bold text-red-400 animate-pulse flex items-center gap-3 shadow-lg">
            <span className="text-lg">🛑</span>
            <p className="leading-relaxed">{gpsError}</p>
          </div>
        )}

        {/* Console Grid Layout */}
        <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
          {/* Main Map Visual Panel */}
          <div className="rounded-3xl border border-slate-800 bg-slate-950 p-3 shadow-2xl">
            <div className="px-3 pb-3 border-b border-slate-900 flex justify-between items-center text-xs font-semibold text-slate-500 uppercase tracking-wider">
              <span>Dynamic Navigation Tracking Radar</span>
              <span className="flex items-center gap-1">
                <span className={`w-1.5 h-1.5 rounded-full ${gpsError ? "bg-red-500" : "bg-blue-500 animate-ping"}`}></span>
                <span className="text-[10px] tracking-widest text-slate-400">
                  {gpsError ? "GPS Offline" : "Live GPS"}
                </span>
              </span>
            </div>
            <div className="mt-3">
              <DriverMap 
                current={liveLocation} 
                pickup={incomingRide?.pickup} 
                destination={incomingRide?.destination} 
              />
            </div>
          </div>

          {/* Right Sidebar details */}
          <div className="flex flex-col gap-6">
            <DriverProfileCard profile={profile} />
            <DriverRideHistory rides={rideHistory} />
          </div>
        </div>

        {/* Modal overlays for dispatch jobs */}
        <RideRequestPopup />
      </div>
    </main>
  );
}
