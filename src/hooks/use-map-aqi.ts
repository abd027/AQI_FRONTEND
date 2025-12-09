'use client';

import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { fetchAQIByCoordinates, fetchAQIBatch, type AqiData } from '@/lib/api-client';
import { type City } from '@/hooks/use-dynamic-cities';
import { getCacheKey, getCachedData, setCachedData, hasCachedData } from '@/lib/cache-utils';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  city: string;
  area?: string;
  aqi: number;
  category: string;
  data?: AqiData;
  loading?: boolean;
}

export function useMapAQI(zoomLevel: number = 2) {
  const [cities, setCities] = useState<City[]>([]);
  const citiesLoadedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Always show only city center (one reading per city)
  const filteredLocations = useMemo(() => {
    const locations: Array<{ city: string; area?: string; lat: number; lng: number; isCityCenter: boolean }> = [];
    
    cities.forEach(city => {
      // Always show only city center (Downtown area) regardless of zoom level
        locations.push({
          city: city.name,
          area: 'Downtown',
          lat: city.lat,
          lng: city.lng,
          isCityCenter: true,
        });
    });
    
    return locations;
  }, [cities, zoomLevel]);

  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loadedCount, setLoadedCount] = useState(0);

  // Fetch AQI for a single location with cache check
  const fetchAQIForLocation = useCallback(async (
    lat: number,
    lng: number,
    city?: string,
    area?: string,
    signal?: AbortSignal
  ): Promise<AqiData | null> => {
    const cacheKey = getCacheKey(lat, lng);
    
    // Check cache first
    const cached = getCachedData<AqiData>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const data = await fetchAQIByCoordinates(lat, lng, signal);
      
      // Cache the result if we got data
      if (data) {
        setCachedData(cacheKey, data);
      }
      return data;
    } catch (err) {
      console.error(`Error fetching AQI for ${city || `${lat},${lng}`}:`, err);
      return null;
    }
  }, []);

  // Load markers based on filtered locations
  useEffect(() => {
    let isMounted = true;

    async function loadMarkers() {
      // Cancel any previous request
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      
      // Create new abort controller
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      // Wait for cities to be loaded
      if (!citiesLoadedRef.current || filteredLocations.length === 0) {
        return;
      }

      console.log(`Loading markers for ${filteredLocations.length} locations (zoom: ${zoomLevel})`);
      setLoading(true);
      setError(null);
      setLoadedCount(0);

      // Check cache for all locations first
      const locationsToFetch: typeof filteredLocations = [];
      const cachedData: Map<string, AqiData> = new Map();
      
      filteredLocations.forEach(location => {
        const cacheKey = getCacheKey(location.lat, location.lng);
        const cached = getCachedData<AqiData>(cacheKey);
        if (cached) {
          cachedData.set(cacheKey, cached);
        } else {
          locationsToFetch.push(location);
        }
      });

      // Initialize markers with cached data
      const initialMarkers: MapMarker[] = filteredLocations.map((location, index) => {
        const cacheKey = getCacheKey(location.lat, location.lng);
        const cached = cachedData.get(cacheKey);
        
        return {
          id: `${location.city}-${location.area || 'main'}-${index}`,
          lat: location.lat,
          lng: location.lng,
          city: `${location.city}${location.area && location.area !== 'Downtown' ? ` - ${location.area}` : ''}`,
          area: location.area,
          aqi: cached?.aqi || 50,
          category: cached?.category || 'Moderate',
          data: cached,
          loading: !cached,
        };
      });
      
      setMarkers(initialMarkers);
      setLoadedCount(cachedData.size);

      // If all data is cached, we're done
      if (locationsToFetch.length === 0) {
        if (isMounted) {
          setLoading(false);
        }
        return;
      }

      try {
        // Fetch AQI data for uncached locations in batches
        const batchSize = 50;
        const allMarkers: MapMarker[] = [...initialMarkers];
        
        for (let i = 0; i < locationsToFetch.length; i += batchSize) {
          if (abortController.signal.aborted || !isMounted) {
            break;
          }

          const batch = locationsToFetch.slice(i, i + batchSize);
          
          // Fetch batch AQI data
          const batchData = await fetchAQIBatch(
            batch.map(loc => ({ 
              lat: loc.lat, 
              lng: loc.lng,
              city: loc.city,
              area: loc.area
            })),
            abortController.signal
          );
          
          if (abortController.signal.aborted || !isMounted) {
            break;
          }
          
          // Update markers with fetched data
          batch.forEach((location, batchIndex) => {
            const aqiData = batchData[batchIndex];
            const cacheKey = getCacheKey(location.lat, location.lng);
            
            // Cache the data
            if (aqiData) {
              setCachedData(cacheKey, aqiData);
            }
            
            // Find and update the marker
            const markerIndex = allMarkers.findIndex(
              m => m.lat === location.lat && m.lng === location.lng
            );
            
            if (markerIndex >= 0) {
              allMarkers[markerIndex] = {
                ...allMarkers[markerIndex],
                aqi: aqiData?.aqi || 50,
                category: aqiData?.category || 'Moderate',
                data: aqiData || undefined,
                loading: false,
              };
            }
            
            setLoadedCount(prev => prev + 1);
          });
          
          // Update markers progressively
          if (isMounted && !abortController.signal.aborted) {
            setMarkers([...allMarkers]);
          }
        }

        if (isMounted && !abortController.signal.aborted && allMarkers.length > 0) {
          setMarkers(allMarkers);
          
          // Check if we had any errors
          const successCount = allMarkers.filter(m => m.data).length;
          if (successCount === 0 && allMarkers.length > 0) {
            setError('Unable to load AQI data. Showing default values.');
          }
        }
      } catch (err) {
        if (isMounted && !abortController.signal.aborted) {
          if (err instanceof Error && err.name !== 'AbortError') {
            setError(err.message || 'Failed to load map data');
            console.error('Error loading map markers:', err);
          }
        }
      } finally {
        if (isMounted && !abortController.signal.aborted) {
          setLoading(false);
        }
      }
    }

    loadMarkers();

    return () => {
      isMounted = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [filteredLocations, zoomLevel]);

  const fetchAQIForCoordinates = useCallback(async (lat: number, lng: number): Promise<AqiData | null> => {
    return await fetchAQIForLocation(lat, lng);
  }, [fetchAQIForLocation]);

  // Function to load cities from API (called from map component)
  const loadCitiesFromAPI = useCallback((fetchedCities: City[]) => {
    console.log(`loadCitiesFromAPI called with ${fetchedCities.length} cities`);
    if (fetchedCities.length === 0) {
      console.warn('No cities provided to loadCitiesFromAPI');
      return;
    }
    
    setCities(prev => {
      const existing = new Map(prev.map(c => [`${c.name}:${c.lat}:${c.lng}`, c]));
      fetchedCities.forEach(city => {
        const key = `${city.name}:${city.lat}:${city.lng}`;
        if (!existing.has(key)) {
          existing.set(key, city);
        }
      });
      const updated = Array.from(existing.values());
      console.log(`Cities updated: ${updated.length} total cities`);
      return updated;
    });
    citiesLoadedRef.current = true;
    console.log('citiesLoadedRef set to true');
  }, []);

  return {
    markers,
    loading,
    error,
    loadedCount,
    totalCount: markers.length,
    fetchAQIForCoordinates,
    loadCitiesFromAPI,
  };
}
