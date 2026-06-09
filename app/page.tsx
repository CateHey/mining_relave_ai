import Link from "next/link";
import { getPortfolio, getPortfolioStats } from "@/lib/portfolio";
import { MapPanel } from "@/components/MapPanel";
import type { MapMarker } from "@/components/MapView";
import { PortfolioTable } from "@/components/PortfolioTable";
import { StatCard, Card } from "@/components/ui";
import { BAND_COLOR } from "@/lib/format";

export default function Home() {
  const rows = getPortfolio();
  const stats = getPortfolioStats(rows);
  const markers: MapMarker[] = rows.map(({ facility, risk }) => ({
    id: facility.id,
    name: facility.name,
    operator: facility.operator,
    country: facility.country,
    lat: facility.lat,
    lng: facility.lng,
    band: risk.band,
    score: risk.score,
  }));

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Portfolio risk screen</h1>
        <p className="max-w-3xl text-sm text-muted">
          Every tailings facility in your portfolio, ranked by failure risk from free Sentinel-1
          radar. No on-site hardware, no field trip — millimetre-scale ground movement read from
          space and explained in plain language. Relave AI informs your engineers; it doesn&apos;t
          replace their sign-off.
        </p>
      </section>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Facilities monitored" value={stats.total} sub={`${stats.midTierUnmonitored} mid-tier / legacy`} />
        <StatCard label="Critical" value={stats.critical} accent={BAND_COLOR.critical} sub="Accelerating movement" />
        <StatCard label="Elevated" value={stats.elevated} accent={BAND_COLOR.elevated} sub="Above baseline" />
        <StatCard
          label="People at risk"
          value={stats.populationAtRisk.toLocaleString()}
          sub="In flagged inundation paths"
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Card className="overflow-hidden p-1.5">
          <MapPanel markers={markers} />
        </Card>
        <Card className="p-5">
          <h2 className="text-sm font-semibold">Wet-season screen · {markers.length} dams</h2>
          <p className="mt-1 text-xs text-muted">
            Click any dam — on the map or in the table — to open its deformation history and AI risk
            read.
          </p>
          <div className="mt-4 space-y-3">
            {rows.slice(0, 3).map(({ facility, risk }) => (
              <Link
                key={facility.id}
                href={`/facility/${facility.id}`}
                className="block rounded-lg border border-border bg-surface-2 p-3 transition-colors hover:border-brand/50"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{facility.name}</span>
                  <span className="font-semibold tabular-nums" style={{ color: BAND_COLOR[risk.band] }}>
                    {risk.score}
                  </span>
                </div>
                <p className="mt-1 line-clamp-2 text-xs text-muted">{risk.explanation}</p>
              </Link>
            ))}
          </div>
          <Link
            href="/alerts"
            className="mt-4 inline-block text-xs font-medium text-brand hover:underline"
          >
            View all alerts →
          </Link>
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Ranked portfolio
        </h2>
        <PortfolioTable rows={rows} />
      </section>
    </div>
  );
}
