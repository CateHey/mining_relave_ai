import Link from "next/link";
import { getAlerts } from "@/lib/portfolio";
import { BAND_COLOR, DIMENSION_META, formatDate } from "@/lib/format";
import { RiskBadge, Card } from "@/components/ui";

export default function AlertsPage() {
  const alerts = getAlerts();

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-2xl font-semibold tracking-tight">Alerts</h1>
        <p className="mt-1 max-w-2xl text-sm text-muted">
          New environmental change above baseline turns a one-off screen into always-on monitoring.
          Each alert links straight to the mine&apos;s indicator history and the recommended next
          step.
        </p>
      </section>

      <div className="space-y-3">
        {alerts.map((a) => (
          <Link key={a.id} href={`/mine/${a.mineId}`} className="block">
            <Card className="flex items-start gap-4 p-4 transition-colors hover:border-brand/40">
              <div className="mt-1 h-2.5 w-2.5 flex-none rounded-full" style={{ background: BAND_COLOR[a.band] }} />
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-text">{a.mineName}</span>
                  <RiskBadge band={a.band} size="sm" />
                  <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] text-muted">
                    {DIMENSION_META[a.dimension].icon} {DIMENSION_META[a.dimension].label}
                  </span>
                  <span className="text-xs text-muted">{formatDate(a.date)}</span>
                </div>
                <div className="mt-0.5 text-sm font-medium" style={{ color: BAND_COLOR[a.band] }}>
                  {a.title}
                </div>
                <p className="mt-1 text-sm text-muted">{a.message}</p>
              </div>
              <span className="self-center text-muted">→</span>
            </Card>
          </Link>
        ))}
        {alerts.length === 0 && (
          <Card className="p-8 text-center text-sm text-muted">
            No mines above baseline. Portfolio is low-impact.
          </Card>
        )}
      </div>
    </div>
  );
}
