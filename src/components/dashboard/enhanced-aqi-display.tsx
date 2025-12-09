'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAqiStyleFromHex } from '@/lib/data';
import type { EnhancedAqiResponse } from '@/lib/api-client';
import AqiCharts from './aqi-charts';

interface EnhancedAqiDisplayProps {
  data: EnhancedAqiResponse;
}

export default function EnhancedAqiDisplay({ data }: EnhancedAqiDisplayProps) {
  const locationName = data.location.city
    ? `${data.location.city}${data.location.country ? `, ${data.location.country}` : ''}`
    : 'Unknown Location';

  return (
    <Card className="glass overflow-hidden transition-all duration-300 hover:shadow-2xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">{locationName}</CardTitle>
        <p className="text-sm text-muted-foreground">
          {data.location?.latitude !== undefined && data.location?.longitude !== undefined
            ? `${data.location.latitude.toFixed(4)}, ${data.location.longitude.toFixed(4)}`
            : 'Coordinates unavailable'}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AQI Index Section - Exact format as specified */}
        <div>
          <h3 className="text-lg font-semibold mb-4 border-b pb-2">AQI Index</h3>
          <div className="space-y-3">
            {/* Local EPA AQI (PM2.5) */}
            {data.aqi.local_epa_aqi && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <span className="text-sm font-medium">Local EPA AQI (PM2.5):</span>
                <span
                  className="text-2xl font-bold"
                  style={data.aqi.local_epa_aqi.color ? getAqiStyleFromHex(data.aqi.local_epa_aqi.color) : {}}
                >
                  {data.aqi.local_epa_aqi.value}
                </span>
              </div>
            )}

            {/* Global / Universal AQI (UAQI) */}
            {data.aqi.uaqi && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <span className="text-sm font-medium">Global / Universal AQI (UAQI):</span>
                <span
                  className="text-2xl font-bold text-blue-500"
                  style={data.aqi.uaqi.color ? getAqiStyleFromHex(data.aqi.uaqi.color) : { color: '#3b82f6' }}
                >
                  {data.aqi.uaqi.value}
                </span>
              </div>
            )}

            {/* National AQI (NAQI - Country) */}
            {data.aqi.national_aqi && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                <span className="text-sm font-medium">National AQI (NAQI - Country):</span>
                <span
                  className="text-2xl font-bold text-indigo-500"
                  style={data.aqi.national_aqi.color ? getAqiStyleFromHex(data.aqi.national_aqi.color) : { color: '#6366f1' }}
                >
                  {data.aqi.national_aqi.value}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Pollutants Section */}
        {Object.keys(data.pollutants).length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4 border-b pb-2">Pollutant Concentrations</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(data.pollutants).map(([key, pollutant]) => {
                if (!pollutant || pollutant.value === undefined || pollutant.value === null) return null;

                const pollutantNames: Record<string, string> = {
                  pm25: 'PM2.5',
                  pm10: 'PM10',
                  o3: 'O₃',
                  no2: 'NO₂',
                  co: 'CO',
                  so2: 'SO₂'
                };

                return (
                  <div
                    key={key}
                    className="p-3 rounded-lg bg-muted/20 border"
                    style={pollutant.color ? { borderColor: pollutant.color } : {}}
                  >
                    <p className="text-sm font-semibold mb-1">{pollutantNames[key] || key.toUpperCase()}</p>
                    <p className="text-xl font-bold" style={pollutant.color ? getAqiStyleFromHex(pollutant.color) : {}}>
                      {pollutant.value} {pollutant.unit}
                    </p>
                    {pollutant.epa_aqi && (
                      <p className="text-xs text-muted-foreground mt-1">
                        EPA AQI: {pollutant.epa_aqi}
                      </p>
                    )}
                    {pollutant.category && (
                      <p className="text-xs text-muted-foreground">{pollutant.category}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Dominant Pollutant */}
        {data.dominant_pollutant && (
          <div className="p-3 rounded-lg bg-muted/30">
            <p className="text-sm text-muted-foreground">Dominant Pollutant</p>
            <p className="text-lg font-semibold capitalize">{data.dominant_pollutant}</p>
          </div>
        )}

        {/* Health Recommendations */}
        {data.health_recommendations && data.health_recommendations.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Health Recommendations</h3>
            <ul className="space-y-2">
              {data.health_recommendations.map((rec, index) => (
                <li key={index} className="text-sm text-muted-foreground pl-4 border-l-2 border-primary">
                  {rec}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Analytics Charts */}
        <div className="mt-6 pt-6 border-t">
          <h3 className="text-lg font-semibold mb-6">Analytics & Visualizations</h3>
          <AqiCharts data={data} />
        </div>

        {/* Last Updated */}
        <p className="text-xs text-muted-foreground text-right">
          Last updated: {data.lastUpdated}
        </p>
      </CardContent>
    </Card>
  );
}

