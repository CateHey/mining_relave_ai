"use client";

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import type { DeformationPoint } from "@/lib/types";

export function DeformationChart({ points }: { points: DeformationPoint[] }) {
  const data = points.map((p) => ({
    date: p.date,
    displacement: p.displacementMm,
    rainfall: p.rainfallMm,
    label: new Date(p.date).toLocaleDateString("en-AU", { month: "short", year: "2-digit" }),
  }));

  return (
    <div style={{ width: "100%", height: 320 }}>
      <ResponsiveContainer>
        <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <CartesianGrid stroke="#233047" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#8b9bb4", fontSize: 11 }}
            interval={Math.max(0, Math.floor(data.length / 8))}
            tickLine={false}
            axisLine={{ stroke: "#233047" }}
          />
          <YAxis
            yAxisId="disp"
            tick={{ fill: "#8b9bb4", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Displacement (mm)",
              angle: -90,
              position: "insideLeft",
              fill: "#8b9bb4",
              fontSize: 11,
              dy: 60,
            }}
          />
          <YAxis
            yAxisId="rain"
            orientation="right"
            tick={{ fill: "#46566f", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip
            contentStyle={{
              background: "#161e2b",
              border: "1px solid #233047",
              borderRadius: 8,
              fontSize: 12,
            }}
            labelStyle={{ color: "#e6edf6" }}
            formatter={(value: number, name: string) =>
              name === "Rainfall"
                ? [`${value} mm`, "Rainfall"]
                : [`${value} mm`, "Cumulative displacement"]
            }
          />
          <Legend wrapperStyle={{ fontSize: 12, color: "#8b9bb4" }} />
          <Bar yAxisId="rain" dataKey="rainfall" name="Rainfall" fill="#233047" radius={[2, 2, 0, 0]} />
          <Line
            yAxisId="disp"
            type="monotone"
            dataKey="displacement"
            name="Displacement"
            stroke="#1f9d8f"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
