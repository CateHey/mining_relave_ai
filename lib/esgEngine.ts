import type {
  MineSite,
  IndicatorSeries,
  EsgAssessment,
  EsgFactor,
  RiskBand,
  ActionType,
  DimensionKey,
} from "./types";
import { NOW } from "./mines";

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
const mean = (a: number[]) => (a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0);

function bandFor(score: number): RiskBand {
  if (score >= 70) return "critical"; // high impact
  if (score >= 40) return "elevated"; // watch
  return "stable"; // low impact
}

function actionFor(band: RiskBand): ActionType {
  if (band === "critical") return "escalate"; // remediate
  if (band === "elevated") return "inspect"; // investigate
  return "report"; // disclose
}

function trendFromDelta(delta: number, eps: number): "improving" | "worsening" | "steady" {
  if (delta > eps) return "worsening";
  if (delta < -eps) return "improving";
  return "steady";
}

/**
 * The ESG model. Turns the raw satellite indicators into an explainable
 * environmental impact score with a per-dimension breakdown and a confidence
 * driven by cloud-free data availability. Transparent by design — every input to
 * the score is exposed as an auditable factor. This is the seam where a learned
 * model (or a Claude-generated narrative) plugs in without changing the contract.
 */
export function assessEsg(mine: MineSite, series: IndicatorSeries): EsgAssessment {
  const pts = series.points;
  const recent = pts.slice(-3);
  const early = pts.slice(0, 3);

  // ── Vegetation & deforestation ───────────────────────────────────────────────
  const ndviNow = mean(recent.map((p) => p.ndvi));
  const ndviThen = mean(early.map((p) => p.ndvi));
  const ndviDelta = ndviNow - ndviThen; // negative = greening loss
  const canopyLoss = pts[pts.length - 1].canopyLossHa;
  const vegImpact = clamp(
    45 * clamp(-ndviDelta / 0.25, 0, 1) + // losing green cover
      35 * clamp(canopyLoss / (mine.areaHa * 0.25), 0, 1) + // clearing relative to site
      20 * clamp((0.55 - ndviNow) / 0.4, 0, 1), // low absolute cover
    0,
    100,
  );

  // ── Water ────────────────────────────────────────────────────────────────────
  const turbNow = mean(recent.map((p) => p.waterTurbidity));
  const turbThen = mean(early.map((p) => p.waterTurbidity));
  const waterImpact = clamp(0.55 * turbNow + 1.4 * Math.max(0, turbNow - turbThen), 0, 100);

  // ── Air & dust ───────────────────────────────────────────────────────────────
  const dustNow = mean(recent.map((p) => p.dustIndex));
  const airImpact = clamp(dustNow, 0, 100);

  // ── Land disturbance ─────────────────────────────────────────────────────────
  const footStart = pts[0].footprintHa;
  const footNow = pts[pts.length - 1].footprintHa;
  const footprintGrowthPct = footStart > 0 ? (footNow - footStart) / footStart : 0;
  const landImpact = clamp(footprintGrowthPct * 280, 0, 100);

  // ── Ground stability ─────────────────────────────────────────────────────────
  const subsidence = pts[pts.length - 1].subsidenceMm; // negative
  const groundImpact = clamp(-subsidence / 0.4, 0, 100);

  const dims: { key: DimensionKey; label: string; impact: number; weight: number; detail: string; delta: number; eps: number }[] = [
    {
      key: "vegetation",
      label: "Vegetation & deforestation",
      impact: vegImpact,
      weight: 0.3,
      delta: -ndviDelta,
      eps: 0.02,
      detail:
        canopyLoss > 50
          ? `${canopyLoss.toLocaleString()} ha cleared in 24 months; NDVI ${ndviDelta < 0 ? "down" : "up"} ${Math.abs(ndviDelta).toFixed(2)} to ${ndviNow.toFixed(2)}.`
          : `Canopy stable; NDVI ${ndviNow.toFixed(2)} (${ndviDelta >= 0 ? "+" : ""}${ndviDelta.toFixed(2)} over 24 mo).`,
    },
    {
      key: "water",
      label: "Water quality",
      impact: waterImpact,
      weight: 0.26,
      delta: turbNow - turbThen,
      eps: 4,
      detail: `Downstream turbidity ${Math.round(turbNow)}/100 on ${mine.waterBody} (${turbNow - turbThen >= 0 ? "+" : ""}${Math.round(turbNow - turbThen)} vs baseline).`,
    },
    {
      key: "air",
      label: "Air & dust",
      impact: airImpact,
      weight: 0.16,
      delta: 0,
      eps: 100,
      detail: `Aerosol/dust proxy ${Math.round(dustNow)}/100 over the site (receptor: ${mine.nearbyCommunity}).`,
    },
    {
      key: "land",
      label: "Land disturbance",
      impact: landImpact,
      weight: 0.16,
      delta: footprintGrowthPct,
      eps: 0.02,
      detail:
        footNow >= footStart
          ? `Disturbed footprint +${Math.round((footNow - footStart)).toLocaleString()} ha (+${Math.round(footprintGrowthPct * 100)}%) in 24 mo.`
          : `Footprint reducing (${Math.round(footNow - footStart)} ha) — active rehabilitation.`,
    },
    {
      key: "ground",
      label: "Ground stability",
      impact: groundImpact,
      weight: 0.12,
      delta: 0,
      eps: 100,
      detail: `${subsidence.toFixed(0)} mm cumulative subsidence (InSAR) over 24 months.`,
    },
  ];

  const score = clamp(Math.round(dims.reduce((a, d) => a + d.impact * d.weight, 0)), 2, 99);
  const band = bandFor(score);
  const recommendedAction = actionFor(band);

  // Confidence from cloud-free optical availability + series length.
  const dq = mean(pts.map((p) => p.dataQuality));
  const confidence = clamp(0.55 * dq + 0.4 * clamp(pts.length / 24, 0, 1) + 0.05, 0.3, 0.97);

  const factors: EsgFactor[] = dims.map((d) => ({
    dimension: d.key,
    label: d.label,
    detail: d.detail,
    score: Math.round(d.impact),
    weight: d.weight,
    band: bandFor(d.impact),
    trend: trendFromDelta(d.delta, d.eps),
  }));

  // Composite trend from the real momentum of the headline drivers (vegetation
  // loss, water deterioration, footprint growth) — only material change counts.
  const momentum =
    -ndviDelta * 120 + (turbNow - turbThen) * 0.7 + footprintGrowthPct * 70;
  const trend: "improving" | "worsening" | "steady" =
    momentum > 14 ? "worsening" : momentum < -14 ? "improving" : "steady";

  const explanation = buildExplanation(mine, { band, trend, confidence, dq, factors });

  return {
    mineId: mine.id,
    score,
    band,
    trend,
    confidence: Math.round(confidence * 100) / 100,
    explanation,
    factors,
    recommendedAction,
    assessedAt: NOW.toISOString(),
  };
}

function buildExplanation(
  mine: MineSite,
  x: {
    band: RiskBand;
    trend: "improving" | "worsening" | "steady";
    confidence: number;
    dq: number;
    factors: EsgFactor[];
  },
): string {
  const conf = Math.round(x.confidence * 100);
  const top = [...x.factors].sort((a, b) => b.score * b.weight - a.score * a.weight)[0];

  const lead =
    x.band === "critical"
      ? `${mine.name} is a high environmental-impact site this period.`
      : x.band === "elevated"
        ? `${mine.name} shows environmental pressure worth a closer look.`
        : x.trend === "improving"
          ? `${mine.name} is low-impact and improving.`
          : `${mine.name} is within a low-impact envelope.`;

  const driver = `The dominant signal is ${top.label.toLowerCase()} — ${top.detail.charAt(0).toLowerCase() + top.detail.slice(1)}`;

  const trust = `Model confidence ${conf}% (cloud-free optical availability ${(x.dq * 100).toFixed(0)}%).`;

  const call =
    x.band === "critical"
      ? `Recommended: open a remediation case and notify the responsible environmental lead.`
      : x.band === "elevated"
        ? `Recommended: investigate the flagged dimension and tighten the monitoring cadence.`
        : `Recommended: log the evidence to the ESG disclosure record and continue routine monitoring.`;

  return `${lead} ${driver} ${trust} ${call} This is decision support for ESG disclosure — it informs the analyst, it is not a substitute for a regulated environmental audit.`;
}
