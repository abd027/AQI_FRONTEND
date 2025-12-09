'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getAqiColor } from '@/lib/data';
import type { CityRanking } from '@/lib/types';

interface RankingsTableProps {
  rankings: CityRanking[];
  loading?: boolean;
}

export default function RankingsTable({ rankings, loading = false }: RankingsTableProps) {
  const getCategoryVariant = (
    category: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous'
  ) => {
    switch (category) {
      case 'Good':
        return 'default';
      case 'Moderate':
        return 'secondary';
      case 'Unhealthy':
        return 'destructive';
      case 'Hazardous':
        return 'destructive';
      default:
        return 'default';
    }
  };

  return (
    <Card className="glass overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[50px]">Rank</TableHead>
              <TableHead>City</TableHead>
              <TableHead className="text-center">PM2.5 AQI</TableHead>
              <TableHead className="text-center">PM10 AQI</TableHead>
              <TableHead className="text-center">Category</TableHead>
              <TableHead className="text-center">Dominant Pollutant</TableHead>
              <TableHead className="text-right">Last Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rankings.length === 0 && !loading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                  No cities found. Try adjusting your search or filter.
                </TableCell>
              </TableRow>
            ) : (
              rankings.map((city) => {
                // Use PM2.5 AQI as primary, fallback to PM10 AQI, then to aqi field
                const primaryAqi = city.aqi_pm25 ?? city.aqi_pm10 ?? city.aqi;

                // Calculate fallback values if one AQI is missing
                // PM2.5 typically ~60% of PM10, PM10 typically ~167% of PM2.5
                const pm25Aqi = city.aqi_pm25 ?? (city.aqi_pm10 ? Math.round(city.aqi_pm10 * 0.6) : primaryAqi);
                const pm10Aqi = city.aqi_pm10 ?? (city.aqi_pm25 ? Math.round(city.aqi_pm25 * 1.67) : primaryAqi);

                return (
                  <TableRow
                    key={`${city.city}-${city.country}`}
                    className="transition-all hover:bg-accent/50 cursor-pointer"
                  >
                    <TableCell className="font-medium">{city.rank}</TableCell>
                    <TableCell>
                      <div className="font-medium">{city.city}</div>
                      <div className="text-sm text-muted-foreground">
                        {city.country}
                      </div>
                    </TableCell>
                    <TableCell
                      className={`text-center font-bold text-lg ${getAqiColor(pm25Aqi)}`}
                    >
                      {pm25Aqi}
                    </TableCell>
                    <TableCell
                      className={`text-center font-bold text-lg ${getAqiColor(pm10Aqi)}`}
                    >
                      {pm10Aqi}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={getCategoryVariant(city.category)}>
                        {city.category}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">{city.dominantPollutant}</TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {city.lastUpdated}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
