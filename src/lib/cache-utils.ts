/**
 * Cache utilities for AQI data
 * Provides in-memory LRU cache and localStorage persistence with TTL
 */

const CACHE_PREFIX = 'aqi_cache_';
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes in milliseconds
const MAX_CACHE_SIZE = 1000; // Maximum entries in memory cache

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

/**
 * In-memory LRU cache for AQI data
 */
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number = MAX_CACHE_SIZE) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    // Move to end (most recently used)
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    if (this.cache.has(key)) {
      // Update existing
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // Remove least recently used (first item)
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  delete(key: K): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// Global in-memory cache
const memoryCache = new LRUCache<string, any>(MAX_CACHE_SIZE);

/**
 * Generate cache key from coordinates
 */
export function getCacheKey(lat: number, lng: number): string {
  return `${lat.toFixed(4)},${lng.toFixed(4)}`;
}

/**
 * Get data from cache (checks both memory and localStorage)
 */
export function getCachedData<T>(key: string): T | null {
  // Check memory cache first
  const memoryData = memoryCache.get(key);
  if (memoryData) {
    return memoryData as T;
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (stored) {
      const entry: CacheEntry<T> = JSON.parse(stored);
      const now = Date.now();
      
      // Check if expired
      if (now - entry.timestamp < CACHE_TTL) {
        // Still valid, move to memory cache and return
        memoryCache.set(key, entry.data);
        return entry.data;
      } else {
        // Expired, remove from localStorage
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      }
    }
  } catch (error) {
    console.warn('Error reading from localStorage cache:', error);
  }

  return null;
}

/**
 * Set data in cache (both memory and localStorage)
 */
export function setCachedData<T>(key: string, data: T): void {
  // Store in memory cache
  memoryCache.set(key, data);

  // Store in localStorage
  try {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
    };
    localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(entry));
  } catch (error) {
    // localStorage might be full or disabled
    console.warn('Error writing to localStorage cache:', error);
    // Try to clean up old entries
    try {
      const keys = Object.keys(localStorage);
      const cacheKeys = keys.filter(k => k.startsWith(CACHE_PREFIX));
      if (cacheKeys.length > MAX_CACHE_SIZE) {
        // Remove oldest entries
        const sorted = cacheKeys
          .map(k => ({
            key: k,
            timestamp: JSON.parse(localStorage.getItem(k) || '{}').timestamp || 0,
          }))
          .sort((a, b) => a.timestamp - b.timestamp);
        
        // Remove oldest 10%
        const toRemove = Math.floor(sorted.length * 0.1);
        for (let i = 0; i < toRemove; i++) {
          localStorage.removeItem(sorted[i].key);
        }
      }
    } catch (cleanupError) {
      console.warn('Error cleaning up localStorage:', cleanupError);
    }
  }
}

/**
 * Check if key exists in cache and is not expired
 */
export function hasCachedData(key: string): boolean {
  // Check memory cache
  if (memoryCache.has(key)) {
    return true;
  }

  // Check localStorage
  try {
    const stored = localStorage.getItem(`${CACHE_PREFIX}${key}`);
    if (stored) {
      const entry: CacheEntry<any> = JSON.parse(stored);
      const now = Date.now();
      
      if (now - entry.timestamp < CACHE_TTL) {
        return true;
      } else {
        // Expired, remove
        localStorage.removeItem(`${CACHE_PREFIX}${key}`);
      }
    }
  } catch (error) {
    // Ignore errors
  }

  return false;
}

/**
 * Clear all cache data
 */
export function clearCache(): void {
  memoryCache.clear();
  try {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Error clearing localStorage cache:', error);
  }
}

/**
 * Clean up expired entries from localStorage
 */
export function cleanupExpiredCache(): void {
  try {
    const keys = Object.keys(localStorage);
    const now = Date.now();
    let cleaned = 0;

    keys.forEach(key => {
      if (key.startsWith(CACHE_PREFIX)) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const entry: CacheEntry<any> = JSON.parse(stored);
            if (now - entry.timestamp >= CACHE_TTL) {
              localStorage.removeItem(key);
              cleaned++;
            }
          }
        } catch (error) {
          // Invalid entry, remove it
          localStorage.removeItem(key);
          cleaned++;
        }
      }
    });

    if (cleaned > 0) {
      console.log(`Cleaned up ${cleaned} expired cache entries`);
    }
  } catch (error) {
    console.warn('Error cleaning up expired cache:', error);
  }
}

// Clean up expired entries on module load
if (typeof window !== 'undefined') {
  cleanupExpiredCache();
  // Clean up every 10 minutes
  setInterval(cleanupExpiredCache, 10 * 60 * 1000);
}



