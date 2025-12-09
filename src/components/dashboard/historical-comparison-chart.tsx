'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import type { EnhancedAqiResponse } from '@/lib/api-client';

const chartConfig = {
  o3: { label: 'Ozone', color: 'hsl(var(--chart-1))' },
  no2: { label: 'NO₂', color: 'hsl(var(--chart-2))' },
  pm25: { label: 'PM2.5', color: 'hsl(var(--chart-3))' },
} satisfies ChartConfig;

interface HistoricalComparisonChartProps {
  data?: EnhancedAqiResponse | null;
}

export default function HistoricalComparisonChart({ data }: HistoricalComparisonChartProps) {
  const daily = data?.daily || {};

  // Transform Daily Data
  const chartData = daily.time?.map((time: string, i: number) => ({
    date: time,
    pm25: daily.pm2_5?.[i] || 0,
    no2: daily.nitrogen_dioxide?.[i] || 0,
    o3: daily.ozone?.[i] || 0,
  })) || [];

  return (
    <Card className="glass h-full transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          7-Day Forecast
          {!data && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Expected levels of key pollutants for the next week.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <BarChart data={chartData} margin={{ left: -20, right: 20 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="date" tickFormatter={(val) => new Date(val).toLocaleDateString('en-US', { weekday: 'short' })} tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="o3" fill="var(--color-o3)" radius={4} name="Ozone" />
              <Bar dataKey="no2" fill="var(--color-no2)" radius={4} name="NO2" />
              <Bar dataKey="pm25" fill="var(--color-pm25)" radius={4} name="PM2.5" />
            </BarChart>
          </ChartContainer>
        ) : (
          <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
            No forecast data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

