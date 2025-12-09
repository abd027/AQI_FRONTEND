'use client';

import { memo } from 'react';
import { getAqiColor } from '@/lib/data';
import { cn } from '@/lib/utils';

interface AqiMarkerProps {
  aqi: number;
  city: string;
  area?: string;
  lat: number;
  lng: number;
  onClick?: () => void;
  onHover?: () => void;
  onLeave?: () => void;
}

function AqiMarker({ aqi, city, area, onClick, onHover, onLeave }: AqiMarkerProps) {
  const aqiColorClass = getAqiColor(aqi);
  const bgColor = aqiColorClass.replace('text-', 'bg-');
  
  // Determine marker size based on AQI (higher AQI = larger marker)
  const size = aqi > 200 ? 'w-12 h-12' : aqi > 100 ? 'w-10 h-10' : 'w-8 h-8';
  const textSize = aqi > 200 ? 'text-sm' : aqi > 100 ? 'text-xs' : 'text-[10px]';

  return (
    <div
      className={cn(
        'relative flex items-center justify-center rounded-full border-2 border-white shadow-lg cursor-pointer transition-all duration-200 hover:scale-110 hover:z-50 pointer-events-auto',
        bgColor,
        size
      )}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      onMouseEnter={(e) => {
        e.stopPropagation();
        onHover?.();
      }}
      onMouseLeave={(e) => {
        e.stopPropagation();
        onLeave?.();
      }}
      title={`${city}${area ? ` - ${area}` : ''}: AQI ${aqi}`}
    >
      <span className={cn('font-bold text-white drop-shadow-md', textSize)}>
        {aqi}
      </span>
      {/* Pulse animation for high AQI */}
      {aqi > 150 && (
        <span className="absolute inset-0 rounded-full animate-ping opacity-75 bg-inherit pointer-events-none"></span>
      )}
    </div>
  );
}

export default memo(AqiMarker);

