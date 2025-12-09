'use client';

import dynamic from 'next/dynamic';
import MainLayout from '@/components/layout/main-layout';
import { Loader2 } from 'lucide-react';

// Dynamically import AqiMap with SSR disabled (Leaflet requires window)
const AqiMap = dynamic(() => import('@/components/map/aqi-map'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-muted/20 rounded-lg min-h-[600px]">
      <div className="flex flex-col items-center gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="text-muted-foreground">Loading map...</span>
      </div>
    </div>
  ),
});

export default function MapPage() {
  return (
    <MainLayout>
      <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8 h-[calc(100vh-8rem)]">
        <header className="animate-slide-up flex-shrink-0">
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">World Air Quality Map</h1>
          <p className="text-muted-foreground mt-2 text-sm md:text-base">
            Explore air quality data across the globe. Hover over markers to see AQI values, click to view detailed information.
          </p>
        </header>
        <div className="flex-1 min-h-[600px] animate-slide-up overflow-hidden" style={{ animationDelay: '0.1s', height: '100%' }}>
          <AqiMap className="w-full h-full" />
        </div>
      </div>
    </MainLayout>
  );
}

