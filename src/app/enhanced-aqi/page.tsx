'use client';

import { useState, useEffect } from 'react';
import MainLayout from '@/components/layout/main-layout';
import EnhancedAqiDisplay from '@/components/dashboard/enhanced-aqi-display';
import { fetchEnhancedAQIByCoordinates, geocodeCity } from '@/lib/api-client';
import type { EnhancedAqiResponse } from '@/lib/api-client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, MapPin, Search, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function EnhancedAQIPage() {
  const [cityQuery, setCityQuery] = useState('');
  const [lat, setLat] = useState<string>('40.7128');
  const [lng, setLng] = useState<string>('-74.0060');
  const [data, setData] = useState<EnhancedAqiResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data for default location (New York) on mount
  useEffect(() => {
    handleFetch();
  }, []);

  const handleCitySearch = async () => {
    if (!cityQuery.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const location = await geocodeCity(cityQuery);
      if (location) {
        // Update lat/lng inputs
        setLat(location.latitude.toString());
        setLng(location.longitude.toString());

        // Fetch AQI data
        const result = await fetchEnhancedAQIByCoordinates(location.latitude, location.longitude);
        if (result) {
          setData(result);
        } else {
          setError('Failed to fetch AQI data for this location');
        }
      } else {
        setError(`City not found: ${cityQuery}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during search');
    } finally {
      setLoading(false);
    }
  };

  const handleFetch = async () => {
    const latitude = parseFloat(lat);
    const longitude = parseFloat(lng);

    if (isNaN(latitude) || isNaN(longitude)) {
      setError('Please enter valid latitude and longitude values');
      return;
    }

    if (latitude < -90 || latitude > 90) {
      setError('Latitude must be between -90 and 90');
      return;
    }

    if (longitude < -180 || longitude > 180) {
      setError('Longitude must be between -180 and 180');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchEnhancedAQIByCoordinates(latitude, longitude);
      if (result) {
        setData(result);
      } else {
        setError('Failed to fetch AQI data for this location');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while fetching data');
    } finally {
      setLoading(false);
    }
  };

  const handleUseCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLat(position.coords.latitude.toString());
          setLng(position.coords.longitude.toString());
          // Auto-fetch when location is found
          // We can't immediately call handleFetch because state updates are async
          // Ideally we'd call fetch directly or use useEffect, but let's just update fields for now
          // Or better, trigger fetch directly with these coords
          fetchEnhancedAQIByCoordinates(position.coords.latitude, position.coords.longitude)
            .then(result => {
              if (result) setData(result);
            });
        },
        (err) => {
          setError('Unable to get your location: ' + err.message);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  return (
    <MainLayout>
      <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        <div className="animate-slide-up">
          <h1 className="text-3xl font-bold tracking-tight mb-2">Enhanced Air Quality Data</h1>
          <p className="text-muted-foreground">
            View comprehensive air quality data with Local EPA AQI, Global AQI, National AQI, and all pollutant concentrations.
          </p>
        </div>

        {/* Search Form */}
        <Card className="animate-slide-up" style={{ animationDelay: '0.1s' }}>
          <CardContent className="p-6 space-y-4">
            {/* City Search */}
            <div className="flex flex-col md:flex-row gap-4 border-b pb-6">
              <div className="flex-1">
                <Label htmlFor="city">Search by City</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="city"
                    value={cityQuery}
                    onChange={(e) => setCityQuery(e.target.value)}
                    placeholder="Enter city name (e.g. London, Tokyo)"
                    onKeyDown={(e) => e.key === 'Enter' && handleCitySearch()}
                  />
                  <Button onClick={handleCitySearch} disabled={loading}>
                    <Search className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Coordinates Search */}
            <div>
              <Label className="text-xs text-muted-foreground uppercase font-semibold mb-2 block">Or search by coordinates</Label>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <Label htmlFor="lat">Latitude</Label>
                  <Input
                    id="lat"
                    type="number"
                    step="any"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="40.7128"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="lng">Longitude</Label>
                  <Input
                    id="lng"
                    type="number"
                    step="any"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="-74.0060"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button
                    onClick={handleFetch}
                    disabled={loading}
                    className="w-full"
                    variant="secondary"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Loading...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Fetch Data
                      </>
                    )}
                  </Button>
                </div>
                <div className="flex items-end">
                  <Button
                    onClick={handleUseCurrentLocation}
                    variant="outline"
                    className="w-full"
                  >
                    <MapPin className="mr-2 h-4 w-4" />
                    Use My Location
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="animate-slide-up" style={{ animationDelay: '0.15s' }}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Data Display */}
        {loading && (
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-12 text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
              <p className="text-muted-foreground">Fetching air quality data...</p>
            </CardContent>
          </Card>
        )}

        {!loading && data && (
          <div className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <EnhancedAqiDisplay data={data} />
          </div>
        )}

        {!loading && !data && !error && (
          <Card className="animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <CardContent className="p-12 text-center">
              <MapPin className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">Enter coordinates and click "Fetch Data" to view air quality information</p>
            </CardContent>
          </Card>
        )}
      </div>
    </MainLayout>
  );
}

