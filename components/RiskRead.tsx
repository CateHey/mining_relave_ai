import type { RiskAssessment } from "@/lib/types";
import { BAND_COLOR } from "@/lib/format";
import { Card, RiskBadge, ConfidenceBar } from "./ui";

function Gauge({ score, color }: { score: number; color: string }) {
  const r = 34;
  const circ = Math.PI * r; // semicircle
  const pct = score / 100;
  return (
    <svg viewBox="0 0 90 52" className="w-[120px]">
      <path
        d={`M 11 46 A ${r} ${r} 0 0 1 79 46`}
        fill="none"
        stroke="#233047"
        strokeWidth="8"
        strokeLinecap="round"
      />
      <path
        d={`M 11 46 A ${r} ${r} 0 0 1 79 46`}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${circ * pct} ${circ}`}
      />
      <text x="45" y="42" textAnchor="middle" fontSize="20" fontWeight="700" fill="#e6edf6">
        {score}
      </text>
    </svg>
  );
}

export function RiskRead({ risk }: { risk: RiskAssessment }) {
  const color = BAND_COLOR[risk.band];
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">AI Risk Read</span>
          <span className="text-xs text-muted">· explainable model</span>
        </div>
        <RiskBadge band={risk.band} />
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2">
          <Gauge score={risk.score} color={color} />
          <div className="text-[11px] uppercase tracking-wide text-muted">Risk score</div>
          <div className="mt-1">
            <div className="mb-1 text-center text-[11px] text-muted">Confidence</div>
            <ConfidenceBar value={risk.confidence} />
          </div>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Metric
              label="LoS velocity"
              value={`${risk.velocityMmYr} mm/yr`}
              tone={risk.velocityMmYr < -25 ? "bad" : risk.velocityMmYr < -10 ? "warn" : "ok"}
            />
            <Metric
              label="Acceleration"
              value={`${risk.accelerationMmYr2} mm/yr²`}
              tone={risk.accelerationMmYr2 < -8 ? "bad" : risk.accelerationMmYr2 < -3 ? "warn" : "ok"}
            />
          </div>

          <p className="text-sm leading-relaxed text-text">{risk.explanation}</p>
        </div>
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">
          Why — contributing factors
        </div>
        <div className="space-y-2.5">
          {risk.factors.map((f) => (
            <div key={f.label} className="grid grid-cols-[140px_1fr_46px] items-start gap-3 text-sm">
              <div className="font-medium text-text">{f.label}</div>
              <div className="text-muted">{f.detail}</div>
              <div className="text-right tabular-nums text-xs text-muted">
                {Math.round(f.weight * 100)}%
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "ok" | "warn" | "bad";
}) {
  const color = tone === "bad" ? "#f5564a" : tone === "warn" ? "#f5b945" : "#2dd4a7";
  return (
    <div className="rounded-lg border border-border bg-surface-2 px-3 py-2">
      <div className="text-[11px] uppercase tracking-wide text-muted">{label}</div>
      <div className="text-lg font-semibold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
