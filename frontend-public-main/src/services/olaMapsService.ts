// Ola Maps Service for frontend
export interface MapCoordinates {
  lat: number;
  lng: number;
}

export interface RouteResponse {
  success: boolean;
  provider: string;
  coordinates: number[][];
  distance: number;
  duration: number;
  trafficData?: {
    congestionLevel: number;
    delayMinutes: number;
  };
  waypoints: any[];
  summary: {
    totalDistance: number;
    totalDuration: number;
    provider: string;
  };
}

export interface DriverLocation {
  lat: number;
  lng: number;
}

export interface GeocodingResult {
  display_name: string;
  lat: number;
  lng: number;
  address: any[];
  place_id: string;
}

export interface GeocodingResponse {
  success: boolean;
  results: GeocodingResult[];
}

export interface ReverseGeocodingResponse {
  success: boolean;
  address: string;
  lat: number;
  lng: number;
  address_details: any[];
}

class OlaMapsService {
  private baseUrl = '/api/bookings';

  async getRoute(
    pickup: MapCoordinates,
    dropoff: MapCoordinates,
    options: { mode?: string; waypoints?: MapCoordinates[] } = {}
  ): Promise<RouteResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/route`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pickup: { coords: pickup },
          dropoff: { coords: dropoff },
          options,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Error fetching route:', error);
      return null;
    }
  }

  async geocode(query: string): Promise<GeocodingResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/geocode?q=${encodeURIComponent(query)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Error geocoding:', error);
      return null;
    }
  }

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodingResponse | null> {
    try {
      const response = await fetch(`${this.baseUrl}/reverse-geocode?lat=${lat}&lng=${lng}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Error reverse geocoding:', error);
      return null;
    }
  }

  // Utility function to calculate distance between two points
  calculateDistance(point1: MapCoordinates, point2: MapCoordinates): number {
    const R = 6371; // Earth's radius in kilometers
    const dLat = this.toRadians(point2.lat - point1.lat);
    const dLng = this.toRadians(point2.lng - point1.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(point1.lat)) * Math.cos(this.toRadians(point2.lat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  // Format duration from seconds to readable format
  formatDuration(seconds: number): string {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  // Format distance from meters to readable format
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${meters}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  }
}

export const olaMapsService = new OlaMapsService();
export default olaMapsService;

