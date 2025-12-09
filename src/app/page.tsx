"use client";

import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/main-layout";
import DashboardHeader from "@/components/dashboard/header";
import HeroAqiCard from "@/components/dashboard/hero-aqi-card";
import AqiTrendChart from "@/components/dashboard/aqi-trend-chart";
import FuturePredictionChart from "@/components/dashboard/future-prediction-chart";
import PollutantDistributionChart from "@/components/dashboard/pollutant-distribution-chart";
import HistoricalComparisonChart from "@/components/dashboard/historical-comparison-chart";
import AiAssistant from "@/components/dashboard/ai-assistant";
import LiveCityRankingWidget from "@/components/dashboard/live-city-ranking-widget";
import ProtectedRoute from "@/components/auth/protected-route";
import { useAuth } from "@/contexts/auth-context";

import { fetchEnhancedAQIByCoordinates, geocodeCity } from "@/lib/api-client";
import type { EnhancedAqiResponse } from "@/lib/api-client";

export default function Home() {
  const { user } = useAuth();
  const [selectedCity, setSelectedCity] = useState<string | null>(null);
  const [selectedCoordinates, setSelectedCoordinates] = useState<{
    lat: number;
    lng: number;
  } | null>(null);
  const [enhancedData, setEnhancedData] = useState<EnhancedAqiResponse | null>(
    null
  );
  const [locationError, setLocationError] = useState<string | null>(null);

  // Initialize with user's city and coordinates on mount
  useEffect(() => {
    if (user && !selectedCity) {
      if (user.city) {
        setSelectedCity(user.city);
        // Use user's coordinates if available, otherwise will use city name lookup
        if (user.latitude && user.longitude) {
          setSelectedCoordinates({
            lat: user.latitude,
            lng: user.longitude,
          });
        }
      }
    }
  }, [user, selectedCity]);

  // Fetch Enhanced AQI Data when coordinates change
  useEffect(() => {
    if (selectedCoordinates) {
      const fetchData = async () => {
        try {
          const data = await fetchEnhancedAQIByCoordinates(
            selectedCoordinates.lat,
            selectedCoordinates.lng
          );
          setEnhancedData(data);
        } catch (err) {
          console.error("Failed to fetch enhanced dashboard data:", err);
        }
      };
      fetchData();
    } else {
      setEnhancedData(null);
    }
  }, [selectedCoordinates]);

  const handleCitySearch = (
    city: string,
    location: { lat: number; lng: number }
  ) => {
    setSelectedCity(city);
    setSelectedCoordinates(location);
    setLocationError(null); // Clear any location errors when user searches
  };

  const handleResetToUserCity = async () => {
    // If user has a city from registration, use that
    if (user?.city) {
      setSelectedCity(user.city);

      // Use user's coordinates if available
      if (user.latitude && user.longitude) {
        setSelectedCoordinates({
          lat: user.latitude,
          lng: user.longitude,
        });
        setLocationError(null); // Clear error on success
      } else {
        // If no coordinates, geocode the city name to get coordinates
        try {
          const geocoded = await geocodeCity(user.city);
          if (geocoded) {
            setSelectedCoordinates({
              lat: geocoded.latitude,
              lng: geocoded.longitude,
            });
            setLocationError(null); // Clear error on success
          } else {
            // If geocoding fails, try to get current location as fallback
            getCurrentLocation();
          }
        } catch (error) {
          console.error("Error geocoding user city:", error);
          // Fallback to current location if geocoding fails
          getCurrentLocation();
        }
      }
    } else {
      // If user has no city from registration, use current location
      getCurrentLocation();
    }
  };

  // Helper function to get current location
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setSelectedCoordinates(coords);
          setLocationError(null); // Clear error on success
          // Set city name to "Current Location" or try to reverse geocode
          setSelectedCity("Current Location");
        },
        (error) => {
          console.error("Error getting current location:", error);
          // If geolocation fails, show error or use default
          setLocationError(
            "Unable to get your location. Please allow location access or search for a city."
          );
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      console.error("Geolocation is not supported by your browser");
      setLocationError(
        "Geolocation is not supported. Please search for a city."
      );
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout onCitySearch={handleCitySearch}>
        <div className="flex flex-col gap-6 md:gap-8 p-4 md:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          <main className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="lg:col-span-3 animate-slide-up">
              <HeroAqiCard
                city={selectedCity || undefined}
                coordinates={selectedCoordinates || undefined}
                onResetToUserCity={handleResetToUserCity}
                isViewingUserCity={selectedCity === user?.city}
              />
            </div>
            <div
              className="lg:col-span-2 animate-slide-up"
              style={{ animationDelay: "0.1s" }}
            >
              <FuturePredictionChart data={enhancedData} />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.15s" }}
            >
              <LiveCityRankingWidget />
            </div>
            <div
              className="lg:col-span-2 animate-slide-up"
              style={{ animationDelay: "0.2s" }}
            >
              <AqiTrendChart data={enhancedData} />
            </div>
            <div
              className="animate-slide-up"
              style={{ animationDelay: "0.25s" }}
            >
              <PollutantDistributionChart data={enhancedData} />
            </div>
            <div
              className="lg:col-span-3 animate-slide-up"
              style={{ animationDelay: "0.3s" }}
            >
              <HistoricalComparisonChart data={enhancedData} />
            </div>
          </main>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}
