import type { EsgAssessment } from "@/lib/types";
import { BAND_COLOR, BAND_LABEL, DIMENSION_META } from "@/lib/format";
import { Card, RiskBadge, ConfidenceBar } from "./ui";

function Gauge({ score, color }: { score: number; color: string }) {
  const r = 34;
  const circ = Math.PI * r;
  const pct = score / 100;
  return (
    <svg viewBox="0 0 90 52" className="w-[120px]">
      <path d={`M 11 46 A ${r} ${r} 0 0 1 79 46`} fill="none" stroke="#233047" strokeWidth="8" strokeLinecap="round" />
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

function TrendChip({ trend }: { trend: "improving" | "worsening" | "steady" }) {
  const map = {
    improving: { c: "#19e6a3", t: "↓ Improving" },
    worsening: { c: "#ff4d5e", t: "↑ Worsening" },
    steady: { c: "#8b9bb4", t: "→ Steady" },
  } as const;
  const { c, t } = map[trend];
  return (
    <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ color: c, background: `${c}1a` }}>
      {t}
    </span>
  );
}

export function EsgRead({ esg }: { esg: EsgAssessment }) {
  const color = BAND_COLOR[esg.band];
  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wide text-brand">AI ESG Read</span>
          <span className="text-xs text-muted">· explainable model</span>
        </div>
        <div className="flex items-center gap-2">
          <TrendChip trend={esg.trend} />
          <RiskBadge band={esg.band} />
        </div>
      </div>

      <div className="grid gap-5 p-5 md:grid-cols-[auto_1fr]">
        <div className="flex flex-col items-center gap-2">
          <Gauge score={esg.score} color={color} />
          <div className="text-[11px] uppercase tracking-wide text-muted">Impact score</div>
          <div className="text-xs font-medium" style={{ color }}>
            {BAND_LABEL[esg.band]}
          </div>
          <div className="mt-1">
            <div className="mb-1 text-center text-[11px] text-muted">Confidence</div>
            <ConfidenceBar value={esg.confidence} />
          </div>
        </div>

        <p className="self-center text-sm leading-relaxed text-text">{esg.explanation}</p>
      </div>

      <div className="border-t border-border px-5 py-4">
        <div className="mb-3 text-[11px] uppercase tracking-wide text-muted">Environmental dimensions</div>
        <div className="space-y-3">
          {esg.factors.map((f) => {
            const c = BAND_COLOR[f.band];
            const meta = DIMENSION_META[f.dimension];
            return (
              <div key={f.dimension} className="grid grid-cols-[120px_1fr_auto] items-center gap-3">
                <div className="flex items-center gap-1.5 text-sm font-medium text-text">
                  <span>{meta.icon}</span>
                  {meta.label}
                </div>
                <div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full" style={{ width: `${f.score}%`, background: c }} />
                  </div>
                  <div className="mt-1 text-[11px] text-muted">{f.detail}</div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-7 text-right text-sm font-semibold tabular-nums" style={{ color: c }}>
                    {f.score}
                  </span>
                  <span
                    className="text-xs"
                    title={f.trend}
                    style={{ color: f.trend === "worsening" ? "#ff4d5e" : f.trend === "improving" ? "#19e6a3" : "#8b9bb4" }}
                  >
                    {f.trend === "worsening" ? "↑" : f.trend === "improving" ? "↓" : "→"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
}
