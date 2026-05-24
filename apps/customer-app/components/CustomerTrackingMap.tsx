"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// Note: You will need to install this plugin: npm install leaflet-routing-machine
// @ts-ignore
import 'leaflet-routing-machine';
import { Coordinates } from '@cab/shared';

// Beautiful premium custom color marker pins
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

// Premium top-down ride-hailing sedan vehicle marker
const driverIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/3089/3089803.png", // Crisp vector modern passenger car icon
  iconSize: [40, 40],
  iconAnchor: [20, 20], // Centered layout anchors to keep movement fluid on updates
  popupAnchor: [0, -20],
  shadowUrl: undefined // Removed pinpoint shadow matrix for cleaner visual execution
});

interface MapLocation {
  lat: number;
  lng: number;
  label?: string; // Made optional as not all map locations will have a label
}

interface CustomerTrackingMapProps {
  pickup?: MapLocation;
  destination?: MapLocation;
  driver?: Coordinates; // Driver's current location
  className?: string;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
}

/**
 * Sub-component to inject the Leaflet Routing Machine engine.
 * Road-aware routing between two points with the text overlay completely disabled.
 */
const RoutingEngine = ({ start, end }: { start: MapLocation; end: MapLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // Safely cast L to bypass missing Leaflet-Routing-Machine plugin definitions 
    const leafletAny = L as any;

    if (!leafletAny.Routing) {
      console.error("Leaflet Routing Machine plugin not attached to 'L' runtime context.");
      return;
    }

    const routingControl = leafletAny.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      router: leafletAny.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      routeWhileDragging: false,
      addWaypoints: false,
      draggableWaypoints: false, // Prevents breaking the line route path
      show: false,                // Disables text instructions container natively
      createMarker: () => null, // We use our own custom styled markers
      lineOptions: {
        styles: [{ color: '#2A75D3', weight: 6, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 100
      }
    }).addTo(map);

    // Foolproof Fix: Programmatically wipe the container style layout from rendering on the map viewport
    try {
      const routingContainer = routingControl.getContainer();
      if (routingContainer) {
        routingContainer.style.display = 'none';
      }
    } catch (err) {
      console.warn("Routing layout container cleanup:", err);
    }

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start.lat, start.lng, end.lat, end.lng]);

  return null;
};

/**
 * Internal helper to handle map clicks and auto-fit bounds
 */
function MapEvents({ onMapClick, pickup, destination, driver }: any) {
  const map = useMap();
  
  useMapEvents({
    click(e) {
      if (onMapClick) onMapClick(e.latlng);
    },
  });

  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (destination) points.push([destination.lat, destination.lng]);
    if (driver) points.push([driver.lat, driver.lng]);
    
    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50] });
    } else if (points.length === 1) {
      map.setView(points[0], 15);
    }
  }, [pickup, destination, driver, map]);

  return null;
}

/**
 * Immersive Leaflet Map component for Cab Tracking.
 * Uses OpenStreetMap tiles and Leaflet Routing Machine for navigation.
 */
export const CustomerTrackingMap: React.FC<CustomerTrackingMapProps> = ({
  pickup,
  destination,
  driver,
  className = "",
  onMapClick
}) => {
  const defaultCenter: [number, number] = [28.6139, 77.2090];

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner ${className}`}>
      <MapContainer 
        center={pickup ? [pickup.lat, pickup.lng] : defaultCenter} 
        zoom={13} 
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapEvents onMapClick={onMapClick} pickup={pickup} destination={destination} driver={driver} />

        {pickup && (
          <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon}>
            <Popup><b>Pickup:</b> {pickup.label || 'Selected Location'}</Popup>
          </Marker>
        )}

        {destination && (
          <Marker position={[destination.lat, destination.lng]} icon={destIcon}>
            <Popup><b>Destination:</b> {destination.label || 'Selected Location'}</Popup>
          </Marker>
        )}

        {driver && (
          <Marker position={[driver.lat, driver.lng]} icon={driverIcon}>
            <Popup><b>Your Ride</b><br/>Driver is approaching</Popup>
          </Marker>
        )}

        {pickup && destination && (
          <RoutingEngine start={pickup} end={destination} />
        )}
      </MapContainer>
    </div>
  );
};