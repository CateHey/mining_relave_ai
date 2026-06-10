import { getPortfolio, getPortfolioStats } from "@/lib/portfolio";
import { PortfolioExplorer, type ExplorerRow } from "@/components/PortfolioExplorer";
import { Card } from "@/components/ui";
import { BAND_COLOR, DIMENSION_META } from "@/lib/format";

export default function Home() {
  const rows = getPortfolio();
  const stats = getPortfolioStats(rows);

  const explorerRows: ExplorerRow[] = rows.map(({ mine, esg }) => {
    const top = [...esg.factors].sort((a, b) => b.score * b.weight - a.score * a.weight)[0];
    return {
      id: mine.id,
      name: mine.name,
      operator: mine.operator,
      region: mine.region,
      country: mine.country,
      commodity: mine.commodity,
      lat: mine.lat,
      lng: mine.lng,
      band: esg.band,
      score: esg.score,
      confidence: esg.confidence,
      recommendedAction: esg.recommendedAction,
      trend: esg.trend,
      topDimension: `${DIMENSION_META[top.dimension].icon} ${DIMENSION_META[top.dimension].label}`,
      esgNote: mine.esgNote,
    };
  });

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-brand">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-critical blink" />
          {stats.high} high-impact · {stats.improving} improving · live monthly screen
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Mine ESG impact screen</h1>
        <p className="max-w-3xl text-sm text-muted">
          Every mine in your portfolio, scored on its real environmental footprint from free
          satellite data — vegetation &amp; deforestation, water, dust, land disturbance and ground
          stability. No site visit, no contractor: an explainable ESG read and a trail of evidence
          for investors and regulators. Relave AI informs your analysts; it isn&apos;t a regulated
          environmental audit.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Mines monitored" value={stats.total} sub={`${stats.midTier} mid-tier sites`} />
        <Stat label="High impact" value={stats.high} accent={BAND_COLOR.critical} sub="Active environmental pressure" glow pulse />
        <Stat label="Vegetation cleared" value={`${stats.canopyLossHa.toLocaleString()} ha`} accent={BAND_COLOR.elevated} sub="Across portfolio, 24 mo" glow />
        <Stat label="Improving" value={stats.improving} accent={BAND_COLOR.stable} sub="Trending lower impact" />
      </section>

      <PortfolioExplorer rows={explorerRows} />
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  accent,
  glow,
  pulse,
}: {
  label: string;
  value: React.ReactNode;
  sub?: string;
  accent?: string;
  glow?: boolean;
  pulse?: boolean;
}) {
  return (
    <Card
      className="relative overflow-hidden p-4"
      style={
        accent && glow
          ? { borderColor: `${accent}55`, background: `linear-gradient(160deg, ${accent}12, transparent 70%)` }
          : undefined
      }
    >
      {accent && (
        <span className="absolute right-3 top-3 h-2 w-2 rounded-full" style={{ background: accent, boxShadow: `0 0 8px ${accent}` }} />
      )}
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold tabular-nums md:text-3xl ${pulse ? "blink" : ""}`} style={accent ? { color: accent } : undefined}>
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </Card>
  );
}
