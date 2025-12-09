'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { fetchAQIByCoordinates, fetchAQITrend, type AqiData, type AqiTimePoint } from '@/lib/api-client';
import { mainAqiData, aqiTrendData } from '@/lib/data';

const DEFAULT_CITY = 'New York';
// Default coordinates for New York (same as map uses)
const DEFAULT_COORDINATES = { lat: 40.7128, lng: -74.0060 };
const REFRESH_INTERVAL = 5 * 60 * 1000; // 5 minutes

// City coordinates map for common cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  'New York': { lat: 40.7128, lng: -74.0060 },
  'London': { lat: 51.5074, lng: -0.1278 },
  'Tokyo': { lat: 35.6762, lng: 139.6503 },
  'Paris': { lat: 48.8566, lng: 2.3522 },
  'Delhi': { lat: 28.6139, lng: 77.2090 },
  'Beijing': { lat: 39.9042, lng: 116.4074 },
  'Los Angeles': { lat: 34.0522, lng: -118.2437 },
  'Mumbai': { lat: 19.0760, lng: 72.8777 },
  'São Paulo': { lat: -23.5505, lng: -46.6333 },
  'Cairo': { lat: 30.0444, lng: 31.2357 },
  'Sydney': { lat: -33.8688, lng: 151.2093 },
  'Mexico City': { lat: 19.4326, lng: -99.1332 },
  'Karachi': { lat: 24.8607, lng: 67.0011 },
  'Lahore': { lat: 31.5204, lng: 74.3587 },
};

interface UseMainAqiDataOptions {
  city?: string;
  coordinates?: { lat: number; lng: number };
}

export function useMainAqiData(options?: UseMainAqiDataOptions) {
  const city = options?.city || DEFAULT_CITY;
  const coordinates = options?.coordinates;
  const { user } = useAuth(); // Get authentication status

  const [aqiData, setAqiData] = useState<AqiData>(mainAqiData);
  const [trendData, setTrendData] = useState<AqiTimePoint[]>(aqiTrendData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [retryCount, setRetryCount] = useState(0);

  // Get coordinates for the city
  const getCityCoordinates = (cityName: string): { lat: number; lng: number } => {
    // If coordinates are provided, use them directly (highest priority)
    if (coordinates) {
      return coordinates;
    }
    // Otherwise, use the city name lookup
    return CITY_COORDINATES[cityName] || DEFAULT_COORDINATES;
  };

  useEffect(() => {
    let isMounted = true;
    let refreshTimer: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      // Don't fetch if user is not authenticated
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        setRetryCount((prev) => prev + 1);

        // Get coordinates for the city (same approach as map)
        const coordinates = getCityCoordinates(city);

        // Fetch AQI data by coordinates (same as map) and trend in parallel
        const [aqiResponse, trendResponse] = await Promise.allSettled([
          fetchAQIByCoordinates(coordinates.lat, coordinates.lng),
          fetchAQITrend(city),
        ]);

        if (!isMounted) return;

        // Handle AQI data
        if (aqiResponse.status === 'fulfilled' && aqiResponse.value) {
          // Ensure city name is set if not provided by API
          const apiData = aqiResponse.value;
          if (!apiData.city && city) {
            apiData.city = city;
          }
          setAqiData(apiData);
          setError(null); // Clear error on successful fetch
          setRetryCount(0); // Reset retry count on success
          setIsInitialLoad(false);
        } else {
          // API failed - check if we have valid fallback data
          const hasValidData = aqiData && aqiData.city && aqiData.aqi > 0;

          if (hasValidData) {
            // We have valid fallback data - don't show error, just keep existing data
            console.warn('Failed to fetch latest AQI data, using cached/fallback data');
            setError(null);
          } else {
            // No valid data - create a basic data structure with city name
            if (isInitialLoad) {
              console.error('Failed to fetch AQI data and no fallback available');
              // Set basic data with city name to avoid "Unknown Location"
              setAqiData({
                ...mainAqiData,
                city: city || 'Unknown Location',
              });
              setError('Failed to fetch latest AQI data. Please try again later.');
            } else {
              // On refresh failure, keep existing data without error
              setError(null);
            }
          }
          setIsInitialLoad(false);
        }

        // Handle trend data
        if (trendResponse.status === 'fulfilled' && trendResponse.value) {
          setTrendData(trendResponse.value);
        } else {
          console.warn('Failed to fetch trend data, using fallback');
        }
      } catch (err) {
        if (isMounted) {
          console.error('Error fetching AQI data:', err);
          // Check if we have valid fallback data
          const hasValidData = aqiData && aqiData.city && aqiData.aqi > 0;

          if (hasValidData) {
            // Keep existing data and don't show error
            setError(null);
          } else if (isInitialLoad) {
            // Only show error on initial load if no data
            setError('Error loading air quality data');
          } else {
            // On refresh failure, keep existing data
            setError(null);
          }
          setIsInitialLoad(false);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    // Initial fetch
    fetchData();

    // Set up auto-refresh
    refreshTimer = setInterval(() => {
      if (isMounted) {
        fetchData();
      }
    }, REFRESH_INTERVAL);

    // Cleanup
    return () => {
      isMounted = false;
      if (refreshTimer) {
        clearInterval(refreshTimer);
      }
    };
  }, [city, coordinates]);

  return {
    aqiData,
    trendData,
    loading,
    error,
    retryCount,
    refetch: async () => {
      setLoading(true);
      setRetryCount((prev) => prev + 1);
      const coordinates = getCityCoordinates(city);
      const [aqiResponse, trendResponse] = await Promise.allSettled([
        fetchAQIByCoordinates(coordinates.lat, coordinates.lng),
        fetchAQITrend(city),
      ]);

      if (aqiResponse.status === 'fulfilled' && aqiResponse.value) {
        setAqiData(aqiResponse.value);
        setError(null);
        setRetryCount(0); // Reset on success
      }
      if (trendResponse.status === 'fulfilled' && trendResponse.value) {
        setTrendData(trendResponse.value);
      }
      setLoading(false);
    },
  };
}

