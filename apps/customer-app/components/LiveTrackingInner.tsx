"use client";

import { useEffect, useState, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

interface Coordinates {
  lat: number;
  lng: number;
}

function MapClickHandler({ onMapClick }: { onMapClick?: (latlng: Coordinates) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) {
        onMapClick({ lat: e.latlng.lat, lng: e.latlng.lng });
      }
    }
  });
  return null;
}

function AutoFitMap({ currentPosition }: { currentPosition: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (currentPosition) {
      map.setView([currentPosition.lat, currentPosition.lng], 15, { animate: true });
    }
  }, [currentPosition, map]);
  return null;
}

export default function LiveTrackingInner({
  customerId,
  token,
  initialLocation
}: {
  customerId: string;
  token: string;
  initialLocation?: Coordinates;
}) {
  const defaultLocation = initialLocation || { lat: 28.7041, lng: 77.1025 };
  const [currentPosition, setCurrentPosition] = useState<Coordinates>(defaultLocation);
  const [pinnedLocation, setPinnedLocation] = useState<Coordinates | null>(null);
  const [isTracking, setIsTracking] = useState(true);

  // Safely generate browser-only Leaflet icons inside the client execution context
  const { userIcon, pinnedIcon } = useMemo(() => {
    if (typeof window === "undefined") return { userIcon: null, pinnedIcon: null };
    
    return {
      userIcon: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      }),
      pinnedIcon: new L.Icon({
        iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
        shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41]
      })
    };
  }, []);

  const sendLocationToBackend = async (latitude: number, longitude: number) => {
    try {
      await fetch(`/api/customers/${customerId}/location`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude, timestamp: new Date().toISOString() })
      });
    } catch (error) {
      console.error("Error sending location:", error);
    }
  };

  useEffect(() => {
    if (!isTracking) return;

    navigator.geolocation.getCurrentPosition((position) => {
      const { latitude, longitude } = position.coords;
      setCurrentPosition({ lat: latitude, lng: longitude });
      sendLocationToBackend(latitude, longitude);
    });

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setCurrentPosition({ lat: latitude, lng: longitude });
        sendLocationToBackend(latitude, longitude);
      },
      (error) => console.error("Geolocation error:", error),
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, [customerId, token, isTracking]);

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={[currentPosition.lat, currentPosition.lng]}
        zoom={15}
        className="w-full h-80 md:h-[520px] rounded-2xl border border-slate-200"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {userIcon && (
          <Marker position={[currentPosition.lat, currentPosition.lng]} icon={userIcon} title="Your Location" />
        )}
        {pinnedLocation && pinnedIcon && (
          <Marker position={[pinnedLocation.lat, pinnedLocation.lng]} icon={pinnedIcon} title="Pinned Location" />
        )}

        <MapClickHandler onMapClick={(coords) => setPinnedLocation(coords)} />
        <AutoFitMap currentPosition={currentPosition} />
      </MapContainer>

      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-4 z-10 max-w-xs">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">📍 Live Tracking</span>
          <button
            type="button"
            onClick={() => setIsTracking(!isTracking)}
            className={`text-xs px-2 py-1 rounded transition-colors ${isTracking ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}
          >
            {isTracking ? "Tracking" : "Paused"}
          </button>
        </div>
        <p className="text-xs text-slate-600 mb-3">
          <span className="font-medium">Current:</span> {currentPosition.lat.toFixed(4)}, {currentPosition.lng.toFixed(4)}
        </p>
        {pinnedLocation && (
          <div className="mb-3 p-2 bg-red-50 rounded border border-red-200">
            <p className="text-xs text-slate-600 mb-2">📌 Pinned: {pinnedLocation.lat.toFixed(4)}, {pinnedLocation.lng.toFixed(4)}</p>
            <button type="button" onClick={() => setPinnedLocation(null)} className="w-full text-xs bg-red-500 text-white px-2 py-1 rounded">Clear Pin</button>
          </div>
        )}
      </div>
    </div>
  );
}