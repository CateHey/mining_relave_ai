"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPanel } from "./MapPanel";
import type { MapMarker } from "./MapView";
import { ActionPill, Card } from "./ui";
import { BAND_COLOR } from "@/lib/format";
import type { RiskBand } from "@/lib/types";

export interface ExplorerRow {
  id: string;
  name: string;
  operator: string;
  region: string;
  country: string;
  status: string;
  damType: string;
  lat: number;
  lng: number;
  band: RiskBand;
  score: number;
  velocityMmYr: number;
  confidence: number;
  recommendedAction: "monitor" | "inspect" | "escalate" | "report";
  historicalFailure?: string;
}

type CountryFilter = "all" | "Australia" | "Peru" | "Other";
type BandFilter = "all" | RiskBand;

export function PortfolioExplorer({ rows }: { rows: ExplorerRow[] }) {
  const [country, setCountry] = useState<CountryFilter>("all");
  const [band, setBand] = useState<BandFilter>("all");
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [focusId, setFocusId] = useState<string | undefined>(undefined);
  const [focusTick, setFocusTick] = useState(0);

  function flyTo(id: string) {
    setFocusId(id);
    setFocusTick((t) => t + 1);
  }

  const countries = useMemo(() => {
    const set = new Set(rows.map((r) => r.country));
    return ["all", ...["Australia", "Peru"].filter((c) => set.has(c)), "Other"] as CountryFilter[];
  }, [rows]);

  const filtered = useMemo(
    () =>
      rows.filter((r) => {
        const countryOk =
          country === "all" ||
          (country === "Other" ? r.country !== "Australia" && r.country !== "Peru" : r.country === country);
        const bandOk = band === "all" || r.band === band;
        return countryOk && bandOk;
      }),
    [rows, country, band],
  );

  const markers: MapMarker[] = filtered.map((r) => ({
    id: r.id,
    name: r.name,
    operator: r.operator,
    country: r.country,
    lat: r.lat,
    lng: r.lng,
    band: r.band,
    score: r.score,
  }));

  const bandCounts = useMemo(() => {
    const base = { critical: 0, elevated: 0, stable: 0 } as Record<RiskBand, number>;
    rows.forEach((r) => (base[r.band] += 1));
    return base;
  }, [rows]);

  return (
    <div className="grid gap-4 lg:grid-cols-[1.35fr_1fr]">
      {/* Map + filters */}
      <Card className="overflow-hidden">
        <div className="flex flex-wrap items-center gap-2 border-b border-border p-3">
          <FilterGroup label="Region">
            {countries.map((c) => (
              <Chip key={c} active={country === c} onClick={() => setCountry(c)}>
                {c === "all" ? "All regions" : c}
              </Chip>
            ))}
          </FilterGroup>
          <span className="mx-1 hidden h-5 w-px bg-border sm:block" />
          <FilterGroup label="Risk">
            <Chip active={band === "all"} onClick={() => setBand("all")}>
              All
            </Chip>
            {(["critical", "elevated", "stable"] as RiskBand[]).map((b) => (
              <Chip key={b} active={band === b} color={BAND_COLOR[b]} onClick={() => setBand(b)}>
                <span className="h-1.5 w-1.5 rounded-full" style={{ background: BAND_COLOR[b] }} />
                {b[0].toUpperCase() + b.slice(1)} · {bandCounts[b]}
              </Chip>
            ))}
          </FilterGroup>
        </div>
        <div className="p-1.5">
          <MapPanel
            markers={markers}
            selectedId={hoveredId ?? undefined}
            focusId={focusId}
            focusTick={focusTick}
            onHover={setHoveredId}
          />
        </div>
        <div className="flex items-center justify-between px-4 py-2 text-[11px] text-muted">
          <div className="flex items-center gap-3">
            {(["critical", "elevated", "stable"] as RiskBand[]).map((b) => (
              <span key={b} className="inline-flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ background: BAND_COLOR[b], boxShadow: `0 0 6px ${BAND_COLOR[b]}` }} />
                {b}
              </span>
            ))}
          </div>
          <span>
            Showing {filtered.length} of {rows.length} facilities
          </span>
        </div>
      </Card>

      {/* Interactive list */}
      <Card className="flex flex-col overflow-hidden">
        <div className="border-b border-border px-4 py-3">
          <h2 className="text-sm font-semibold">Ranked by failure risk</h2>
          <p className="mt-0.5 text-xs text-muted">
            Hover a row to highlight it on the map · click <span className="text-brand">◎</span> to fly there · click the name to open.
          </p>
        </div>
        <div className="max-h-[520px] flex-1 divide-y divide-border overflow-y-auto">
          {filtered.map((r) => {
            const isHot = hoveredId === r.id;
            return (
              <div
                key={r.id}
                onMouseEnter={() => setHoveredId(r.id)}
                onMouseLeave={() => setHoveredId(null)}
                className="group flex items-center gap-3 px-4 py-3 transition-colors"
                style={isHot ? { background: "#161e2b" } : undefined}
              >
                <button
                  onClick={() => flyTo(r.id)}
                  title="Fly to on map"
                  className="flex-none rounded-md border border-border px-1.5 py-1 text-sm text-muted transition-colors hover:border-brand hover:text-brand"
                >
                  ◎
                </button>
                <Link href={`/facility/${r.id}`} className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span
                      className="h-2 w-2 flex-none rounded-full"
                      style={{ background: BAND_COLOR[r.band], boxShadow: `0 0 6px ${BAND_COLOR[r.band]}` }}
                    />
                    <span className="truncate text-sm font-medium text-text group-hover:text-brand">{r.name}</span>
                    {r.historicalFailure && (
                      <span className="flex-none rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">gt</span>
                    )}
                  </div>
                  <div className="mt-0.5 flex items-center gap-2 pl-4 text-[11px] text-muted">
                    <span className="truncate">{r.region}, {r.country}</span>
                    <span>·</span>
                    <span className="tabular-nums" style={{ color: r.velocityMmYr < -25 ? BAND_COLOR.critical : r.velocityMmYr < -10 ? BAND_COLOR.elevated : undefined }}>
                      {r.velocityMmYr} mm/yr
                    </span>
                  </div>
                </Link>
                <div className="flex flex-none flex-col items-end gap-1">
                  <span
                    className="rounded-md px-2 py-0.5 text-sm font-semibold tabular-nums"
                    style={{ color: BAND_COLOR[r.band], background: `${BAND_COLOR[r.band]}1a` }}
                  >
                    {r.score}
                  </span>
                  <ActionPill action={r.recommendedAction} />
                </div>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-muted">No facilities match these filters.</div>
          )}
        </div>
      </Card>
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-1.5">
      <span className="text-[10px] uppercase tracking-wide text-muted">{label}</span>
      <div className="flex flex-wrap items-center gap-1">{children}</div>
    </div>
  );
}

function Chip({
  active,
  color,
  onClick,
  children,
}: {
  active: boolean;
  color?: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-colors"
      style={{
        borderColor: active ? (color ?? "#1f9d8f") : "#233047",
        color: active ? (color ?? "#e6edf6") : "#8b9bb4",
        background: active ? `${color ?? "#1f9d8f"}1a` : "transparent",
      }}
    >
      {children}
    </button>
  );
}
