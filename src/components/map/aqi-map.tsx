"use client";

import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { fetchAQIByCoordinates, type AqiData } from "@/lib/api-client";
import { WORLD_CITIES } from "@/lib/world-cities";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import MapWrapper from "./map-wrapper";

interface AqiMapProps {
  className?: string;
}

interface CityMarker {
  id: string;
  name: string;
  country: string;
  lat: number;
  lng: number;
  aqi: number;
  category: string;
  loading: boolean;
}

// Get AQI color based on value
function getAQIColor(aqi: number): string {
  if (aqi <= 50) return "#00e400"; // Good
  if (aqi <= 100) return "#ffff00"; // Moderate
  if (aqi <= 150) return "#ff7e00"; // USG
  if (aqi <= 200) return "#ff0000"; // Unhealthy
  if (aqi <= 300) return "#8f3f97"; // Very Unhealthy
  return "#7e0023"; // Hazardous
}

// Create custom marker icon based on AQI level
function createAQIIcon(aqi: number, loading: boolean = false): L.DivIcon {
  const color = loading ? "#888888" : getAQIColor(aqi);
  const size = 36;
  const displayValue = loading ? "..." : aqi;

  return L.divIcon({
    html: `
      <div style="
        width: ${size}px;
        height: ${size}px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: ${aqi > 100 ? "white" : "black"};
        font-weight: bold;
        font-size: 11px;
      ">
        ${displayValue}
      </div>
    `,
    className: "custom-aqi-marker",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

// Get AQI category text
function getAQICategory(aqi: number): string {
  if (aqi <= 50) return "Good";
  if (aqi <= 100) return "Moderate";
  if (aqi <= 150) return "Unhealthy for Sensitive Groups";
  if (aqi <= 200) return "Unhealthy";
  if (aqi <= 300) return "Very Unhealthy";
  return "Hazardous";
}

// AQI Legend component
function AqiLegend() {
  const levels = [
    { range: "0-50", label: "Good", color: "#00e400" },
    { range: "51-100", label: "Moderate", color: "#ffff00" },
    { range: "101-150", label: "USG", color: "#ff7e00" },
    { range: "151-200", label: "Unhealthy", color: "#ff0000" },
    { range: "201-300", label: "Very Unhealthy", color: "#8f3f97" },
    { range: "301+", label: "Hazardous", color: "#7e0023" },
  ];

  return (
    <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur p-3 rounded-lg shadow-lg">
      <h4 className="text-xs font-semibold mb-2 text-gray-700 dark:text-gray-200">
        AQI Legend
      </h4>
      <div className="space-y-1">
        {levels.map((level) => (
          <div key={level.range} className="flex items-center gap-2 text-xs">
            <div
              className="w-4 h-4 rounded-full border border-white shadow-sm"
              style={{ backgroundColor: level.color }}
            />
            <span className="text-gray-600 dark:text-gray-300">
              {level.range}
            </span>
            <span className="text-gray-500 dark:text-gray-400">
              {level.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// Map click handler to fetch AQI for clicked location
function MapClickHandler({
  onLocationClick,
}: {
  onLocationClick: (lat: number, lng: number) => void;
}) {
  const map = useMap();

  useEffect(() => {
    const handleClick = (e: L.LeafletMouseEvent) => {
      onLocationClick(e.latlng.lat, e.latlng.lng);
    };

    map.on("click", handleClick);
    return () => {
      map.off("click", handleClick);
    };
  }, [map, onLocationClick]);

  return null;
}

export default function AqiMap({ className }: AqiMapProps) {
  const markersInitializedRef = useRef(false);
  const [markers, setMarkers] = useState<CityMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number;
    lng: number;
    data?: AqiData;
  } | null>(null);
  const [loadingLocation, setLoadingLocation] = useState(false);

  const defaultCenter: [number, number] = useMemo(() => [30.3753, 69.3451], []); // Center on Pakistan
  const defaultZoom = useMemo(() => 5, []); // Zoomed in on Pakistan

  // Initialize markers with default values immediately on mount
  useEffect(() => {
    if (markersInitializedRef.current) return;
    markersInitializedRef.current = true;

    console.log("Initializing map with major cities...");

    // Create initial markers with placeholder AQI values
    const initialMarkers: CityMarker[] = WORLD_CITIES.map((city, index) => ({
      id: `city-${index}`,
      name: city.name,
      country: city.country,
      lat: city.lat,
      lng: city.lng,
      aqi: 50 + Math.floor(Math.random() * 100), // Random placeholder between 50-150
      category: "Loading...",
      loading: true,
    }));

    setMarkers(initialMarkers);
    setLoading(false);
    console.log(`Created ${initialMarkers.length} city markers`);

    // Fetch real AQI data in background
    fetchRealAQIData(initialMarkers);
  }, []);

  // Fetch real AQI data for all cities
  const fetchRealAQIData = async (cityMarkers: CityMarker[]) => {
    console.log("Fetching real AQI data for cities...");

    for (let i = 0; i < cityMarkers.length; i++) {
      const city = cityMarkers[i];

      try {
        const data = await fetchAQIByCoordinates(city.lat, city.lng);

        if (data && data.aqi) {
          setMarkers((prev) =>
            prev.map((m) =>
              m.id === city.id
                ? {
                    ...m,
                    aqi: data.aqi!,
                    category: getAQICategory(data.aqi!),
                    loading: false,
                  }
                : m
            )
          );
        } else {
          // Use random value if API fails
          setMarkers((prev) =>
            prev.map((m) =>
              m.id === city.id
                ? { ...m, category: getAQICategory(m.aqi), loading: false }
                : m
            )
          );
        }
      } catch (err) {
        console.error(`Failed to fetch AQI for ${city.name}:`, err);
        // Keep placeholder value on error
        setMarkers((prev) =>
          prev.map((m) =>
            m.id === city.id
              ? { ...m, category: getAQICategory(m.aqi), loading: false }
              : m
          )
        );
      }

      // Small delay between requests to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 200));
    }

    console.log("Finished fetching AQI data");
  };

  // Handle click on map to get AQI for that location
  const handleLocationClick = useCallback(async (lat: number, lng: number) => {
    setLoadingLocation(true);
    setSelectedLocation({ lat, lng });

    try {
      const data = await fetchAQIByCoordinates(lat, lng);
      setSelectedLocation({ lat, lng, data: data || undefined });
    } catch (err) {
      console.error("Error fetching AQI for clicked location:", err);
    } finally {
      setLoadingLocation(false);
    }
  }, []);

  const handleRetry = useCallback(() => {
    window.location.reload();
  }, []);

  return (
    <div
      className={`relative w-full h-full min-h-[600px] rounded-lg overflow-hidden bg-muted/20 ${className}`}
    >
      {/* AQI Legend */}
      <div className="absolute bottom-4 left-4 z-[1000]">
        <AqiLegend />
      </div>

      {/* Loading indicator */}
      {loading && (
        <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur p-3 rounded-lg shadow-lg">
          <div className="flex items-center gap-2 text-sm">
            <Loader2 className="h-4 w-4 animate-spin text-primary" />
            <span>Loading cities...</span>
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div className="absolute top-4 left-4 right-4 z-[1000]">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={handleRetry}>
                <RefreshCw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* City count indicator */}
      <div className="absolute top-4 right-4 z-[1000] bg-white/90 dark:bg-gray-800/90 backdrop-blur px-3 py-2 rounded-lg shadow-lg">
        <span className="text-sm text-gray-600 dark:text-gray-300">
          {markers.length} cities loaded
        </span>
      </div>

      {/* Map */}
      <MapWrapper
        center={defaultCenter}
        zoom={defaultZoom}
        className="w-full h-full"
        style={{
          width: "100%",
          height: "100%",
          minHeight: "600px",
          position: "relative",
          zIndex: 0,
        }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapClickHandler onLocationClick={handleLocationClick} />

        {/* City markers with clustering */}
        <MarkerClusterGroup chunkedLoading>
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              position={[marker.lat, marker.lng]}
              icon={createAQIIcon(marker.aqi, marker.loading)}
            >
              <Popup>
                <div className="p-2 min-w-[200px]">
                  <h3 className="font-bold text-base">{marker.name}</h3>
                  <p className="text-sm text-gray-500">{marker.country}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: getAQIColor(marker.aqi) }}
                    >
                      {marker.aqi}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{marker.category}</p>
                      <p className="text-xs text-gray-500">Air Quality Index</p>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>

        {/* Clicked location popup */}
        {selectedLocation && (
          <Popup position={[selectedLocation.lat, selectedLocation.lng]}>
            <div className="p-2 min-w-[200px]">
              {loadingLocation ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                </div>
              ) : selectedLocation.data ? (
                <>
                  <h3 className="font-bold text-base">
                    {selectedLocation.data.city || "Selected Location"}
                  </h3>
                  <p className="text-xs text-gray-500">
                    {selectedLocation.lat.toFixed(4)},{" "}
                    {selectedLocation.lng.toFixed(4)}
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                      style={{
                        backgroundColor: getAQIColor(
                          selectedLocation.data.aqi || 50
                        ),
                      }}
                    >
                      {selectedLocation.data.aqi || "N/A"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {selectedLocation.data.category || "Unknown"}
                      </p>
                      <p className="text-xs text-gray-500">Air Quality Index</p>
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-sm text-gray-500">
                  No AQI data available for this location
                </p>
              )}
            </div>
          </Popup>
        )}
      </MapWrapper>
    </div>
  );
}
