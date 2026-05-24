"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { customerApi } from "../lib/customerApi";
import { useCustomerAuthStore } from "../stores/authStore";
import { useCustomerRideStore } from "../stores/rideStore";
import { useCustomerMapStore } from "../stores/mapStore";
import { LocationSearchPanel } from "./LocationSearchPanel";
import { VehiclePanel } from "./VehiclePanel";
import { detectHighPrecisionLocation } from "../lib/locationHelper";
import { geocodingService } from "../../../geocodingService";

const CustomerTrackingMap = dynamic(
  () => import("./CustomerTrackingMap").then((mod) => mod.CustomerTrackingMap),
  { ssr: false }
);

interface NominatimSuggestion {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
}

export function BookingCard() {
  const router = useRouter();
  const user = useCustomerAuthStore((state) => state.user);
  const setRide = useCustomerRideStore((state) => state.setRide);
  
  // Connect to map store
  const { pickup, destination, setPickup, setDestination } = useCustomerMapStore();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Address inputs
  const [pickupSearch, setPickupSearch] = useState("President's Estate, New Delhi, Delhi, 110004, India");
  const [destSearch, setDestSearch] = useState("Rohini, Delhi, 110085, India");
  
  // Suggestion states
  const [pickupSuggestions, setPickupSuggestions] = useState<NominatimSuggestion[]>([]);
  const [destSuggestions, setDestSuggestions] = useState<NominatimSuggestion[]>([]);
  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDestDropdown, setShowDestDropdown] = useState(false);

  // Search active states to avoid overwriting typing
  const isTypingPickup = useRef(false);
  const isTypingDest = useRef(false);
  const cancelBookingRef = useRef(false);

  // Rate-limiting bypass flags: skips reverse geocode when setting from autocomplete
  const skipReverse = useRef({ pickup: false, dest: false });

  // Map Click Targeting: 'pickup' | 'destination'
  const [clickTarget, setClickTarget] = useState<"pickup" | "destination">("pickup");

  // Memoize map click handler to prevent unnecessary re-renders
  const handleMapClick = useCallback((latlng: { lat: number; lng: number }) => {
    if (clickTarget === "pickup") {
      isTypingPickup.current = false;
      setPickup({ lat: latlng.lat, lng: latlng.lng });
    } else {
      isTypingDest.current = false;
      setDestination({ lat: latlng.lat, lng: latlng.lng });
    }
  }, [clickTarget, setPickup, setDestination]);

  // Ride Option State
  const [selectedTier, setSelectedTier] = useState<"UberGo" | "UberPremier" | "UberXL">("UberGo");

  // High-precision initial location detection on mount
  useEffect(() => {
    const initLocation = async () => {
      setLoading(true);
      const detected = await detectHighPrecisionLocation();
      skipReverse.current.pickup = false;
      skipReverse.current.dest = false;
      setPickup(detected);
      // Place drop slightly offset from pickup to form a clean short route
      setDestination({ lat: detected.lat + 0.05, lng: detected.lng - 0.05 });
      setLoading(false);
    };
    initLocation();
  }, []);

  // Debounced Pickup Search (Forward Geocoding)
  useEffect(() => {
    if (!pickupSearch.trim() || !isTypingPickup.current) {
      setPickupSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const results = await geocodingService.forward(pickupSearch);
        if (results && results.length > 0) {
          const transformed = results.map((item: any, idx: number) => ({
            place_id: idx,
            display_name: item.label,
            lat: String(item.latitude),
            lon: String(item.longitude)
          }));
          setPickupSuggestions(transformed);
        } else {
          setPickupSuggestions([]);
        }
      } catch (err) {
        console.error("Pickup suggestions fetch error:", err);
      }
    }, 600);
    return () => clearTimeout(delay);
  }, [pickupSearch]);

  // Debounced Destination Search (Forward Geocoding)
  useEffect(() => {
    if (!destSearch.trim() || !isTypingDest.current) {
      setDestSuggestions([]);
      return;
    }
    const delay = setTimeout(async () => {
      try {
        const results = await geocodingService.forward(destSearch);
        if (results && results.length > 0) {
          const transformed = results.map((item: any, idx: number) => ({
            place_id: idx,
            display_name: item.label,
            lat: String(item.latitude),
            lon: String(item.longitude)
          }));
          setDestSuggestions(transformed);
        } else {
          setDestSuggestions([]);
        }
      } catch (err) {
        console.error("Destination suggestions fetch error:", err);
      }
    }, 600);
    return () => clearTimeout(delay);
  }, [destSearch]);

  // Reverse Geocoding Helper with Graceful 429 Fallback Logic
  const reverseGeocode = async (lat: number, lng: number, target: "pickup" | "destination") => {
    try {
      const results = await geocodingService.reverse(lat, lng);
      if (results && results.length > 0) {
        const address = results[0].label;
        if (target === "pickup") {
          isTypingPickup.current = false;
          setPickupSearch(address);
        } else {
          isTypingDest.current = false;
          setDestSearch(address);
        }
      }
    } catch (err) {
      console.warn("Reverse geocoding limited or unavailable, falling back to clean coordinates placeholder text.", err);
      const fallbackAddress = `Location (${lat.toFixed(4)}, ${lng.toFixed(4)})`;
      if (target === "pickup") {
        setPickupSearch(fallbackAddress);
      } else {
        setDestSearch(fallbackAddress);
      }
    }
  };

  // Detect coordinate adjustments & Reverse Geocode with debouncing + loop exclusions
  useEffect(() => {
    if (skipReverse.current.pickup) {
      skipReverse.current.pickup = false;
      return;
    }
    if (pickup && !isTypingPickup.current) {
      const delay = setTimeout(() => {
        reverseGeocode(pickup.lat, pickup.lng, "pickup");
      }, 600);
      return () => clearTimeout(delay);
    }
  }, [pickup]);

  useEffect(() => {
    if (skipReverse.current.dest) {
      skipReverse.current.dest = false;
      return;
    }
    if (destination && !isTypingDest.current) {
      const delay = setTimeout(() => {
        reverseGeocode(destination.lat, destination.lng, "destination");
      }, 600);
      return () => clearTimeout(delay);
    }
  }, [destination]);

  // GPS & IP Current Location
  const handleUseCurrentLocation = async () => {
    setLoading(true);
    try {
      const coords = await detectHighPrecisionLocation();
      isTypingPickup.current = false;
      skipReverse.current.pickup = false;
      setPickup(coords);
    } catch (err) {
      setError("Unable to resolve exact device coordinates.");
    } finally {
      setLoading(false);
    }
  };

  // Calculate distance between points for fares
  const getDistanceKm = () => {
    if (!pickup || !destination) return 0;
    const R = 6371; // km
    const dLat = ((destination.lat - pickup.lat) * Math.PI) / 180;
    const dLon = ((destination.lng - pickup.lng) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((pickup.lat * Math.PI) / 180) *
        Math.cos((destination.lat * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const distance = getDistanceKm();
  const estimateTimeMin = Math.max(3, Math.round(distance * 1.5 + 4));

  // Tiers and pricing matrix
  const rideTiers = [
    {
      id: "UberGo" as const,
      name: "UberGo",
      desc: "Affordable compact rides",
      emoji: "🚗",
      pricePerKm: 12,
      baseFare: 50,
      eta: "3 min"
    },
    {
      id: "UberPremier" as const,
      name: "UberPremier",
      desc: "High quality sedans",
      emoji: "🚘",
      pricePerKm: 18,
      baseFare: 80,
      eta: "2 min"
    },
    {
      id: "UberXL" as const,
      name: "UberXL",
      desc: "Comfortable spacious SUVs",
      emoji: "🚙",
      pricePerKm: 28,
      baseFare: 120,
      eta: "5 min"
    }
  ];

  const calculateFare = (baseFare: number, pricePerKm: number) => {
    if (distance === 0) return 0;
    return Math.round(baseFare + distance * pricePerKm);
  };

  // Match active fare for the locked waiting status view
  const currentTierConfig = rideTiers.find((t) => t.id === selectedTier);
  const calculatedFare = currentTierConfig 
    ? calculateFare(currentTierConfig.baseFare, currentTierConfig.pricePerKm) 
    : 0;

  // Book trip handler
  const handleBookRide = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !pickup || !destination) return;
    setLoading(true);
    setError("");
    cancelBookingRef.current = false;

    try {
      const ride = await customerApi.bookRide(user.token, {
        pickup,
        destination,
      });
      
      if (cancelBookingRef.current) {
        return; // Halted if canceled while finding drivers
      }

      setRide(ride);
      router.push(`/ride/${ride.id}`);
    } catch (err) {
      if (!cancelBookingRef.current) {
        setError(err instanceof Error ? err.message : "Ride booking failed");
      }
    } finally {
      if (!cancelBookingRef.current) {
        setLoading(false);
      }
    }
  };

  const handleCancelRideRequest = () => {
    cancelBookingRef.current = true;
    setLoading(false);
    setError("Ride request was successfully cancelled.");
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_400px]">
      {/* Left side: Premium Map Container with Click Instructions */}
      <div className="flex flex-col gap-2 rounded-2xl border border-slate-200/80 bg-white p-3 shadow-md h-96">
        <div className="flex items-center justify-between px-2 pb-2 border-b border-slate-100">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Interactive Trip Route Map</span>
          <div className="flex bg-slate-100 p-0.5 rounded-lg text-xs font-medium">
            <button
              type="button"
              onClick={() => setClickTarget("pickup")}
              className={`px-3 py-1 rounded-md transition-all duration-200 ${
                clickTarget === "pickup" ? "bg-white text-emerald-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              📍 Set Pickup
            </button>
            <button
              type="button"
              onClick={() => setClickTarget("destination")}
              className={`px-3 py-1 rounded-md transition-all duration-200 ${
                clickTarget === "destination" ? "bg-white text-rose-800 shadow-sm" : "text-slate-500 hover:text-slate-800"
              }`}
            >
              🏁 Set Drop
            </button>
          </div>
        </div>
        
        {pickup && (
          <div className="flex-1 rounded-xl overflow-hidden">
            <CustomerTrackingMap
              pickup={pickup}
              destination={destination}
              onMapClick={handleMapClick}
            />
          </div>
        )}
        <div className="text-center text-xs text-slate-400 py-1">
          💡 Pro-tip: You can tap anywhere on the map to set the active pin target.
        </div>
      </div>

      {/* Right side: Enhanced Ride Booking Card */}
      <div className="flex flex-col gap-6">
        {/* Location Search Panel */}
        <LocationSearchPanel
          pickupSearch={pickupSearch}
          destSearch={destSearch}
          pickupSuggestions={pickupSuggestions}
          destSuggestions={destSuggestions}
          showPickupDropdown={showPickupDropdown}
          showDestDropdown={showDestDropdown}
          onPickupChange={(value) => {
            isTypingPickup.current = true;
            setPickupSearch(value);
          }}
          onDestChange={(value) => {
            isTypingDest.current = true;
            setDestSearch(value);
          }}
          onPickupFocus={() => setShowPickupDropdown(true)}
          onDestFocus={() => setShowDestDropdown(true)}
          onPickupBlur={() => setTimeout(() => setShowPickupDropdown(false), 200)}
          onDestBlur={() => setTimeout(() => setShowDestDropdown(false), 200)}
          onPickupSelect={(suggestion) => {
            isTypingPickup.current = false;
            skipReverse.current.pickup = true; // Avoid lookup loop
            setPickupSearch(suggestion.display_name);
            setPickup({ lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) });
            setPickupSuggestions([]);
            setShowPickupDropdown(false);
          }}
          onDestSelect={(suggestion) => {
            isTypingDest.current = false;
            skipReverse.current.dest = true; // Avoid lookup loop
            setDestSearch(suggestion.display_name);
            setDestination({ lat: parseFloat(suggestion.lat), lng: parseFloat(suggestion.lon) });
            setDestSuggestions([]);
            setShowDestDropdown(false);
          }}
          onCurrentLocation={handleUseCurrentLocation}
          isLoading={loading}
        />

        {/* Vehicle Panel with fare estimates */}
        {distance > 0 && (
          <VehiclePanel
            selectedTier={selectedTier}
            onSelect={(tier) => setSelectedTier(tier)}
            estimatedTime={estimateTimeMin}
            estimatedDistance={distance}
          />
        )}

        {/* Booking Form with live locked fare during waiting sequence */}
        <form onSubmit={handleBookRide} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-lg">
          {error && (
            <div className={`mb-4 p-4 rounded-xl border ${error.includes("cancelled") ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-red-50 border-red-200 text-red-700"}`}>
              <p className="text-xs font-semibold">⚠️ {error}</p>
            </div>
          )}

          {loading && (
            <div className="mb-4 p-4 rounded-xl bg-teal-50 border border-teal-200 text-center animate-pulse">
              <p className="text-xs font-bold text-teal-800">🚕 Confirmed Trip Fare: ₹{calculatedFare}</p>
              <p className="text-[10px] text-teal-600 mt-0.5">Please wait, your fare amount is locked while we search for a vehicle...</p>
            </div>
          )}

          {loading ? (
            <div className="flex flex-col gap-2 w-full">
              <button
                type="button"
                disabled
                className="w-full rounded-xl bg-slate-100 text-slate-400 font-bold py-4 text-sm tracking-wide flex items-center justify-center gap-2 cursor-not-allowed border border-slate-200"
              >
                <span className="animate-spin">⚙️</span>
                Finding Drivers... [Fare: ₹{calculatedFare}]
              </button>
              
              <button
                type="button"
                onClick={handleCancelRideRequest}
                className="w-full rounded-xl bg-red-50 hover:bg-red-100 text-red-600 font-bold py-3 text-xs tracking-wide transition-all border border-red-200 active:scale-95 flex items-center justify-center gap-1"
              >
                🛑 Cancel Ride Request
              </button>
            </div>
          ) : (
            <button
              type="submit"
              disabled={loading || !pickup || !destination}
              className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white font-bold py-4 text-sm tracking-wide transition-all shadow-md active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              🚗 Request {selectedTier} • ₹{calculatedFare}
            </button>
          )}

          <p className="text-center text-xs text-slate-500 mt-3">
            ✓ Safe rides with certified drivers
          </p>
        </form>
      </div>
      
      {/* Dynamic dropdown overlays clean up */}
      {(showPickupDropdown || showDestDropdown) && (
        <div 
          className="fixed inset-0 z-40 cursor-default" 
          onClick={() => {
            setShowPickupDropdown(false);
            setShowDestDropdown(false);
          }}
        />
      )}
    </div>
  );
}