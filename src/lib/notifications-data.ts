
import type { Notification } from './types';

export const notificationsData: Notification[] = [
  {
    id: '1',
    title: 'Unhealthy AQI Detected',
    city: 'Lahore',
    aqi: 178,
    timestamp: '5m ago',
    type: 'Critical',
  },
  {
    id: '2',
    title: 'Air Quality Improving',
    city: 'Sydney',
    aqi: 45,
    timestamp: '15m ago',
    type: 'Info',
  },
  {
    id: '3',
    title: 'Moderate Pollution Alert',
    city: 'Mexico City',
    aqi: 105,
    timestamp: '30m ago',
    type: 'Warning',
  },
  {
    id: '4',
    title: 'Hazardous Conditions',
    city: 'Delhi',
    aqi: 250,
    timestamp: '45m ago',
    type: 'Critical',
  },
  {
    id: '5',
    title: 'Good Air Quality',
    city: 'London',
    aqi: 30,
    timestamp: '1h ago',
    type: 'Info',
  },
    {
    id: '6',
    title: 'Pollution Spike Recorded',
    city: 'Jakarta',
    aqi: 155,
    timestamp: '2h ago',
    type: 'Warning',
  },
  {
    id: '7',
    title: 'Air Quality Normalizing',
    city: 'Los Angeles',
    aqi: 60,
    timestamp: '3h ago',
    type: 'Info',
  },
];
