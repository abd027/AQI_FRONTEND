'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/auth-context';
import ProtectedRoute from '@/components/auth/protected-route';
import MainLayout from '@/components/layout/main-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle, CheckCircle2, Home, Thermometer, Droplets, Wind, Activity, ChevronLeft, ChevronRight, RefreshCw } from 'lucide-react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface SensorReading {
  id: number;
  received_at: string;
  temperature: number | null;
  humidity: number | null;
  co_ppm: number | null;
  co2_ppm: number | null;
  ch4_ppm: number | null;
  calculated_aqi: number | null;
  aqi_category: string | null;
  aqi_color: string | null;
  dominant_pollutant: string | null;
}

interface MQTTConfig {
  id?: number;
  host: string;
  port: number;
  topic: string;
  username: string;
  password: string;
  client_id: string;
  is_active: boolean;
}

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

export default function MyRoomPage() {
  const { user } = useAuth();
  const [readings, setReadings] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<MQTTConfig>({
    host: '127.0.0.1',
    port: 1883,
    topic: 'sensor/data',
    username: '',
    password: '',
    client_id: '',
    is_active: true,
  });
  const [configLoading, setConfigLoading] = useState(true);
  const [configSaving, setConfigSaving] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);
  const [configSuccess, setConfigSuccess] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(5);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);

  // Fetch sensor readings
  const fetchReadings = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_BASE_URL}/api/sensor-readings/`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch sensor readings');
      }

      const data = await response.json();
      setReadings(data.results || data);
    } catch (err: any) {
      setError(err.message || 'Failed to load sensor readings');
    } finally {
      setLoading(false);
    }
  };

  // Fetch MQTT configuration
  const fetchConfig = async () => {
    try {
      setConfigLoading(true);
      setConfigError(null);
      const response = await fetch(`${API_BASE_URL}/api/mqtt-config/`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch MQTT configuration');
      }

      const data = await response.json();
      setConfig({
        host: data.host || '127.0.0.1',
        port: data.port || 1883,
        topic: data.topic || 'sensor/data',
        username: data.username || '',
        password: data.password === '***' ? '' : (data.password || ''),
        client_id: data.client_id || '',
        is_active: data.is_active !== undefined ? data.is_active : true,
      });
    } catch (err: any) {
      setConfigError(err.message || 'Failed to load MQTT configuration');
    } finally {
      setConfigLoading(false);
    }
  };

  // Save MQTT configuration
  const saveConfig = async () => {
    try {
      setConfigSaving(true);
      setConfigError(null);
      setConfigSuccess(false);

      const response = await fetch(`${API_BASE_URL}/api/mqtt-config/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(config),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to save MQTT configuration');
      }

      setConfigSuccess(true);
      setTimeout(() => setConfigSuccess(false), 3000);
    } catch (err: any) {
      setConfigError(err.message || 'Failed to save MQTT configuration');
    } finally {
      setConfigSaving(false);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchReadings();
      fetchConfig();
    }
  }, [user]);

  // Auto-refresh every 25 seconds
  useEffect(() => {
    if (!user || !autoRefreshEnabled) return;

    const intervalId = setInterval(() => {
      fetchReadings();
    }, 25000); // 25 seconds

    return () => clearInterval(intervalId);
  }, [user, autoRefreshEnabled]);

  // Format timestamp
  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Get AQI badge style
  const getAQIBadgeStyle = (aqi: number | null, color: string | null) => {
    if (!aqi || !color) return {};
    return {
      backgroundColor: color,
      color: '#fff',
    };
  };

  // Pagination calculations
  const indexOfLastReading = currentPage * itemsPerPage;
  const indexOfFirstReading = indexOfLastReading - itemsPerPage;
  const currentReadings = readings.slice(indexOfFirstReading, indexOfLastReading);
  const totalPages = Math.ceil(readings.length / itemsPerPage);

  const goToNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages));
  };

  const goToPreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1));
  };

  return (
    <ProtectedRoute>
      <MainLayout>
        <div className="flex flex-col gap-4 md:gap-6 p-4 md:p-6 lg:p-8">
          <header className="animate-slide-up flex-shrink-0">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              <Home className="h-6 w-6" />
              My Room
            </h1>
            <p className="text-muted-foreground text-sm md:text-base">
              Monitor your room's air quality from sensor data
            </p>
          </header>

          <div className="grid gap-6 lg:grid-cols-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {/* MQTT Configuration */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>MQTT Configuration</CardTitle>
                  <CardDescription>
                    Configure your MQTT broker connection
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {configLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : (
                    <>
                      {configError && (
                        <Alert variant="destructive">
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>{configError}</AlertDescription>
                        </Alert>
                      )}
                      {configSuccess && (
                        <Alert>
                          <CheckCircle2 className="h-4 w-4" />
                          <AlertDescription>Configuration saved successfully!</AlertDescription>
                        </Alert>
                      )}

                      <div className="space-y-2">
                        <Label htmlFor="host">Host / IP Address *</Label>
                        <Input
                          id="host"
                          value={config.host}
                          onChange={(e) => setConfig({ ...config, host: e.target.value })}
                          placeholder="127.0.0.1"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="port">Port *</Label>
                        <Input
                          id="port"
                          type="number"
                          value={config.port}
                          onChange={(e) => setConfig({ ...config, port: parseInt(e.target.value) || 1883 })}
                          placeholder="1883"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="topic">Topic *</Label>
                        <Input
                          id="topic"
                          value={config.topic}
                          onChange={(e) => setConfig({ ...config, topic: e.target.value })}
                          placeholder="sensor/data"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="username">Username (optional)</Label>
                        <Input
                          id="username"
                          value={config.username}
                          onChange={(e) => setConfig({ ...config, username: e.target.value })}
                          placeholder="MQTT username"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="password">Password (optional)</Label>
                        <Input
                          id="password"
                          type="password"
                          value={config.password}
                          onChange={(e) => setConfig({ ...config, password: e.target.value })}
                          placeholder="MQTT password"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="client_id">Client ID (optional)</Label>
                        <Input
                          id="client_id"
                          value={config.client_id}
                          onChange={(e) => setConfig({ ...config, client_id: e.target.value })}
                          placeholder="MQTT client ID"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="is_active"
                          checked={config.is_active}
                          onChange={(e) => setConfig({ ...config, is_active: e.target.checked })}
                          className="rounded border-gray-300"
                        />
                        <Label htmlFor="is_active" className="cursor-pointer">
                          Active
                        </Label>
                      </div>

                      <Button
                        onClick={saveConfig}
                        disabled={configSaving}
                        className="w-full"
                      >
                        {configSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          'Save Configuration'
                        )}
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Sensor Readings */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sensor Readings</CardTitle>
                      <CardDescription>
                        Latest sensor data from your MQTT broker
                      </CardDescription>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
                        className={autoRefreshEnabled ? 'bg-primary/10' : ''}
                      >
                        <RefreshCw className={`h-4 w-4 ${autoRefreshEnabled ? 'animate-spin' : ''}`} />
                        <span className="ml-2">{autoRefreshEnabled ? 'Auto' : 'Manual'}</span>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : error ? (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  ) : readings.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      No sensor readings available yet. Make sure your MQTT listener is running.
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {currentReadings.map((reading) => (
                        <Card key={reading.id} className="border">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between mb-4">
                              <div>
                                <p className="text-sm text-muted-foreground">
                                  {formatTimestamp(reading.received_at)}
                                </p>
                              </div>
                              {reading.calculated_aqi !== null && (
                                <div
                                  className="px-3 py-1 rounded-full text-sm font-semibold"
                                  style={getAQIBadgeStyle(reading.calculated_aqi, reading.aqi_color || null)}
                                >
                                  AQI: {reading.calculated_aqi} - {reading.aqi_category || 'Unknown'}
                                </div>
                              )}
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                              {reading.temperature !== null && (
                                <div className="flex items-center gap-2">
                                  <Thermometer className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Temperature</p>
                                    <p className="text-lg font-semibold">{reading.temperature.toFixed(1)}°C</p>
                                  </div>
                                </div>
                              )}

                              {reading.humidity !== null && (
                                <div className="flex items-center gap-2">
                                  <Droplets className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">Humidity</p>
                                    <p className="text-lg font-semibold">{reading.humidity.toFixed(1)}%</p>
                                  </div>
                                </div>
                              )}

                              {reading.co_ppm !== null && (
                                <div className="flex items-center gap-2">
                                  <Wind className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">CO</p>
                                    <p className="text-lg font-semibold">{reading.co_ppm.toFixed(2)} ppm</p>
                                  </div>
                                </div>
                              )}

                              {reading.co2_ppm !== null && (
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">CO₂</p>
                                    <p className="text-lg font-semibold">{reading.co2_ppm.toFixed(2)} ppm</p>
                                  </div>
                                </div>
                              )}
                            </div>

                            {reading.ch4_ppm !== null && (
                              <div className="mt-4 pt-4 border-t">
                                <div className="flex items-center gap-2">
                                  <Activity className="h-4 w-4 text-muted-foreground" />
                                  <div>
                                    <p className="text-xs text-muted-foreground">CH₄ (Methane)</p>
                                    <p className="text-lg font-semibold">{reading.ch4_ppm.toFixed(2)} ppm</p>
                                  </div>
                                </div>
                              </div>
                            )}

                            {reading.dominant_pollutant && (
                              <div className="mt-4 pt-4 border-t">
                                <p className="text-xs text-muted-foreground">
                                  Dominant Pollutant: <span className="font-semibold">{reading.dominant_pollutant}</span>
                                </p>
                              </div>
                            )}      
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}

                  {!loading && readings.length > 0 && (
                    <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="text-sm text-muted-foreground">
                        Showing {indexOfFirstReading + 1}-{Math.min(indexOfLastReading, readings.length)} of {readings.length} readings
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToPreviousPage}
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          Previous
                        </Button>
                        
                        <div className="text-sm font-medium px-4">
                          Page {currentPage} of {totalPages}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={goToNextPage}
                          disabled={currentPage === totalPages}
                        >
                          Next
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}


