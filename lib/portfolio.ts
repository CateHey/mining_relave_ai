import type { Alert, MineSite, EsgAssessment, DimensionKey } from "./types";
import { MINES, getMine, NOW } from "./mines";
import { getIndicatorSeries } from "./indicators";
import { assessEsg } from "./esgEngine";

export interface MineWithEsg {
  mine: MineSite;
  esg: EsgAssessment;
}

/** Assess every mine in the portfolio, ranked highest-impact first. */
export function getPortfolio(): MineWithEsg[] {
  return MINES.map((mine) => ({
    mine,
    esg: assessEsg(mine, getIndicatorSeries(mine.id)),
  })).sort((a, b) => b.esg.score - a.esg.score);
}

export function getMineWithEsg(id: string): MineWithEsg | undefined {
  const mine = getMine(id);
  if (!mine) return undefined;
  return { mine, esg: assessEsg(mine, getIndicatorSeries(id)) };
}

export interface PortfolioStats {
  total: number;
  high: number;
  watch: number;
  low: number;
  improving: number;
  midTier: number;
  canopyLossHa: number;
  avgConfidence: number;
}

export function getPortfolioStats(rows: MineWithEsg[]): PortfolioStats {
  const high = rows.filter((r) => r.esg.band === "critical").length;
  const watch = rows.filter((r) => r.esg.band === "elevated").length;
  const low = rows.filter((r) => r.esg.band === "stable").length;
  const improving = rows.filter((r) => r.esg.trend === "improving").length;
  // Sum real cleared hectares from each series' latest point.
  const canopyLossHa = rows.reduce((a, r) => {
    const series = getIndicatorSeries(r.mine.id);
    return a + series.points[series.points.length - 1].canopyLossHa;
  }, 0);
  const avgConfidence = rows.reduce((a, r) => a + r.esg.confidence, 0) / (rows.length || 1);
  return {
    total: rows.length,
    high,
    watch,
    low,
    improving,
    midTier: rows.filter((r) => r.mine.midTier).length,
    canopyLossHa,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
  };
}

const DIM_TITLE: Record<DimensionKey, string> = {
  vegetation: "Deforestation / vegetation loss detected",
  water: "Downstream water turbidity rising",
  air: "Elevated dust over the site",
  land: "Rapid footprint expansion",
  ground: "Ground subsidence above baseline",
};

/** Derive an alert feed from any mine currently above the low-impact band. */
export function getAlerts(): Alert[] {
  const rows = getPortfolio().filter((r) => r.esg.band !== "stable");
  const alerts: Alert[] = rows.map((r, i) => {
    const top = [...r.esg.factors].sort((a, b) => b.score * b.weight - a.score * a.weight)[0];
    const daysAgo = r.esg.band === "critical" ? 2 + i : 6 + i * 3;
    const date = new Date(NOW.getTime() - daysAgo * 86400000).toISOString().slice(0, 10);
    return {
      id: `al-${r.mine.id}`,
      mineId: r.mine.id,
      mineName: r.mine.name,
      date,
      band: r.esg.band,
      dimension: top.dimension,
      title: DIM_TITLE[top.dimension],
      message: top.detail,
    };
  });
  return alerts.sort((a, b) => (a.date < b.date ? 1 : -1));
}
