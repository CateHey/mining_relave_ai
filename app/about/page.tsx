import { Card } from "@/components/ui";

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight">How Relave AI works</h1>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Mines are under growing pressure from investors, regulators and communities to prove their
          real environmental footprint — but credible monitoring still means costly site surveys and
          consultants. Relave AI reads <strong className="text-text">free satellite data with AI</strong>{" "}
          to score every mine on its environmental impact — vegetation, water, dust, land and ground —
          and explains each read in plain language with the evidence behind it.
        </p>
      </header>

      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { n: "1", t: "Select", d: "Pick any mine on the map — no site visit, no contractor." },
          { n: "2", t: "Read", d: "Satellite indicators are scored across 5 ESG dimensions, with confidence." },
          { n: "3", t: "Act", d: "Each review ends in one step: investigate, remediate, or disclose." },
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
          Free satellite data → an ESG signal
        </h2>
        <div className="overflow-hidden rounded-xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-2 text-left text-[11px] uppercase tracking-wide text-muted">
                <th className="px-4 py-2.5 font-medium">Dimension</th>
                <th className="px-4 py-2.5 font-medium">Source (free)</th>
                <th className="px-4 py-2.5 font-medium">What it detects</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["🌿 Vegetation", "Sentinel-2 NDVI · ESA WorldCover", "Deforestation, clearing and revegetation around the site."],
                ["💧 Water", "Sentinel-2 multispectral", "Turbidity / discolouration in the downstream watercourse."],
                ["🌫️ Air & dust", "Sentinel-5P aerosol", "Dust and emissions over the site and nearby communities."],
                ["⛰️ Land", "Sentinel-2 · WorldCover change", "Growth of the disturbed mine footprint over time."],
                ["📐 Ground", "Sentinel-1 InSAR", "Millimetre-scale subsidence and ground movement."],
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
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Inform, don&apos;t audit</h2>
        <Card className="p-5 text-sm leading-relaxed text-muted">
          Satellite indicators are noisy — clouds, seasonality and atmospheric effects degrade the raw
          signal. That is where the AI earns its keep: it separates a real environmental change from
          seasonal noise and shows its confidence. Relave AI surfaces impact and evidence and defers
          the formal sign-off to the environmental professional — credible, continuous ESG evidence
          that sits alongside auditors and regulators rather than replacing them.
        </Card>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted">Built to scale</h2>
        <Card className="p-5 text-sm leading-relaxed text-muted">
          This prototype runs on a synthetic indicator generator and a transparent, deterministic ESG
          model. The domain layer (<code className="text-text">lib/indicators.ts</code>,{" "}
          <code className="text-text">lib/esgEngine.ts</code>) is decoupled behind typed interfaces, so
          the synthetic source swaps for real Sentinel composites and the rule-based model for a learned
          one — without touching the UI. A JSON assessment endpoint is exposed at{" "}
          <code className="text-text">/api/esg?mine=&lt;id&gt;</code>.
        </Card>
      </section>
    </div>
  );
}
