"use client";

import dynamic from "next/dynamic";
import type { MapMarker } from "./MapView";

// Leaflet touches `window`, so load the map only on the client.
const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
  loading: () => (
    <div
      className="flex items-center justify-center rounded-xl border border-border bg-surface text-sm text-muted"
      style={{ height: 460 }}
    >
      Loading satellite map…
    </div>
  ),
});

export function MapPanel({
  markers,
  selectedId,
  focusId,
  focusTick,
  onHover,
  height,
}: {
  markers: MapMarker[];
  selectedId?: string;
  focusId?: string;
  focusTick?: number;
  onHover?: (id: string | null) => void;
  height?: number;
}) {
  return (
    <MapView
      markers={markers}
      selectedId={selectedId}
      focusId={focusId}
      focusTick={focusTick}
      onHover={onHover}
      height={height}
    />
  );
}
