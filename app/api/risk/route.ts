import { NextResponse } from "next/server";
import { getFacilityWithRisk, getPortfolio } from "@/lib/portfolio";
import { getDeformationSeries } from "@/lib/deformation";

// Assessment endpoint — the seam a real client (mobile, regulator portal,
// insurer data feed) integrates against. Returns the same explainable risk
// object the UI renders.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("facility");

  if (!id) {
    const portfolio = getPortfolio().map(({ facility, risk }) => ({
      id: facility.id,
      name: facility.name,
      country: facility.country,
      band: risk.band,
      score: risk.score,
      velocityMmYr: risk.velocityMmYr,
      recommendedAction: risk.recommendedAction,
    }));
    return NextResponse.json({ portfolio });
  }

  const data = getFacilityWithRisk(id);
  if (!data) {
    return NextResponse.json({ error: `Unknown facility: ${id}` }, { status: 404 });
  }

  const series = getDeformationSeries(id);
  return NextResponse.json({
    facility: data.facility,
    risk: data.risk,
    series: { source: series.source, revisitDays: series.revisitDays, points: series.points },
  });
}
