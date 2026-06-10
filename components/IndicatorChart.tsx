"use client";

import {
  ComposedChart,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { IndicatorPoint } from "@/lib/types";

export function IndicatorChart({ points }: { points: IndicatorPoint[] }) {
  const data = points.map((p) => ({
    label: new Date(p.date).toLocaleDateString("en-AU", { month: "short", year: "2-digit" }),
    ndvi: p.ndvi,
    turbidity: p.waterTurbidity,
    dust: p.dustIndex,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
          <defs>
            <linearGradient id="ndviFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#19e6a3" stopOpacity={0.35} />
              <stop offset="100%" stopColor="#19e6a3" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#233047" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#8b9bb4", fontSize: 11 }}
            interval={Math.max(0, Math.floor(data.length / 8))}
            tickLine={false}
            axisLine={{ stroke: "#233047" }}
          />
          <YAxis
            yAxisId="ndvi"
            domain={[0, 1]}
            tick={{ fill: "#19e6a3", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={48}
            label={{ value: "NDVI", angle: -90, position: "insideLeft", fill: "#19e6a3", fontSize: 11, dy: 18 }}
          />
          <YAxis
            yAxisId="idx"
            orientation="right"
            domain={[0, 100]}
            tick={{ fill: "#8b9bb4", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{ background: "#161e2b", border: "1px solid #233047", borderRadius: 8, fontSize: 12 }}
            labelStyle={{ color: "#e6edf6" }}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8b9bb4" }} />
          <Area
            yAxisId="ndvi"
            type="monotone"
            dataKey="ndvi"
            name="Vegetation (NDVI)"
            stroke="#19e6a3"
            strokeWidth={2}
            fill="url(#ndviFill)"
            dot={false}
          />
          <Line yAxisId="idx" type="monotone" dataKey="turbidity" name="Water turbidity" stroke="#4aa3ff" strokeWidth={2} dot={false} />
          <Line yAxisId="idx" type="monotone" dataKey="dust" name="Dust / aerosol" stroke="#ffc233" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
