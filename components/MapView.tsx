"use client";

import { MapContainer, TileLayer, CircleMarker, Tooltip, useMap } from "react-leaflet";
import { useRouter } from "next/navigation";
import "leaflet/dist/leaflet.css";
import { BAND_COLOR } from "@/lib/format";
import type { RiskBand } from "@/lib/types";

export interface MapMarker {
  id: string;
  name: string;
  operator: string;
  country: string;
  lat: number;
  lng: number;
  band: RiskBand;
  score: number;
}

function FitToMarkers({ markers, selectedId }: { markers: MapMarker[]; selectedId?: string }) {
  const map = useMap();
  const selected = markers.find((m) => m.id === selectedId);
  if (selected) {
    map.setView([selected.lat, selected.lng], 6, { animate: true });
  }
  return null;
}

export default function MapView({
  markers,
  selectedId,
  height = 460,
}: {
  markers: MapMarker[];
  selectedId?: string;
  height?: number;
}) {
  const router = useRouter();
  return (
    <MapContainer
      center={[-20, -10]}
      zoom={2}
      minZoom={2}
      worldCopyJump
      scrollWheelZoom
      style={{ height, width: "100%", borderRadius: 12 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution='&copy; OpenStreetMap &copy; CARTO'
      />
      <FitToMarkers markers={markers} selectedId={selectedId} />
      {markers.map((m) => {
        const color = BAND_COLOR[m.band];
        const radius = m.band === "critical" ? 11 : m.band === "elevated" ? 9 : 7;
        const isSel = m.id === selectedId;
        return (
          <CircleMarker
            key={m.id}
            center={[m.lat, m.lng]}
            radius={radius}
            pathOptions={{
              color,
              weight: isSel ? 3 : 1.5,
              fillColor: color,
              fillOpacity: m.band === "stable" ? 0.5 : 0.8,
            }}
            eventHandlers={{ click: () => router.push(`/facility/${m.id}`) }}
          >
            <Tooltip direction="top" offset={[0, -radius]} opacity={1}>
              <div style={{ minWidth: 160 }}>
                <div style={{ fontWeight: 600 }}>{m.name}</div>
                <div style={{ fontSize: 11, color: "#8b9bb4" }}>
                  {m.operator} · {m.country}
                </div>
                <div style={{ fontSize: 11, marginTop: 2, color }}>
                  Risk {m.score} · {m.band}
                </div>
              </div>
            </Tooltip>
          </CircleMarker>
        );
      })}
    </MapContainer>
  );
}
