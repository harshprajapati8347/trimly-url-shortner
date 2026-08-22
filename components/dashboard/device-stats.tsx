"use client";

import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts";
import type { ClickRecord } from "@/lib/types";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

export function DeviceStats({ stats }: { stats: ClickRecord[] }) {
  const deviceCount = stats.reduce<Record<string, number>>((acc, item) => {
    const device = item.device || "unknown";
    acc[device] = (acc[device] ?? 0) + 1;
    return acc;
  }, {});

  const result = Object.entries(deviceCount).map(([device, count]) => ({
    device,
    count,
  }));

  return (
    <div style={{ width: "100%", height: 300 }}>
      <ResponsiveContainer>
        <PieChart>
          <Pie
            data={result}
            labelLine={false}
            label={({ device, percent }) =>
              `${device}: ${((percent ?? 0) * 100).toFixed(0)}%`
            }
            dataKey="count"
          >
            {result.map((entry, index) => (
              <Cell key={entry.device} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
