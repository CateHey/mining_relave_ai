// Domain model for Relave AI — satellite-and-AI ESG & environmental intelligence
// for mine sites. The data layer is decoupled from the synthetic source so it can
// be swapped for real Sentinel-2 / Sentinel-1 / Sentinel-5P ingestion later.

export type Commodity = "Copper" | "Gold" | "Coal" | "Nickel" | "Lithium" | "Iron ore";

export type MineStatus = "operating" | "expanding" | "care & maintenance" | "rehabilitation";

/** Reused 3-level scale: stable = low impact, elevated = watch, critical = high impact. */
export type RiskBand = "stable" | "elevated" | "critical";

/** Reused action scale, relabelled for ESG: report=disclose, inspect=investigate, escalate=remediate. */
export type ActionType = "monitor" | "inspect" | "escalate" | "report";

export type DimensionKey = "vegetation" | "water" | "air" | "land" | "ground";

export interface MineSite {
  id: string;
  name: string;
  operator: string;
  country: "Australia" | "Peru" | "Brazil" | "Chile";
  region: string;
  commodity: Commodity;
  lat: number;
  lng: number;
  status: MineStatus;
  /** Disturbed footprint in hectares. */
  areaHa: number;
  /** Nearest community / receptor in the impact buffer. */
  nearbyCommunity: string;
  /** Nearest watercourse downstream of the site. */
  waterBody: string;
  /** A noted real-world-style ESG context (illustrative). */
  esgNote?: string;
  /** True for the mid-tier / under-monitored segment Relave AI serves first. */
  midTier: boolean;
}

/** One monthly cloud-free observation across the environmental indicators. */
export interface IndicatorPoint {
  /** ISO date of the monthly composite. */
  date: string;
  /** Vegetation health (NDVI proxy) in the buffer, 0..1 (higher = greener). */
  ndvi: number;
  /** Cumulative vegetation/forest cleared since the window start (ha). */
  canopyLossHa: number;
  /** Water turbidity / discolouration index downstream, 0..100 (higher = worse). */
  waterTurbidity: number;
  /** Dust / aerosol proxy over the site, 0..100 (higher = worse). */
  dustIndex: number;
  /** Disturbed mine footprint to date (ha). */
  footprintHa: number;
  /** Cumulative ground subsidence from InSAR (mm, negative = settling). */
  subsidenceMm: number;
  /** Fraction of the month with usable (cloud-free) optical data, 0..1. */
  dataQuality: number;
}

export interface IndicatorSeries {
  mineId: string;
  /** Free satellite sources powering the indicators. */
  sources: string[];
  points: IndicatorPoint[];
}

export interface EsgFactor {
  dimension: DimensionKey;
  label: string;
  /** Plain-language detail for the analyst. */
  detail: string;
  /** Impact sub-score for this dimension, 0..100 (higher = more concern). */
  score: number;
  /** Relative contribution to the composite, 0..1. */
  weight: number;
  band: RiskBand;
  /** Direction of change over the window. */
  trend: "improving" | "worsening" | "steady";
}

export interface EsgAssessment {
  mineId: string;
  /** Composite environmental impact score 0..100 (higher = more concern). */
  score: number;
  band: RiskBand;
  /** Composite direction of change. */
  trend: "improving" | "worsening" | "steady";
  /** Model confidence 0..1, driven by cloud-free data availability and series length. */
  confidence: number;
  /** One-paragraph, plain-language explanation. */
  explanation: string;
  factors: EsgFactor[];
  recommendedAction: ActionType;
  assessedAt: string;
}

export interface Alert {
  id: string;
  mineId: string;
  mineName: string;
  date: string;
  band: RiskBand;
  dimension: DimensionKey;
  title: string;
  message: string;
}

export interface AuditEntry {
  timestamp: string;
  mineId: string;
  mineName: string;
  action: string;
  detail: string;
  actor: string;
}
