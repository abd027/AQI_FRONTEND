import { type ReactNode } from 'react';

export interface Pollutant {
  name: 'PM2.5' | 'PM10' | 'NO₂' | 'O₃' | 'CO' | 'SO₂';
  value: number | null;
  unit: string;
}

export interface Weather {
  temperature?: number;
  humidity?: number;
  wind?: number;
}

export interface AqiData {
  city?: string;  // Optional - may be fetched via reverse geocoding
  aqi: number | null;
  category: 'Good' | 'Moderate' | 'Unhealthy for Sensitive Groups' | 'Unhealthy' | 'Very Unhealthy' | 'Hazardous';
  healthAdvice?: string;
  pollutants: Pollutant[];
  weather?: Weather | null;
  lastUpdated: string;
}

export interface AqiTimePoint {
  time: string;
  aqi: number;
}

export interface PollutantDistribution {
  name: 'PM2.5' | 'PM10' | 'NO₂' | 'O₃' | 'CO' | 'SO₂';
  value: number;
}

export interface HistoricalData {
  period: 'Today' | 'Yesterday' | 'Last Week' | 'Last Month';
  aqi: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: ReactNode;
}

export interface CityRanking {
  rank: number;
  city: string;
  country: string;
  aqi: number;
  category: 'Good' | 'Moderate' | 'Unhealthy' | 'Hazardous';
  dominantPollutant: 'PM2.5' | 'O₃' | 'NO₂';
  trend: { time: string; aqi: number }[];
  lastUpdated: string;
  region: 'Asia' | 'Europe' | 'North America' | 'South America' | 'Africa' | 'Oceania';
  pm25?: number;
  pm10?: number;
  aqi_pm25?: number;
  aqi_pm10?: number;
}

export interface Notification {
  id: string;
  title: string;
  city: string;
  aqi: number;
  timestamp: string;
  type: 'Warning' | 'Info' | 'Critical';
}
