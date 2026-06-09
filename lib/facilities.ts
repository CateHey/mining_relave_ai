import type { Facility } from "./types";

// Fixed reference date for the demo so every chart and assessment is reproducible.
export const NOW = new Date("2026-06-09T00:00:00Z");

/** Internal behaviour profile that drives the synthetic InSAR generator. */
export interface DeformationProfile {
  /** Background subsidence rate, mm/yr (negative = settling). */
  baseRateMmYr: number;
  /** Extra rate that ramps in over the trailing months (the precursor). */
  rampRateMmYr: number;
  /** Fraction of the window over which the ramp builds (0..1, 1 = whole window). */
  rampStart: number;
  /** Sensitivity of displacement to rainfall (mm displacement per mm rain). */
  rainSensitivity: number;
  /** Measurement noise sd (mm) — higher = noisier interferogram. */
  noiseMm: number;
  /** Mean interferometric coherence 0..1. */
  coherence: number;
}

export const PROFILES: Record<string, DeformationProfile> = {
  // ── The story dam: accelerating wall movement + rainfall coupling (CRITICAL)
  "au-mtcarbine": { baseRateMmYr: -6, rampRateMmYr: -120, rampStart: 0.55, rainSensitivity: 0.06, noiseMm: 1.8, coherence: 0.85 },
  // ── Elevated: slow but real acceleration, worth an inspection
  "pe-quellaveco-n": { baseRateMmYr: -8, rampRateMmYr: -45, rampStart: 0.55, rainSensitivity: 0.04, noiseMm: 2.0, coherence: 0.76 },
  "au-savagervr": { baseRateMmYr: -5, rampRateMmYr: -40, rampStart: 0.58, rainSensitivity: 0.05, noiseMm: 1.9, coherence: 0.73 },
  // ── Ground-truth historical failures (known-positive precursor signatures)
  "br-corrego": { baseRateMmYr: -10, rampRateMmYr: -110, rampStart: 0.5, rainSensitivity: 0.03, noiseMm: 2.4, coherence: 0.7 },
  "pe-cobriza": { baseRateMmYr: -8, rampRateMmYr: -95, rampStart: 0.55, rainSensitivity: 0.05, noiseMm: 2.2, coherence: 0.66 },
};

/** Default stable-ish profile for the long tail of well-behaved dams. */
export function defaultProfile(seed: number): DeformationProfile {
  const r = (seed % 1000) / 1000;
  return {
    baseRateMmYr: -2 - r * 4,
    rampRateMmYr: -r * 4,
    rampStart: 0.7,
    rainSensitivity: 0.01 + r * 0.02,
    noiseMm: 1.8 + r * 1.0,
    coherence: 0.78 + (1 - r) * 0.12,
  };
}

export const FACILITIES: Facility[] = [
  {
    id: "au-mtcarbine",
    name: "Mt Carbine North TSF",
    operator: "Tableland Resources",
    country: "Australia",
    region: "Far North Queensland",
    lat: -16.86,
    lng: 145.13,
    damType: "upstream",
    heightM: 48,
    storedVolumeMm3: 22,
    status: "active",
    populationAtRisk: 1400,
    midTier: true,
  },
  {
    id: "au-savagervr",
    name: "Savage River Cell 4",
    operator: "Goldamere Pty",
    country: "Australia",
    region: "Western Tasmania",
    lat: -41.58,
    lng: 145.18,
    damType: "centreline",
    heightM: 35,
    storedVolumeMm3: 14,
    status: "active",
    populationAtRisk: 310,
    midTier: true,
  },
  {
    id: "au-peakhill",
    name: "Peak Hill Legacy Impoundment",
    operator: "NSW Resources Regulator",
    country: "Australia",
    region: "Central West NSW",
    lat: -32.72,
    lng: 148.19,
    damType: "upstream",
    heightM: 21,
    storedVolumeMm3: 4,
    status: "abandoned",
    populationAtRisk: 90,
    midTier: true,
  },
  {
    id: "au-mountmorgan",
    name: "Mount Morgan No.7 Dam",
    operator: "QLD DRMME",
    country: "Australia",
    region: "Central Queensland",
    lat: -23.65,
    lng: 150.38,
    damType: "upstream",
    heightM: 18,
    storedVolumeMm3: 3,
    status: "abandoned",
    populationAtRisk: 220,
    historicalFailure: "Chronic acid drainage; partial overtopping 1990s",
    midTier: true,
  },
  {
    id: "au-cadia-s",
    name: "Cadia South Expansion",
    operator: "Cadia Holdings",
    country: "Australia",
    region: "Central West NSW",
    lat: -33.46,
    lng: 148.99,
    damType: "centreline",
    heightM: 52,
    storedVolumeMm3: 120,
    status: "active",
    populationAtRisk: 600,
    historicalFailure: "2018 northern embankment slump (NSW)",
    midTier: false,
  },
  {
    id: "pe-quellaveco-n",
    name: "Quellaveco North Cell",
    operator: "Sierra Andina Mining",
    country: "Peru",
    region: "Moquegua",
    lat: -17.1,
    lng: -70.78,
    damType: "downstream",
    heightM: 60,
    storedVolumeMm3: 95,
    status: "active",
    populationAtRisk: 2100,
    midTier: true,
  },
  {
    id: "pe-cobriza",
    name: "Cobriza Tailings Deposit",
    operator: "Doe Run Andes",
    country: "Peru",
    region: "Huancavelica",
    lat: -12.58,
    lng: -74.46,
    damType: "upstream",
    heightM: 28,
    storedVolumeMm3: 9,
    status: "legacy",
    populationAtRisk: 800,
    historicalFailure: "2019 breach — ~67,000 m³ released to the Mantaro River",
    midTier: true,
  },
  {
    id: "pe-pasco",
    name: "Cerro de Pasco Quiulacocha",
    operator: "Activos Mineros (state)",
    country: "Peru",
    region: "Pasco",
    lat: -10.7,
    lng: -76.27,
    damType: "upstream",
    heightM: 24,
    storedVolumeMm3: 12,
    status: "abandoned",
    populationAtRisk: 1700,
    midTier: true,
  },
  {
    id: "br-corrego",
    name: "Córrego do Feijão B-V (ref.)",
    operator: "Reference / ground-truth",
    country: "Brazil",
    region: "Minas Gerais",
    lat: -20.12,
    lng: -44.12,
    damType: "upstream",
    heightM: 86,
    storedVolumeMm3: 12,
    status: "legacy",
    populationAtRisk: 270,
    historicalFailure: "2019 Brumadinho collapse — ~270 fatalities (known-positive case)",
    midTier: false,
  },
  {
    id: "cl-elteniente",
    name: "Carén Tailings (Andes ref.)",
    operator: "Reference / Andean baseline",
    country: "Chile",
    region: "O'Higgins",
    lat: -34.13,
    lng: -70.78,
    damType: "downstream",
    heightM: 110,
    storedVolumeMm3: 600,
    status: "active",
    populationAtRisk: 450,
    midTier: false,
  },
];

export function getFacility(id: string): Facility | undefined {
  return FACILITIES.find((f) => f.id === id);
}
