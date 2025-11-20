import api from './api';

// Simple in-memory cache with localStorage persistence for geocoding
type Coords = { lat: number; lng: number };
const memoryGeocodeCache: Record<string, Coords> = {};
const GEOCODE_CACHE_KEY = 'geocode_cache_v1';
const CACHE_TTL_MS = 1000 * 60 * 60 * 24; // 24 hours

function loadCacheFromStorage() {
  try {
    const raw = typeof window !== 'undefined' ? localStorage.getItem(GEOCODE_CACHE_KEY) : null;
    if (!raw) return;
    const parsed = JSON.parse(raw) as { [q: string]: { v: Coords; t: number } };
    const now = Date.now();
    for (const [k, entry] of Object.entries(parsed)) {
      if (entry && typeof entry.t === 'number' && now - entry.t < CACHE_TTL_MS) {
        memoryGeocodeCache[k] = entry.v;
      }
    }
  } catch {}
}

function persistCacheToStorage() {
  try {
    const now = Date.now();
    const store: Record<string, { v: Coords; t: number }> = {};
    for (const [k, v] of Object.entries(memoryGeocodeCache)) {
      store[k] = { v, t: now };
    }
    if (typeof window !== 'undefined') {
      localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(store));
    }
  } catch {}
}

loadCacheFromStorage();

// Geofencing configuration for Patna
const PATNA_CENTER_LAT = 25.5941;
const PATNA_CENTER_LNG = 85.1376;
const SERVICE_RADIUS_KM = 30; // 30km radius from Patna center

/**
 * Calculate distance between two points using Haversine formula
 */
function calculateDistanceFromPoint(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (v: number) => v * Math.PI / 180;
  const R = 6371; // Earth's radius in km
  
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const lat1Rad = toRad(lat1);
  const lat2Rad = toRad(lat2);
  
  const a = (Math.sin(dLat / 2) * Math.sin(dLat / 2) +
             Math.sin(dLng / 2) * Math.sin(dLng / 2) * 
             Math.cos(lat1Rad) * Math.cos(lat2Rad));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distanceInKm = Math.max(0, R * c);
  
  return distanceInKm;
}

/**
 * Check if coordinates are within the service area (30km radius from Patna center)
 */
export function isWithinServiceArea(lat: number, lng: number): boolean {
  try {
    const distance = calculateDistanceFromPoint(PATNA_CENTER_LAT, PATNA_CENTER_LNG, lat, lng);
    return distance <= SERVICE_RADIUS_KM;
  } catch (error) {
    console.error('Error checking service area:', error);
    return false;
  }
}

/**
 * Get Patna center coordinates
 */
export function getPatnaCenter(): { lat: number; lng: number } {
  return { lat: PATNA_CENTER_LAT, lng: PATNA_CENTER_LNG };
}

/**
 * Get service radius in km
 */
export function getServiceRadius(): number {
  return SERVICE_RADIUS_KM;
}

export interface GeocodeResult {
  display_name: string;
  lat: number;
  lng: number;
  address: any;
  place_id: string;
}

export interface LocationData {
  address: string;
  lat: number;
  lng: number;
  address_details: any;
}

// Search for addresses using our backend geocoding service
export async function searchAddresses(query: string): Promise<GeocodeResult[]> {
  try {
    const q = (query || '').trim();
    if (q.length < 3) {
      return [];
    }
    const response = await api.get(`/bookings/geocode?q=${encodeURIComponent(query)}`);
    if (response.data.success) {
      return response.data.results || [];
    }
    return [];
  } catch (error: any) {
    if (error?.response?.status === 404) {
      return [];
    }
    // eslint-disable-next-line no-console
    console.error('Address search failed:', error);
    return [];
  }
}

// Convert address to coordinates using our backend
export async function geocodeToCoords(query: string): Promise<{ lat: number; lng: number } | null> {
  try {
    const key = query.trim().toLowerCase();
    if (memoryGeocodeCache[key]) {
      return memoryGeocodeCache[key];
    }
    const results = await searchAddresses(query);
    if (results.length > 0) {
      const first = results[0];
      const coords = { lat: first.lat, lng: first.lng } as Coords;
      memoryGeocodeCache[key] = coords;
      persistCacheToStorage();
      return coords;
    }
    return null;
  } catch (error) {
    console.error('Geocoding failed:', error);
    return null;
  }
}

// Convert coordinates to address using our backend
export async function reverseGeocode(lat: number, lng: number): Promise<LocationData | null> {
  try {
    const response = await api.get(`/bookings/reverse-geocode?lat=${lat}&lng=${lng}`);
    if (response.data.success) {
      return {
        address: response.data.address,
        lat: response.data.lat,
        lng: response.data.lng,
        address_details: response.data.address_details
      };
    }
    return null;
  } catch (error) {
    console.error('Reverse geocoding failed:', error);
    return null;
  }
}

// Get user's current location
export async function getCurrentLocation(): Promise<{ lat: number; lng: number; address: string } | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lng = position.coords.longitude;
        
        try {
          const locationData = await reverseGeocode(lat, lng);
          if (locationData) {
            resolve({
              lat,
              lng,
              address: locationData.address
            });
          } else {
            resolve({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
          }
        } catch (error) {
          console.error('Failed to get address for current location:', error);
          resolve({ lat, lng, address: `${lat.toFixed(4)}, ${lng.toFixed(4)}` });
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        resolve(null);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000 // 5 minutes
      }
    );
  });
}


