"use client";

import { AreaChart, Area, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

type RevenueChartProps = {
  data?: Array<{ month: string; revenue: number }>;
};

const fallbackData = [
  { month: "Jan", revenue: 0 },
  { month: "Feb", revenue: 0 },
  { month: "Mar", revenue: 0 },
];

export default function RevenueChart({ data }: RevenueChartProps) {
  const chartData = data && data.length > 0 ? data : fallbackData;

  return (
    <div className="rounded-xl border bg-white p-5 shadow-sm">
      <div className="mb-5">
        <h2 className="text-lg font-semibold">Revenue Overview</h2>
        <p className="text-sm text-gray-500">Monthly revenue from successful payments</p>
      </div>
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(v) => `$${v}`} />
            <Tooltip formatter={(v) => [`$${Number(v ?? 0).toFixed(2)}`, "Revenue"]} />
            <Area
              type="monotone"
              dataKey="revenue"
              stroke="#2563eb"
              fill="#93c5fd"
              fillOpacity={0.3}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
