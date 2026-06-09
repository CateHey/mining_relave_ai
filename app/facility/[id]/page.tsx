import { notFound } from "next/navigation";
import Link from "next/link";
import { getFacilityWithRisk } from "@/lib/portfolio";
import { getDeformationSeries } from "@/lib/deformation";
import { FACILITIES } from "@/lib/facilities";
import { DeformationChart } from "@/components/DeformationChart";
import { DeformationField } from "@/components/DeformationField";
import { RiskRead } from "@/components/RiskRead";
import { ActionPanel } from "@/components/ActionPanel";
import { MapPanel } from "@/components/MapPanel";
import { Card, RiskBadge } from "@/components/ui";

export function generateStaticParams() {
  return FACILITIES.map((f) => ({ id: f.id }));
}

export default async function FacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const data = getFacilityWithRisk(id);
  if (!data) notFound();
  const { facility, risk } = data;
  const series = getDeformationSeries(id);

  const specs = [
    { label: "Operator", value: facility.operator },
    { label: "Location", value: `${facility.region}, ${facility.country}` },
    { label: "Dam type", value: facility.damType },
    { label: "Wall height", value: `${facility.heightM} m` },
    { label: "Stored volume", value: `${facility.storedVolumeMm3} Mm³` },
    { label: "Status", value: facility.status },
    { label: "People at risk", value: facility.populationAtRisk.toLocaleString() },
  ];

  return (
    <div className="space-y-5">
      <Link href="/" className="text-xs text-muted hover:text-text">
        ← Portfolio
      </Link>

      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">{facility.name}</h1>
            <RiskBadge band={risk.band} />
          </div>
          <p className="mt-1 text-sm text-muted">
            {facility.operator} · {facility.region}, {facility.country}
          </p>
        </div>
        <div className="text-right text-xs text-muted">
          <div>Base layer · {series.source}</div>
          <div>{series.revisitDays}-day revisit · {series.points.length} acquisitions</div>
        </div>
      </header>

      {facility.historicalFailure && (
        <div className="rounded-lg border border-critical/30 bg-critical/10 px-4 py-2.5 text-sm text-text">
          <span className="font-semibold text-critical">Documented history: </span>
          {facility.historicalFailure}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1.5fr_1fr]">
        <div className="space-y-5">
          <Card className="p-5">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold">Cumulative line-of-sight displacement</h2>
              <span className="text-xs text-muted">InSAR · rainfall overlay (ERA5)</span>
            </div>
            <DeformationChart points={series.points} />
          </Card>

          <RiskRead risk={risk} />
        </div>

        <div className="space-y-5">
          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Deformation field</h2>
            <DeformationField facilityId={facility.id} band={risk.band} />
            <p className="mt-3 text-xs text-muted">
              Synthetic InSAR raster over the embankment footprint — concentrated movement marks the
              section of wall to inspect first.
            </p>
          </Card>

          <ActionPanel
            facilityId={facility.id}
            facilityName={facility.name}
            recommended={risk.recommendedAction}
            band={risk.band}
          />

          <Card className="p-5">
            <h2 className="mb-3 text-sm font-semibold">Facility</h2>
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
                    id: facility.id,
                    name: facility.name,
                    operator: facility.operator,
                    country: facility.country,
                    lat: facility.lat,
                    lng: facility.lng,
                    band: risk.band,
                    score: risk.score,
                  },
                ]}
                selectedId={facility.id}
                height={200}
              />
            </div>
          </Card>
        </div>
      </div>

      <p className="border-t border-border pt-4 text-xs leading-relaxed text-muted">
        Data provenance — Base: Sentinel-1 C-band (ESA, free, 6–12 day revisit). Context: Copernicus
        DEM, ERA5 rainfall, USGS seismic. Premium tasking (ICEYE / Capella) triggered only when the
        base layer flags movement. Figures in this demo are synthetic and illustrative; the model is
        decision support and does not constitute geotechnical certification.
      </p>
    </div>
  );
}
