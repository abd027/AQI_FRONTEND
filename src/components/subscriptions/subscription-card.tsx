'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { CitySubscription } from '@/lib/api-client';
import { Trash2, MapPin, Send, RefreshCw } from 'lucide-react';
import { AqiData } from '@/lib/api-client';
import { useState } from 'react';

interface SubscriptionCardProps {
  subscription: CitySubscription;
  aqiData?: AqiData;
  onToggle: (id: number) => void;
  onDelete: (id: number) => void;
  onSendNotification?: (id: number) => Promise<void>;
  onRefresh?: (id: number) => Promise<void>;
  loading?: boolean;
  error?: string | null;
  isLoading?: boolean;
}

export default function SubscriptionCard({
  subscription,
  aqiData,
  onToggle,
  onDelete,
  onSendNotification,
  onRefresh,
  loading = false,
  error = null,
  isLoading = false,
}: SubscriptionCardProps) {
  const [sendingNotification, setSendingNotification] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const aqiValue = aqiData?.aqi || 0;

  const handleSendNotification = async () => {
    if (!onSendNotification) return;
    
    setSendingNotification(true);
    try {
      await onSendNotification(subscription.id);
    } catch (err) {
      // Error handling is done in parent component
      console.error('Failed to send notification:', err);
    } finally {
      setSendingNotification(false);
    }
  };

  const handleRefresh = async () => {
    if (!onRefresh) return;
    
    setRefreshing(true);
    try {
      await onRefresh(subscription.id);
    } catch (err) {
      console.error('Failed to refresh AQI data:', err);
    } finally {
      setRefreshing(false);
    }
  };
  
  // Get color from aqiData.color or calculate from AQI value
  const getAQIColorValue = (aqi: number) => {
    if (aqi <= 50) return '#00e400'; // Good - green
    if (aqi <= 100) return '#ffff00'; // Moderate - yellow
    if (aqi <= 150) return '#ff7e00'; // USG - orange
    if (aqi <= 200) return '#ff0000'; // Unhealthy - red
    if (aqi <= 300) return '#8f3f97'; // Very Unhealthy - purple
    return '#7e0023'; // Hazardous - dark red
  };

  const getAQIColor = (aqi: number) => {
    if (aqi <= 50) return 'bg-green-500';
    if (aqi <= 100) return 'bg-yellow-500';
    if (aqi <= 150) return 'bg-orange-500';
    if (aqi <= 200) return 'bg-red-500';
    if (aqi <= 300) return 'bg-purple-500';
    return 'bg-red-800';
  };

  const getAQICategory = (aqi: number) => {
    if (aqi <= 50) return 'Good';
    if (aqi <= 100) return 'Moderate';
    if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
    if (aqi <= 200) return 'Unhealthy';
    if (aqi <= 300) return 'Very Unhealthy';
    return 'Hazardous';
  };

  // Use color from aqiData if available, otherwise calculate from AQI value
  const aqiColor = aqiData?.color || (aqiValue > 0 ? getAQIColorValue(aqiValue) : '#808080');

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              {subscription.city}, {subscription.country}
            </CardTitle>
            <CardDescription className="mt-1">
              {subscription.latitude.toFixed(4)}, {subscription.longitude.toFixed(4)}
            </CardDescription>
          </div>
          <Badge variant={subscription.is_active ? 'default' : 'secondary'}>
            {subscription.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <div className="text-sm text-muted-foreground">Loading AQI data...</div>
          </div>
        ) : error ? (
          <div className="space-y-2">
            <div className="text-sm text-destructive font-medium">Failed to load AQI data</div>
            <div className="text-xs text-muted-foreground">{error}</div>
          </div>
        ) : aqiData && aqiData.aqi !== null && aqiData.aqi !== undefined ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold" style={{ color: aqiColor }}>
                    {Math.round(aqiValue)}
                  </div>
                  {onRefresh && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={handleRefresh}
                      disabled={loading || refreshing || isLoading}
                      className="h-6 w-6"
                      title="Refresh AQI data"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshing ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  {aqiData.category || getAQICategory(aqiValue)}
                </div>
              </div>
              <div
                className={`w-16 h-16 rounded-full ${getAQIColor(aqiValue)} opacity-20`}
              />
            </div>
            {aqiData.dominant_pollutant && (
              <div className="text-sm">
                <span className="text-muted-foreground">Dominant Pollutant: </span>
                <span className="font-medium">{aqiData.dominant_pollutant}</span>
              </div>
            )}
            {aqiData.lastUpdated && (
              <div className="text-xs text-muted-foreground">
                Last updated: {new Date(aqiData.lastUpdated).toLocaleString()}
              </div>
            )}
          </div>
        ) : (
          <div className="text-sm text-muted-foreground">No AQI data available</div>
        )}
        
        <div className="mt-4 pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Switch
                checked={subscription.is_active}
                onCheckedChange={() => onToggle(subscription.id)}
                disabled={loading}
              />
              <label className="text-sm font-medium">
                Email notifications {subscription.is_active ? 'enabled' : 'disabled'}
              </label>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(subscription.id)}
              disabled={loading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
          {onSendNotification && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendNotification}
              disabled={loading || sendingNotification}
              className="w-full"
            >
              <Send className="h-4 w-4 mr-2" />
              {sendingNotification ? 'Sending...' : 'Send Notification'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

