'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import CityAutocomplete from '@/components/auth/city-autocomplete';
import CountryAutocomplete from '@/components/auth/country-autocomplete';
import { Plus, Loader2 } from 'lucide-react';
import { CreateSubscriptionRequest } from '@/lib/api-client';

interface AddSubscriptionFormProps {
  onSubmit: (data: CreateSubscriptionRequest) => Promise<void>;
  loading?: boolean;
}

export default function AddSubscriptionForm({ onSubmit, loading = false }: AddSubscriptionFormProps) {
  const [city, setCity] = useState('');
  const [country, setCountry] = useState('');
  const [cityCoordinates, setCityCoordinates] = useState<{ lat: number; lng: number } | undefined>(undefined);
  const [error, setError] = useState('');

  const handleCityChange = (cityName: string, countryName: string, coordinates?: { lat: number; lng: number }) => {
    setCity(cityName);
    if (countryName) {
      setCountry(countryName);
    }
    if (coordinates) {
      setCityCoordinates(coordinates);
    }
  };

  const handleCountryChange = (countryName: string) => {
    setCountry(countryName);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!city || !country) {
      setError('Please select both city and country');
      return;
    }

    if (!cityCoordinates) {
      setError('Please select a valid city with coordinates');
      return;
    }

    // Validate coordinate ranges
    const { lat, lng } = cityCoordinates;
    if (lat < -90 || lat > 90) {
      setError('Invalid latitude. Must be between -90 and 90.');
      return;
    }
    if (lng < -180 || lng > 180) {
      setError('Invalid longitude. Must be between -180 and 180.');
      return;
    }

    try {
      await onSubmit({
        city: city.trim(),
        country: country.trim(),
        latitude: lat,
        longitude: lng,
      });
      
      // Reset form
      setCity('');
      setCountry('');
      setCityCoordinates(undefined);
      setError('');
    } catch (err: any) {
      // Extract error message from various formats
      let errorMessage = 'Failed to add subscription';
      if (err.message) {
        errorMessage = err.message;
      } else if (typeof err === 'string') {
        errorMessage = err;
      } else if (err.detail) {
        errorMessage = err.detail;
      } else if (err.non_field_errors && Array.isArray(err.non_field_errors)) {
        errorMessage = err.non_field_errors[0];
      }
      setError(errorMessage);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add City Subscription</CardTitle>
        <CardDescription>
          Subscribe to receive email notifications when AQI exceeds 100 in this city
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CityAutocomplete
            value={city}
            onChange={handleCityChange}
            disabled={loading}
            placeholder="Search for a city..."
            label="City"
          />

          <CountryAutocomplete
            value={country}
            onChange={handleCountryChange}
            disabled={loading}
            placeholder="Select or search for a country..."
            label="Country"
          />

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <Button 
            type="submit" 
            disabled={loading || !city || !country || !cityCoordinates} 
            className="w-full mt-4"
            variant="default"
            size="default"
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Adding...
              </>
            ) : (
              <>
                <Plus className="mr-2 h-4 w-4" />
                Add Subscription
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

