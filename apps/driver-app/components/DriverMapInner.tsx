"use client";

import { useEffect, useMemo } from "react";
import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMap } from "react-leaflet";

// IMPORTANT: Import css first
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine'; // Dynamic injection of L.Routing happens here
import { Coordinates } from "@cab/shared";

// Fix Leaflet's default marker asset icon pathing bug in Webpack/Next.js platforms
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Leaflet Icons for Driver Nav
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

/**
 * Sub-component to inject the Leaflet Routing Machine engine.
 */
const RoutingEngine = ({ start, end }: { start: Coordinates; end: Coordinates }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !start || !end) return;

    // FIXED: Changed L.Routing to (L as any).Routing to bypass strict production type checking
    const routingControl = (L as any).Routing.control({
      waypoints: [
        L.latLng(start.lat, start.lng),
        L.latLng(end.lat, end.lng)
      ],
      router: (L as any).Routing.osrmv1({ serviceUrl: 'https://router.project-osrm.org/route/v1' }),
      routeWhileDragging: false,
      addWaypoints: false,
      show: false, 
      itinerary: {
        containerClassName: 'hidden',
      },
      createMarker: () => null, // Use our own custom styled markers
      lineOptions: {
        styles: [{ color: '#2563eb', weight: 6, opacity: 0.8 }],
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

// Fit map viewport automatically to encapsulate all active route coordinates for Leaflet
function FitRouteBounds({
  pickup,
  destination,
  driver
}: {
  pickup?: Coordinates;
  destination?: Coordinates;
  driver?: Coordinates;
}) {
  const map = useMap();

  useEffect(() => {
    const points: L.LatLngExpression[] = [];
    if (pickup) points.push([pickup.lat, pickup.lng]);
    if (destination) points.push([destination.lat, destination.lng]);
    if (driver) points.push([driver.lat, driver.lng]);

    if (points.length > 1) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15, animate: false });
    } else if (points.length === 1) {
      map.setView(points[0], 15, { animate: false });
    }
    
    // In Next.js layouts, mapping instances render before structural styling completes.
    setTimeout(() => {
      map.invalidateSize();
    }, 200);

  }, [pickup, destination, driver, map]);

  return null;
}

export default function DriverMapInner({
  current,
  pickup,
  destination
}: {
  current?: Coordinates;
  pickup?: Coordinates;
  destination?: Coordinates;
}) {
  const center: [number, number] = current ? [current.lat, current.lng] : [28.6139, 77.209];
  const mapKey = useMemo(() => `driver-map-${Math.random().toString(36).slice(2)}`, []);

  return (
    /* Added explicit height classes & minimum sizes to the wrapper to prevent map collapse */
    <div className="w-full h-72 min-h-[288px] md:h-[480px] md:min-h-[480px] overflow-hidden rounded-2xl border border-slate-800 shadow-2xl relative z-10">
      
      {/* GLOBAL ROUTING MACHINE LAYOUT SHIELD */}
      <style dangerouslySetInnerHTML={{ __html: `
        .leaflet-routing-container, 
        .leaflet-routing-error,
        .leaflet-bar.leaflet-routing-container {
          display: none !important;
          visibility: hidden !important;
          opacity: 0 !important;
          height: 0 !important;
          width: 0 !important;
          overflow: hidden !important;
        }
      `}} />

      <MapContainer 
        key={mapKey}
        center={center} 
        zoom={13} 
        zoomControl={false} 
        style={{ height: "100%", width: "100%" }} /* Added inline style safety fallback */
        className="h-full w-full"
      >
        <FitRouteBounds pickup={pickup} destination={destination} driver={current} />
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {current && <Marker position={[current.lat, current.lng]} icon={driverIcon} />}
        {pickup && <Marker position={[pickup.lat, pickup.lng]} icon={pickupIcon} />}
        {destination && <Marker position={[destination.lat, destination.lng]} icon={destIcon} />}

        {/* Show route to pickup if en route to pickup */}
        {current && pickup && (
          <RoutingEngine start={current} end={pickup} />
        )}
        
        {/* Show route from pickup to destination for the trip */}
        {pickup && destination && (
           <RoutingEngine start={pickup} end={destination} />
        )}
      </MapContainer>
    </div>
  );
        }
