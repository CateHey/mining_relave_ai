import type { IndicatorPoint, IndicatorSeries } from "./types";
import { NOW, PROFILES, defaultProfile, EnvProfile, getMine } from "./mines";
import { hashSeed, makeRng, gaussian } from "./prng";

const MONTHS = 24;

const SOURCES = ["Sentinel-2 (NDVI)", "Sentinel-1 (InSAR)", "Sentinel-5P (aerosol)", "ESA WorldCover"];

function profileFor(mineId: string): EnvProfile {
  return PROFILES[mineId] ?? defaultProfile(hashSeed(mineId));
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * Reproduce a realistic monthly environmental indicator series from a behaviour
 * profile. Deterministic in the mine id — same input, same series, so the server
 * and client always agree. In production this is replaced by queries against the
 * processed Sentinel-2 / Sentinel-1 / Sentinel-5P composites.
 */
export function getIndicatorSeries(mineId: string): IndicatorSeries {
  const p = profileFor(mineId);
  const rng = makeRng(`${mineId}:env`);
  const points: IndicatorPoint[] = [];

  let canopyLoss = 0;
  let subsidence = 0;
  // Footprint starts at the site's existing disturbed area and grows from there,
  // so growth % stays meaningful (not measured from zero).
  const baseArea = getMine(mineId)?.areaHa ?? 1000;
  let footprintGrowth = 0;

  for (let i = 0; i < MONTHS; i++) {
    const monthsAgo = MONTHS - 1 - i;
    const date = new Date(NOW.getTime() - monthsAgo * 30 * 86400000);
    const tYr = i / 12; // years since window start

    // Seasonal wet/dry cycle drives turbidity, dust and cloud cover.
    const phase = (date.getTime() / 86400000 / 365) * 2 * Math.PI;
    const wet = 0.5 + 0.5 * Math.sin(phase + 1.0); // 0 dry .. 1 wet

    // Vegetation health trend + seasonal greening + noise.
    const ndvi = clamp(
      p.ndviStart + p.ndviTrendYr * tYr + 0.04 * Math.sin(phase) + gaussian(rng, 0, 0.015),
      0.05,
      0.95,
    );

    // Cumulative clearing and footprint growth (monotonic-ish, with monthly steps).
    canopyLoss += Math.max(0, (p.canopyLossHaYr / 12) * (0.8 + 0.6 * rng()));
    footprintGrowth += (p.footprintHaYr / 12) * (0.8 + 0.5 * rng());
    const footprint = baseArea + footprintGrowth;

    // Water turbidity rises in the wet season and with the secular trend.
    const waterTurbidity = clamp(
      p.turbidityBase + p.turbidityTrendYr * tYr + 22 * wet + gaussian(rng, 0, 4),
      0,
      100,
    );

    // Dust peaks in the dry season.
    const dustIndex = clamp(p.dustBase + 18 * (1 - wet) + gaussian(rng, 0, 5), 0, 100);

    // Ground subsidence accumulates.
    subsidence += (p.subsidenceMmYr / 12) * (0.85 + 0.3 * rng());

    // Optical data quality drops under wet-season cloud.
    const dataQuality = clamp(p.dataQuality - 0.25 * wet + gaussian(rng, 0, 0.04), 0.2, 0.99);

    points.push({
      date: date.toISOString().slice(0, 10),
      ndvi: Math.round(ndvi * 100) / 100,
      canopyLossHa: Math.round(canopyLoss),
      waterTurbidity: Math.round(waterTurbidity),
      dustIndex: Math.round(dustIndex),
      footprintHa: Math.round(footprint),
      subsidenceMm: Math.round(subsidence * 10) / 10,
      dataQuality: Math.round(dataQuality * 100) / 100,
    });
  }

  return { mineId, sources: SOURCES, points };
}
