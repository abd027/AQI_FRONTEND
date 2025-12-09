'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

export interface City {
  name: string;
  lat: number;
  lng: number;
  country?: string;
  countryCode?: string;
  formatted_address?: string;
}

export interface ViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Generate multiple locations (areas) around a city center
 * Uses larger offsets to ensure areas are visible and separated at high zoom levels
 */
export function generateCityAreas(city: City, zoomLevel?: number): Array<{ city: string; area: string; lat: number; lng: number }> {
  const areas = [];

  // Base offset in degrees (approximately 0.1 degree ≈ 11km)
  // This ensures areas are well-separated and visible at high zoom levels
  const baseOffset = 0.1; // ~11km separation
  const mediumOffset = 0.07; // ~7.7km
  const smallOffset = 0.05; // ~5.5km

  // Adjust offsets based on zoom level if provided
  // Higher zoom = can use smaller offsets, lower zoom = need larger offsets
  let offset = baseOffset;
  if (zoomLevel !== undefined) {
    if (zoomLevel > 10) {
      // High zoom: can use smaller offsets
      offset = smallOffset;
    } else if (zoomLevel > 7) {
      // Medium zoom: use medium offsets
      offset = mediumOffset;
    } else {
      // Low zoom: use larger offsets for visibility
      offset = baseOffset;
    }
  }

  const offsets = [
    { name: 'Downtown', latOffset: 0, lngOffset: 0 },
    { name: 'North', latOffset: offset, lngOffset: 0 },
    { name: 'South', latOffset: -offset, lngOffset: 0 },
    { name: 'East', latOffset: 0, lngOffset: offset },
    { name: 'West', latOffset: 0, lngOffset: -offset },
    { name: 'Northeast', latOffset: offset * 0.7, lngOffset: offset * 0.7 },
    { name: 'Northwest', latOffset: offset * 0.7, lngOffset: -offset * 0.7 },
    { name: 'Southeast', latOffset: -offset * 0.7, lngOffset: offset * 0.7 },
    { name: 'Southwest', latOffset: -offset * 0.7, lngOffset: -offset * 0.7 },
  ];

  for (const offset_config of offsets) {
    areas.push({
      city: city.name,
      area: offset_config.name,
      lat: city.lat + offset_config.latOffset,
      lng: city.lng + offset_config.lngOffset,
    });
  }

  return areas;
}

export function useDynamicCities() {
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedViewports, setLoadedViewports] = useState<Set<string>>(new Set());
  const citiesCacheRef = useRef<Map<string, City>>(new Map());
  const viewportTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Generate a viewport key for caching
   */
  const getViewportKey = useCallback((bounds: ViewportBounds): string => {
    // Round bounds to avoid duplicate requests for similar viewports
    const round = (n: number) => Math.round(n * 100) / 100;
    return `${round(bounds.north)}:${round(bounds.south)}:${round(bounds.east)}:${round(bounds.west)}`;
  }, []);

  /**
   * Fetch major cities - uses fallback data since the API endpoint doesn't exist
   */
  const fetchMajorCities = useCallback(async (): Promise<City[]> => {
    setLoading(true);
    setError(null);

    console.log('Loading major cities from fallback data...');

    // Use fallback cities directly (API endpoint not implemented)
    const fallbackCities = getFallbackCities();

    // Cache cities
    fallbackCities.forEach(city => {
      const key = `${city.name}:${city.lat}:${city.lng}`;
      citiesCacheRef.current.set(key, city);
    });

    setCities(prev => {
      const existing = new Map(prev.map(c => [`${c.name}:${c.lat}:${c.lng}`, c]));
      fallbackCities.forEach(city => {
        const key = `${city.name}:${city.lat}:${city.lng}`;
        if (!existing.has(key)) {
          existing.set(key, city);
        }
      });
      return Array.from(existing.values());
    });

    console.log(`✓ Loaded ${fallbackCities.length} cities`);
    setLoading(false);

    return fallbackCities;
  }, []);

  /**
   * Get cities in viewport from cache - API endpoint not implemented
   */
  const fetchCitiesInViewport = useCallback(async (bounds: ViewportBounds) => {
    const viewportKey = getViewportKey(bounds);

    // Check if we've already loaded this viewport
    if (loadedViewports.has(viewportKey)) {
      return [];
    }

    // Get cached cities in this viewport
    const cachedCities: City[] = [];
    citiesCacheRef.current.forEach(city => {
      if (
        bounds.south <= city.lat && city.lat <= bounds.north &&
        bounds.west <= city.lng && city.lng <= bounds.east
      ) {
        cachedCities.push(city);
      }
    });

    // Mark viewport as loaded
    setLoadedViewports(prev => new Set([...prev, viewportKey]));

    // Add to cities list if any found
    if (cachedCities.length > 0) {
      setCities(prev => {
        const existing = new Map(prev.map(c => [`${c.name}:${c.lat}:${c.lng}`, c]));
        cachedCities.forEach(city => {
          const key = `${city.name}:${city.lat}:${city.lng}`;
          if (!existing.has(key)) {
            existing.set(key, city);
          }
        });
        return Array.from(existing.values());
      });
    }

    return cachedCities;
  }, [loadedViewports, getViewportKey]);

  /**
   * Debounced viewport change handler
   */
  const handleViewportChange = useCallback((bounds: ViewportBounds) => {
    // Clear existing timeout
    if (viewportTimeoutRef.current) {
      clearTimeout(viewportTimeoutRef.current);
    }

    // Debounce viewport changes (500ms)
    viewportTimeoutRef.current = setTimeout(() => {
      fetchCitiesInViewport(bounds);
    }, 500);
  }, [fetchCitiesInViewport]);

  /**
   * Get cities by country from cache - API endpoint not implemented
   */
  const fetchCitiesByCountry = useCallback(async (countryCode: string) => {
    // Filter from cached cities (fallback data)
    const countryCities: City[] = [];
    citiesCacheRef.current.forEach(city => {
      if (city.countryCode === countryCode) {
        countryCities.push(city);
      }
    });

    // If cache is empty, load fallback first
    if (citiesCacheRef.current.size === 0) {
      const fallback = getFallbackCities();
      fallback.forEach(city => {
        const key = `${city.name}:${city.lat}:${city.lng}`;
        citiesCacheRef.current.set(key, city);
        if (city.countryCode === countryCode) {
          countryCities.push(city);
        }
      });
    }

    // Add to cities list
    if (countryCities.length > 0) {
      setCities(prev => {
        const existing = new Map(prev.map(c => [`${c.name}:${c.lat}:${c.lng}`, c]));
        countryCities.forEach(city => {
          const key = `${city.name}:${city.lat}:${city.lng}`;
          if (!existing.has(key)) {
            existing.set(key, city);
          }
        });
        return Array.from(existing.values());
      });
    }

    return countryCities;
  }, []);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (viewportTimeoutRef.current) {
        clearTimeout(viewportTimeoutRef.current);
      }
    };
  }, []);

  return {
    cities,
    loading,
    error,
    fetchMajorCities,
    fetchCitiesInViewport,
    handleViewportChange,
    fetchCitiesByCountry,
    generateCityAreas,
  };
}

/**
 * Fallback city list if API fails
 */
function getFallbackCities(): City[] {
  return [
    // Pakistan Cities
    { name: 'Karachi', lat: 24.8607, lng: 67.0011, country: 'Pakistan', countryCode: 'PK' },
    { name: 'Lahore', lat: 31.5204, lng: 74.3587, country: 'Pakistan', countryCode: 'PK' },
    { name: 'Faisalabad', lat: 31.4504, lng: 73.1350, country: 'Pakistan', countryCode: 'PK' },
    { name: 'Rawalpindi', lat: 33.5651, lng: 73.0169, country: 'Pakistan', countryCode: 'PK' },
    { name: 'Multan', lat: 30.1575, lng: 71.5249, country: 'Pakistan', countryCode: 'PK' },
    { name: 'Peshawar', lat: 34.0151, lng: 71.5249, country: 'Pakistan', countryCode: 'PK' },
    { name: 'Islamabad', lat: 33.6844, lng: 73.0479, country: 'Pakistan', countryCode: 'PK' },
    { name: 'Quetta', lat: 30.1798, lng: 66.9750, country: 'Pakistan', countryCode: 'PK' },
    // Major World Cities
    { name: 'New York', lat: 40.7128, lng: -74.0060, country: 'United States', countryCode: 'US' },
    { name: 'London', lat: 51.5074, lng: -0.1278, country: 'United Kingdom', countryCode: 'GB' },
    { name: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan', countryCode: 'JP' },
    { name: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France', countryCode: 'FR' },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090, country: 'India', countryCode: 'IN' },
    { name: 'Beijing', lat: 39.9042, lng: 116.4074, country: 'China', countryCode: 'CN' },
    { name: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'United States', countryCode: 'US' },
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777, country: 'India', countryCode: 'IN' },
    { name: 'São Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil', countryCode: 'BR' },
    { name: 'Cairo', lat: 30.0444, lng: 31.2357, country: 'Egypt', countryCode: 'EG' },
    { name: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia', countryCode: 'AU' },
    { name: 'Mexico City', lat: 19.4326, lng: -99.1332, country: 'Mexico', countryCode: 'MX' },
    { name: 'Jakarta', lat: -6.2088, lng: 106.8456, country: 'Indonesia', countryCode: 'ID' },
    { name: 'Bangkok', lat: 13.7563, lng: 100.5018, country: 'Thailand', countryCode: 'TH' },
    { name: 'Seoul', lat: 37.5665, lng: 126.9780, country: 'South Korea', countryCode: 'KR' },
  ];
}

