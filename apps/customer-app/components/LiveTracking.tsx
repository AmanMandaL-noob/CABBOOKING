"use client";

import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Coordinates } from '@cab/shared';

const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function CenterMap({ coords }: { coords: Coordinates }) {
  const map = useMap();
  useEffect(() => {
    if (coords) {
      map.setView([coords.lat, coords.lng], map.getZoom());
    }
  }, [coords, map]);
  return null;
}

export default function LiveTrackingInner({ rideId }: { rideId: string }) {
  const [driverLocation, setDriverLocation] = useState<Coordinates | null>(null);
  const [rideStatus, setRideStatus] = useState<string>("ACCEPTED");
  const [otp, setOtp] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rideId) return;

    const streamRideUpdates = async () => {
      try {
        // Poll the entire ride resource state instead of raw detached coordinates
        const response = await fetch(`/api/rides/${rideId}`);
        if (!response.ok) throw new Error("Could not sync with dispatch systems");
        
        const ride = await response.json();
        
        // Sync both telemetry coordinates and contextual trip phase status
        if (ride.driverLocation) {
          setDriverLocation(ride.driverLocation);
        }
        setRideStatus(ride.status);
        if (ride.otp) setOtp(ride.otp); // Capture OTP if supplied from backend manifest
      } catch (err: any) {
        console.error("Sync error:", err);
        setError(err.message);
      }
    };

    streamRideUpdates();
    const interval = setInterval(streamRideUpdates, 3000); // Poll tracking every 3 seconds
    return () => clearInterval(interval);
  }, [rideId]);

  const defaultCenter: [number, number] = driverLocation 
    ? [driverLocation.lat, driverLocation.lng] 
    : [28.6139, 77.209];

  return (
    <div className="relative w-full h-72 min-h-[288px] md:h-[480px] overflow-hidden rounded-2xl border border-slate-200 shadow-xl">
      
      {/* DYNAMIC TOP ALERT BANNER CHANGING BASED ON DRIVER STATE */}
      <div className="absolute top-4 inset-x-4 z-[1000] mx-auto max-w-sm rounded-xl border border-slate-100 bg-white p-3.5 shadow-lg flex items-center justify-between">
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">Ride Status</h4>
          <p className="text-sm font-bold text-slate-800 mt-0.5">
            {rideStatus === 'ARRIVING' && "🚕 Driver is arriving shortly..."}
            {rideStatus === 'ARRIVED' && "📍 Driver has arrived at pickup!"}
            {rideStatus === 'STARTED' && "🚀 Trip is in progress"}
          </p>
        </div>
        
        {/* If driver is at the door waiting for OTP, overlay it clearly for the customer */}
        {rideStatus === 'ARRIVED' && otp && (
          <div className="bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-lg text-center">
            <span className="block text-[9px] font-bold text-amber-600 uppercase">Share OTP</span>
            <span className="font-mono text-sm font-black tracking-widest text-amber-700">{otp}</span>
          </div>
        )}
      </div>

      {error && (
        <div className="absolute bottom-4 left-4 z-[1000] bg-red-600 text-white text-[11px] font-bold px-3 py-1.5 rounded-md shadow">
          ⚠️ Connection Lag: Reconnecting...
        </div>
      )}

      <MapContainer center={defaultCenter} zoom={15} zoomControl={false} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {driverLocation && (
          <>
            <CenterMap coords={driverLocation} />
            <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
              <Popup><b className="text-slate-900">Your Ride Location</b></Popup>
            </Marker>
          </>
        )}
      </MapContainer>
    </div>
  );
}