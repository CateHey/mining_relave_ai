import type { Alert, Facility, RiskAssessment } from "./types";
import { FACILITIES, getFacility, NOW } from "./facilities";
import { getDeformationSeries } from "./deformation";
import { assessRisk } from "./riskEngine";

export interface FacilityWithRisk {
  facility: Facility;
  risk: RiskAssessment;
}

/** Assess every facility in the portfolio, ranked highest-risk first. */
export function getPortfolio(): FacilityWithRisk[] {
  return FACILITIES.map((facility) => ({
    facility,
    risk: assessRisk(facility, getDeformationSeries(facility.id)),
  })).sort((a, b) => b.risk.score - a.risk.score);
}

export function getFacilityWithRisk(id: string): FacilityWithRisk | undefined {
  const facility = getFacility(id);
  if (!facility) return undefined;
  return { facility, risk: assessRisk(facility, getDeformationSeries(id)) };
}

export interface PortfolioStats {
  total: number;
  critical: number;
  elevated: number;
  stable: number;
  midTierUnmonitored: number;
  populationAtRisk: number;
  avgConfidence: number;
}

export function getPortfolioStats(rows: FacilityWithRisk[]): PortfolioStats {
  const critical = rows.filter((r) => r.risk.band === "critical").length;
  const elevated = rows.filter((r) => r.risk.band === "elevated").length;
  const stable = rows.filter((r) => r.risk.band === "stable").length;
  const populationAtRisk = rows
    .filter((r) => r.risk.band !== "stable")
    .reduce((a, r) => a + r.facility.populationAtRisk, 0);
  const avgConfidence = rows.reduce((a, r) => a + r.risk.confidence, 0) / (rows.length || 1);
  return {
    total: rows.length,
    critical,
    elevated,
    stable,
    midTierUnmonitored: rows.filter((r) => r.facility.midTier).length,
    populationAtRisk,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
  };
}

/** Derive an alert feed from any facility currently above the stable band. */
export function getAlerts(): Alert[] {
  const rows = getPortfolio().filter((r) => r.risk.band !== "stable");
  const alerts: Alert[] = rows.map((r, i) => {
    const daysAgo = r.risk.band === "critical" ? 1 + i : 4 + i * 3;
    const date = new Date(NOW.getTime() - daysAgo * 86400000).toISOString().slice(0, 10);
    return {
      id: `al-${r.facility.id}`,
      facilityId: r.facility.id,
      facilityName: r.facility.name,
      date,
      band: r.risk.band,
      title:
        r.risk.band === "critical"
          ? "Accelerating crest subsidence detected"
          : "Elevated movement above baseline",
      message: r.risk.explanation.split(".")[1]
        ? r.risk.explanation.split(".").slice(0, 2).join(".") + "."
        : r.risk.explanation,
    };
  });
  return alerts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
