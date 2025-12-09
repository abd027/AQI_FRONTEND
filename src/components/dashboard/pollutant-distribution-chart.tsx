'use client';

import { Pie, PieChart } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from '@/components/ui/chart';
import { Loader2 } from 'lucide-react';
import type { ChartConfig } from '@/components/ui/chart';
import type { PollutantDistribution } from '@/lib/types';
import type { EnhancedAqiResponse } from '@/lib/api-client';

const chartConfig = {
  value: {
    label: 'Value',
  },
  'PM2.5': {
    label: 'PM2.5',
    color: 'hsl(var(--chart-1))',
  },
  PM10: {
    label: 'PM10',
    color: 'hsl(var(--chart-2))',
  },
  'O₃': {
    label: 'O₃',
    color: 'hsl(var(--chart-3))',
  },
  'NO₂': {
    label: 'NO₂',
    color: 'hsl(var(--chart-4))',
  },
  'SO₂': {
    label: 'SO₂',
    color: 'hsl(var(--chart-5))',
  },
  CO: {
    label: 'CO',
    color: 'hsl(var(--primary))',
  },
} satisfies ChartConfig;

interface PollutantDistributionChartProps {
  data?: EnhancedAqiResponse | null;
}

export default function PollutantDistributionChart({ data }: PollutantDistributionChartProps) {

  // Convert pollutants from AQI data to distribution format
  const getDistributionData = (): PollutantDistribution[] => {
    if (!data?.pollutants || Object.keys(data.pollutants).length === 0) {
      return [];
    }

    // Valid pollutant names for the type
    const validNames: PollutantDistribution['name'][] = ['PM2.5', 'PM10', 'NO₂', 'O₃', 'CO', 'SO₂'];

    // Convert object to array
    const pollutantsArray = Object.values(data.pollutants) as any[];

    // Calculate total for normalization
    const total = pollutantsArray.reduce((sum, p) => sum + (p.value || 0), 0);

    if (total === 0) {
      return [];
    }

    // Convert to percentage distribution, filtering for valid names
    return pollutantsArray
      .filter(p => validNames.includes(p.name as PollutantDistribution['name']))
      .map(p => ({
        name: p.name as PollutantDistribution['name'],
        value: Math.round((p.value / total) * 100),
      }))
      .filter(p => p.value > 0) // Only show pollutants with values
      .slice(0, 6); // Limit to 6 pollutants for readability
  };

  const chartData = getDistributionData();

  return (
    <Card className="glass flex flex-col h-full transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          Pollutant Distribution
          {!data && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
        </CardTitle>
        <CardDescription>
          Contribution of each pollutant to air quality.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1 pb-0">
        {chartData.length > 0 ? (
          <ChartContainer
            config={chartConfig}
            className="mx-auto aspect-square max-h-64"
          >
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent nameKey="name" />} />
              <Pie data={chartData} dataKey="value" nameKey="name" innerRadius={50} outerRadius={80} paddingAngle={2} />
              <ChartLegend
                content={<ChartLegendContent nameKey="name" />}
                className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center"
              />
            </PieChart>
          </ChartContainer>
        ) : (
          <div className="h-64 w-full flex items-center justify-center text-muted-foreground">
            No pollutant data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}

