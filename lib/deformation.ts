import type { DeformationPoint, DeformationSeries } from "./types";
import { NOW, PROFILES, defaultProfile, DeformationProfile } from "./facilities";
import { hashSeed, makeRng, gaussian } from "./prng";

const WINDOW_DAYS = 720; // ~24 months of history
const REVISIT_DAYS = 12; // Sentinel-1 effective revisit

function profileFor(facilityId: string): DeformationProfile {
  return PROFILES[facilityId] ?? defaultProfile(hashSeed(facilityId));
}

/**
 * Reproduce a realistic InSAR cumulative-displacement series from a behaviour
 * profile. Deterministic in the facility id — same input, same series, so the
 * server and client always agree. In production this function is replaced by a
 * query against the processed Sentinel-1 / ICEYE time-series store.
 */
export function getDeformationSeries(facilityId: string): DeformationSeries {
  const p = profileFor(facilityId);
  const rng = makeRng(`${facilityId}:deform`);
  const nPoints = Math.floor(WINDOW_DAYS / REVISIT_DAYS) + 1;
  const dtYr = REVISIT_DAYS / 365;

  const MEAN_RAIN = 50; // reference seasonal mean (mm/interval) — rain enters as an anomaly

  const points: DeformationPoint[] = [];
  let trend = 0; // smooth physical deformation (accumulates only the rate)

  for (let i = 0; i < nPoints; i++) {
    const daysAgo = WINDOW_DAYS - i * REVISIT_DAYS;
    const date = new Date(NOW.getTime() - daysAgo * 86400000);
    const t = i / (nPoints - 1); // 0 (oldest) .. 1 (now)

    // Seasonal rainfall — annual sinusoid + stochastic storms.
    const phase = (date.getTime() / 86400000 / 365) * 2 * Math.PI;
    const seasonal = 35 + 30 * Math.sin(phase + 1.1);
    const storm = rng() < 0.12 ? rng() * 80 : 0;
    const rainfallMm = Math.max(0, seasonal + gaussian(rng, 0, 12) + storm);

    // Precursor ramp: zero until rampStart, then quadratic build-up (acceleration).
    const rampT = t <= p.rampStart ? 0 : (t - p.rampStart) / (1 - p.rampStart);
    const rampFactor = rampT * rampT;
    const rateMmYr = p.baseRateMmYr + p.rampRateMmYr * rampFactor;

    // The smooth deformation trend accumulates only the physical rate.
    trend += rateMmYr * dtYr;

    // Rainfall enters as a mean-zero transient (saturation swells then rebounds),
    // so it modulates the signal and creates coupling without inflating the trend.
    const rainTransient = -p.rainSensitivity * (rainfallMm - MEAN_RAIN);
    // Per-acquisition measurement noise (atmospheric / decorrelation) — not cumulative.
    const measNoise = gaussian(rng, 0, p.noiseMm);
    const displacement = trend + rainTransient + measNoise;

    // Coherence drops a little in the wet season and with measurement noise.
    const wetPenalty = (rainfallMm / 120) * 0.12;
    const coherence = Math.min(0.97, Math.max(0.35, p.coherence - wetPenalty + gaussian(rng, 0, 0.03)));

    // Occasional seismic events (Andean sites are more active).
    const seismicMag = rng() < 0.05 ? Math.round((3 + rng() * 2.5) * 10) / 10 : 0;

    points.push({
      date: date.toISOString().slice(0, 10),
      displacementMm: Math.round(displacement * 10) / 10,
      coherence: Math.round(coherence * 100) / 100,
      rainfallMm: Math.round(rainfallMm),
      seismicMag,
    });
  }

  return { facilityId, source: "Sentinel-1", revisitDays: REVISIT_DAYS, points };
}
