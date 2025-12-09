/**
 * API Client for Backend Integration
 * Connects to Python FastAPI backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

/**
 * Retry function with exponential backoff
 */
/**
 * Get authentication headers
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

async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  maxRetries: number = 3
): Promise<Response | null> {
  const delays = [300, 700]; // 300ms, 700ms delays in milliseconds

  // Add auth headers if not already present
  const headers = getAuthHeaders();
  const mergedOptions = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {}),
    },
  };

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 20000);

      const response = await fetch(url, {
        ...mergedOptions,
        signal: controller.signal,
      });

      // Handle 401 Unauthorized
      if (response.status === 401) {
        handleAuthError();
        return null;
      }

      clearTimeout(timeoutId);

      if (response.ok) {
        return response;
      }

      // If not OK and not last attempt, retry
      if (attempt < maxRetries - 1) {
        const delay = delays[attempt] || delays[delays.length - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      return response; // Return even if not OK on last attempt
    } catch (error: any) {
      // If abort error or network error, retry if not last attempt
      if (attempt < maxRetries - 1 && (error.name === 'AbortError' || error.name === 'TypeError')) {
        const delay = delays[attempt] || delays[delays.length - 1];
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      // Last attempt or non-retryable error
      if (attempt === maxRetries - 1) {
        return null;
      }
    }
  }

  return null;
}

export interface AqiData {
  city?: string;  // Optional - may be fetched via reverse geocoding
  aqi: number | null;
  category: string;
  healthAdvice?: string;  // Maps from backend's health_advice
  pollutants: Array<{
    name: string;
    value: number | null;
    unit: string;
  }>;
  weather?: {  // Now provided by backend via Open Meteo Weather API
    temperature?: number;
    humidity?: number;
    wind?: number;
  } | null;
  lastUpdated: string;
  // Backend fields for compatibility
  location?: { lat: number; lon: number };
  dominant_pollutant?: string;
  color?: string;
  // Raw backend current data (for advanced usage)
  current?: {
    time?: string;
    pm2_5?: number | null;
    pm10?: number | null;
    ozone?: number | null;
    nitrogen_dioxide?: number | null;
    carbon_monoxide?: number | null;
    sulphur_dioxide?: number | null;
    dust?: number | null;
    uv_index?: number | null;
  };
}

// New enhanced structured response interfaces
export interface LocationInfo {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
  region?: string;
}

export interface AqiIndex {
  value?: number;
  category?: string;
  color?: string;
}

export interface PollutantData {
  value?: number;
  unit?: string;
  epa_aqi?: number;
  category?: string;
  color?: string;
}

export interface EnhancedAqiResponse {
  location: LocationInfo;
  aqi: {
    local_epa_aqi?: AqiIndex;
    uaqi?: AqiIndex;
    national_aqi?: AqiIndex;
  };
  pollutants: {
    pm25?: PollutantData;
    pm10?: PollutantData;
    o3?: PollutantData;
    no2?: PollutantData;
    co?: PollutantData;
    so2?: PollutantData;
  };
  dominant_pollutant?: string;
  health_recommendations: string[];
  lastUpdated: string;
  current?: any;
  hourly?: any;
  daily?: any;
}

export interface AqiTimePoint {
  time: string;
  aqi: number;
}

export interface CityRanking {
  rank: number;
  city: string;
  country: string;
  aqi: number;
  category: string;
  dominantPollutant: string;
  trend: Array<{ time: string; aqi: number }>;
  lastUpdated: string;
  region: string;
  pm25?: number;
  pm10?: number;
  aqi_pm25?: number;
  aqi_pm10?: number;
}

/**
 * Transform backend API response to frontend format
 * Handles snake_case to camelCase conversion and data structure mapping
 */
export function transformBackendResponse(backendData: any): AqiData {
  const current = backendData.current || {};

  return {
    city: backendData.city,
    aqi: backendData.aqi,
    category: backendData.category,
    healthAdvice: backendData.health_advice || backendData.healthAdvice || '',
    pollutants: [
      { name: 'PM2.5', value: current.pm2_5 ?? null, unit: 'µg/m³' },
      { name: 'PM10', value: current.pm10 ?? null, unit: 'µg/m³' },
      { name: 'O₃', value: current.ozone ?? null, unit: 'µg/m³' },
      { name: 'NO₂', value: current.nitrogen_dioxide ?? null, unit: 'µg/m³' },
      { name: 'CO', value: current.carbon_monoxide ?? null, unit: 'µg/m³' },
      { name: 'SO₂', value: current.sulphur_dioxide ?? null, unit: 'µg/m³' },
    ].filter(p => p.value !== null),
    weather: backendData.weather || undefined,
    lastUpdated: backendData.lastUpdated || backendData.last_updated || '',
    location: backendData.location,
    dominant_pollutant: backendData.dominant_pollutant,
    color: backendData.color,
    current: current,
  };
}

/**
 * Fetch AQI data for a city
 */
export async function fetchAQIData(city: string = 'New York'): Promise<AqiData | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

    try {
      const response = await fetch(`${API_BASE_URL}/api/aqi?city=${encodeURIComponent(city)}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!response.ok) {
        console.warn(`Failed to fetch AQI data for ${city}: ${response.statusText}`);
        return null;
      }
      return await response.json();
    } catch (fetchError: any) {
      clearTimeout(timeoutId);
      if (fetchError.name === 'AbortError') {
        console.warn(`Request timeout for ${city} - server took too long to respond`);
        return null;
      }
      console.warn(`Error fetching AQI data for ${city}:`, fetchError);
      return null;
    }
  } catch (error) {
    console.error('Error fetching AQI data:', error);
    return null;
  }
}

/**
 * Fetch AQI trend data with retry logic
 */
export async function fetchAQITrend(city: string = 'New York'): Promise<AqiTimePoint[]> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/aqi/trend?city=${encodeURIComponent(city)}`,
      {},
      3 // 3 retries
    );

    if (!response || !response.ok) {
      console.warn(`Failed to fetch AQI trend data for ${city}: ${response?.statusText || 'Unknown error'} (status: ${response?.status || 'N/A'})`);
      return [];
    }

    const data = await response.json();
    return Array.isArray(data) ? data : [];
  } catch (error) {
    console.error(`Error fetching AQI trend for ${city}:`, error);
    return [];
  }
}

/**
 * Fetch city rankings
 */
export async function fetchCityRankings(): Promise<CityRanking[]> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/cities/rankings/`,
      {},
      3 // 3 retries
    );

    if (!response || !response.ok) {
      console.warn('Failed to fetch city rankings');
      return [];
    }

    const data = await response.json();
    
    // Ensure we return an array
    if (Array.isArray(data)) {
      return data;
    }
    
    // If the response has an error, return empty array
    if (data.error) {
      console.error('Error in city rankings response:', data.detail || data.message);
      return [];
    }
    
    return [];
  } catch (error) {
    console.error('Error fetching city rankings:', error);
    return [];
  }
}

/**
 * Fetch AQI data by coordinates with retry logic
 */
export async function fetchAQIByCoordinates(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<AqiData | null> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/aqi/coordinates?lat=${lat}&lng=${lng}`,
      { signal }
    );

    if (!response || !response.ok) {
      console.warn(`Failed to fetch AQI data by coordinates: ${response?.statusText || 'Unknown error'}`);
      return null;
    }

    const data = await response.json();
    return transformBackendResponse(data);
  } catch (error) {
    console.error('Error fetching AQI data by coordinates:', error);
    return null;
  }
}

/**
 * Fetch AQI data for multiple locations (batch) with retry logic
 */
export async function fetchAQIBatch(
  locations: Array<{ lat: number; lng: number; city?: string; area?: string }>,
  signal?: AbortSignal
): Promise<AqiData[]> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/aqi/batch`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ locations }),
        signal,
      },
      2 // Batch requests: fewer retries to avoid long waits
    );

    if (!response || !response.ok) {
      console.warn(`Failed to fetch batch AQI data: ${response?.statusText || 'Unknown error'}`);
      return [];
    }

    const data = await response.json();
    return data.map((item: any) => transformBackendResponse(item));
  } catch (error) {
    console.error('Error fetching batch AQI data:', error);
    return [];
  }
}

/**
 * Fetch enhanced structured AQI data by coordinates
 */
export async function fetchEnhancedAQIByCoordinates(
  lat: number,
  lng: number,
  signal?: AbortSignal
): Promise<EnhancedAqiResponse | null> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/aqi/enhanced?lat=${lat}&lng=${lng}`,
      { signal }
    );

    if (!response || !response.ok) {
      console.warn(`Failed to fetch enhanced AQI data: ${response?.statusText || 'Unknown error'}`);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching enhanced AQI data:', error);
    return null;
  }
}

/**
 * Fetch enhanced AQI data for multiple locations (batch) with retry logic
 */
export async function fetchEnhancedAQIBatch(
  locations: Array<{ lat: number; lng: number; city?: string; area?: string }>,
  signal?: AbortSignal
): Promise<EnhancedAqiResponse[]> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/aqi/batch/enhanced`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(locations),
        signal,
      },
      2 // Batch requests: fewer retries to avoid long waits
    );

    if (!response || !response.ok) {
      console.warn(`Failed to fetch enhanced batch AQI data: ${response?.statusText || 'Unknown error'}`);
      return [];
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching enhanced batch AQI data:', error);
    return [];
  }
}

/**
 * Geocoded City Response
 */
export interface GeocodedCity {
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  country_code: string;
  admin1?: string;
}

/**
 * Geocode a city name to coordinates
 */
export async function geocodeCity(city: string): Promise<GeocodedCity | null> {
  try {
    const response = await fetchWithRetry(
      `${API_BASE_URL}/api/aqi/geocode/?city=${encodeURIComponent(city)}`
    );

    if (!response || !response.ok) {
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error('Error geocoding city:', error);
    return null;
  }
}

// ============================================================================
// Authentication API Functions
// ============================================================================

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username: string;
  is_active: boolean;
  is_verified: boolean;
  created_at: string;
  last_login?: string;
}

/**
 * Login user
 */
export async function login(credentials: LoginRequest): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Login failed');
  }

  return await response.json();
}

/**
 * Register new user
 */
export async function register(userData: RegisterRequest): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(userData),
  });

  if (!response.ok) {
    const error = await response.json();
    // Handle validation errors (422)
    if (response.status === 422 && Array.isArray(error.detail)) {
      const validationErrors = error.detail
        .map((err: any) => `${err.field}: ${err.message}`)
        .join(', ');
      throw new Error(`Validation error: ${validationErrors}`);
    }
    // Handle other errors
    const errorMessage = typeof error.detail === 'string'
      ? error.detail
      : error.message || 'Registration failed';
    throw new Error(errorMessage);
  }

  return await response.json();
}

/**
 * Logout user
 */
export async function logout(refreshToken: string): Promise<void> {
  try {
    await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
  } catch (error) {
    console.error('Error during logout:', error);
  }
}

/**
 * Refresh access token
 */
export async function refreshToken(refreshTokenValue: string): Promise<TokenResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshTokenValue }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Token refresh failed');
  }

  return await response.json();
}

/**
 * Get current user
 */
export async function getCurrentUser(): Promise<UserResponse> {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    headers: getAuthHeaders(),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
    }
    throw new Error('Failed to get current user');
  }

  return await response.json();
}

/**
 * Verify email
 */
export async function verifyEmail(token: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/verify-email/?token=${token}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    // Check if response is JSON before parsing
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        const error = await response.json();
        throw new Error(error.detail || error.message || 'Email verification failed');
      } catch (parseError) {
        throw new Error('Email verification failed');
      }
    } else {
      // Response is HTML (error page), extract status text
      throw new Error(`Email verification failed: ${response.status} ${response.statusText}`);
    }
  }
  
  // Success response - try to parse JSON if available
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    await response.json();
  }
}

/**
 * Resend verification email
 */
export async function resendVerification(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/resend-verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to resend verification email');
  }
}

/**
 * Request password reset
 */
export async function forgotPassword(email: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Failed to send password reset email');
  }
}

/**
 * Reset password
 */
export async function resetPassword(token: string, newPassword: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, new_password: newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Password reset failed');
  }
}

/**
 * City Subscription Types
 */
export interface CitySubscription {
  id: number;
  city: string;
  country: string;
  latitude: number;
  longitude: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateSubscriptionRequest {
  city: string;
  country: string;
  latitude: number;
  longitude: number;
}

/**
 * Get user's city subscriptions
 */
export async function getSubscriptions(): Promise<CitySubscription[]> {
  const response = await fetch(`${API_BASE_URL}/api/aqi/subscriptions/`, {
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
    }
    const error = await response.json().catch(() => ({ detail: 'Failed to fetch subscriptions' }));
    throw new Error(error.detail || 'Failed to fetch subscriptions');
  }

  const data = await response.json();
  
  // Handle paginated response (if pagination is enabled)
  if (data && typeof data === 'object' && 'results' in data && Array.isArray(data.results)) {
    return data.results;
  }
  
  // Handle direct array response
  if (Array.isArray(data)) {
    return data;
  }
  
  // Fallback: return empty array if response format is unexpected
  console.warn('Unexpected subscriptions response format:', data);
  return [];
}

/**
 * Create a new city subscription
 */
export async function createSubscription(data: CreateSubscriptionRequest): Promise<CitySubscription> {
  const response = await fetch(`${API_BASE_URL}/api/aqi/subscriptions/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
    }
    const error = await response.json().catch(() => ({ detail: 'Failed to create subscription' }));
    
    // Handle validation errors (400)
    if (response.status === 400 && error.non_field_errors) {
      throw new Error(Array.isArray(error.non_field_errors) ? error.non_field_errors[0] : error.non_field_errors);
    }
    
    // Handle field-specific errors
    if (response.status === 400) {
      const fieldErrors = Object.entries(error)
        .filter(([key]) => key !== 'detail')
        .map(([key, value]) => {
          const errorMsg = Array.isArray(value) ? value[0] : value;
          return `${key}: ${errorMsg}`;
        });
      
      if (fieldErrors.length > 0) {
        throw new Error(fieldErrors.join(', '));
      }
    }
    
    throw new Error(error.detail || error.message || 'Failed to create subscription');
  }

  return await response.json();
}

/**
 * Delete a city subscription
 */
export async function deleteSubscription(id: number): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/api/aqi/subscriptions/${id}/`, {
    method: 'DELETE',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
    }
    const error = await response.json().catch(() => ({ detail: 'Failed to delete subscription' }));
    throw new Error(error.detail || 'Failed to delete subscription');
  }
}

/**
 * Update a city subscription (e.g., toggle active status)
 */
export async function updateSubscription(
  id: number,
  data: Partial<CitySubscription>
): Promise<CitySubscription> {
  const response = await fetch(`${API_BASE_URL}/api/aqi/subscriptions/${id}/`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
    }
    const error = await response.json().catch(() => ({ detail: 'Failed to update subscription' }));
    throw new Error(error.detail || error.message || 'Failed to update subscription');
  }

  return await response.json();
}

/**
 * Toggle subscription active status
 */
export async function toggleSubscription(id: number): Promise<CitySubscription> {
  const response = await fetch(`${API_BASE_URL}/api/aqi/subscriptions/${id}/toggle/`, {
    method: 'PATCH',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
    }
    const error = await response.json().catch(() => ({ detail: 'Failed to toggle subscription' }));
    throw new Error(error.detail || 'Failed to toggle subscription');
  }

  return await response.json();
}

/**
 * Send immediate notification email for a subscription
 */
export async function sendSubscriptionNotification(id: number, aqi_value?: number): Promise<{ success: boolean; message: string; aqi_value: number }> {
  const body: { aqi_value?: number } = {};
  if (aqi_value !== undefined) {
    body.aqi_value = aqi_value;
  }

  const response = await fetch(`${API_BASE_URL}/api/aqi/subscriptions/${id}/send_notification/`, {
    method: 'POST',
    headers: {
      ...getAuthHeaders(),
      'Content-Type': 'application/json',
    },
    body: Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 401) {
      handleAuthError();
    }
    
    let errorMessage = 'Failed to send notification';
    try {
      const error = await response.json();
      errorMessage = error.error || error.detail || errorMessage;
    } catch (e) {
      // If response is not JSON, try to get text
      try {
        const text = await response.text();
        if (text) {
          errorMessage = text;
        }
      } catch (textError) {
        // Use default error message
      }
    }
    
    throw new Error(errorMessage);
  }

  return await response.json();
}

