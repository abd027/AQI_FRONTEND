'use client';

import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import type { EnhancedAqiResponse } from '@/lib/api-client';

const chartConfig = {
  aqi: {
    label: 'PM2.5',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface AqiTrendChartProps {
  data?: EnhancedAqiResponse | null;
}

export default function AqiTrendChart({ data }: AqiTrendChartProps) {
  const hourly = data?.hourly || {};

  // Transform Hourly Data (Next 24h)
  const chartData = hourly.time?.slice(0, 24).map((time: string, i: number) => ({
    time: new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    aqi: hourly.pm2_5?.[i] || 0, // Using PM2.5 as proxy for AQI trend if AQI not pre-calc
  })) || [];

  return (
    <Card className="glass h-full transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          PM2.5 Trend (24h)
          {!data && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Predicted PM2.5 fluctuation for the next 24 hours.
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
                domain={['dataMin - 10', 'dataMax + 10']}
              />
              <ChartTooltip
                cursor={{
                  stroke: 'hsl(var(--border))',
                  strokeWidth: 2,
                  strokeDasharray: '3 3',
                }}
                content={<ChartTooltipContent />}
              />
              <Line
                type="monotone"
                dataKey="aqi"
                stroke="var(--color-aqi)"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ChartContainer>
        ) : (
          <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
            No trend data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

