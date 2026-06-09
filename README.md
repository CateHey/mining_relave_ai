# Relave AI

**Satellite-and-AI tailings-failure early warning for the mid-tier mines and regulators that radar can't reach. Built in Australia, ready for Peru.**

A tailings dam failure can bury a town in minutes — and the technology that predicts it is locked behind six-figure on-site hardware only the biggest mines can buy. Relave AI reads **free satellite radar (InSAR)** with AI to give every mine and regulator an early warning of **which dam is moving, why, and how urgently** — guidance for engineers, not a replacement for them.

This repo is a working prototype of the core flow: an operator or regulator selects a tailings storage facility (TSF) on a map; Relave AI returns its deformation history, an explainable AI risk read with a confidence score, and one concrete next step — **inspect, escalate, or report.**

---

## What's in the demo

- **Portfolio risk screen** (`/`) — every facility on a map and ranked in a table by failure risk, colour-coded by band (stable / elevated / critical), with portfolio-wide stats (people at risk, critical/elevated counts).
- **Facility detail** (`/facility/[id]`) — cumulative InSAR line-of-sight displacement chart with a rainfall overlay, a synthetic deformation field (which part of the wall is moving), the **AI Risk Read** (score, confidence, velocity, acceleration, plain-language explanation, contributing factors), and an action panel that writes to an **audit trail you can export as CSV** for the regulator.
- **Alerts** (`/alerts`) — always-on feed of facilities that have moved above baseline.
- **How it works** (`/about`) — the tiered free/premium data strategy and the "inform, don't certify" positioning.
- **Assessment API** (`/api/risk` and `/api/risk?facility=<id>`) — the JSON seam a real client, regulator portal or insurer feed integrates against.

The demo ships with 10 illustrative facilities across Australia and Peru, including ground-truth historical-failure cases (Brumadinho / Córrego do Feijão, Cobriza) used as known-positive precursor signatures.

---

## How it's built to scale

The data and model layers are decoupled behind typed interfaces, so the demo's synthetic source swaps for a real backend **without touching the UI**:

| Layer | Demo (this repo) | Production swap |
| --- | --- | --- |
| Deformation time series | `lib/deformation.ts` — deterministic synthetic InSAR | Processed Sentinel-1 / ICEYE time-series store (SNAP / EZ-InSAR pipeline) |
| Risk model | `lib/riskEngine.ts` — transparent, rule-based, every input exposed as an auditable factor | A learned failure-precursor model + optional Claude-generated narrative, same `RiskAssessment` contract |
| Context layers | seasonal rainfall + seismic in the generator | Copernicus DEM, ERA5 rainfall, USGS seismic feeds |

Everything is deterministic (seeded PRNG) so charts and assessments are reproducible across server and client — no hydration drift.

**Tiered data strategy = tiered product:** free Sentinel-1 C-band powers continuous portfolio-wide screening at near-zero marginal cost; paid high-res tasking (ICEYE / Capella) is triggered only when the base layer flags movement.

---

## Tech stack

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4**
- **react-leaflet** + CARTO dark tiles for the map (no API key required)
- **Recharts** for the deformation/rainfall chart

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
```

```bash
npm run build && npm start   # production build
```

## Deploy to Vercel

This is a standard Next.js app — zero config required.

1. Push to GitHub (this repo: `CateHey/mining_relave_ai`).
2. Import the repo at [vercel.com/new](https://vercel.com/new).
3. Vercel auto-detects Next.js — accept the defaults and deploy.

No environment variables are needed for the demo. (When wiring a real model, add `ANTHROPIC_API_KEY` and the SAR data store credentials as Vercel env vars.)

---

> **Inform, don't certify.** Relave AI surfaces risk and evidence and defers the formal sign-off to the licensed geotechnical engineer. All figures in this prototype are synthetic and illustrative; the model is decision support and does not constitute geotechnical certification.
