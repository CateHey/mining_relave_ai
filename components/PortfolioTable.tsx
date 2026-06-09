import Link from "next/link";
import type { FacilityWithRisk } from "@/lib/portfolio";
import { BAND_COLOR } from "@/lib/format";
import { RiskBadge, ActionPill, ConfidenceBar } from "./ui";

export function PortfolioTable({ rows }: { rows: FacilityWithRisk[] }) {
  return (
    <div className="overflow-hidden rounded-xl border border-border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface-2 text-left text-[11px] uppercase tracking-wide text-muted">
            <th className="px-4 py-2.5 font-medium">Facility</th>
            <th className="px-3 py-2.5 font-medium">Status</th>
            <th className="px-3 py-2.5 text-right font-medium">Velocity</th>
            <th className="px-3 py-2.5 font-medium">Risk</th>
            <th className="hidden px-3 py-2.5 font-medium md:table-cell">Confidence</th>
            <th className="px-3 py-2.5 font-medium">Action</th>
            <th className="px-3 py-2.5 text-right font-medium">Score</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(({ facility, risk }) => (
            <tr
              key={facility.id}
              className="group border-b border-border last:border-0 transition-colors hover:bg-surface-2"
            >
              <td className="px-4 py-3">
                <Link href={`/facility/${facility.id}`} className="block">
                  <div className="flex items-center gap-2 font-medium text-text group-hover:text-brand">
                    {facility.name}
                    {facility.historicalFailure && (
                      <span
                        title={facility.historicalFailure}
                        className="rounded bg-surface px-1.5 py-0.5 text-[10px] text-muted"
                      >
                        ground-truth
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted">
                    {facility.operator} · {facility.region}, {facility.country}
                  </div>
                </Link>
              </td>
              <td className="px-3 py-3">
                <span className="text-xs capitalize text-muted">{facility.status}</span>
                <div className="text-[11px] text-muted">{facility.damType}</div>
              </td>
              <td className="px-3 py-3 text-right tabular-nums">
                <span style={{ color: risk.velocityMmYr < -25 ? BAND_COLOR.critical : risk.velocityMmYr < -10 ? BAND_COLOR.elevated : "#8b9bb4" }}>
                  {risk.velocityMmYr}
                </span>
                <span className="text-[11px] text-muted"> mm/yr</span>
              </td>
              <td className="px-3 py-3">
                <RiskBadge band={risk.band} size="sm" />
              </td>
              <td className="hidden px-3 py-3 md:table-cell">
                <ConfidenceBar value={risk.confidence} />
              </td>
              <td className="px-3 py-3">
                <ActionPill action={risk.recommendedAction} />
              </td>
              <td className="px-3 py-3 text-right">
                <span
                  className="inline-block min-w-[2rem] rounded-md px-2 py-1 text-center font-semibold tabular-nums"
                  style={{ color: BAND_COLOR[risk.band], background: `${BAND_COLOR[risk.band]}14` }}
                >
                  {risk.score}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
