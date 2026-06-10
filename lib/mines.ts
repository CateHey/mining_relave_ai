import type { MineSite } from "./types";

// Fixed reference date for the demo so every chart and assessment is reproducible.
export const NOW = new Date("2026-06-09T00:00:00Z");

/** Internal environmental behaviour profile that drives the synthetic indicators. */
export interface EnvProfile {
  /** Baseline vegetation health (NDVI) in the buffer, 0..1. */
  ndviStart: number;
  /** NDVI change per year (negative = greening loss, positive = recovery). */
  ndviTrendYr: number;
  /** Vegetation/forest cleared per year (ha). */
  canopyLossHaYr: number;
  /** Baseline water turbidity index 0..100. */
  turbidityBase: number;
  /** Turbidity change per year. */
  turbidityTrendYr: number;
  /** Baseline dust/aerosol index 0..100. */
  dustBase: number;
  /** Mine footprint growth per year (ha). */
  footprintHaYr: number;
  /** Ground subsidence per year (mm, negative = settling). */
  subsidenceMmYr: number;
  /** Mean cloud-free data availability 0..1 (lower in wet tropics). */
  dataQuality: number;
}

export const PROFILES: Record<string, EnvProfile> = {
  // ── Flagship HIGH impact: Amazon alluvial gold — rapid deforestation + muddy rivers
  "pe-madrededios": { ndviStart: 0.78, ndviTrendYr: -0.27, canopyLossHaYr: 720, turbidityBase: 45, turbidityTrendYr: 34, dustBase: 18, footprintHaYr: 620, subsidenceMmYr: -11, dataQuality: 0.55 },
  // ── Flagship HIGH impact: Andean copper — water turbidity + community water conflict
  "pe-lasbambas-s": { ndviStart: 0.42, ndviTrendYr: -0.05, canopyLossHaYr: 60, turbidityBase: 38, turbidityTrendYr: 26, dustBase: 40, footprintHaYr: 140, subsidenceMmYr: -9, dataQuality: 0.8 },
  // ── HIGH/MODERATE: Amazon iron frontier — deforestation
  "br-carajas": { ndviStart: 0.82, ndviTrendYr: -0.2, canopyLossHaYr: 520, turbidityBase: 22, turbidityTrendYr: 12, dustBase: 32, footprintHaYr: 560, subsidenceMmYr: -8, dataQuality: 0.6 },
  // ── MODERATE: coal — dust + water, mature footprint
  "au-huntervalley": { ndviStart: 0.5, ndviTrendYr: -0.03, canopyLossHaYr: 70, turbidityBase: 30, turbidityTrendYr: 12, dustBase: 58, footprintHaYr: 90, subsidenceMmYr: -16, dataQuality: 0.85 },
  // ── MODERATE: lithium brine — water stress in the Atacama
  "cl-atacama-li": { ndviStart: 0.18, ndviTrendYr: -0.02, canopyLossHaYr: 10, turbidityBase: 20, turbidityTrendYr: 14, dustBase: 46, footprintHaYr: 120, subsidenceMmYr: -22, dataQuality: 0.92 },
  // ── MODERATE: copper expansion — footprint + dust
  "au-mtpleasant": { ndviStart: 0.55, ndviTrendYr: -0.04, canopyLossHaYr: 85, turbidityBase: 16, turbidityTrendYr: 6, dustBase: 44, footprintHaYr: 130, subsidenceMmYr: -6, dataQuality: 0.86 },
  // ── LOW / improving: rehabilitation success — NDVI recovering (the positive story)
  "au-kambalda-rehab": { ndviStart: 0.34, ndviTrendYr: 0.14, canopyLossHaYr: 0, turbidityBase: 12, turbidityTrendYr: -4, dustBase: 20, footprintHaYr: -8, subsidenceMmYr: -2, dataQuality: 0.88 },
};

/** Default low-impact profile for the long tail of well-behaved sites. */
export function defaultProfile(seed: number): EnvProfile {
  const r = (seed % 1000) / 1000;
  return {
    ndviStart: 0.45 + r * 0.2,
    ndviTrendYr: -0.01 - r * 0.02,
    canopyLossHaYr: 10 + r * 30,
    turbidityBase: 10 + r * 12,
    turbidityTrendYr: -2 + r * 6,
    dustBase: 18 + r * 20,
    footprintHaYr: 20 + r * 40,
    subsidenceMmYr: -2 - r * 6,
    dataQuality: 0.82 + (1 - r) * 0.12,
  };
}

export const MINES: MineSite[] = [
  {
    id: "pe-madrededios",
    name: "Madre de Dios Alluvial",
    operator: "Consorcio Aurífero Amazónico",
    country: "Peru",
    region: "Madre de Dios",
    commodity: "Gold",
    lat: -12.85,
    lng: -70.03,
    status: "operating",
    areaHa: 3100,
    nearbyCommunity: "Boca Colorado",
    waterBody: "Río Madre de Dios",
    esgNote: "Alluvial gold belt — rapid rainforest clearing and mercury-linked river turbidity",
    midTier: true,
  },
  {
    id: "pe-lasbambas-s",
    name: "Las Bambas South Cell",
    operator: "Apurímac Copper SA",
    country: "Peru",
    region: "Apurímac",
    commodity: "Copper",
    lat: -14.08,
    lng: -72.32,
    status: "operating",
    areaHa: 4200,
    nearbyCommunity: "Challhuahuacho",
    waterBody: "Río Ferrobamba",
    esgNote: "Recurrent water-use and road-dust disputes with downstream farming communities",
    midTier: true,
  },
  {
    id: "br-carajas",
    name: "Carajás Frontier Pit",
    operator: "Pará Ferro Mineração",
    country: "Brazil",
    region: "Pará",
    commodity: "Iron ore",
    lat: -6.06,
    lng: -50.16,
    status: "expanding",
    areaHa: 5400,
    nearbyCommunity: "Parauapebas",
    waterBody: "Igarapé Azul",
    esgNote: "Expansion pushing into Amazon canopy at the reserve boundary",
    midTier: false,
  },
  {
    id: "au-huntervalley",
    name: "Hunter Valley Coal Complex",
    operator: "Coalfields Operations Pty",
    country: "Australia",
    region: "New South Wales",
    commodity: "Coal",
    lat: -32.56,
    lng: 151.05,
    status: "operating",
    areaHa: 2600,
    nearbyCommunity: "Singleton",
    waterBody: "Hunter River",
    esgNote: "Air-quality and dust scrutiny across the Upper Hunter airshed",
    midTier: true,
  },
  {
    id: "cl-atacama-li",
    name: "Atacama Litio Brine",
    operator: "Salar Resources SpA",
    country: "Chile",
    region: "Antofagasta",
    commodity: "Lithium",
    lat: -23.5,
    lng: -68.25,
    status: "expanding",
    areaHa: 1800,
    nearbyCommunity: "Peine",
    waterBody: "Salar de Atacama",
    esgNote: "Brine extraction and freshwater balance in a water-scarce basin",
    midTier: true,
  },
  {
    id: "au-mtpleasant",
    name: "Mount Pleasant Copper",
    operator: "Tableland Resources",
    country: "Australia",
    region: "Queensland",
    commodity: "Copper",
    lat: -20.72,
    lng: 140.51,
    status: "expanding",
    areaHa: 1200,
    nearbyCommunity: "Cloncurry",
    waterBody: "Cloncurry River",
    midTier: true,
  },
  {
    id: "au-kambalda-rehab",
    name: "Kambalda Nickel Rehab",
    operator: "Goldfields Rehabilitation Co",
    country: "Australia",
    region: "Western Australia",
    commodity: "Nickel",
    lat: -31.2,
    lng: 121.66,
    status: "rehabilitation",
    areaHa: 900,
    nearbyCommunity: "Kambalda",
    waterBody: "Lake Lefroy",
    esgNote: "Progressive rehabilitation — revegetation tracking ahead of closure plan",
    midTier: true,
  },
  {
    id: "pe-cerroverde-n",
    name: "Cerro Verde North",
    operator: "Arequipa Minerals",
    country: "Peru",
    region: "Arequipa",
    commodity: "Copper",
    lat: -16.53,
    lng: -71.6,
    status: "operating",
    areaHa: 3300,
    nearbyCommunity: "Uchumayo",
    waterBody: "Río Chili",
    midTier: false,
  },
  {
    id: "au-cloncurry-au",
    name: "Cloncurry Gold Project",
    operator: "Selwyn Gold Pty",
    country: "Australia",
    region: "Queensland",
    commodity: "Gold",
    lat: -21.42,
    lng: 140.69,
    status: "operating",
    areaHa: 700,
    nearbyCommunity: "Cloncurry",
    waterBody: "Corella River",
    midTier: true,
  },
  {
    id: "pe-yanacocha-h",
    name: "Yanacocha Highlands",
    operator: "Cajamarca Gold SA",
    country: "Peru",
    region: "Cajamarca",
    commodity: "Gold",
    lat: -6.98,
    lng: -78.51,
    status: "care & maintenance",
    areaHa: 2100,
    nearbyCommunity: "Cajamarca",
    waterBody: "Río Grande",
    midTier: true,
  },
];

export function getMine(id: string): MineSite | undefined {
  return MINES.find((m) => m.id === id);
}
