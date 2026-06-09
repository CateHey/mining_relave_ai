import { Card } from "@/components/ui";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">How Relave AI works</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A tailings dam failure can bury a town in minutes — and the technology that predicts it is
          locked behind six-figure on-site hardware only the biggest mines can buy. Relave AI reads
          free satellite radar with AI to give every mine and regulator an early warning of which dam
          is moving, why, and how urgently — guidance for engineers, not a replacement for them.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { n: "1", t: "Select", d: "Pick any facility on the map — no install, no field trip." },
          { n: "2", t: "Read", d: "InSAR measures mm-scale movement; the AI explains it with a confidence score." },
          { n: "3", t: "Act", d: "Each review ends in one step: inspect, escalate, or report." },
        ].map((s) => (
          <Card key={s.n} className="p-4">
            <div className="text-xs font-semibold text-brand">STEP {s.n}</div>
            <div className="mt-1 font-medium">{s.t}</div>
            <div className="mt-1 text-sm text-muted">{s.d}</div>
          </Card>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Tiered data strategy = tiered product
        </h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5 font-medium">Layer</th>
                <th className="px-4 py-2.5 font-medium">Source</th>
                <th className="px-4 py-2.5 font-medium">Role</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Base (free)", "Sentinel-1 C-band, 6–12 day revisit", "Continuous portfolio-wide screening at near-zero marginal cost per dam."],
                ["Premium (paid)", "ICEYE / Capella high-res tasking", "Triggered only when the base layer flags movement — a close-up look."],
                ["Context (free)", "Copernicus DEM, ERA5 rainfall, USGS seismic", "Turns a static map into a dynamic, trigger-aware risk score."],
              ].map((r) => (
                <tr key={r[0]} className="border-b border-border last:border-0">
                  <td className="px-4 py-3 font-medium text-text">{r[0]}</td>
                  <td className="px-4 py-3 text-muted">{r[1]}</td>
                  <td className="px-4 py-3 text-muted">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">
          Inform, don&apos;t certify
        </h2>
        <Card className="p-5 text-sm leading-relaxed text-muted">
          InSAR over tailings is noisy — atmospheric distortion and temporal decorrelation degrade
          the raw signal, and that can never be fully removed. That is precisely where the AI earns
          its keep: it learns to separate a real failure precursor from seasonal noise and shows its
          confidence. Relave AI surfaces risk and evidence and defers the formal sign-off to the
          licensed professional — turning the liability constraint into a trust advantage and an
          ecosystem-friendly position alongside geotechnical engineers and regulators.
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Built to scale</h2>
        <Card className="p-5 text-sm leading-relaxed text-muted">
          This prototype runs on a synthetic InSAR generator and a transparent, deterministic risk
          model. The domain layer (<code className="text-text">lib/deformation.ts</code>,{" "}
          <code className="text-text">lib/riskEngine.ts</code>) is decoupled behind typed interfaces,
          so the synthetic source swaps for a real Sentinel-1 time-series store and the rule-based
          model for a learned one — without touching the UI. A JSON assessment endpoint is exposed at{" "}
          <code className="text-text">/api/risk?facility=&lt;id&gt;</code>.
        </Card>
      </section>
    </div>
  );
}
