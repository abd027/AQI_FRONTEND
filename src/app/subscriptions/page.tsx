'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/auth/protected-route';
import MainLayout from '@/components/layout/main-layout';
import SubscriptionList from '@/components/subscriptions/subscription-list';
import AddSubscriptionForm from '@/components/subscriptions/add-subscription-form';
import {
  getSubscriptions,
  createSubscription,
  deleteSubscription,
  toggleSubscription,
  sendSubscriptionNotification,
  transformBackendResponse,
  CitySubscription,
  CreateSubscriptionRequest,
  AqiData,
} from '@/lib/api-client';
import { useAQIWebSocket, AQIUpdateData } from '@/hooks/use-aqi-websocket';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, Wifi, WifiOff } from 'lucide-react';

// Helper function to generate consistent city keys
function getCityKey(city: string, country: string | null | undefined): string {
  const normalizedCountry = (country || 'unknown').trim();
  return `${city}_${normalizedCountry}`.toLowerCase();
}

export default function SubscriptionsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [subscriptions, setSubscriptions] = useState<CitySubscription[]>([]);
  const [aqiDataMap, setAqiDataMap] = useState<Record<string, AqiData>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, string | null>>({});
  const subscriptionsRef = useRef<CitySubscription[]>([]);

  // WebSocket for live updates
  const { isConnected, subscribe, unsubscribe } = useAQIWebSocket({
    autoConnect: true,
    onUpdate: (data: AQIUpdateData) => {
      if (data.type === 'aqi_update' && data.city && data.data) {
        const cityKey = getCityKey(data.city, data.country);
        
        // Transform backend response to match frontend AqiData format
        try {
          const transformedData = transformBackendResponse(data.data);
          setAqiDataMap((prev) => ({
            ...prev,
            [cityKey]: transformedData,
          }));
          // Clear error state when data arrives
          setErrorStates((prev) => ({
            ...prev,
            [cityKey]: null,
          }));
        } catch (err) {
          console.error('Error transforming WebSocket AQI data:', err);
          // Fallback: try to use data as-is if transformation fails
          setAqiDataMap((prev) => ({
            ...prev,
            [cityKey]: data.data as AqiData,
          }));
        }
      }
    },
  });

  const loadSubscriptions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getSubscriptions();
      setSubscriptions(data);

      // Fetch initial AQI data for all active subscriptions
      // Use sequential requests with delays to avoid rate limiting
      const { fetchAQIByCoordinates } = await import('@/lib/api-client');
      const activeSubscriptions = data.filter((sub) => sub.is_active);
      
      const aqiResults: Array<{ cityKey: string; aqiData: AqiData } | null> = [];
      
      // Process subscriptions sequentially with delays to avoid rate limiting
      for (let i = 0; i < activeSubscriptions.length; i++) {
        const sub = activeSubscriptions[i];
        const cityKey = getCityKey(sub.city, sub.country);
        setLoadingStates((prev) => ({ ...prev, [cityKey]: true }));
        setErrorStates((prev) => ({ ...prev, [cityKey]: null }));
        
        try {
          // Add delay between requests (except for first one) to avoid rate limiting
          if (i > 0) {
            await new Promise(resolve => setTimeout(resolve, 600)); // 600ms delay between requests
          }
          
          const aqiData = await fetchAQIByCoordinates(sub.latitude, sub.longitude);
          if (aqiData) {
            aqiResults.push({ cityKey, aqiData });
          } else {
            setErrorStates((prev) => ({
              ...prev,
              [cityKey]: 'No AQI data available for this location',
            }));
            aqiResults.push(null);
          }
        } catch (err: any) {
          const errorMessage = err?.message || `Failed to fetch AQI data for ${sub.city}`;
          console.warn(`Failed to fetch initial AQI for ${sub.city}:`, err);
          setErrorStates((prev) => ({
            ...prev,
            [cityKey]: errorMessage,
          }));
          aqiResults.push(null);
        } finally {
          setLoadingStates((prev) => ({ ...prev, [cityKey]: false }));
        }
      }

      const newAqiMap: Record<string, AqiData> = {};
      aqiResults.forEach((result) => {
        if (result) {
          newAqiMap[result.cityKey] = result.aqiData;
        }
      });
      setAqiDataMap((prev) => ({ ...prev, ...newAqiMap }));

      // Subscribe to WebSocket for each city (only if connected)
      const subscribeToCities = () => {
        if (isConnected) {
          data.forEach((sub) => {
            if (sub.is_active) {
              subscribe(sub.city, sub.country, sub.latitude, sub.longitude);
            }
          });
        }
      };

      // Try to subscribe immediately if connected, otherwise wait
      if (isConnected) {
        subscribeToCities();
      } else {
        // Wait for connection with timeout
        const maxWait = 3000; // 3 seconds max wait
        const startTime = Date.now();
        const checkConnection = setInterval(() => {
          if (isConnected || Date.now() - startTime > maxWait) {
            clearInterval(checkConnection);
            if (isConnected) {
              subscribeToCities();
            }
          }
        }, 100);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  }, [subscribe, isConnected]);

  useEffect(() => {
    if (user) {
      loadSubscriptions();
    }
  }, [user, loadSubscriptions]);

  // Keep subscriptions ref in sync
  useEffect(() => {
    subscriptionsRef.current = subscriptions;
  }, [subscriptions]);

  // Function to refresh AQI data for a specific subscription or all active subscriptions
  const refreshAQIData = useCallback(async (subscriptionId?: number) => {
    const { fetchAQIByCoordinates } = await import('@/lib/api-client');
    const currentSubscriptions = subscriptionsRef.current;
    
    // If subscriptionId is provided, refresh only that subscription
    if (subscriptionId !== undefined) {
      const sub = currentSubscriptions.find((s) => s.id === subscriptionId);
      if (!sub || !sub.is_active) {
        return;
      }
      
      const cityKey = getCityKey(sub.city, sub.country);
      setLoadingStates((prev) => ({ ...prev, [cityKey]: true }));
      setErrorStates((prev) => ({ ...prev, [cityKey]: null }));
      
      try {
        const aqiData = await fetchAQIByCoordinates(sub.latitude, sub.longitude);
        if (aqiData) {
          setAqiDataMap((prev) => ({
            ...prev,
            [cityKey]: aqiData,
          }));
          setErrorStates((prev) => ({
            ...prev,
            [cityKey]: null,
          }));
        } else {
          setErrorStates((prev) => ({
            ...prev,
            [cityKey]: 'No AQI data available for this location',
          }));
        }
      } catch (err: any) {
        const errorMessage = err?.message || `Failed to fetch AQI data for ${sub.city}`;
        setErrorStates((prev) => ({
          ...prev,
          [cityKey]: errorMessage,
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, [cityKey]: false }));
      }
      return;
    }
    
    // Otherwise, refresh all active subscriptions
    const activeSubscriptions = currentSubscriptions.filter((sub) => sub.is_active);
    if (activeSubscriptions.length === 0) {
      return;
    }
    
    // Update AQI data for each active subscription
    for (let i = 0; i < activeSubscriptions.length; i++) {
      const sub = activeSubscriptions[i];
      const cityKey = getCityKey(sub.city, sub.country);
      
      try {
        // Add small delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 300)); // 300ms delay
        }
        
        const aqiData = await fetchAQIByCoordinates(sub.latitude, sub.longitude);
        if (aqiData) {
          setAqiDataMap((prev) => ({
            ...prev,
            [cityKey]: aqiData,
          }));
          // Clear error state on successful update
          setErrorStates((prev) => ({
            ...prev,
            [cityKey]: null,
          }));
        }
      } catch (err: any) {
        // Only log error, don't update error state for polling (to avoid UI flicker)
        console.warn(`Failed to refresh AQI for ${sub.city}:`, err);
      }
    }
  }, []);

  // Set up polling to refresh AQI data every 25 seconds
  useEffect(() => {
    if (!user || subscriptions.length === 0) {
      return;
    }

    let isMounted = true;

    // Initial refresh after 25 seconds
    const initialTimeoutId = setTimeout(() => {
      if (isMounted) {
        refreshAQIData();
      }
    }, 25000); // First refresh after 25 seconds

    // Then set up interval for subsequent refreshes
    const intervalId = setInterval(() => {
      if (isMounted) {
        refreshAQIData();
      }
    }, 25000); // Every 25 seconds

    // Cleanup interval and timeout on unmount or when dependencies change
    return () => {
      isMounted = false;
      clearTimeout(initialTimeoutId);
      clearInterval(intervalId);
    };
  }, [user, subscriptions.length, refreshAQIData]);

  const handleAddSubscription = async (data: CreateSubscriptionRequest) => {
    try {
      setActionLoading(true);
      setError(null);
      const newSubscription = await createSubscription(data);
      setSubscriptions((prev) => [...prev, newSubscription]);
      
      // Fetch initial AQI data
      const { fetchAQIByCoordinates } = await import('@/lib/api-client');
      const cityKey = getCityKey(data.city, data.country);
      setLoadingStates((prev) => ({ ...prev, [cityKey]: true }));
      setErrorStates((prev) => ({ ...prev, [cityKey]: null }));
      
      try {
        const aqiData = await fetchAQIByCoordinates(data.latitude, data.longitude);
        if (aqiData) {
          setAqiDataMap((prev) => ({
            ...prev,
            [cityKey]: aqiData,
          }));
        } else {
          setErrorStates((prev) => ({
            ...prev,
            [cityKey]: 'No AQI data available for this location',
          }));
        }
      } catch (aqiErr: any) {
        const errorMessage = aqiErr?.message || 'Failed to fetch AQI data';
        console.warn('Failed to fetch initial AQI data:', aqiErr);
        setErrorStates((prev) => ({
          ...prev,
          [cityKey]: errorMessage,
        }));
      } finally {
        setLoadingStates((prev) => ({ ...prev, [cityKey]: false }));
      }
      
      // Subscribe to WebSocket if connected
      if (isConnected) {
        subscribe(data.city, data.country, data.latitude, data.longitude);
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to add subscription';
      setError(errorMessage);
      throw err; // Let form handle error display
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggle = async (id: number) => {
    try {
      setActionLoading(true);
      const updated = await toggleSubscription(id);
      setSubscriptions((prev) =>
        prev.map((sub) => (sub.id === id ? updated : sub))
      );

      // Update WebSocket subscription
      const subscription = subscriptions.find((s) => s.id === id);
      if (subscription) {
        if (updated.is_active) {
          subscribe(subscription.city, subscription.country, subscription.latitude, subscription.longitude);
        } else {
          unsubscribe(subscription.city, subscription.country);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to remove this subscription?')) {
      return;
    }

    try {
      setActionLoading(true);
      const subscription = subscriptions.find((s) => s.id === id);
      await deleteSubscription(id);
      setSubscriptions((prev) => prev.filter((sub) => sub.id !== id));

      // Unsubscribe from WebSocket
      if (subscription) {
        unsubscribe(subscription.city, subscription.country);
        const cityKey = getCityKey(subscription.city, subscription.country);
        setAqiDataMap((prev) => {
          const newMap = { ...prev };
          delete newMap[cityKey];
          return newMap;
        });
        setLoadingStates((prev) => {
          const newMap = { ...prev };
          delete newMap[cityKey];
          return newMap;
        });
        setErrorStates((prev) => {
          const newMap = { ...prev };
          delete newMap[cityKey];
          return newMap;
        });
      }
    } catch (err: any) {
      setError(err.message || 'Failed to delete subscription');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSendNotification = async (id: number) => {
    try {
      setError(null);
      
      // Get the current AQI value from aqiDataMap to ensure consistency with displayed value
      const subscription = subscriptions.find(sub => sub.id === id);
      let aqiValue: number | undefined;
      
      if (subscription) {
        const cityKey = getCityKey(subscription.city, subscription.country);
        const aqiData = aqiDataMap[cityKey];
        
        // Ensure AQI data exists and is valid (same validation as card display)
        if (aqiData && aqiData.aqi !== null && aqiData.aqi !== undefined && aqiData.aqi > 0) {
          // Round the value exactly as displayed in the card (Math.round)
          // This ensures the notification shows the same value as the card
          aqiValue = Math.round(aqiData.aqi);
        } else {
          // If no valid AQI data in card, show error
          throw new Error('No valid AQI data available for this location. Please refresh the data first.');
        }
      } else {
        throw new Error('Subscription not found.');
      }
      
      // Validate that we have a valid AQI value before sending
      if (aqiValue === undefined || aqiValue <= 0) {
        throw new Error('Invalid AQI value. Please refresh the data and try again.');
      }
      
      const result = await sendSubscriptionNotification(id, aqiValue);
      // Show success message (you could use a toast notification here)
      alert(result.message || 'Notification sent successfully!');
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to send notification';
      setError(errorMessage);
      throw err; // Re-throw so the card can handle loading state
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8">
          <header className="animate-slide-up flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2">City Subscriptions</h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Manage your city subscriptions to receive email alerts when AQI exceeds 100
            </p>
          </header>

          {/* Connection Status */}
          <div className="mb-4 md:mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
            <Alert>
              {isConnected ? (
                <>
                  <Wifi className="h-4 w-4" />
                  <AlertDescription>
                    Live updates enabled. AQI data will refresh automatically.
                  </AlertDescription>
                </>
              ) : (
                <>
                  <WifiOff className="h-4 w-4" />
                  <AlertDescription>
                    Live updates disabled. Please refresh the page to see latest AQI data.
                  </AlertDescription>
                </>
              )}
            </Alert>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert variant="destructive" className="mb-4 md:mb-6 animate-slide-up" style={{ animationDelay: '0.05s' }}>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="grid gap-6 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {/* Add Subscription Form */}
          <div className="lg:col-span-1">
            <AddSubscriptionForm onSubmit={handleAddSubscription} loading={actionLoading} />
          </div>

          {/* Subscriptions List */}
          <div className="lg:col-span-2">
            {loading ? (
              <Card>
                <CardContent className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </CardContent>
              </Card>
            ) : (
              <SubscriptionList
                subscriptions={subscriptions}
                aqiDataMap={aqiDataMap}
                onToggle={handleToggle}
                onDelete={handleDelete}
                onSendNotification={handleSendNotification}
                onRefresh={refreshAQIData}
                loading={actionLoading}
                loadingStates={loadingStates}
                errorStates={errorStates}
              />
            )}
          </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}

