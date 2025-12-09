'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import type { EnhancedAqiResponse } from '@/lib/api-client';

const chartConfig = {
  pm25: {
    label: 'PM2.5 Forecast',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface FuturePredictionChartProps {
  data?: EnhancedAqiResponse | null;
}

export default function FuturePredictionChart({ data }: FuturePredictionChartProps) {
  const hourly = data?.hourly || {};

  // Transform Hourly Data (Next 24h)
  const chartData = hourly.time?.slice(0, 24).map((time: string, i: number) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    pm25: hourly.pm2_5?.[i] || 0,
  })) || [];

  return (
    <Card className="glass h-full transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          24h PM2.5 Forecast
          {!data && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Predicted PM2.5 levels for the next 24 hours.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length > 0 ? (
          <ChartContainer config={chartConfig} className="h-64 w-full">
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis
                dataKey="time"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
                minTickGap={30}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                fontSize={12}
              />
              <ChartTooltip
                content={<ChartTooltipContent />}
              />
              <ChartLegend content={<ChartLegendContent />} />
              <Line
                type="monotone"
                dataKey="pm25"
                stroke="var(--color-pm25)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
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

