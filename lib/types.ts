// Domain model for Relave AI — satellite-and-AI tailings-failure early warning.
// This layer is intentionally decoupled from the synthetic data source so it can be
// swapped for a real InSAR ingestion / inference backend without touching the UI.

export type DamType = "upstream" | "downstream" | "centreline" | "unknown";

export type FacilityStatus = "active" | "legacy" | "abandoned";

export type RiskBand = "stable" | "elevated" | "critical";

export type ActionType = "monitor" | "inspect" | "escalate" | "report";

/** A Tailings Storage Facility (TSF) — the dam being monitored. */
export interface Facility {
  id: string;
  name: string;
  operator: string;
  country: "Australia" | "Peru" | "Brazil" | "Chile" | "China";
  region: string;
  lat: number;
  lng: number;
  damType: DamType;
  heightM: number;
  /** Stored tailings volume, million cubic metres. */
  storedVolumeMm3: number;
  status: FacilityStatus;
  /** Consequence category — estimated population in the inundation path. */
  populationAtRisk: number;
  /** Whether this facility has a documented historical failure (ground-truth case). */
  historicalFailure?: string;
  /** True if the facility is in the demo "watchlist" segment (mid-tier / legacy). */
  midTier: boolean;
}

/** One InSAR observation: cumulative line-of-sight displacement at a point in time. */
export interface DeformationPoint {
  /** ISO date of the SAR acquisition. */
  date: string;
  /** Cumulative displacement in mm (negative = subsidence / wall slumping). */
  displacementMm: number;
  /** Interferometric coherence 0..1 — a proxy for measurement quality. */
  coherence: number;
  /** Rainfall over the interval (mm), from ERA5 — the dynamic trigger layer. */
  rainfallMm: number;
  /** Peak local seismic magnitude over the interval, from USGS (0 if none). */
  seismicMag: number;
}

export interface DeformationSeries {
  facilityId: string;
  /** Satellite source of the base layer. */
  source: "Sentinel-1" | "ICEYE" | "Capella";
  /** Revisit cadence in days. */
  revisitDays: number;
  points: DeformationPoint[];
}

export interface RiskFactor {
  label: string;
  /** Plain-language detail shown to the engineer. */
  detail: string;
  /** Relative contribution to the score, 0..1. */
  weight: number;
  severity: RiskBand;
}

export interface RiskAssessment {
  facilityId: string;
  /** Composite risk score 0..100. */
  score: number;
  band: RiskBand;
  /** Mean line-of-sight velocity over the trailing window (mm/yr). */
  velocityMmYr: number;
  /** Change in velocity across the window (mm/yr²) — the acceleration signal. */
  accelerationMmYr2: number;
  /** Model confidence 0..1, driven by coherence and series length. */
  confidence: number;
  /** One-paragraph, plain-language explanation of the read. */
  explanation: string;
  factors: RiskFactor[];
  recommendedAction: ActionType;
  /** ISO timestamp of the assessment. */
  assessedAt: string;
}

export interface Alert {
  id: string;
  facilityId: string;
  facilityName: string;
  date: string;
  band: RiskBand;
  title: string;
  message: string;
}

export interface AuditEntry {
  timestamp: string;
  facilityId: string;
  facilityName: string;
  action: string;
  detail: string;
  actor: string;
}
