"use client";

import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
// @ts-ignore
import 'leaflet-routing-machine';
import { Coordinates } from '@cab/shared';

/**
 * Driver-App specific icons
 * Gold for Driver (Self), Green for Pickup, Red for Destination
 */
const driverIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

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

interface DriverTrackingMapProps {
  driverLocation: Coordinates;
  pickupLocation?: Coordinates;
  destinationLocation?: Coordinates;
  rideStatus?: 'REQUESTED' | 'ACCEPTED' | 'ARRIVING' | 'STARTED' | 'COMPLETED' | 'CANCELLED';
  className?: string;
}

/**
 * Sub-component to inject the Leaflet Routing Machine engine.
 * For drivers, the "start" is always their current GPS location.
 */
const RoutingEngine = ({ start, end }: { start: Coordinates; end: Coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // @ts-ignore - L.Routing is injected by the plugin
    const routingControl = L.Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      router: L.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      routeWhileDragging: false,
      addWaypoints: false,
      show: false, 
      itinerary: {
        containerClassName: 'hidden',
      },
      createMarker: () => null, // Use our own custom styled markers
      lineOptions: {
        styles: [{ color: '#2A75D3', weight: 6, opacity: 0.8 }],
        extendToWaypoints: true,
        missingRouteTolerance: 100
      }
    }).addTo(map);

    return () => {
      if (map && routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, start.lat, start.lng, end.lat, end.lng]);

  return null;
};

/**
 * Keeps the map focused on the driver and their current target
 */
function MapAutoFitter({ driver, pickup, destination, status }: any) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [[driver.lat, driver.lng]];
    
    if ((status === 'ACCEPTED' || status === 'ARRIVING') && pickup) {
      points.push([pickup.lat, pickup.lng]);
    } else if (status === 'STARTED' && destination) {
      points.push([destination.lat, destination.lng]);
    }

    if (points.length > 1) {
      map.fitBounds(L.latLngBounds(points), { padding: [70, 70] });
    } else {
      map.setView(points[0], 16);
    }
  }, [driver, pickup, destination, status, map]);

  return null;
}

/**
 * Immersive Map component for the Driver App.
 * Routes to Pickup if arriving, or to Destination if trip started.
 */
export const DriverTrackingMap: React.FC<DriverTrackingMapProps> = ({
  driverLocation,
  pickupLocation,
  destinationLocation,
  rideStatus,
  className = ""
}) => {
  // Determine the active navigation target based on ride lifecycle
  const navigationTarget = (rideStatus === 'ACCEPTED' || rideStatus === 'ARRIVING') 
    ? pickupLocation 
    : (rideStatus === 'STARTED') 
      ? destinationLocation 
      : null;

  return (
    <div className={`relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner ${className}`}>
      {/* FORCE LEAFLET ROUTING PANEL TO HIDE */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-routing-container, .leaflet-routing-error {
          display: none !important;
        }
      `}} />

      <MapContainer 
        center={[driverLocation.lat, driverLocation.lng]} 
        zoom={15} 
        zoomControl={false}
        className="h-full w-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapAutoFitter 
          driver={driverLocation} 
          pickup={pickupLocation} 
          destination={destinationLocation} 
          status={rideStatus} 
        />

        {/* Always show Driver (Self) */}
        <Marker position={[driverLocation.lat, driverLocation.lng]} icon={driverIcon}>
          <Popup><b>You (Driver)</b></Popup>
        </Marker>

        {/* Show active target marker */}
        {navigationTarget && (
          <Marker 
            position={[navigationTarget.lat, navigationTarget.lng]} 
            icon={rideStatus === 'STARTED' ? destIcon : pickupIcon}
          >
            <Popup><b>{rideStatus === 'STARTED' ? 'Drop-off' : 'Pickup'} Point</b></Popup>
          </Marker>
        )}

        {/* Draw road-aware route to the active target */}
        {navigationTarget && (
          <RoutingEngine start={driverLocation} end={navigationTarget} />
        )}
      </MapContainer>
    </div>
  );
};