"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import type { LatLngExpression } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Marker icon fix
const markerIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapProps {
  lat: number;
  lng: number;
}

export default function Map({ lat, lng }: MapProps) {
  const position: LatLngExpression = [lat, lng];

  return (
    <div className="w-full h-[500px] rounded-lg overflow-hidden z-0">
      <MapContainer
        center={position}
        zoom={15}
        style={{ width: "100%", height: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* ✨ icon props TypeScript bilan to‘g‘ri ishlayapti */}
        <Marker position={position} icon={markerIcon}>
          <Popup>
            <div>
              Bu bizning manzil!
              <br />
              <a
                href={`https://www.google.com/maps?q=${lat},${lng}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline"
              >
                Google Maps’da ochish
              </a>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
