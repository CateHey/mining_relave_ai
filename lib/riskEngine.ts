import type {
  Facility,
  DeformationSeries,
  RiskAssessment,
  RiskBand,
  RiskFactor,
  ActionType,
} from "./types";
import { NOW } from "./facilities";

/** Least-squares slope (units of y per index step) over a set of points. */
function slope(values: number[]): number {
  const n = values.length;
  if (n < 2) return 0;
  const meanX = (n - 1) / 2;
  const meanY = values.reduce((a, b) => a + b, 0) / n;
  let num = 0;
  let den = 0;
  for (let i = 0; i < n; i++) {
    num += (i - meanX) * (values[i] - meanY);
    den += (i - meanX) * (i - meanX);
  }
  return den === 0 ? 0 : num / den;
}

/** Pearson correlation between two equal-length arrays. */
function corr(a: number[], b: number[]): number {
  const n = a.length;
  if (n < 3) return 0;
  const ma = a.reduce((x, y) => x + y, 0) / n;
  const mb = b.reduce((x, y) => x + y, 0) / n;
  let num = 0;
  let da = 0;
  let db = 0;
  for (let i = 0; i < n; i++) {
    num += (a[i] - ma) * (b[i] - mb);
    da += (a[i] - ma) ** 2;
    db += (b[i] - mb) ** 2;
  }
  const den = Math.sqrt(da * db);
  return den === 0 ? 0 : num / den;
}

function bandFor(score: number): RiskBand {
  if (score >= 70) return "critical";
  if (score >= 40) return "elevated";
  return "stable";
}

function actionFor(band: RiskBand): ActionType {
  if (band === "critical") return "escalate";
  if (band === "elevated") return "inspect";
  return "report";
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/**
 * The risk model. Separates a genuine failure precursor (sustained, accelerating,
 * rainfall-coupled subsidence) from seasonal noise, and reports its confidence.
 * Deterministic and transparent by design — every input to the score is exposed
 * as a factor the engineer can audit. This is the seam where a learned model
 * (or a Claude-generated narrative) plugs in without changing the contract.
 */
export function assessRisk(facility: Facility, series: DeformationSeries): RiskAssessment {
  const pts = series.points;
  const disp = pts.map((p) => p.displacementMm);
  const stepsPerYear = 365 / series.revisitDays;

  // Velocity over the trailing ~4 months vs the prior period → acceleration.
  const recentN = Math.max(6, Math.floor(pts.length * 0.18));
  const recent = disp.slice(-recentN);
  const prior = disp.slice(-recentN * 2, -recentN);

  const velocityMmYr = slope(recent) * stepsPerYear;
  const priorVelocity = prior.length >= 2 ? slope(prior) * stepsPerYear : velocityMmYr;
  // Acceleration: how much faster it is moving now than before (mm/yr per ~6mo).
  const accelerationMmYr2 = velocityMmYr - priorVelocity;

  // Rainfall coupling over the recent window — incremental displacement vs rain.
  const recentPts = pts.slice(-recentN);
  const increments: number[] = [];
  const rains: number[] = [];
  for (let i = 1; i < recentPts.length; i++) {
    increments.push(recentPts[i].displacementMm - recentPts[i - 1].displacementMm);
    rains.push(recentPts[i].rainfallMm);
  }
  const rainCoupling = -corr(increments, rains); // negative disp with high rain → positive coupling

  const meanCoherence = pts.reduce((a, p) => a + p.coherence, 0) / pts.length;
  const recentSeismic = recentPts.some((p) => p.seismicMag >= 3.5);

  // ── Score components (each 0..1 of its sub-weight) ───────────────────────────
  const speed = clamp(-velocityMmYr / 60, 0, 1); // 60 mm/yr subsidence → maxed
  const accel = clamp(-accelerationMmYr2 / 35, 0, 1); // accelerating subsidence
  const rain = clamp(rainCoupling, 0, 1);
  const consequence =
    (facility.damType === "upstream" ? 0.5 : facility.damType === "centreline" ? 0.3 : 0.15) +
    clamp(facility.populationAtRisk / 2500, 0, 0.5);

  // Acceleration is the dominant precursor; consequence amplifies but never alone triggers.
  const hazard = 0.34 * speed + 0.4 * accel + 0.16 * rain + 0.1 * clamp(consequence, 0, 1);
  let score = Math.round(hazard * 100 * (0.85 + 0.3 * clamp(consequence, 0, 1)));
  score = clamp(score, 2, 99);

  const band = bandFor(score);
  const recommendedAction = actionFor(band);

  // Confidence: coherence quality + series length, penalised by recent seismic ambiguity.
  const lengthConf = clamp(pts.length / 60, 0, 1);
  const confidence = clamp(
    0.45 * meanCoherence + 0.45 * lengthConf + 0.1 - (recentSeismic ? 0.08 : 0),
    0.3,
    0.97,
  );

  const factors: RiskFactor[] = [
    {
      label: "Line-of-sight velocity",
      detail: `${velocityMmYr.toFixed(1)} mm/yr ${velocityMmYr < 0 ? "subsidence" : "uplift"} over the trailing ${Math.round(
        (recentN * series.revisitDays) / 30,
      )} months.`,
      weight: 0.34,
      severity: speed > 0.6 ? "critical" : speed > 0.3 ? "elevated" : "stable",
    },
    {
      label: "Acceleration",
      detail:
        accelerationMmYr2 < -3
          ? `Movement is speeding up by ${Math.abs(accelerationMmYr2).toFixed(0)} mm/yr vs the prior window — the classic pre-failure ramp.`
          : `Rate is steady (${accelerationMmYr2.toFixed(1)} mm/yr change) — no acceleration detected.`,
      weight: 0.4,
      severity: accel > 0.5 ? "critical" : accel > 0.25 ? "elevated" : "stable",
    },
    {
      label: "Rainfall coupling",
      detail:
        rainCoupling > 0.35
          ? `Subsidence tracks rainfall (r=${rainCoupling.toFixed(2)}) — a saturation-driven trigger is active.`
          : `Weak rainfall coupling (r=${rainCoupling.toFixed(2)}) — movement is not primarily rain-driven.`,
      weight: 0.16,
      severity: rain > 0.5 ? "elevated" : "stable",
    },
    {
      label: "Consequence exposure",
      detail: `${facility.damType} dam, ${facility.heightM} m, ~${facility.populationAtRisk.toLocaleString()} people in the potential inundation path.`,
      weight: 0.1,
      severity: consequence > 0.7 ? "elevated" : "stable",
    },
  ];

  const explanation = buildExplanation(facility, {
    band,
    velocityMmYr,
    accelerationMmYr2,
    rainCoupling,
    confidence,
    meanCoherence,
    recentSeismic,
    recommendedAction,
  });

  return {
    facilityId: facility.id,
    score,
    band,
    velocityMmYr: Math.round(velocityMmYr * 10) / 10,
    accelerationMmYr2: Math.round(accelerationMmYr2 * 10) / 10,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
    factors,
    recommendedAction,
    assessedAt: NOW.toISOString(),
  };
}

function buildExplanation(
  f: Facility,
  x: {
    band: RiskBand;
    velocityMmYr: number;
    accelerationMmYr2: number;
    rainCoupling: number;
    confidence: number;
    meanCoherence: number;
    recentSeismic: boolean;
    recommendedAction: ActionType;
  },
): string {
  const v = Math.abs(x.velocityMmYr).toFixed(0);
  const conf = Math.round(x.confidence * 100);
  const accelerating = x.accelerationMmYr2 < -3;
  const rainDriven = x.rainCoupling > 0.35;

  const lead =
    x.band === "critical"
      ? `${f.name} is showing a failure-precursor signature.`
      : x.band === "elevated"
        ? `${f.name} is moving more than its baseline and warrants a closer look.`
        : `${f.name} is stable within the expected envelope.`;

  const motion =
    x.band === "stable"
      ? `InSAR shows ${v} mm/yr of background settlement with no acceleration — consistent with normal consolidation.`
      : `InSAR measures ${v} mm/yr of crest subsidence${
          accelerating ? `, and the rate is accelerating` : ` at a steady rate`
        }${rainDriven ? `, tightly coupled to recent rainfall` : ``}.`;

  const trigger = x.recentSeismic
    ? ` A magnitude-3.5+ event in the window adds seismic loading to watch.`
    : ``;

  const trust = `Model confidence ${conf}% (mean coherence ${(x.meanCoherence * 100).toFixed(0)}%).`;

  const call =
    x.recommendedAction === "escalate"
      ? `Recommended: escalate to the responsible geotechnical engineer for urgent review.`
      : x.recommendedAction === "inspect"
        ? `Recommended: schedule a field inspection and tighten the monitoring cadence.`
        : `Recommended: log to the compliance record and continue routine monitoring.`;

  return `${lead} ${motion}${trigger} ${trust} ${call} This is decision support — it informs, it does not certify; the licensed engineer signs off.`;
}
