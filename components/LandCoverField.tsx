import { makeRng } from "@/lib/prng";
import type { RiskBand } from "@/lib/types";

// A synthetic land-cover / change map over the mine buffer. Renders vegetation
// (green) vs cleared or disturbed ground (brown→red), with the disturbed area
// growing as the impact band rises — the "what changed on the ground" view.

const VEG = "#1f7a52";
const VEG2 = "#2f9e6a";
const BARE = "#7a5a36";
const DIST = "#b4452f";

function colorFor(v: number): string {
  // v in [0,1]: 0 = healthy vegetation, 1 = disturbed/cleared ground
  if (v < 0.35) return VEG;
  if (v < 0.55) return VEG2;
  if (v < 0.78) return BARE;
  return DIST;
}

export function LandCoverField({
  mineId,
  band,
  cols = 26,
  rows = 16,
}: {
  mineId: string;
  band: RiskBand;
  cols?: number;
  rows?: number;
}) {
  const rng = makeRng(`${mineId}:land`);
  const disturbed = band === "critical" ? 0.62 : band === "elevated" ? 0.38 : 0.18;

  // Mine pit / cleared core location.
  const hx = 0.4 + rng() * 0.3;
  const hy = 0.4 + rng() * 0.3;

  const cells: { x: number; y: number; v: number }[] = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = c / (cols - 1);
      const y = r / (rows - 1);
      const d = Math.hypot(x - hx, y - hy);
      const core = Math.exp(-(d * d) / (0.02 + disturbed * 0.08));
      const noise = (rng() - 0.5) * 0.22;
      const v = Math.max(0, Math.min(1, core + noise + (disturbed - 0.3) * 0.4));
      cells.push({ x: c, y: r, v });
    }
  }

  const cw = 100 / cols;
  const ch = 100 / rows;

  return (
    <div>
      <svg viewBox="0 0 100 62" preserveAspectRatio="none" className="w-full rounded-lg" style={{ height: 200 }}>
        {cells.map((cell, i) => (
          <rect
            key={i}
            x={cell.x * cw}
            y={cell.y * ch * 0.62}
            width={cw + 0.3}
            height={ch * 0.62 + 0.3}
            fill={colorFor(cell.v)}
            opacity={0.95}
          />
        ))}
        {/* watercourse */}
        <path d="M0 8 Q 30 16 55 12 T 100 22" stroke="#4aa3ff" strokeWidth="0.9" fill="none" opacity="0.7" />
      </svg>
      <div className="mt-2 flex items-center justify-between text-[10px] text-muted">
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ background: VEG }} /> Vegetation</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ background: BARE }} /> Bare ground</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ background: DIST }} /> Disturbed / cleared</span>
        <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-sm" style={{ background: "#4aa3ff" }} /> Watercourse</span>
      </div>
    </div>
  );
}
