'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { fetchCityRankings, type CityRanking } from '@/lib/api-client';
import { cityRankingsData } from '@/lib/city-ranking-data';

const POLL_INTERVAL = 60000; // Poll every 60 seconds

export function useCityRankings() {
  const { user } = useAuth();
  const [rankings, setRankings] = useState<CityRanking[]>(cityRankingsData);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch rankings via REST API
  const fetchRankings = useCallback(async () => {
    // Don't fetch if user is not authenticated
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setIsRefreshing(true);
      const data = await fetchCityRankings();
      if (data && data.length > 0) {
        setRankings(data);
        setLastUpdated(new Date());
        setError(null);
        setIsConnected(true);
        setConnectionAttempts(0);
        console.log(`✓ Fetched ${data.length} city rankings`);
      }
    } catch (err) {
      console.error('Error fetching city rankings:', err);
      setError('Failed to fetch rankings. Using cached data.');
      setIsConnected(false);
      setConnectionAttempts((prev) => prev + 1);
    } finally {
      setIsRefreshing(false);
      setLoading(false);
    }
  }, [user]);

  // Initialize polling on mount - only when authenticated
  useEffect(() => {
    // Don't attempt any connections if user is not authenticated
    if (!user) {
      setLoading(false);
      console.log('⏸ Rankings: Waiting for authentication...');
      return;
    }

    // Initial fetch
    fetchRankings();

    // Set up polling interval
    console.log(`→ Starting rankings poll (every ${POLL_INTERVAL / 1000}s)`);
    pollIntervalRef.current = setInterval(() => {
      fetchRankings();
    }, POLL_INTERVAL);

    return () => {
      // Cleanup on unmount
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = null;
      }
    };
  }, [user, fetchRankings]);

  // Manual refetch function
  const refetch = useCallback(() => {
    fetchRankings();
  }, [fetchRankings]);

  return {
    rankings,
    loading,
    isRefreshing,
    error,
    lastUpdated,
    isConnected,
    connectionAttempts,
    refetch,
  };
}
