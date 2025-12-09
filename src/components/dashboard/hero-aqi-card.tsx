'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getAqiColor, getAqiRingColor, getAqiStyleFromHex } from '@/lib/data';
import { useMainAqiData } from '@/hooks/use-main-aqi-data';
import { Thermometer, Droplets, Wind, Leaf, Mountain, Cloud, AlertCircle, Loader2, MapPin, RotateCcw } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

const pollutantIcons: { [key: string]: LucideIcon } = {
  'PM2.5': Leaf,
  'PM10': Mountain,
  'NO₂': Cloud,
  'O₃': Wind,
  'CO': AlertCircle,
  'SO₂': AlertCircle,
};

interface HeroAqiCardProps {
  city?: string;
  coordinates?: { lat: number; lng: number };
  onResetToUserCity?: () => void;
  isViewingUserCity?: boolean;
}

export default function HeroAqiCard({ city, coordinates, onResetToUserCity, isViewingUserCity = true }: HeroAqiCardProps) {
  const { aqiData, loading, error } = useMainAqiData({ city, coordinates });
  
  // Get city from aqiData to avoid naming conflict with prop
  const aqiCity = aqiData.city;
  
  const { 
    aqi, 
    category, 
    healthAdvice, 
    pollutants, 
    weather, 
    lastUpdated,
    usEpaAqi,
    globalAqi,
    localAqi,
    pm25Concentration,
    dominantPollutant,
    aqiCategory,
    aqiColor
  } = aqiData;

  const aqiColorClass = getAqiColor(aqi);
  const usEpaAqiValue = usEpaAqi ?? aqi;
  const usEpaAqiStyle = aqiColor ? getAqiStyleFromHex(aqiColor) : {};

  if (loading && !aqiCity) {
    return (
      <Card className="glass overflow-hidden transition-all duration-300 hover:shadow-2xl">
        <CardContent className="p-6 md:p-8 flex items-center justify-center min-h-[300px]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading air quality data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="glass overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <CardContent className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center">
        <div className="flex flex-col items-center justify-center md:border-r md:border-border/50 md:pr-8">
          <div className="relative w-40 h-40 md:w-48 md:h-48">
            <svg className="w-full h-full" viewBox="0 0 36 36">
              <path
                className="stroke-muted/30"
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="2"
              />
              <path
                className={getAqiRingColor(usEpaAqiValue)}
                strokeDasharray={`${(usEpaAqiValue / 500) * 100}, 100`}
                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-6xl font-bold ${aqiColorClass}`} style={usEpaAqiStyle}>
                {usEpaAqiValue}
              </span>
              <span className="text-sm font-medium text-muted-foreground">US EPA AQI</span>
            </div>
          </div>
          <div className="text-center mt-4">
            <div className="flex items-center justify-center gap-2 mb-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold">{aqiCity || city || 'Unknown City'}</h3>
              {!isViewingUserCity && onResetToUserCity && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onResetToUserCity}
                  className="h-6 px-2 text-xs"
                  title="Reset to my city"
                >
                  <RotateCcw className="h-3 w-3 mr-1" />
                  My City
                </Button>
              )}
            </div>
            <h2 className={`text-2xl font-semibold ${aqiColorClass}`} style={usEpaAqiStyle}>
              {aqiCategory || category}
            </h2>
            {dominantPollutant && (
              <p className="text-xs text-muted-foreground mt-1">
                Dominant: {dominantPollutant}
              </p>
            )}
          </div>
        </div>

        <div className="md:col-span-2 flex flex-col gap-6">
          <div>
            <p className="text-lg">{healthAdvice}</p>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-xs text-muted-foreground">Last updated: {lastUpdated}</p>
              {loading && <Loader2 className="size-3 animate-spin text-muted-foreground" />}
              {error && !loading && (
                <p className="text-xs text-orange-500">⚠ {error}</p>
              )}
            </div>
          </div>

          {/* Display all three AQI values */}
          <div className={`grid gap-4 p-4 rounded-lg bg-muted/30 ${globalAqi != null || localAqi != null ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">US EPA AQI</p>
              <p className="text-2xl font-bold" style={usEpaAqiStyle}>
                {usEpaAqiValue}
              </p>
              {pm25Concentration != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  PM2.5: {pm25Concentration.toFixed(1)} µg/m³
                </p>
              )}
            </div>
            {globalAqi != null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Global AQI</p>
                <p className="text-2xl font-bold text-blue-500">{globalAqi}</p>
              </div>
            )}
            {localAqi != null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Local AQI</p>
                <p className="text-2xl font-bold text-indigo-500">{localAqi}</p>
              </div>
            )}
          </div>
          
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 text-sm">
            {pollutants.map((p) => {
              const Icon = pollutantIcons[p.name] || Leaf;
              return (
                <div key={p.name} className="flex items-center gap-2">
                  <Icon className="size-5 text-muted-foreground" />
                  <div>
                    <p className="font-semibold">{p.value} <span className="text-xs text-muted-foreground">{p.unit}</span></p>
                    <p className="text-xs text-muted-foreground">{p.name}</p>
                  </div>
                </div>
              );
            })}
             <div className="flex items-center gap-2">
              <Thermometer className="size-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{weather.temperature}°C</p>
                <p className="text-xs text-muted-foreground">Temp</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Droplets className="size-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{weather.humidity}%</p>
                <p className="text-xs text-muted-foreground">Humidity</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Wind className="size-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{weather.wind} km/h</p>
                <p className="text-xs text-muted-foreground">Wind</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
