# Relave AI

**Satellite-and-AI environmental & ESG intelligence for mines.**

Mines face growing pressure from investors, regulators and communities to prove their real environmental footprint — but credible monitoring still means costly site surveys and consultants. Relave AI reads **free satellite data with AI** to score every mine on its environmental impact and explain each read in plain language, with the evidence behind it.

An analyst selects a mine on a map; Relave AI returns its 24-month environmental history, an explainable **ESG impact score** with a confidence level, a breakdown across five dimensions, and one concrete next step — **investigate, remediate, or disclose.**

---

## What's in the demo

- **Mine ESG impact screen** (`/`) — every mine on a map and ranked by environmental impact, colour-coded (low / watch / high), with portfolio stats (high-impact count, vegetation cleared, improving sites). Interactive: filter by region & impact, hover to highlight on the map, fly-to.
- **Mine detail** (`/mine/[id]`) — a 24-month indicator chart (NDVI vegetation, water turbidity, dust), a synthetic land-cover change map, the **AI ESG Read** (composite score, confidence, trend, plain-language explanation, and a 5-dimension breakdown), and an action panel that writes to an **audit trail you can export as CSV** for ESG disclosure.
- **Alerts** (`/alerts`) — always-on feed of mines whose impact has risen above baseline, tagged by dimension.
- **How it works** (`/about`) — the free-satellite → ESG-signal mapping and the "inform, don't audit" positioning.
- **Assessment API** (`/api/esg` and `/api/esg?mine=<id>`) — the JSON seam an investor portal, regulator feed or ESG-reporting suite integrates against.

The five ESG dimensions, each from free satellite data:

| Dimension | Source (free) | Detects |
| --- | --- | --- |
| 🌿 Vegetation | Sentinel-2 NDVI · ESA WorldCover | Deforestation, clearing, revegetation |
| 💧 Water | Sentinel-2 multispectral | Downstream turbidity / discolouration |
| 🌫️ Air & dust | Sentinel-5P aerosol | Dust & emissions over the site |
| ⛰️ Land | Sentinel-2 · WorldCover change | Growth of the disturbed footprint |
| 📐 Ground | Sentinel-1 InSAR | Millimetre-scale subsidence |

The demo ships with 10 illustrative mines across Australia, Peru, Brazil and Chile — including an Amazon alluvial-gold deforestation case (high impact) and a nickel rehabilitation site (low impact, improving).

---

## How it's built to scale

The data and model layers are decoupled behind typed interfaces, so the demo's synthetic source swaps for a real backend **without touching the UI**:

| Layer | Demo (this repo) | Production swap |
| --- | --- | --- |
| Indicator time series | `lib/indicators.ts` — deterministic synthetic | Real Sentinel-2 / Sentinel-1 / Sentinel-5P monthly composites |
| ESG model | `lib/esgEngine.ts` — transparent, every input an auditable factor | A learned model + optional Claude-generated narrative, same `EsgAssessment` contract |

Everything is deterministic (seeded PRNG) so charts and assessments are reproducible across server and client — no hydration drift.

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **react-leaflet** + CARTO dark tiles for the map (no API key required)
- **Recharts** for the indicator chart

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

## Deploy to Vercel

Standard Next.js app — zero config. Push to GitHub, import at [vercel.com/new](https://vercel.com/new), accept the auto-detected defaults, deploy. No environment variables needed for the demo.

---

> **Inform, don't audit.** Relave AI surfaces environmental impact and evidence and defers the formal sign-off to the environmental professional. All figures in this prototype are synthetic and illustrative; the model is decision support for ESG disclosure and is not a regulated environmental audit.
