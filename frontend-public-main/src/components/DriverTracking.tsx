import React, { useEffect, useState, useCallback } from 'react';

interface DriverLocation {
  driverId: string;
  coordinates: { lat: number; lng: number };
  heading: number;
  speed: number;
  timestamp: number;
  status: 'available' | 'en_route' | 'arrived' | 'on_trip';
}

interface DriverTrackingProps {
  driverId: string;
  bookingId: string;
  onDriverUpdate?: (location: DriverLocation) => void;
  onDriverArrived?: () => void;
}

const DriverTracking: React.FC<DriverTrackingProps> = ({
  driverId,
  bookingId,
  onDriverUpdate,
  onDriverArrived
}) => {
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [isTracking, setIsTracking] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');

  // WebSocket connection for real-time updates
  const [ws, setWs] = useState<WebSocket | null>(null);

  const connectWebSocket = useCallback(() => {
    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/ws/driver-tracking/${driverId}/`;
      
      const websocket = new WebSocket(wsUrl);
      
      websocket.onopen = () => {
        console.log('Driver tracking WebSocket connected');
        setConnectionStatus('connected');
        setIsTracking(true);
      };

      websocket.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.type === 'location_update') {
            const location: DriverLocation = {
              driverId: data.driver_id,
              coordinates: { lat: data.lat, lng: data.lng },
              heading: data.heading || 0,
              speed: data.speed || 0,
              timestamp: data.timestamp,
              status: data.status
            };
            
            setDriverLocation(location);
            setLastUpdate(new Date());
            onDriverUpdate?.(location);

            if (location.status === 'arrived') {
              onDriverArrived?.();
            }
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      };

      websocket.onclose = () => {
        console.log('Driver tracking WebSocket disconnected');
        setConnectionStatus('disconnected');
        setIsTracking(false);
        
        // Attempt to reconnect after 3 seconds
        setTimeout(() => {
          if (connectionStatus !== 'connected') {
            connectWebSocket();
          }
        }, 3000);
      };

      websocket.onerror = (error) => {
        console.error('WebSocket error:', error);
        setConnectionStatus('disconnected');
      };

      setWs(websocket);
    } catch (error) {
      console.error('Failed to connect WebSocket:', error);
      setConnectionStatus('disconnected');
    }
  }, [driverId, connectionStatus]);

  // Fallback HTTP polling if WebSocket fails
  const pollDriverLocation = useCallback(async () => {
    try {
      const response = await fetch(`/api/drivers/${driverId}/location`);
      if (response.ok) {
        const data = await response.json();
        const location: DriverLocation = {
          driverId: data.driver_id,
          coordinates: { lat: data.lat, lng: data.lng },
          heading: data.heading || 0,
          speed: data.speed || 0,
          timestamp: data.timestamp,
          status: data.status
        };
        
        setDriverLocation(location);
        setLastUpdate(new Date());
        onDriverUpdate?.(location);

        if (location.status === 'arrived') {
          onDriverArrived?.();
        }
      }
    } catch (error) {
      console.error('HTTP polling failed:', error);
    }
  }, [driverId, onDriverUpdate, onDriverArrived]);

  useEffect(() => {
    // Try WebSocket first, fallback to HTTP polling
    connectWebSocket();

    // Set up HTTP polling as backup
    const pollInterval = setInterval(pollDriverLocation, 10000); // Poll every 10 seconds

    return () => {
      if (ws) {
        ws.close();
      }
      clearInterval(pollInterval);
    };
  }, [connectWebSocket, pollDriverLocation]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'text-green-600';
      case 'en_route': return 'text-blue-600';
      case 'arrived': return 'text-orange-600';
      case 'on_trip': return 'text-purple-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'available': return 'Available';
      case 'en_route': return 'En Route';
      case 'arrived': return 'Arrived';
      case 'on_trip': return 'On Trip';
      default: return 'Unknown';
    }
  };

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes === 1) return '1 minute ago';
    return `${minutes} minutes ago`;
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-lg">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold text-gray-800">Driver Tracking</h3>
        <div className="flex items-center space-x-2">
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === 'connected' ? 'bg-green-500' :
            connectionStatus === 'connecting' ? 'bg-yellow-500' : 'bg-red-500'
          }`}></div>
          <span className="text-xs text-gray-500">
            {connectionStatus === 'connected' ? 'Live' :
             connectionStatus === 'connecting' ? 'Connecting' : 'Offline'}
          </span>
        </div>
      </div>

      {driverLocation ? (
        <div className="space-y-3">
          {/* Driver Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Status:</span>
            <span className={`text-sm font-medium ${getStatusColor(driverLocation.status)}`}>
              {getStatusText(driverLocation.status)}
            </span>
          </div>

          {/* Driver Location */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Location:</span>
            <span className="text-sm text-gray-800">
              {driverLocation.coordinates.lat.toFixed(6)}, {driverLocation.coordinates.lng.toFixed(6)}
            </span>
          </div>

          {/* Speed */}
          {driverLocation.speed > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Speed:</span>
              <span className="text-sm text-gray-800">
                {Math.round(driverLocation.speed * 3.6)} km/h
              </span>
            </div>
          )}

          {/* Heading */}
          {driverLocation.heading > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Direction:</span>
              <span className="text-sm text-gray-800">
                {Math.round(driverLocation.heading)}°
              </span>
            </div>
          )}

          {/* Last Update */}
          {lastUpdate && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Last Update:</span>
              <span className="text-sm text-gray-800">
                {formatTimeAgo(driverLocation.timestamp)}
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
          <p className="text-sm text-gray-600">Waiting for driver location...</p>
        </div>
      )}

      {/* Connection Info */}
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="text-xs text-gray-500 text-center">
          Driver ID: {driverId} • Booking: {bookingId}
        </div>
      </div>
    </div>
  );
};

export default DriverTracking;




