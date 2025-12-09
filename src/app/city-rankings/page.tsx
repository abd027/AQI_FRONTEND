'use client';

import { useState, useEffect, useMemo } from 'react';
import MainLayout from '@/components/layout/main-layout';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import RankingsTable from '@/components/city-rankings/rankings-table';
import { useCityRankings } from '@/hooks/use-city-rankings';
import { Button } from '@/components/ui/button';
import type { CityRanking } from '@/lib/types';

export default function CityRankingsPage() {
  const { rankings: allRankings, loading, isRefreshing, error, lastUpdated, refetch, isConnected } = useCityRankings();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All');

  // Filter rankings based on search and region
  const filteredRankings = useMemo(() => {
    let filtered = allRankings;

    if (searchTerm) {
      filtered = filtered.filter((city) =>
        city.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        city.country.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedRegion !== 'All') {
      filtered = filtered.filter((city) => city.region === selectedRegion);
    }

    return filtered;
  }, [allRankings, searchTerm, selectedRegion]);

  const regions = useMemo(() => {
    const uniqueRegions = Array.from(new Set(allRankings.map((c) => c.region)));
    return ['All', ...uniqueRegions];
  }, [allRankings]);

  return (
    <MainLayout>
      <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <header className="mb-6 md:mb-8 animate-slide-up">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
                Live City Pollution Rankings
                {loading && <Loader2 className="size-5 animate-spin text-primary" />}
                {!loading && isConnected && (
                  <span className="flex h-3 w-3 relative ml-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                  </span>
                )}
                {!loading && !isConnected && !isRefreshing && (
                  <span className="flex h-3 w-3 rounded-full bg-yellow-500 ml-2" title="Reconnecting..."></span>
                )}
                {!loading && isRefreshing && (
                  <RefreshCw className="size-4 animate-spin text-muted-foreground" title="Updating in background..." />
                )}
              </h1>
              <p className="text-muted-foreground mt-2">
                Real-time air quality index rankings from around the world.
                {isRefreshing && !loading && (
                  <span className="ml-2 text-xs text-primary">Updating...</span>
                )}
              </p>
              {lastUpdated && (
                <p className="text-xs text-muted-foreground mt-1">
                  Last updated: {lastUpdated.toLocaleTimeString()}
                </p>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => refetch()}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`size-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {error && (
            <div className="mt-4 flex items-center gap-2 text-sm text-orange-500 bg-orange-50 dark:bg-orange-950/20 p-3 rounded-lg">
              <AlertCircle className="size-4" />
              {error}
            </div>
          )}
        </header>
        <div className="flex flex-col md:flex-row gap-4 mb-6 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by city..."
              className="pl-10"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Select value={selectedRegion} onValueChange={setSelectedRegion}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="Filter by region" />
            </SelectTrigger>
            <SelectContent>
              {regions.map((region) => (
                <SelectItem key={region} value={region}>
                  {region}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
          {loading && allRankings.length === 0 ? (
            <div className="flex items-center justify-center min-h-[400px]">
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="size-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading city rankings...</p>
              </div>
            </div>
          ) : (
            <RankingsTable rankings={filteredRankings} loading={loading} />
          )}
        </div>
      </div>
    </MainLayout>
  );
}
