import { makeRng } from "@/lib/prng";
import type { RiskBand } from "@/lib/types";

// A synthetic InSAR line-of-sight deformation field over the dam footprint.
// Renders an interferogram-style raster with a movement hotspot whose intensity
// scales with the risk band — the "which part of the wall is moving" view.

const COLORS = [
  "#0b3d91", // strong uplift / stable (blue)
  "#1f78b4",
  "#41b6c4",
  "#a1dab4",
  "#ffffbf",
  "#fdae61",
  "#f46d43",
  "#d73027", // strong subsidence (red)
];

function colorFor(v: number): string {
  // v in [-1, 1]; -1 uplift (blue) .. +1 subsidence (red)
  const t = (v + 1) / 2;
  const idx = Math.min(COLORS.length - 1, Math.max(0, Math.floor(t * COLORS.length)));
  return COLORS[idx];
}

export function DeformationField({
  facilityId,
  band,
  cols = 26,
  rows = 16,
}: {
  facilityId: string;
  band: RiskBand;
  cols?: number;
  rows?: number;
}) {
  const rng = makeRng(`${facilityId}:field`);
  const intensity = band === "critical" ? 1 : band === "elevated" ? 0.55 : 0.18;

  // Hotspot location on the embankment.
  const hx = 0.35 + rng() * 0.4;
  const hy = 0.45 + rng() * 0.35;

  const cells: { x: number; y: number; v: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c / (cols - 1);
      const y = r / (rows - 1);
      const d = Math.hypot(x - hx, y - hy);
      const hot = Math.exp(-(d * d) / 0.045) * intensity;
      const base = -0.15 + 0.1 * Math.sin(x * 6 + y * 3); // gentle fringe pattern
      const noise = (rng() - 0.5) * 0.18;
      const v = Math.max(-1, Math.min(1, base + hot + noise));
      cells.push({ x: c, y: r, v });
    }
  }

  const cw = 100 / cols;
  const ch = 100 / rows;

  return (
    <div className="relative">
      <svg viewBox="0 0 100 62" preserveAspectRatio="none" className="w-full rounded-lg" style={{ height: 200 }}>
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x * cw}
            y={cell.y * ch * 0.62}
            width={cw + 0.3}
            height={ch * 0.62 + 0.3}
            fill={colorFor(cell.v)}
            opacity={0.92}
          />
        ))}
        {/* dam crest line */}
        <path
          d="M2 40 Q 30 30 50 33 T 98 24"
          stroke="#0a0e14"
          strokeWidth="0.8"
          fill="none"
          opacity="0.5"
        />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
        <span>Uplift</span>
        <div className="mx-2 h-2 flex-1 rounded-full" style={{ background: `linear-gradient(90deg, ${COLORS.join(",")})` }} />
        <span>Subsidence (LoS)</span>
      </div>
    </div>
  );
}
