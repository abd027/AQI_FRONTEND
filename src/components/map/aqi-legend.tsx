'use client';

import { Card, CardContent } from '@/components/ui/card';

interface AqiCategory {
  label: string;
  range: string;
  color: string;
  bgColor: string;
}

const aqiCategories: AqiCategory[] = [
  {
    label: 'Good',
    range: '0-50',
    color: 'text-primary',
    bgColor: 'bg-primary',
  },
  {
    label: 'Moderate',
    range: '51-100',
    color: 'text-yellow-500',
    bgColor: 'bg-yellow-500',
  },
  {
    label: 'Unhealthy for Sensitive Groups',
    range: '101-150',
    color: 'text-orange-500',
    bgColor: 'bg-orange-500',
  },
  {
    label: 'Unhealthy',
    range: '151-200',
    color: 'text-red-500',
    bgColor: 'bg-red-500',
  },
  {
    label: 'Very Unhealthy',
    range: '201-300',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500',
  },
  {
    label: 'Hazardous',
    range: '301+',
    color: 'text-red-700',
    bgColor: 'bg-red-800',
  },
];

export default function AqiLegend() {
  return (
    <Card className="glass border-border/50 shadow-lg">
      <CardContent className="p-4">
        <h3 className="text-sm font-semibold mb-3">Air Quality Index</h3>
        <div className="space-y-2">
          {aqiCategories.map((category) => (
            <div key={category.label} className="flex items-center gap-2 text-xs">
              <div
                className={`w-4 h-4 rounded-full border-2 border-white shadow-sm ${category.bgColor}`}
                aria-label={`AQI ${category.range}: ${category.label}`}
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium truncate">{category.label}</div>
                <div className="text-muted-foreground text-[10px]">{category.range}</div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}




