import type { AqiData, AqiTimePoint, PollutantDistribution, HistoricalData } from './types';
import type React from 'react';

export const getAqiColor = (aqi: number): string => {
  if (aqi <= 50) return 'text-primary';
  if (aqi <= 100) return 'text-yellow-500';
  if (aqi <= 150) return 'text-orange-500';
  if (aqi <= 200) return 'text-red-500';
  if (aqi <= 300) return 'text-purple-500';
  return 'text-red-700';
};

export const getAqiRingColor = (aqi: number): string => {
  if (aqi <= 50) return 'stroke-primary';
  if (aqi <= 100) return 'stroke-yellow-500';
  if (aqi <= 150) return 'stroke-orange-500';
  if (aqi <= 200) return 'stroke-red-500';
  if (aqi <= 300) return 'stroke-purple-500';
  return 'stroke-red-700';
};

/**
 * Get AQI color from hex color code (from backend)
 * Returns a style object with the color
 */
export const getAqiColorFromHex = (hexColor?: string): string => {
  if (!hexColor) return 'text-primary';
  
  // Map hex colors to Tailwind classes
  const colorMap: Record<string, string> = {
    '#00E400': 'text-green-500',      // Good
    '#FFFF00': 'text-yellow-500',      // Moderate
    '#FF7E00': 'text-orange-500',      // Unhealthy for Sensitive Groups
    '#FF0000': 'text-red-500',         // Unhealthy
    '#8F3F97': 'text-purple-500',      // Very Unhealthy
    '#7E0023': 'text-red-700',         // Hazardous
  };
  
  return colorMap[hexColor] || 'text-primary';
};

/**
 * Get inline style for AQI color from hex code
 */
export const getAqiStyleFromHex = (hexColor?: string): React.CSSProperties => {
  if (!hexColor) return { color: 'inherit' };
  return { color: hexColor };
};

/**
 * Get AQI category name from AQI value
 */
export const getAqiCategoryName = (aqi: number): string => {
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
};

export const mainAqiData: AqiData = {
  city: "New York",
  aqi: 42,
  category: "Good",
  healthAdvice: "Air quality is good. It's a great day to be active outside.",
  pollutants: [
    { name: 'PM2.5', value: 8.7, unit: 'µg/m³' },
    { name: 'PM10', value: 12.1, unit: 'µg/m³' },
    { name: 'NO₂', value: 15.3, unit: 'ppb' },
    { name: 'O₃', value: 30.5, unit: 'ppb' },
    { name: 'CO', value: 0.4, unit: 'ppm' },
    { name: 'SO₂', value: 1.2, unit: 'ppb' },
  ],
  weather: {
    temperature: 22,
    humidity: 55,
    wind: 10,
  },
  lastUpdated: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
};

export const aqiTrendData: AqiTimePoint[] = [
  { time: "12 AM", aqi: 45 }, { time: "3 AM", aqi: 48 }, { time: "6 AM", aqi: 50 },
  { time: "9 AM", aqi: 55 }, { time: "12 PM", aqi: 60 }, { time: "3 PM", aqi: 58 },
  { time: "6 PM", aqi: 52 }, { time: "9 PM", aqi: 48 },
];

export const futurePredictionData: AqiTimePoint[] = [
  { time: "12 AM", aqi: 45 }, { time: "3 AM", aqi: 48 }, { time: "6 AM", aqi: 50 },
  { time: "9 AM", aqi: 55 }, { time: "12 PM", aqi: 60 }, { time: "3 PM", aqi: 58 },
  { time: "6 PM", aqi: 52 }, { time: "9 PM", aqi: 48 },
  { time: "Next 3H", aqi: 46 }, { time: "Next 6H", aqi: 44 }, { time: "Next 12H", aqi: 42 },
  { time: "Next 24H", aqi: 40 },
];

export const pollutantDistributionData: PollutantDistribution[] = [
  { name: 'PM2.5', value: 25 },
  { name: 'PM10', value: 15 },
  { name: 'O₃', value: 40 },
  { name: 'NO₂', value: 10 },
  { name: 'SO₂', value: 5 },
  { name: 'CO', value: 5 },
];

export const historicalComparisonData: HistoricalData[] = [
  { period: 'Today', aqi: 42 },
  { period: 'Yesterday', aqi: 55 },
  { period: 'Last Week', aqi: 68 },
  { period: 'Last Month', aqi: 75 },
];
