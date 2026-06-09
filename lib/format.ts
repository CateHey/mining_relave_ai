import type { ActionType, RiskBand } from "./types";

export const BAND_LABEL: Record<RiskBand, string> = {
  stable: "Stable",
  elevated: "Elevated",
  critical: "Critical",
};

export const BAND_COLOR: Record<RiskBand, string> = {
  stable: "#19e6a3",
  elevated: "#ffc233",
  critical: "#ff4d5e",
};

export const ACTION_LABEL: Record<ActionType, string> = {
  monitor: "Monitor",
  report: "Report",
  inspect: "Inspect",
  escalate: "Escalate",
};

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-AU", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
