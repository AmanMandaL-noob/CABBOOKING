"use client";

import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import { MapContainer, Marker as LeafletMarker, Polyline as LeafletPolyline, TileLayer, useMap, useMapEvents } from "react-leaflet";
import { Coordinates } from "@cab/shared";

// Leaflet Icons
const pickupIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const destIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

function toLatLng(input?: Coordinates): [number, number] | null {
  if (!input) return null;
  if (!Number.isFinite(input.lat) || !Number.isFinite(input.lng)) return null;
  if (input.lat < -90 || input.lat > 90 || input.lng < -180 || input.lng > 180) return null;
  return [input.lat, input.lng];
}

// Fit map viewport automatically to encapsulate all active route coordinates for Leaflet
function FitRouteBounds({
  pickup,
  destination,
  driver
}: {
  pickup: [number, number];
  destination?: [number, number] | null;
  driver?: [number, number] | null;
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [pickup];
    if (destination) points.push(destination);
    if (driver) points.push(driver);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: false });
    } else {
      map.setView(pickup, 14, { animate: false });
    }
  }, [pickup, destination, driver, map]);

  return null;
}

// Listens to click events on map canvas and bubbles up coordinates for Leaflet
function MapClickHandler({ onMapClick }: { onMapClick?: (latlng: L.LatLng) => void }) {
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    }
  });
  return null;
}

// Script Loader for Google Maps
let googleMapsLoadingPromise: Promise<void> | null = null;
function loadGoogleMapsScript(apiKey?: string): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if ((window as any).google && (window as any).google.maps) {
    return Promise.resolve();
  }
  if (googleMapsLoadingPromise) return googleMapsLoadingPromise;

  googleMapsLoadingPromise = new Promise((resolve, reject) => {
    const key = apiKey || "AIzaSyAam8BNxtQ6Gal4W6SMNCxeP4nLnqmhJqs"; // Fallback to firebase key
    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?libraries=places&key=${key}`;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => {
      googleMapsLoadingPromise = null;
      reject(err);
    };
    document.head.appendChild(script);
  });
  return googleMapsLoadingPromise;
}

export default function CustomerTrackingMapInner({
  pickup,
  driver,
  destination,
  onMapClick
}: {
  pickup: Coordinates;
  driver?: Coordinates;
  destination?: Coordinates;
  onMapClick?: (latlng: any) => void;
}) {
  const [mapEngine, setMapEngine] = useState<"loading" | "google" | "leaflet">("loading");
  
  const googleMapRef = useRef<HTMLDivElement>(null);
  const googleMapInstance = useRef<any>(null);
  const googleMarkers = useRef<any[]>([]);
  const googlePolylines = useRef<any[]>([]);

  const pickupPoint = toLatLng(pickup);
  const driverPoint = toLatLng(driver);
  const destinationPoint = toLatLng(destination);
  const center = driverPoint ?? destinationPoint ?? pickupPoint;

  // Try to load Google Maps on mount
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    loadGoogleMapsScript(apiKey)
      .then(() => {
        setMapEngine("google");
      })
      .catch((err) => {
        console.warn("Failed to load Google Maps, falling back to Leaflet:", err);
        setMapEngine("leaflet");
      });
  }, []);

  // Update Google Map on state changes
  useEffect(() => {
    if (mapEngine !== "google" || !googleMapRef.current || !center) return;

    const google = (window as any).google;

    // 1. Initialize Google Map if not already done
    if (!googleMapInstance.current) {
      googleMapInstance.current = new google.maps.Map(googleMapRef.current, {
        center: { lat: center[0], lng: center[1] },
        zoom: 14,
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
        styles: [
          {
            featureType: "poi",
            elementType: "labels",
            stylers: [{ visibility: "off" }]
          }
        ]
      });

      // Handle map clicks
      if (onMapClick) {
        googleMapInstance.current.addListener("click", (e: any) => {
          if (e.latLng) {
            onMapClick({
              lat: e.latLng.lat(),
              lng: e.latLng.lng()
            });
          }
        });
      }
    }

    const map = googleMapInstance.current;

    // 2. Clear previous markers and polylines
    googleMarkers.current.forEach(m => m.setMap(null));
    googleMarkers.current = [];
    googlePolylines.current.forEach(p => p.setMap(null));
    googlePolylines.current = [];

    // 3. INITIALIZE BOUNDS EARLY: Explicitly declared before ANY marker configuration runs
    const bounds = new google.maps.LatLngBounds();

    // 4. Define Commute Custom Marker SVGs
    const markerIconConfig = {
      path: 'M10 27c-.2 0-.2 0-.5-1-.3-.8-.7-2-1.6-3.5-1-1.5-2-2.7-3-3.8-2.2-2.8-3.9-5-3.9-8.8C1 4.9 5 1 10 1s9 4 9 8.9c0 3.9-1.8 6-4 8.8-1 1.2-1.9 2.4-2.8 3.8-1 1.5-1.4 2.7-1.6 3.5-.3 1-.4 1-.6 1Z',
      fillOpacity: 1,
      strokeWeight: 1.5,
      anchor: new google.maps.Point(10, 27),
      scale: 1.3,
      labelOrigin: new google.maps.Point(10, 9)
    };

    const gPickupIcon = {
      ...markerIconConfig,
      fillColor: "#10b981", // Emerald active green
      strokeColor: "#047857",
    };

    const gDestIcon = {
      ...markerIconConfig,
      fillColor: "#ef4444", // Crimson active red
      strokeColor: "#b91c1c",
    };

    // 5. Draw Markers & Populate Bounds top-down safely
    if (pickupPoint) {
      const marker = new google.maps.Marker({
        position: { lat: pickupPoint[0], lng: pickupPoint[1] },
        map: map,
        icon: gPickupIcon,
        label: { text: "A", color: "#ffffff", fontWeight: "900", fontSize: "11px" }
      });
      googleMarkers.current.push(marker);
      bounds.extend(marker.getPosition());
    }

    if (driverPoint) {
      const marker = new google.maps.Marker({
        position: { lat: driverPoint[0], lng: driverPoint[1] },
        map: map,
        icon: {
          url: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png", // Dedicated cab vehicle asset
          scaledSize: new google.maps.Size(40, 40),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(20, 20)
        },
        title: "Cab Location"
      });
      googleMarkers.current.push(marker);
      bounds.extend(marker.getPosition());
    }

    if (destinationPoint) {
      const marker = new google.maps.Marker({
        position: { lat: destinationPoint[0], lng: destinationPoint[1] },
        map: map,
        icon: gDestIcon,
        label: { text: "B", color: "#ffffff", fontWeight: "900", fontSize: "11px" }
      });
      googleMarkers.current.push(marker);
      bounds.extend(marker.getPosition());
    }

    // 6. Draw Double-Stroke Commute Polylines
    const lineCoords: any[] = [];
    if (driverPoint && pickupPoint) {
      lineCoords.push({ lat: pickupPoint[0], lng: pickupPoint[1] });
      lineCoords.push({ lat: driverPoint[0], lng: driverPoint[1] });
    } else if (destinationPoint && pickupPoint) {
      lineCoords.push({ lat: pickupPoint[0], lng: pickupPoint[1] });
      lineCoords.push({ lat: destinationPoint[0], lng: destinationPoint[1] });
    }

    if (lineCoords.length > 1) {
      const outerStroke = new google.maps.Polyline({
        path: lineCoords,
        strokeColor: "#0f172a",
        strokeOpacity: 0.8,
        strokeWeight: 7,
        map: map
      });

      const innerStroke = new google.maps.Polyline({
        path: lineCoords,
        strokeColor: "#0f766e",
        strokeOpacity: 1.0,
        strokeWeight: 4,
        map: map
      });

      googlePolylines.current.push(outerStroke, innerStroke);
    }

    // 7. Adjust viewport bounds setup
    if (googleMarkers.current.length > 1) {
      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    } else {
      map.setCenter({ lat: center[0], lng: center[1] });
    }

  }, [mapEngine, pickupPoint, driverPoint, destinationPoint, center]);

  if (mapEngine === "loading") {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border bg-slate-50 md:h-[520px] font-semibold text-slate-400">
        <div className="flex flex-col items-center gap-2">
          <span className="animate-spin text-2xl text-teal-600">🌐</span>
          <span className="text-xs font-semibold text-slate-500">Initializing GPS Systems...</span>
        </div>
      </div>
    );
  }

  if (mapEngine === "google") {
    return (
      <div 
        ref={googleMapRef} 
        className="h-80 overflow-hidden rounded-2xl border border-slate-200 shadow-inner md:h-[520px] relative z-10"
      />
    );
  }

  // Fallback Leaflet Map
  if (!pickupPoint || !center) {
    return (
      <div className="flex h-80 items-center justify-center rounded-2xl border bg-slate-50 md:h-[520px] font-semibold text-slate-400">
        Map unavailable
      </div>
    );
  }

  const line: [number, number][] | undefined = driverPoint
    ? [pickupPoint, driverPoint]
    : destinationPoint
      ? [pickupPoint, destinationPoint]
      : undefined;

  return (
    <div className="h-80 overflow-hidden rounded-2xl border border-slate-200 shadow-inner md:h-[520px] relative z-10">
      <MapContainer center={center} zoom={13} scrollWheelZoom className="h-full w-full">
        <FitRouteBounds pickup={pickupPoint} destination={destinationPoint} driver={driverPoint} />
        <MapClickHandler onMapClick={onMapClick} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <LeafletMarker key="pickup" position={pickupPoint} icon={pickupIcon} />
        {driverPoint && <LeafletMarker key="driver" position={driverPoint} icon={driverIcon} />}
        {destinationPoint && <LeafletMarker key="destination" position={destinationPoint} icon={destIcon} />}
        
        {line && <LeafletPolyline positions={line} pathOptions={{ color: "#0f766e", weight: 5, dashArray: "4, 8", lineCap: "round" }} />}
      </MapContainer>
    </div>
  );
}