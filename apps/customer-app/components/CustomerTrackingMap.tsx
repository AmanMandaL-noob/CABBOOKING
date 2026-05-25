"use client";

import React, { useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import L from 'leaflet';
import { Coordinates } from '@cab/shared';

// Ensure standard Leaflet CSS is loaded
import 'leaflet/dist/leaflet.css';

interface MapLocation {
  lat: number;
  lng: number;
  label?: string;
}

interface CustomerTrackingMapProps {
  pickup?: MapLocation;
  destination?: MapLocation;
  driver?: Coordinates;
  className?: string;
  onMapClick?: (latlng: { lat: number; lng: number }) => void;
}

let pickupIcon: L.Icon;
let destIcon: L.Icon;
let driverIcon: L.Icon;

if (typeof window !== 'undefined') {
  pickupIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  destIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  driverIcon = new L.Icon({
    iconUrl: "https://cdn-icons-png.flaticon.com/512/3089/3089803.png",
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -20]
  });
}

// ============================================================================
// CLIENT-SIDE REAL CORE LEAFLET APPARATUS
// ============================================================================
const RealTrackingMap = () => {
  const { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } = require('react-leaflet');
  require('leaflet-routing-machine');

  const RoutingEngine = ({ start, end }: { start: MapLocation; end: MapLocation }) => {
    const map = useMap();

    useEffect(() => {
      if (!map || !start || !end) return;

      const leafletAny = L as any;
      if (!leafletAny.Routing) return;

      const routingControl = leafletAny.Routing.control({
        waypoints: [
          L.latLng(start.lat, start.lng),
          L.latLng(end.lat, end.lng)
        ],
        router: leafletAny.Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
        routeWhileDragging: false,
        addWaypoints: false,
        draggableWaypoints: false,
        show: false,
        createMarker: () => null,
        lineOptions: {
          styles: [{ color: '#2A75D3', weight: 6, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 100
        }
      }).addTo(map);

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

  function MapEvents({ onMapClick, pickup, destination, driver }: any) {
    const map = useMap();
    
    useMapEvents({
      click(e: any) {
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

  return function MapRenderWrapper({ pickup, destination, driver, onMapClick }: CustomerTrackingMapProps) {
    const defaultCenter: [number, number] = [28.6139, 77.2090];
    const mapCenter = pickup ? [pickup.lat, pickup.lng] : defaultCenter;
    const mapKey = `map-${pickup?.lat}-${pickup?.lng}-${driver?.lat}-${driver?.lng}`;

    return (
      <MapContainer 
        key={mapKey}
        center={mapCenter} 
        zoom={13} 
        zoomControl={false}
        attributionControl={false}
        className="h-full w-full"
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

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
    );
  };
};

const MapSSRGuard = dynamic(
  async () => RealTrackingMap(),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-full w-full items-center justify-center bg-slate-50 min-h-[320px] rounded-2xl">
        <div className="flex flex-col items-center gap-2">
          <span className="animate-spin text-2xl text-teal-600">🌐</span>
          <span className="text-xs font-semibold text-slate-400">Loading live tracking maps safely...</span>
        </div>
      </div>
    )
  }
);

// ============================================================================
// EXPORTABLE WRAPPER ENTRY POINT WITH LIFECYCLE CLEANUP
// ============================================================================
export const CustomerTrackingMap: React.FC<CustomerTrackingMapProps> = (props) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // FIXED: Clean up trailing Leaflet DOM references on component unmount/remount loops
    return () => {
      if (containerRef.current) {
        const mapContainer = containerRef.current.querySelector('.leaflet-container');
        if (mapContainer && (mapContainer as any)._leaflet_id) {
          delete (mapContainer as any)._leaflet_id;
        }
      }
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`relative h-full w-full overflow-hidden rounded-2xl border border-slate-200 shadow-inner ${props.className}`}
    >
      <MapSSRGuard {...props} />
    </div>
  );
};