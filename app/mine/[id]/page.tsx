import { notFound } from "next/navigation";
import Link from "next/link";
import { getMineWithEsg } from "@/lib/portfolio";
import { getIndicatorSeries } from "@/lib/indicators";
import { MINES } from "@/lib/mines";
import { IndicatorChart } from "@/components/IndicatorChart";
import { LandCoverField } from "@/components/LandCoverField";
import { EsgRead } from "@/components/EsgRead";
import { ActionPanel } from "@/components/ActionPanel";
import { MapPanel } from "@/components/MapPanel";
import { Card, RiskBadge } from "@/components/ui";

export function generateStaticParams() {
  return MINES.map((m) => ({ id: m.id }));
}

export default async function MinePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getMineWithEsg(id);
  if (!data) notFound();
  const { mine, esg } = data;
  const series = getIndicatorSeries(id);
  const last = series.points[series.points.length - 1];

  const specs = [
    { label: "Operator", value: mine.operator },
    { label: "Commodity", value: mine.commodity },
    { label: "Location", value: `${mine.region}, ${mine.country}` },
    { label: "Status", value: mine.status },
    { label: "Disturbed area", value: `${mine.areaHa.toLocaleString()} ha` },
    { label: "Nearest community", value: mine.nearbyCommunity },
    { label: "Watercourse", value: mine.waterBody },
    { label: "Cleared (24 mo)", value: `${last.canopyLossHa.toLocaleString()} ha` },
  ];

  return (
    <div className="space-y-5">
      <Link href="/" className="text-xs text-muted hover:text-text">
        ← Portfolio
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{mine.name}</h1>
            <RiskBadge band={esg.band} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {mine.operator} · {mine.commodity} · {mine.region}, {mine.country}
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <div>Monthly composite · {series.points.length} months</div>
          <div>{series.sources.length} free satellite sources</div>
        </div>
      </header>

      {mine.esgNote && (
        <div className="rounded-lg border border-border bg-surface px-4 py-2.5 text-sm text-text">
          <span className="font-semibold text-brand">Context: </span>
          {mine.esgNote}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Environmental indicators · 24 months</h2>
              <span className="text-xs text-muted">Sentinel-2 NDVI · water · dust</span>
            </div>
            <IndicatorChart points={series.points} />
          </Card>

          <EsgRead esg={esg} />
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Land-cover change</h2>
            <LandCoverField mineId={mine.id} band={esg.band} />
            <p className="mt-3 text-xs text-muted">
              Synthetic land-cover map over the mine buffer — disturbed and cleared ground marks where
              the footprint is growing into vegetation near {mine.waterBody}.
            </p>
          </Card>

          <ActionPanel mineId={mine.id} mineName={mine.name} recommended={esg.recommendedAction} band={esg.band} />

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Site</h2>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-sm">
              {specs.map((s) => (
                <div key={s.label}>
                  <dt className="text-[11px] uppercase tracking-wide text-muted">{s.label}</dt>
                  <dd className="capitalize text-text">{s.value}</dd>
                </div>
              ))}
            </dl>
            <div className="mt-4 overflow-hidden rounded-lg">
              <MapPanel
                markers={[
                  {
                    id: mine.id,
                    name: mine.name,
                    operator: mine.operator,
                    country: mine.country,
                    lat: mine.lat,
                    lng: mine.lng,
                    band: esg.band,
                    score: esg.score,
                  },
                ]}
                selectedId={mine.id}
                height={200}
              />
            </div>
          </Card>
        </div>
      </div>

      <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted">
        Data provenance — Vegetation/NDVI &amp; land cover: Sentinel-2 (ESA, free, ~monthly cloud-free
        composite). Ground stability: Sentinel-1 InSAR. Air &amp; dust: Sentinel-5P aerosol. Land
        classes: ESA WorldCover. All figures in this demo are synthetic and illustrative; the model is
        decision support for ESG disclosure and is not a regulated environmental audit.
      </p>
    </div>
  );
}
