import type { ActionType, DimensionKey, RiskBand } from "./types";

// 3-level scale reused as an ESG impact scale.
export const BAND_LABEL: Record<RiskBand, string> = {
  stable: "Low impact",
  elevated: "Watch",
  critical: "High impact",
};

export const BAND_COLOR: Record<RiskBand, string> = {
  stable: "#19e6a3",
  elevated: "#ffc233",
  critical: "#ff4d5e",
};

// Action scale relabelled for ESG workflows.
export const ACTION_LABEL: Record<ActionType, string> = {
  monitor: "Monitor",
  report: "Disclose",
  inspect: "Investigate",
  escalate: "Remediate",
};

export const DIMENSION_META: Record<DimensionKey, { label: string; icon: string }> = {
  vegetation: { label: "Vegetation", icon: "🌿" },
  water: { label: "Water", icon: "💧" },
  air: { label: "Air & dust", icon: "🌫️" },
  land: { label: "Land", icon: "⛰️" },
  ground: { label: "Ground", icon: "📐" },
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
