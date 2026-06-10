import { NextResponse } from "next/server";
import { getMineWithEsg, getPortfolio } from "@/lib/portfolio";
import { getIndicatorSeries } from "@/lib/indicators";

// Assessment endpoint — the seam a real client (investor portal, regulator feed,
// ESG-reporting suite) integrates against. Returns the same explainable ESG
// object the UI renders.
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get("mine");

  if (!id) {
    const portfolio = getPortfolio().map(({ mine, esg }) => ({
      id: mine.id,
      name: mine.name,
      country: mine.country,
      commodity: mine.commodity,
      band: esg.band,
      score: esg.score,
      trend: esg.trend,
      recommendedAction: esg.recommendedAction,
    }));
    return NextResponse.json({ portfolio });
  }

  const data = getMineWithEsg(id);
  if (!data) {
    return NextResponse.json({ error: `Unknown mine: ${id}` }, { status: 404 });
  }

  const series = getIndicatorSeries(id);
  return NextResponse.json({
    mine: data.mine,
    esg: data.esg,
    series: { sources: series.sources, points: series.points },
  });
}
