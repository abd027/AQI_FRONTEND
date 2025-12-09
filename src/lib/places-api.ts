/**
 * Places API utility functions
 * Uses backend proxy to avoid CORS issues
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

/**
 * Get authentication headers (imported from api-client)
 */
function getAuthHeaders(): HeadersInit {
  const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return headers;
}

/**
 * Handle 401 errors by redirecting to login
 */
function handleAuthError() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';
  }
}

export interface PlaceSuggestion {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  location?: {
    lat: number;
    lng: number;
  };
}

export interface PlaceDetails {
  placeId: string;
  displayName: string;
  formattedAddress: string;
  location: {
    lat: number;
    lng: number;
  };
  addressComponents?: Array<{
    longText: string;
    shortText: string;
    types: string[];
  }>;
}

/**
 * Generate a session token for autocomplete requests
 * (Not used by Nominatim, but kept for API compatibility)
 */
export function generateSessionToken(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Fetch autocomplete suggestions from backend proxy
 */
export async function fetchAutocompleteSuggestions(
  input: string,
  sessionToken?: string
): Promise<PlaceSuggestion[]> {
  if (!input || input.length < 2) {
    return [];
  }

  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      console.warn('No access token found for autocomplete');
      return [];
    }

    const params = new URLSearchParams({
      q: input,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/aqi/autocomplete/?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    // Check if response is OK
    if (!response.ok) {
      // Handle 401 Unauthorized - token expired or invalid
      if (response.status === 401) {
        handleAuthError();
        return [];
      }
      
      // Check content type before trying to parse JSON
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await response.json().catch(() => ({ detail: response.statusText }));
        console.error('Autocomplete API error:', response.status, errorData);
        // Don't throw error, just return empty array to prevent UI breaking
        return [];
      } else {
        // HTML error page (404, 500, etc.)
        const errorText = await response.text().catch(() => response.statusText);
        console.error('Autocomplete API error (HTML response):', response.status, errorText.substring(0, 100));
        return [];
      }
    }

    // Check content type before parsing
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await response.text();
      console.error('Unexpected content type:', contentType, text.substring(0, 100));
      throw new Error('Server returned non-JSON response');
    }

    const data = await response.json();
    
    // Handle error response from backend
    if (data.error) {
      console.error('Backend error:', data.detail);
      return [];
    }

    // Backend returns array of suggestions
    if (Array.isArray(data)) {
      return data as PlaceSuggestion[];
    }

    return [];
  } catch (error) {
    console.error('Error fetching autocomplete suggestions:', error);
    if (error instanceof Error) {
      console.error('Error details:', error.message, error.stack);
    }
    return [];
  }
}

/**
 * Fetch place details using place ID
 * Note: Since we're using backend proxy, we can extract details from the suggestion
 * For now, we'll use the suggestion data directly
 */
export async function fetchPlaceDetails(
  placeId: string,
  sessionToken?: string
): Promise<PlaceDetails | null> {
  // Since we're using backend proxy, the suggestion already contains location data
  // This function is kept for API compatibility but may not be needed
  // If place details are needed, we can add a backend endpoint for it
  console.warn('fetchPlaceDetails called but may not be fully implemented with backend proxy');
  return null;
}

/**
 * Search for places using text query
 */
export async function searchPlaces(
  query: string,
  locationBias?: { lat: number; lng: number; radius?: number }
): Promise<PlaceDetails[]> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
    if (!token) {
      console.warn('No access token found for search places');
      return [];
    }

    const params = new URLSearchParams({
      q: query,
    });

    const response = await fetch(
      `${API_BASE_URL}/api/aqi/autocomplete/?${params.toString()}`,
      {
        headers: getAuthHeaders(),
      }
    );

    if (!response.ok) {
      // Handle 401 Unauthorized
      if (response.status === 401) {
        handleAuthError();
        return [];
      }
      return [];
    }

    const data = await response.json();
    
    if (data.error) {
      return [];
    }

    // Convert suggestions to PlaceDetails format
    const places: PlaceDetails[] = [];
    if (Array.isArray(data)) {
      for (const suggestion of data) {
        if (suggestion.location) {
          places.push({
            placeId: suggestion.placeId || '',
            displayName: suggestion.displayName || '',
            formattedAddress: suggestion.formattedAddress || suggestion.displayName || '',
            location: suggestion.location,
            addressComponents: [],
          });
        }
      }
    }

    return places;
  } catch (error) {
    console.error('Error searching places:', error);
    return [];
  }
}

