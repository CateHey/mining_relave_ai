"use client";

import { useEffect, useState } from "react";
import type { ActionType, AuditEntry, RiskBand } from "@/lib/types";
import { Card } from "./ui";

const NOW_ISO = "2026-06-09T09:30:00Z";

const ACTIONS: { key: ActionType; label: string; desc: string; color: string }[] = [
  { key: "inspect", label: "Investigate", desc: "Open a field / data review", color: "#ffc233" },
  { key: "escalate", label: "Remediate", desc: "Raise a remediation case", color: "#ff4d5e" },
  { key: "report", label: "Disclose", desc: "Log to the ESG record", color: "#19e6a3" },
];

export function ActionPanel({
  mineId,
  mineName,
  recommended,
}: {
  mineId: string;
  mineName: string;
  recommended: ActionType;
  band: RiskBand;
}) {
  const storageKey = `relave-audit:${mineId}`;
  const [trail, setTrail] = useState<AuditEntry[]>([]);
  const [monitoring, setMonitoring] = useState(true);
  const [flash, setFlash] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setTrail(JSON.parse(raw));
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  function persist(next: AuditEntry[]) {
    setTrail(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function record(action: ActionType) {
    const labelMap: Record<ActionType, string> = {
      inspect: "Investigation opened",
      escalate: "Remediation case raised",
      report: "Logged to ESG disclosure record",
      monitor: "Monitoring updated",
    };
    const entry: AuditEntry = {
      timestamp: new Date().toISOString(),
      mineId,
      mineName,
      action: action.toUpperCase(),
      detail: labelMap[action],
      actor: "demo.analyst@relave.ai",
    };
    persist([entry, ...trail]);
    setFlash(`${labelMap[action]} — written to the audit trail.`);
    setTimeout(() => setFlash(null), 2600);
  }

  function exportTrail() {
    const header = "timestamp,mine_id,mine_name,action,detail,actor\n";
    const seed: AuditEntry[] =
      trail.length > 0
        ? trail
        : [
            {
              timestamp: NOW_ISO,
              mineId,
              mineName,
              action: recommended.toUpperCase(),
              detail: "Initial AI ESG assessment recorded",
              actor: "relave-ai/model",
            },
          ];
    const rows = seed
      .map((e) => `${e.timestamp},${e.mineId},"${e.mineName}",${e.action},"${e.detail}",${e.actor}`)
      .join("\n");
    const blob = new Blob([header + rows], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relave-esg-${mineId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-border px-5 py-3">
        <span className="text-xs font-semibold uppercase tracking-wide text-brand">Next step</span>
        <p className="mt-0.5 text-xs text-muted">
          Every review ends in one concrete action. Recommended:{" "}
          <span className="font-semibold text-text">{ACTIONS.find((a) => a.key === recommended)?.label}</span>.
        </p>
      </div>

      <div className="grid grid-cols-3 gap-2 p-4">
        {ACTIONS.map((a) => {
          const isRec = a.key === recommended;
          return (
            <button
              key={a.key}
              onClick={() => record(a.key)}
              className="group flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors hover:bg-surface-2"
              style={{ borderColor: isRec ? a.color : "#233047", background: isRec ? `${a.color}12` : "transparent" }}
            >
              <span className="text-sm font-semibold" style={{ color: a.color }}>
                {a.label}
                {isRec && <span className="ml-1 text-[10px] text-muted">· suggested</span>}
              </span>
              <span className="text-[11px] leading-tight text-muted">{a.desc}</span>
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between border-t border-border px-5 py-3">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-muted">
          <input
            type="checkbox"
            checked={monitoring}
            onChange={(e) => setMonitoring(e.target.checked)}
            className="h-4 w-4 accent-[#1f9d8f]"
          />
          Continuous monitoring & alerts
        </label>
        <button
          onClick={exportTrail}
          className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-text hover:bg-surface-2"
        >
          Export ESG evidence (CSV)
        </button>
      </div>

      {flash && <div className="border-t border-border bg-surface-2 px-5 py-2 text-xs text-stable">{flash}</div>}

      {trail.length > 0 && (
        <div className="border-t border-border px-5 py-3">
          <div className="mb-2 text-[11px] uppercase tracking-wide text-muted">Audit trail</div>
          <ul className="space-y-1.5">
            {trail.slice(0, 5).map((e, i) => (
              <li key={i} className="flex items-center justify-between text-xs">
                <span className="text-text">{e.detail}</span>
                <span className="tabular-nums text-muted">
                  {new Date(e.timestamp).toLocaleString("en-AU", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}
