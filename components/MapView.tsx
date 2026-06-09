"use client";

import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Tooltip, useMap } from "react-leaflet";
import L from "leaflet";
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

function makeIcon(band: RiskBand, active: boolean): L.DivIcon {
  const color = BAND_COLOR[band];
  const size = band === "critical" ? 18 : band === "elevated" ? 15 : 12;
  const animated = band !== "stable";
  const glow = band === "critical" ? 18 : band === "elevated" ? 12 : 7;
  const box = 44;
  return L.divIcon({
    className: "",
    iconSize: [box, box],
    iconAnchor: [box / 2, box / 2],
    html: `
      <div class="relave-marker ${active ? "is-active" : ""}">
        <span class="relave-pulse ${animated ? "is-animated" : ""}" style="background:${color}"></span>
        <span class="relave-dot" style="width:${size}px;height:${size}px;background:${color};box-shadow:0 0 ${glow}px ${color}, 0 0 4px ${color}"></span>
      </div>`,
  } as L.DivIconOptions);
}

function MapController({
  markers,
  focusId,
  focusTick,
}: {
  markers: MapMarker[];
  focusId?: string;
  focusTick?: number;
}) {
  const map = useMap();
  const lastKey = useRef<string>("");

  // Fit to all visible markers whenever the set changes (e.g. a filter is applied).
  useEffect(() => {
    const key = markers.map((m) => m.id).join(",");
    if (key === lastKey.current || markers.length === 0) return;
    lastKey.current = key;
    if (markers.length === 1) {
      map.setView([markers[0].lat, markers[0].lng], 6, { animate: true });
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng] as [number, number]));
    map.fitBounds(bounds, { padding: [50, 50], maxZoom: 5, animate: true });
  }, [markers, map]);

  // Fly to an explicitly focused facility (row "fly to" click). Re-triggers on tick.
  useEffect(() => {
    if (!focusId) return;
    const m = markers.find((x) => x.id === focusId);
    if (m) map.flyTo([m.lat, m.lng], 6, { duration: 0.8 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [focusTick]);

  return null;
}

export default function MapView({
  markers,
  selectedId,
  focusId,
  focusTick,
  onHover,
  height = 460,
}: {
  markers: MapMarker[];
  selectedId?: string;
  focusId?: string;
  focusTick?: number;
  onHover?: (id: string | null) => void;
  height?: number;
}) {
  const router = useRouter();
  return (
    <MapContainer
      center={[-20, 60]}
      zoom={2}
      minZoom={2}
      worldCopyJump
      scrollWheelZoom
      style={{ height, width: "100%", borderRadius: 12 }}
    >
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        attribution="&copy; OpenStreetMap &copy; CARTO"
      />
      <MapController markers={markers} focusId={focusId} focusTick={focusTick} />
      {markers.map((m) => (
        <Marker
          key={m.id}
          position={[m.lat, m.lng]}
          icon={makeIcon(m.band, m.id === selectedId)}
          eventHandlers={{
            click: () => router.push(`/facility/${m.id}`),
            mouseover: () => onHover?.(m.id),
            mouseout: () => onHover?.(null),
          }}
        >
          <Tooltip direction="top" offset={[0, -12]} opacity={1}>
            <div style={{ minWidth: 160 }}>
              <div style={{ fontWeight: 600 }}>{m.name}</div>
              <div style={{ fontSize: 11, color: "#8b9bb4" }}>
                {m.operator} · {m.country}
              </div>
              <div style={{ fontSize: 11, marginTop: 2, color: BAND_COLOR[m.band] }}>
                Risk {m.score} · {m.band}
              </div>
            </div>
          </Tooltip>
        </Marker>
      ))}
    </MapContainer>
  );
}
