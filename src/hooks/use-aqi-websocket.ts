'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const WS_BASE_URL = API_BASE_URL.replace('http://', 'ws://').replace('https://', 'wss://');

export interface AQIUpdateData {
  type: 'aqi_update' | 'heartbeat' | 'error' | 'pong';
  city?: string;
  country?: string;
  data?: any;
  timestamp?: number;
  message?: string;
}

export interface UseAQIWebSocketOptions {
  autoConnect?: boolean;
  onUpdate?: (data: AQIUpdateData) => void;
  onError?: (error: Event) => void;
}

export function useAQIWebSocket(options: UseAQIWebSocketOptions = {}) {
  const { autoConnect = true, onUpdate, onError } = options;
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttempts = useRef(0);
  const maxReconnectAttempts = 5;
  const reconnectDelay = 3000; // 3 seconds
  const connectingRef = useRef(false); // Prevent multiple simultaneous connections
  const onUpdateRef = useRef(onUpdate);
  const onErrorRef = useRef(onError);
  const subscribedCitiesRef = useRef<Record<string, { city: string; country: string; lat: number; lon: number }>>({});
  
  // Keep refs updated
  useEffect(() => {
    onUpdateRef.current = onUpdate;
    onErrorRef.current = onError;
  }, [onUpdate, onError]);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connections
    if (connectingRef.current) {
      return;
    }
    
    if (!user) {
      return;
    }
    
    // Check if already connected or connecting
    if (wsRef.current) {
      const state = wsRef.current.readyState;
      if (state === WebSocket.OPEN || state === WebSocket.CONNECTING) {
        return;
      }
      // Clean up closed connections
      if (state === WebSocket.CLOSING || state === WebSocket.CLOSED) {
        wsRef.current = null;
      }
    }

    connectingRef.current = true;

    try {
      // Get token from localStorage
      const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;
      if (!token) {
        setError('Authentication required');
        connectingRef.current = false;
        return;
      }

      const wsUrl = `${WS_BASE_URL}/ws/aqi/live/?token=${token}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        connectingRef.current = false;
        setIsConnected(true);
        setError(null);
        reconnectAttempts.current = 0;
        console.log('WebSocket connected');
        
        // Resubscribe to all previously subscribed cities after reconnection
        const subscribedCities = Object.values(subscribedCitiesRef.current);
        if (subscribedCities.length > 0) {
          subscribedCities.forEach((cityInfo) => {
            ws.send(JSON.stringify({
              type: 'subscribe',
              city: cityInfo.city,
              country: cityInfo.country,
              lat: cityInfo.lat,
              lon: cityInfo.lon,
            }));
          });
        }
      };

      ws.onmessage = (event) => {
        try {
          const data: AQIUpdateData = JSON.parse(event.data);
          
          if (data.type === 'pong') {
            // Handle pong response
            return;
          }
          
          if (onUpdateRef.current) {
            onUpdateRef.current(data);
          }
        } catch (err) {
          console.error('Error parsing WebSocket message:', err);
        }
      };

      ws.onerror = (event) => {
        connectingRef.current = false;
        console.error('WebSocket error:', event);
        setError('WebSocket connection error');
        if (onErrorRef.current) {
          onErrorRef.current(event);
        }
      };

      ws.onclose = (event) => {
        connectingRef.current = false;
        setIsConnected(false);
        console.log('WebSocket disconnected', event.code, event.reason);
        
        // Only reconnect if it wasn't a manual close (code 1000) or unauthorized (4001)
        if (event.code !== 1000 && event.code !== 4001 && user) {
          // Attempt to reconnect
          if (reconnectAttempts.current < maxReconnectAttempts) {
            reconnectAttempts.current++;
            reconnectTimeoutRef.current = setTimeout(() => {
              connect();
            }, reconnectDelay);
          } else {
            setError('Failed to reconnect. Please refresh the page.');
          }
        }
      };

      wsRef.current = ws;
    } catch (err) {
      connectingRef.current = false;
      console.error('Error connecting WebSocket:', err);
      setError('Failed to connect to WebSocket');
    }
  }, [user]);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    
    if (wsRef.current) {
      // Close with code 1000 (normal closure) to prevent reconnection
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    connectingRef.current = false;
    setIsConnected(false);
    reconnectAttempts.current = 0;
  }, []);

  const subscribe = useCallback((city: string, country: string, lat: number, lon: number) => {
    const cityKey = `${city}_${country}`.toLowerCase();
    
    // Store subscription for reconnection
    subscribedCitiesRef.current[cityKey] = { city, country, lat, lon };
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        city,
        country,
        lat,
        lon,
      }));
      return true;
    }
    return false;
  }, []);

  const unsubscribe = useCallback((city: string, country: string) => {
    const cityKey = `${city}_${country}`.toLowerCase();
    
    // Remove from stored subscriptions
    delete subscribedCitiesRef.current[cityKey];
    
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        city,
        country,
      }));
    }
  }, []);

  const sendPing = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: 'ping' }));
    }
  }, []);

  useEffect(() => {
    if (autoConnect && user) {
      // Small delay to prevent rapid reconnections in React Strict Mode
      const timeoutId = setTimeout(() => {
        connect();
      }, 200);

      return () => {
        clearTimeout(timeoutId);
        disconnect();
      };
    }

    return () => {
      disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoConnect, user]); // Intentionally exclude connect/disconnect to prevent loops

  return {
    isConnected,
    error,
    connect,
    disconnect,
    subscribe,
    unsubscribe,
    sendPing,
  };
}

