'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAqiColor, getAqiStyleFromHex } from '@/lib/data';
import type { AqiData } from '@/lib/api-client';
import { Thermometer, Droplets, Wind } from 'lucide-react';

interface AqiInfoPopupProps {
  data: AqiData;
  position: { lat: number; lng: number };
  onClose: () => void;
}

export default function AqiInfoPopup({ data, onClose }: AqiInfoPopupProps) {
  const aqiColorClass = getAqiColor(data.aqi);
  const usEpaAqiValue = data.usEpaAqi ?? data.aqi;
  const usEpaAqiStyle = data.aqiColor ? getAqiStyleFromHex(data.aqiColor) : {};

  return (
    <Card className="glass w-full max-w-sm shadow-2xl">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-xl mb-1">{data.city}</CardTitle>
            <div className="flex items-center gap-2">
              <span className={`text-3xl font-bold ${aqiColorClass}`} style={usEpaAqiStyle}>
                {usEpaAqiValue}
              </span>
              <Badge variant="outline" className="text-sm">
                {data.aqiCategory || data.category}
              </Badge>
            </div>
            {data.dominantPollutant && (
              <p className="text-xs text-muted-foreground mt-1">
                Dominant: {data.dominantPollutant}
              </p>
            )}
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={onClose}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-muted-foreground mb-2">{data.healthAdvice}</p>
          <p className="text-xs text-muted-foreground">Last updated: {data.lastUpdated}</p>
        </div>

        {/* Display all three AQI values */}
        <div>
          <h4 className="text-sm font-semibold mb-2">AQI Values</h4>
          <div className={`grid gap-2 p-3 rounded-lg bg-muted/50 ${data.globalAqi != null || data.localAqi != null ? 'grid-cols-3' : 'grid-cols-1'}`}>
            <div className="text-center">
              <p className="text-xs text-muted-foreground mb-1">US EPA AQI</p>
              <p className="text-xl font-bold" style={usEpaAqiStyle}>
                {usEpaAqiValue}
              </p>
              {data.pm25Concentration != null && (
                <p className="text-xs text-muted-foreground mt-1">
                  PM2.5: {data.pm25Concentration.toFixed(1)} µg/m³
                </p>
              )}
            </div>
            {data.globalAqi != null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Global AQI</p>
                <p className="text-xl font-bold text-blue-500">{data.globalAqi}</p>
              </div>
            )}
            {data.localAqi != null && (
              <div className="text-center">
                <p className="text-xs text-muted-foreground mb-1">Local AQI</p>
                <p className="text-xl font-bold text-indigo-500">{data.localAqi}</p>
              </div>
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Pollutants</h4>
          <div className="grid grid-cols-2 gap-2">
            {data.pollutants.map((pollutant) => (
              <div
                key={pollutant.name}
                className="flex items-center justify-between p-2 rounded-lg bg-muted/50"
              >
                <span className="text-xs font-medium">{pollutant.name}</span>
                <span className="text-xs text-muted-foreground">
                  {pollutant.value} {pollutant.unit}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold mb-2">Weather</h4>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.weather.temperature}°C</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Droplets className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.weather.humidity}%</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Wind className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{data.weather.wind} km/h</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

