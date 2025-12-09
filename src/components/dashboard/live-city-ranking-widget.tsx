'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAqiColor } from '@/lib/data';
import { useCityRankings } from '@/hooks/use-city-rankings';
import { Button } from '@/components/ui/button';
import { ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { cityRankingsData } from '@/lib/city-ranking-data';

export default function LiveCityRankingWidget() {
  const { rankings, loading, isRefreshing, isConnected } = useCityRankings();
  const topCities = rankings.length > 0 ? rankings.slice(0, 5) : cityRankingsData.slice(0, 5);

  return (
    <Card className="glass h-full transition-all duration-300 hover:shadow-2xl">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle className="text-xl flex items-center gap-2">
          Live Most Polluted Cities
          {loading && <Loader2 className="size-4 animate-spin text-muted-foreground" />}
          {!loading && isConnected && (
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
          )}
          {!loading && !isConnected && !isRefreshing && (
            <span className="flex h-2 w-2 rounded-full bg-yellow-500" title="Reconnecting..."></span>
          )}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild className="group transition-all hover:gap-2">
          <Link href="/city-rankings" className="flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <ul className="space-y-3">
          {topCities.map((city, index) => {
            // Use PM2.5 AQI as primary, fallback to PM10 AQI, then to aqi field
            const primaryAqi = city.aqi_pm25 ?? city.aqi_pm10 ?? city.aqi;

            return (
              <li
                key={`${city.city}-${city.country}`}
                className="flex items-center justify-between gap-4 p-2 rounded-lg transition-all hover:bg-accent/50 cursor-pointer group"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`flex h-2.5 w-2.5 shrink-0 rounded-full transition-all ${getAqiColor(
                      primaryAqi
                    ).replace('text-', 'bg-')} group-hover:scale-125`}
                  ></span>
                  <div>
                    <p className="font-medium group-hover:text-foreground transition-colors">{city.city}</p>
                    <p className="text-sm text-muted-foreground">{city.country}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-lg transition-all group-hover:scale-110 ${getAqiColor(primaryAqi)}`}>
                    {primaryAqi}
                  </p>
                  {city.aqi_pm10 !== undefined && city.aqi_pm10 !== null && (
                    <p className={`text-xs text-muted-foreground ${getAqiColor(city.aqi_pm10)}`}>
                      PM10: {city.aqi_pm10}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
