// =============================================================================
// Weather Service — Production-Grade Weather Data with Offline Support
//
// Architecture:
//   fetchWeather(lat, lng) → IndexedDB Cache Check →
//   AbortController Timeout → Retry with Backoff → Fallback Chain
//
// Key upgrades:
//   ✓ SSR-safe navigator.onLine guard
//   ✓ AbortController timeout on all fetch calls (10s default)
//   ✓ Retry with exponential backoff for transient failures
//   ✓ In-flight request deduplication (same coords = one API call)
//   ✓ Input validation (lat/lng range checks)
//   ✓ Explicit forecast_days parameter
//   ✓ Fixed mock data (is_day time-of-day aware, correct date formats)
//   ✓ Configurable cache TTL via environment
//   ✓ Generic fallback place name (not hardcoded 'Satara')
//   ✓ Extended WeatherData interface with optional fields
// =============================================================================

import { Language } from '../types';
import { OfflineDB } from '../utils/offlineDb';

// ─── Configuration ───────────────────────────────────────────────────────────
const CONFIG = {
  CACHE_TTL_MS:
    parseInt(process.env.WEATHER_CACHE_TTL_MINUTES || '90', 10) * 60 * 1000,
  FETCH_TIMEOUT_MS: parseInt(process.env.WEATHER_FETCH_TIMEOUT || '10000', 10),
  MAX_RETRIES: 3,
  RETRY_BASE_DELAY: 1000,
  FORECAST_DAYS: parseInt(process.env.WEATHER_FORECAST_DAYS || '7', 10),
};

// ─── Types ───────────────────────────────────────────────────────────────────
export interface WeatherData {
  current: {
    temperature_2m: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    apparent_temperature: number;
    visibility: number;
    uv_index?: number;
    precipitation?: number;
    cloud_cover?: number;
    pressure_msl?: number;
  };
  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
    is_day: number[];
    precipitation_probability?: number[];
  };
  daily: {
    time: string[];
    weather_code: number[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    sunrise: string[];
    sunset: string[];
    precipitation_probability?: number[];
    uv_index_max?: number[];
  };
}

export const DEFAULT_COORDS = { lat: 19.75, lng: 75.71 };

// ─── SSR-Safe Utilities ──────────────────────────────────────────────────────
function isOnline(): boolean {
  if (typeof navigator !== 'undefined' && 'onLine' in navigator) {
    return navigator.onLine;
  }
  return true;
}

// ─── Input Validation ────────────────────────────────────────────────────────
function validateCoords(lat: number, lng: number): void {
  if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
    throw new Error('Invalid coordinates: lat/lng must be numbers');
  }
  if (lat < -90 || lat > 90) {
    throw new Error(`Invalid latitude: ${lat} (must be -90..90)`);
  }
  if (lng < -180 || lng > 180) {
    throw new Error(`Invalid longitude: ${lng} (must be -180..180)`);
  }
}

// ─── Fetch with Timeout ──────────────────────────────────────────────────────
async function fetchWithTimeout(
  url: string,
  timeoutMs: number = CONFIG.FETCH_TIMEOUT_MS
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return response;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      throw new Error(`Request timed out after ${timeoutMs}ms`);
    }
    throw err;
  } finally {
    clearTimeout(timeoutId);
  }
}

// ─── Retry with Exponential Backoff ──────────────────────────────────────────
async function fetchWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = CONFIG.MAX_RETRIES,
  baseDelay: number = CONFIG.RETRY_BASE_DELAY
): Promise<T> {
  let lastError: Error | null = null;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.warn(
          `[Weather] Attempt ${attempt + 1} failed, retrying in ${delay}ms:`,
          err.message
        );
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

// ─── In-Flight Request Deduplication ────────────────────────────────────────
const inflightRequests = new Map<string, Promise<WeatherData>>();

// ─── Cache Key ───────────────────────────────────────────────────────────────
function getCacheKey(lat: number, lng: number): string {
  return `weather_${lat.toFixed(3)}_${lng.toFixed(3)}`;
}

// ─── Fetch Weather ───────────────────────────────────────────────────────────
export const fetchWeather = async (
  lat: number,
  lng: number
): Promise<WeatherData> => {
  validateCoords(lat, lng);
  const cacheKey = getCacheKey(lat, lng);

  // Deduplicate simultaneous requests for the same coordinates
  if (inflightRequests.has(cacheKey)) {
    return inflightRequests.get(cacheKey)!;
  }

  const request = (async (): Promise<WeatherData> => {
    // 1. Check IndexedDB cache
    try {
      const cached = await OfflineDB.getItem<{
        data: WeatherData;
        timestamp: number;
      }>('weather_cache', cacheKey);

      if (cached) {
        const isFresh = Date.now() - cached.timestamp < CONFIG.CACHE_TTL_MS;
        const online = isOnline();
        if (!online || isFresh) {
          console.log('[Weather] Loaded from cache (fresh or offline)');
          return cached.data;
        }
      }
    } catch (err) {
      console.warn('[Weather] Cache check failed:', err);
    }

    // 2. Fetch from open-meteo with retry + timeout
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}` +
        `&current=temperature_2m,relative_humidity_2m,is_day,weather_code,wind_speed_10m,apparent_temperature,visibility,precipitation,cloud_cover,pressure_msl` +
        `&hourly=temperature_2m,weather_code,is_day,precipitation_probability` +
        `&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,precipitation_probability_max,uv_index_max` +
        `&timezone=auto&forecast_days=${CONFIG.FORECAST_DAYS}`;

      const data = await fetchWithRetry(async () => {
        const res = await fetchWithTimeout(url);
        return await res.json();
      });

      // Populate current.uv_index from daily.uv_index_max[0] if present
      if (data && data.current && !data.current.uv_index && data.daily && data.daily.uv_index_max) {
        data.current.uv_index = data.daily.uv_index_max[0];
      }

      // Map daily precipitation_probability_max to precipitation_probability if present
      if (data && data.daily && data.daily.precipitation_probability_max && !data.daily.precipitation_probability) {
        data.daily.precipitation_probability = data.daily.precipitation_probability_max;
      }

      // 3. Store in cache
      try {
        await OfflineDB.setItem('weather_cache', cacheKey, {
          data,
          timestamp: Date.now(),
        });
      } catch (cacheErr) {
        console.warn('[Weather] Failed to cache:', cacheErr);
      }

      return data;
    } catch (e) {
      console.error('[Weather] Fetch failed, using fallback:', e);

      // 4. Fallback: stale cache
      try {
        const cached = await OfflineDB.getItem<{ data: WeatherData }>(
          'weather_cache',
          cacheKey
        );
        if (cached) {
          console.warn('[Weather] Returning stale cache as fallback');
          return cached.data;
        }
      } catch { }

      // 5. Last resort: mock data
      console.warn('[Weather] No cache available, returning mock data');
      return MOCK_WEATHER;
    }
  })();

  inflightRequests.set(cacheKey, request);
  try {
    return await request;
  } finally {
    inflightRequests.delete(cacheKey);
  }
};

// ─── Reverse Geocoding ───────────────────────────────────────────────────────
export const getPlaceName = async (
  lat: number,
  lng: number,
  lang: Language = 'en'
): Promise<string> => {
  validateCoords(lat, lng);

  try {
    const url = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lng}&localityLanguage=${lang}`;
    const res = await fetchWithTimeout(url);
    const data = await res.json();
    const placeName =
      data.locality ||
      data.city ||
      data.town ||
      data.village ||
      data.principalSubdivision ||
      '';
    return placeName || getFallbackPlaceName(lat, lng);
  } catch (e) {
    console.warn('[Geocode] Failed:', e instanceof Error ? e.message : e);
    return getFallbackPlaceName(lat, lng);
  }
};

function getFallbackPlaceName(lat: number, lng: number): string {
  if (
    Math.abs(lat - DEFAULT_COORDS.lat) < 0.5 &&
    Math.abs(lng - DEFAULT_COORDS.lng) < 0.5
  ) {
    return 'Maharashtra';
  }
  return 'Your Location';
}

// ─── Mock Weather Data (corrected) ───────────────────────────────────────────
export const MOCK_WEATHER: WeatherData = {
  current: {
    temperature_2m: 28,
    relative_humidity_2m: 45,
    is_day: new Date().getHours() >= 6 && new Date().getHours() < 18 ? 1 : 0,
    weather_code: 1,
    wind_speed_10m: 12,
    apparent_temperature: 30,
    visibility: 10000,
    uv_index: 6,
    precipitation: 0,
    cloud_cover: 25,
    pressure_msl: 1013,
  },
  hourly: {
    time: Array.from({ length: 24 }, (_, i) => {
      const d = new Date();
      d.setHours(i, 0, 0, 0);
      return `${d.toISOString().slice(0, 13)}:00`;
    }),
    temperature_2m: [
      22, 21, 20, 19, 19, 20, 22, 25, 28, 30, 32, 33, 34, 34, 33, 32, 30,
      28, 26, 25, 24, 23, 23, 22,
    ],
    weather_code: Array(24).fill(1),
    is_day: Array.from({ length: 24 }, (_, i) => (i >= 6 && i < 18 ? 1 : 0)),
    precipitation_probability: Array(24).fill(5),
  },
  daily: {
    time: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d.toISOString().slice(0, 10);
    }),
    weather_code: Array(7).fill(1),
    temperature_2m_max: [34, 35, 33, 32, 34, 35, 34],
    temperature_2m_min: [22, 23, 21, 20, 22, 23, 22],
    sunrise: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(6, 30, 0, 0);
      return d.toISOString();
    }),
    sunset: Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      d.setHours(18, 45, 0, 0);
      return d.toISOString();
    }),
    precipitation_probability: Array(7).fill(10),
    uv_index_max: Array(7).fill(6),
  },
};