'use client';

import { Line, LineChart, ResponsiveContainer, YAxis } from 'recharts';

interface SparklineChartProps {
  data: number[];
  color: string;
}

export default function SparklineChart({ data, color }: SparklineChartProps) {
  const chartData = data.map((value, index) => ({
    name: index.toString(),
    value,
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
        <YAxis domain={['dataMin - 5', 'dataMax + 5']} hide />
        <Line
          type="monotone"
          dataKey="value"
          stroke={`hsl(var(--${color.replace(/-[0-9]+$/, '')}))`}
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
