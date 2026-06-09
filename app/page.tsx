import { getPortfolio, getPortfolioStats } from "@/lib/portfolio";
import { PortfolioExplorer, type ExplorerRow } from "@/components/PortfolioExplorer";
import { Card } from "@/components/ui";
import { BAND_COLOR } from "@/lib/format";

export default function Home() {
  const rows = getPortfolio();
  const stats = getPortfolioStats(rows);

  const explorerRows: ExplorerRow[] = rows.map(({ facility, risk }) => ({
    id: facility.id,
    name: facility.name,
    operator: facility.operator,
    region: facility.region,
    country: facility.country,
    status: facility.status,
    damType: facility.damType,
    lat: facility.lat,
    lng: facility.lng,
    band: risk.band,
    score: risk.score,
    velocityMmYr: risk.velocityMmYr,
    confidence: risk.confidence,
    recommendedAction: risk.recommendedAction,
    historicalFailure: facility.historicalFailure,
  }));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <div className="flex items-center gap-2 text-xs font-medium text-brand">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-critical blink" />
          {stats.critical} critical · live wet-season screen
        </div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Portfolio risk screen</h1>
        <p className="max-w-3xl text-sm text-muted">
          Every tailings facility in your portfolio, ranked by failure risk from free Sentinel-1
          radar — across Australia and Peru. No on-site hardware, no field trip: millimetre-scale
          ground movement read from space and explained in plain language. Relave AI informs your
          engineers; it doesn&apos;t replace their sign-off.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat label="Facilities monitored" value={stats.total} sub={`${stats.midTierUnmonitored} mid-tier / legacy`} />
        <Stat label="Critical" value={stats.critical} accent={BAND_COLOR.critical} sub="Accelerating movement" glow pulse />
        <Stat label="Elevated" value={stats.elevated} accent={BAND_COLOR.elevated} sub="Above baseline" glow />
        <Stat label="People at risk" value={stats.populationAtRisk.toLocaleString()} sub="In flagged inundation paths" />
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
        <span
          className="absolute right-3 top-3 h-2 w-2 rounded-full"
          style={{ background: accent, boxShadow: `0 0 8px ${accent}` }}
        />
      )}
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div
        className={`mt-1 text-2xl font-semibold tabular-nums md:text-3xl ${pulse ? "blink" : ""}`}
        style={accent ? { color: accent } : undefined}
      >
        {value}
      </div>
      {sub && <div className="mt-0.5 text-xs text-muted">{sub}</div>}
    </Card>
  );
}
