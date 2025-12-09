"use client";

import { useRef, useEffect, useLayoutEffect, useState, useCallback, type ReactNode } from "react";
import { MapContainer, type MapContainerProps } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapWrapperProps extends Omit<MapContainerProps, "children"> {
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

// Global counter to ensure unique map instances across component remounts
let mapInstanceCounter = 0;

/**
 * Cleanup function to remove Leaflet map from a DOM element and all its children
 * This is necessary because MapContainer creates its own internal div
 */
function cleanupLeafletMap(element: HTMLElement | null) {
  if (!element) return;
  
  // Check the element itself
  const leafletId = (element as any)._leaflet_id;
  if (leafletId) {
    try {
      const existingMap = (L.Map as any).get?.(leafletId);
      if (existingMap && typeof existingMap.remove === 'function') {
        existingMap.remove();
      }
    } catch (e) {
      // Ignore cleanup errors
    }
    delete (element as any)._leaflet_id;
  }
  
  // Check all direct children for Leaflet map instances
  // MapContainer creates a div that will have the map instance
  Array.from(element.children).forEach((child) => {
    const childElement = child as HTMLElement;
    const childLeafletId = (childElement as any)._leaflet_id;
    if (childLeafletId) {
      try {
        const childMap = (L.Map as any).get?.(childLeafletId);
        if (childMap && typeof childMap.remove === 'function') {
          childMap.remove();
        }
      } catch (e) {
        // Ignore cleanup errors
      }
      delete (childElement as any)._leaflet_id;
    }
  });
}

/**
 * MapWrapper component that safely handles Leaflet map initialization
 * and prevents duplicate initialization errors in React 18 Strict Mode.
 * 
 * This wrapper ensures that:
 * 1. Map is only initialized once, even with React 18 Strict Mode double mounting
 * 2. Proper cleanup occurs on unmount
 * 3. No duplicate map instances are created
 */
export default function MapWrapper({
  children,
  className,
  style,
  ...mapProps
}: MapWrapperProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const mountCountRef = useRef(0);
  const [mapKey, setMapKey] = useState(() => {
    mountCountRef.current++;
    return `map-${mapInstanceCounter++}-${mountCountRef.current}-${Date.now()}`;
  });
  const [isReady, setIsReady] = useState(false);

  // Container ref callback - clean up on mount/unmount
  const setContainerRef = useCallback((node: HTMLDivElement | null) => {
    if (node) {
      // Clean up any existing maps before setting the ref
      cleanupLeafletMap(node);
      containerRef.current = node;
    } else {
      containerRef.current = null;
    }
  }, []);

  // Use layout effect to clean up synchronously before render
  // This runs synchronously after DOM mutations but before browser paint
  useLayoutEffect(() => {
    if (!isReady || !containerRef.current) return;
    
    // Only clean up if we don't have a map instance yet
    // This prevents cleaning up the map after it's been created
    if (!mapInstanceRef.current) {
      // Clean up any existing maps in the container and its children
      // This must happen synchronously before MapContainer tries to initialize
      cleanupLeafletMap(containerRef.current);
      
      // Also clean up any leaflet-container divs that don't have a valid map
      const leafletContainers = containerRef.current.querySelectorAll('.leaflet-container');
      leafletContainers.forEach((container) => {
        const element = container as HTMLElement;
        const leafletId = (element as any)._leaflet_id;
        if (leafletId) {
          try {
            const existingMap = (L.Map as any).get?.(leafletId);
            // Only remove if it's not our current map instance
            if (existingMap && existingMap !== mapInstanceRef.current) {
              existingMap.remove();
              delete (element as any)._leaflet_id;
            }
          } catch (e) {
            // Ignore errors
          }
        }
      });
    }
  }, [isReady, mapKey]);

  // Initialize - check browser environment
  useEffect(() => {
    if (typeof window === "undefined") return;

    // Clean up container before initializing
    if (containerRef.current) {
      cleanupLeafletMap(containerRef.current);
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      setIsReady(true);
    }, 0);

    return () => {
      clearTimeout(timer);
      setIsReady(false);
      // On unmount, force a new key for the next mount to ensure fresh container
      // Use setTimeout to avoid state updates during unmount
      setTimeout(() => {
        setMapKey(`map-${mapInstanceCounter++}-${++mountCountRef.current}-${Date.now()}`);
      }, 0);
    };
  }, [mapKey]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clean up map instance
      if (mapInstanceRef.current) {
        try {
          const map = mapInstanceRef.current;
          mapInstanceRef.current = null;
          if (map && typeof map.remove === 'function') {
            map.remove();
          }
        } catch (e) {
          // Ignore cleanup errors - map may already be removed
        }
      }
      
      // Clean up any maps on the container element
      if (containerRef.current) {
        cleanupLeafletMap(containerRef.current);
      }
    };
  }, []);

  // Handle map creation callback - prevents duplicate instances
  const handleMapCreated = useCallback((mapInstance: L.Map) => {
    // If we already have a map instance, remove the duplicate
    if (mapInstanceRef.current) {
      if (mapInstanceRef.current !== mapInstance) {
        try {
          if (mapInstance && typeof mapInstance.remove === 'function') {
            mapInstance.remove();
          }
        } catch (e) {
          // Ignore cleanup errors
        }
      }
      return;
    }

    // Store the map instance
    mapInstanceRef.current = mapInstance;
    
    // Invalidate size to ensure map renders correctly
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      try {
        mapInstance.invalidateSize();
      } catch (e) {
        // Ignore errors
      }
    }, 100);
  }, []);



  // Use a layout effect to clean up right before render
  useLayoutEffect(() => {
    if (!isReady) return;
    
    // Find and clean up any leaflet containers in the entire document that might be orphaned
    // This is a last resort to catch any containers that weren't cleaned up
    const allLeafletContainers = document.querySelectorAll('.leaflet-container');
    allLeafletContainers.forEach((container) => {
      const element = container as HTMLElement;
      const leafletId = (element as any)._leaflet_id;
      if (leafletId && containerRef.current && !containerRef.current.contains(element)) {
        // This is an orphaned container, clean it up
        try {
          const existingMap = (L.Map as any).get?.(leafletId);
          if (existingMap) {
            existingMap.remove();
          }
        } catch (e) {
          // Ignore errors
        }
        delete (element as any)._leaflet_id;
      }
    });
  }, [isReady, mapKey]);

  // Don't render map until ready (browser check passed)
  if (!isReady) {
    return (
      <div
        ref={setContainerRef}
        className={className}
        style={style}
        aria-label="Loading map..."
      />
    );
  }

  return (
    <div ref={setContainerRef} className={className} style={style}>
      <div 
        key={mapKey} 
        style={{ width: "100%", height: "100%", position: "relative" }}
      >
        <MapContainer
          {...mapProps}
          ref={handleMapCreated}
          style={{ width: "100%", height: "100%" }}
        >
          {children}
        </MapContainer>
      </div>
    </div>
  );
}

