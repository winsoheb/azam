"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

export function TelemetryChart({ data, dataKey, color }: { data: any[], dataKey: string, color: string }) {
  if (!data || data.length === 0) {
    return <div className="h-48 flex items-center justify-center text-zinc-500">No telemetry data available</div>;
  }

  return (
    <div className="h-48 w-full mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#3f3f46" vertical={false} />
          <XAxis 
            dataKey="time" 
            stroke="#71717a" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickMargin={10}
          />
          <YAxis 
            stroke="#71717a" 
            fontSize={10}
            tickLine={false}
            axisLine={false}
            tickFormatter={(value) => `${value}`}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px' }}
            itemStyle={{ color: '#e4e4e7' }}
          />
          <Line 
            type="monotone" 
            dataKey={dataKey} 
            stroke={color} 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, fill: color, stroke: '#18181b', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
