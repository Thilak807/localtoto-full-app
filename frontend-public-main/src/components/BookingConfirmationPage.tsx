import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Home, User, Clock, IndianRupee, MapPin, Shield, Phone, Navigation, CheckCircle } from 'lucide-react';
import api from '../services/api';
import LiveTrackingMap from './LiveTrackingMap';
import olaMapsService, { RouteResponse, DriverLocation } from '../services/olaMapsService';

interface ConfirmationState {
  rideId?: string;
  startOtp?: string;
  fare?: number;
  distance?: number;
  duration?: string;
  rideType?: string;
  pickupAddress?: string;
  dropAddress?: string;
  pickupCoords?: { lat: number; lng: number };
  dropCoords?: { lat: number; lng: number };
}

const BookingConfirmationPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ConfirmationState;

  const [isCancelling, setIsCancelling] = useState(false);
  const [driverAssigned, setDriverAssigned] = useState(false);
  const [driverDetails, setDriverDetails] = useState<{
    name: string;
    phone: string;
    vehicle: string;
    rating: number;
    photo: string;
  } | null>(null);
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [driverToPickupRoute, setDriverToPickupRoute] = useState<RouteResponse | null>(null);
  const [driverLocation, setDriverLocation] = useState<DriverLocation | null>(null);
  const [near, setNear] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [wsConnection, setWsConnection] = useState<WebSocket | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [wsRetryLimitReached, setWsRetryLimitReached] = useState(false);
  const wsRetriesRef = React.useRef(0);
  const shouldReconnectRef = React.useRef(true);
  const isConnectingRef = React.useRef(false);
  const [isCompleted, setIsCompleted] = useState(false); // Flag to prevent unnecessary API calls
  const [userPhone, setUserPhone] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/profile');
        const u = res.data?.user;
        if (mounted) {
          setUserPhone(u?.phoneNumber || '');
          setUserEmail(u?.email || '');
        }
      } catch {}
    })();
    return () => { mounted = false; };
  }, []);

  // Animated text for driver assignment
  const [animationIndex, setAnimationIndex] = useState(0);
  const animationTexts = ['shortly.', 'shortly..', 'shortly...', 'shortly.'];

  // Immediate check: if ride is already completed, redirect immediately (prevents unnecessary API calls)
  useEffect(() => {
    if (!state?.rideId) return;
    
    const checkStatus = async () => {
      try {
        const res = await api.get(`/bookings/details/${state.rideId}`);
        const booking = res.data?.booking;
        const bookingStatus = String(booking?.status || '').toLowerCase();
        
        if (bookingStatus === 'completed') {
          setIsCompleted(true); // Set flag to prevent other useEffects from running
          // Ride already completed - redirect immediately without setting up polling/WebSocket
          navigate('/ride-payment-feedback', { 
            replace: true, 
            state: { 
              rideId: state.rideId, 
              fare: booking?.fare || state.fare,
              paymentStatus: booking?.payment_status,
              paymentMethod: booking?.payment_method
            } 
          });
          return;
        }
        // Ride is not completed, allow other useEffects to proceed
      } catch (error) {
        console.error('Error checking ride status:', error);
        // On error, allow other useEffects to proceed (they'll handle errors)
      }
    };
    
    checkStatus();
  }, [state?.rideId, navigate]);

  // Fetch pickup->drop route (kept for stats display)
  useEffect(() => {
    const fetchRoute = async () => {
      if (!state?.pickupCoords || !state?.dropCoords) return;
      
      try {
        const route = await olaMapsService.getRoute(state.pickupCoords, state.dropCoords);
        if (route) {
          setRouteData(route);
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    };

    fetchRoute();
  }, [state?.pickupCoords, state?.dropCoords]);

  // Fetch driver->pickup route whenever driverLocation updates
  useEffect(() => {
    const fetchDriverRoute = async () => {
      if (!state?.pickupCoords || !driverLocation) return;
      try {
        const route = await olaMapsService.getRoute(driverLocation, state.pickupCoords);
        if (route) setDriverToPickupRoute(route);
      } catch {}
    };
    fetchDriverRoute();
  }, [driverLocation?.lat, driverLocation?.lng, state?.pickupCoords?.lat, state?.pickupCoords?.lng]);

  // Poll public proximity flags
  useEffect(() => {
    if (!state?.rideId || isCompleted) return;

    shouldReconnectRef.current = true;
    let polling = true;
    let inFlight = false;
    let intervalId: number | undefined;

    const tick = async () => {
      // Pause polling when WS is connected or tab is hidden
      if (!polling || wsConnected || document.visibilityState === 'hidden') return;
      if (inFlight) return; // debounce overlapping requests
      inFlight = true;
      try {
        const res = await api.get(`/bookings/public-status`, { params: { rideId: state.rideId } });
        setNear(!!res.data?.near);
        setArrived(!!res.data?.arrived);
      } catch {}
      finally {
        inFlight = false;
      }
    };

    // Initial tick and schedule
    tick();
    intervalId = window.setInterval(tick, 7000); // ~7s (6–8s target)

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        // Kick an immediate tick when tab becomes visible
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      polling = false;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [state?.rideId, isCompleted, wsConnected]);

  // Also derive arrival by distance from latest driverLocation to drop (~100m)
  useEffect(() => {
    if (!driverLocation || !state?.dropCoords) return;
    const toRad = (d: number) => (d * Math.PI) / 180;
    const haversineKm = (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => {
      const R = 6371;
      const dLat = toRad(b.lat - a.lat);
      const dLng = toRad(b.lng - a.lng);
      const s = Math.sin(dLat/2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2) ** 2;
      return 2 * R * Math.asin(Math.sqrt(s));
    };
    const dKm = haversineKm({ lat: driverLocation.lat, lng: driverLocation.lng }, state.dropCoords);
    if (dKm <= 0.1) setArrived(true);
  }, [driverLocation, state?.dropCoords]);

  // Auto-complete disabled: driver marks arrival/completion from driver app; rider can press button

  const handleCompleteRide = async () => {
    if (!state?.rideId) return;
    setCompleting(true);
    try {
      const res = await api.post(`/bookings/complete/${state.rideId}`);
      if (res.data?.success) {
        navigate('/');
      }
    } catch {}
    finally { setCompleting(false); }
  };

  // WebSocket connection for real-time driver location updates
  // Skip WebSocket if ride is already completed (handled by initial check)
  useEffect(() => {
    if (!state?.rideId || isCompleted) return;

    const connectWebSocket = () => {
      try {
        if (wsRetryLimitReached || wsRetriesRef.current >= 4) {
          setWsRetryLimitReached(true);
          return;
        }
        if (isConnectingRef.current || !shouldReconnectRef.current) {
          return;
        }
        isConnectingRef.current = true;
        const isHttps = window.location.protocol === 'https:';
        const protocol = isHttps ? 'wss:' : 'ws:';
        // Prefer configured WS base if present
        const envWsBase = (import.meta as any).env?.VITE_WS_BASE as string | undefined;
        const apiBase = (import.meta as any).env?.VITE_API_BASE_URL as string | undefined
          || (import.meta as any).env?.VITE_API_URL as string | undefined;
        const derivedWsBase = (() => {
          try {
            if (envWsBase) return envWsBase;
            if (apiBase) {
              const apiUrl = new URL(apiBase);
              const wsProtocol = apiUrl.protocol === 'https:' ? 'wss:' : apiUrl.protocol === 'http:' ? 'ws:' : protocol;
              return `${wsProtocol}//${apiUrl.host}`;
            }
          } catch {}
          return `${protocol}//${window.location.host}`;
        })();
        const wsUrl = `${derivedWsBase.replace(/\/$/, '')}/ws/bookings/ride/${state.rideId}/`;
        try {
          console.log('[WS] Connecting', {
            wsUrl,
            envWsBase: envWsBase || null,
            apiBase: apiBase || null,
            locationOrigin: window.location.origin
          });
        } catch {}
        
        if (wsRetriesRef.current >= 4) {
          console.warn('WebSocket retry limit reached, aborting reconnect attempts');
          setWsRetryLimitReached(true);
          return;
        }

        const websocket = new WebSocket(wsUrl);
        
        websocket.onopen = () => {
          console.log('Ride tracking WebSocket connected');
          setWsConnected(true);
          wsRetriesRef.current = 0;
          setWsRetryLimitReached(false);
          isConnectingRef.current = false;
        };

        websocket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.driver && typeof data.driver.lat === 'number' && typeof data.driver.lng === 'number') {
              setDriverLocation({ lat: data.driver.lat, lng: data.driver.lng });
            }
            if (typeof data.near === 'boolean') {
              setNear(data.near);
            }
            if (typeof data.arrived === 'boolean') {
              setArrived(data.arrived);
            }
            // Handle ride completion event from WebSocket
            // The consumer sends event['data'] directly, so check for status field
            if (data.status === 'completed') {
              websocket.close(); // Close WebSocket before redirecting
              navigate('/ride-payment-feedback', { 
                replace: true, 
                state: { 
                  rideId: state.rideId, 
                  fare: data.fare || state.fare,
                  paymentStatus: data.payment_status
                } 
              });
            }
          } catch (error) {
            console.error('Error parsing WebSocket message:', error);
          }
        };

        websocket.onclose = (event) => {
          console.log('Ride tracking WebSocket disconnected', { code: event.code, reason: event.reason, wasClean: event.wasClean });
          setWsConnected(false);
          isConnectingRef.current = false;
          if (!shouldReconnectRef.current || isCompleted) {
            return;
          }
          // Normal close (code 1000) shouldn't trigger retry exhaustion
          if (event.code === 1000) {
            return;
          }
          wsRetriesRef.current += 1;
          if (wsRetriesRef.current >= 4) {
            console.warn('WebSocket retry limit reached after consecutive failures');
            setWsRetryLimitReached(true);
            return;
          }
          // Attempt to reconnect after 3 seconds (only if not redirecting)
          setTimeout(() => {
            if (shouldReconnectRef.current && !isCompleted && wsRetriesRef.current < 4 && !isConnectingRef.current) {
              connectWebSocket();
            }
          }, 3000);
        };

        websocket.onerror = (error) => {
          console.error('WebSocket error:', error);
          setWsConnected(false);
          isConnectingRef.current = false;
          if (!shouldReconnectRef.current || isCompleted) {
            return;
          }
          // Count this as a failure towards the limit if close won’t follow
          if (wsRetriesRef.current < 4) {
            wsRetriesRef.current += 1;
          }
        };

        setWsConnection(websocket);
      } catch (error) {
        console.error('Failed to connect WebSocket:', error);
        setWsConnected(false);
        isConnectingRef.current = false;
        if (!shouldReconnectRef.current || isCompleted) {
          return;
        }
        wsRetriesRef.current += 1;
        if (wsRetriesRef.current >= 4) {
          console.warn('WebSocket retry limit reached after consecutive failures (init)');
          setWsRetryLimitReached(true);
          return;
        }
        setTimeout(() => {
          if (shouldReconnectRef.current && !isCompleted && wsRetriesRef.current < 4 && !isConnectingRef.current) {
            connectWebSocket();
          }
        }, 3000);
      }
    };

    connectWebSocket();

    return () => {
      shouldReconnectRef.current = false;
      if (wsConnection) {
        wsConnection.close();
        setWsConnection(null);
      }
      isConnectingRef.current = false;
    };
  }, [state?.rideId, isCompleted]);

  // Poll ride details to get real driver info, live location, and OTP (every 3s) - fallback
  // Skip polling if ride is already completed (handled by initial check)
  useEffect(() => {
    if (!state?.rideId || isCompleted) return;
    
    // Add a flag to prevent polling if we're redirecting
    let shouldPoll = true;
    let inFlight = false;
    let intervalId: number | undefined;
    
    const tick = async () => {
      // Pause details polling when WS is connected or tab is hidden
      if (!shouldPoll || wsConnected || document.visibilityState === 'hidden') return;
      if (inFlight) return; // debounce overlapping requests
      inFlight = true;
      try {
        const res = await api.get(`/bookings/details/${state.rideId}`);
        const booking = res.data?.booking;
        const cacheDriver = res.data?.driver;
        const liveLoc = res.data?.driverLocation;
        if (liveLoc && typeof liveLoc.lat === 'number' && typeof liveLoc.lng === 'number') {
          setDriverLocation(liveLoc);
        }
        // Update OTP if provided by backend
        if (booking?.ride_start_otp && !state.startOtp) {
          // mutate navigation state locally by replacing with new state object
          (state as any).startOtp = booking.ride_start_otp;
        }
        // Detect OTP verification / ride start signals
        if (
          booking?.otp_verified === true ||
          booking?.ride_started === true ||
          booking?.status === 'ongoing' ||
          booking?.status === 'in_progress' ||
          booking?.status === 'started'
        ) {
          console.log('OTP verified, hiding OTP section');
          setOtpVerified(true);
        }
        // Redirect to payment + feedback when completed
        const bookingStatus = String(booking?.status || '').toLowerCase();
        if (bookingStatus === 'completed') {
          shouldPoll = false; // Stop polling
          navigate('/ride-payment-feedback', { 
            replace: true, 
            state: { 
              rideId: state.rideId, 
              fare: booking?.fare || state.fare,
              paymentStatus: booking?.payment_status,
              paymentMethod: booking?.payment_method
            } 
          });
          return;
        }
        // Prefer persistent booking.driver; fallback to cached summary
        const d = booking?.driver || cacheDriver;
        if (d) {
          setDriverAssigned(true);
          setDriverDetails({
            name: d.name || 'Driver',
            phone: d.phone || '',
            vehicle: d.vehicle_type || d.vehicle || '',
            rating: (typeof d.rating === 'number' ? d.rating : 0) as number,
            photo: '/api/placeholder/100/100'
          });
        }
      } catch {}
      finally {
        inFlight = false;
      }
    };

    // Initial tick and schedule
    tick();
    intervalId = window.setInterval(tick, 9000); // ~9s (8–10s target)

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        // Kick an immediate tick when tab becomes visible
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      shouldPoll = false;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [state?.rideId, isCompleted, wsConnected]);

  const handleCancelRide = async () => {
    if (!state?.rideId) return;
    
    setIsCancelling(true);
    try {
      await api.post(`/bookings/cancel/${state.rideId}`);
      navigate('/');
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to cancel ride');
    } finally {
      setIsCancelling(false);
    }
  };


  if (!state) {
  return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">No booking data found</h2>
          <button
            onClick={() => navigate('/')}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center justify-between">
          <div className="w-9"></div>
          <h1 className="text-lg font-semibold text-gray-800">Booking Confirmation</h1>
          <button
            onClick={() => navigate('/')}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <Home className="w-5 h-5 text-gray-600" />
          </button>
        </div>
        </div>

      <div className="max-w-md mx-auto p-4 space-y-4">
        {/* OTP Section - on top; hide after verification */}
        {!otpVerified && state.startOtp && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-green-50 border border-green-200 rounded-xl p-4"
          >
            <div className="text-center">
              <Shield className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <h3 className="text-lg font-semibold text-green-800 mb-1">Share this OTP</h3>
              <p className="text-sm text-green-700 mb-3">
                Share this OTP with your driver only when asked
              </p>
              <div className="bg-white rounded-lg p-3 mb-3">
                <span className="text-2xl font-bold text-green-600">{state.startOtp}</span>
              </div>
              <p className="text-xs text-green-600">This OTP is valid for your ride security</p>
            </div>
          </motion.div>
        )}

        {/* Ride Started Banner - shown after OTP verification */}
        {otpVerified && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-blue-100 border-2 border-blue-300 text-blue-800 rounded-xl p-4 text-center"
          >
            <div className="text-lg font-semibold mb-1">🚗 Our Ride is Started!</div>
            <div className="text-sm">
              {routeData?.duration ? `Estimated arrival: ${routeData.duration}` : 'Ride in progress'}
            </div>
          </motion.div>
        )}

        {/* Driver Status Banner - only show if not verified yet */}
        {!otpVerified && arrived && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-green-100 border-2 border-green-300 text-green-800 rounded-xl p-4 text-center"
          >
            <div className="text-lg font-semibold mb-1">🚗 Driver Has Arrived!</div>
            <div className="text-sm">Your driver is waiting at the pickup location</div>
          </motion.div>
        )}
        
        {!otpVerified && near && !arrived && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-yellow-100 border-2 border-yellow-300 text-yellow-800 rounded-xl p-4 text-center"
          >
            <div className="text-lg font-semibold mb-1">📍 Driver Is Nearby</div>
            <div className="text-sm">Your driver will arrive in approximately 5 minutes</div>
          </motion.div>
        )}

        {/* Live Tracking Map (phase-based) */}
        {state.pickupCoords && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl shadow-lg overflow-hidden"
          >
            <div className="p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Live Tracking</h3>
            </div>
            <div className="p-4">
              <LiveTrackingMap
                key={`live-tracking-${state.rideId || 'temp'}`}
                pickup={state.pickupCoords}
                dropoff={otpVerified ? state.dropCoords : undefined}
                routeData={otpVerified ? (routeData ? { coordinates: routeData.coordinates as [number, number][] } : undefined) : (driverToPickupRoute ? { coordinates: driverToPickupRoute.coordinates as [number, number][] } : undefined)}
                driverLocation={driverLocation || undefined}
                height="300px"
                showDrop={!!otpVerified}
                allowFullscreen={true}
              />
              <div className="mt-2 text-center text-xs text-gray-500">
                {wsRetryLimitReached ? (
                  <span className="text-red-600">
                    Live updates paused after repeated failures. Pull to refresh if needed.
                  </span>
                ) : driverLocation ? (
                  <span className={wsConnected ? 'text-green-600' : 'text-yellow-600'}>
                    {wsConnected ? 'Live driver location updating' : 'Driver location updating (fallback)'}
                  </span>
                ) : (
                  'Waiting for driver location…'
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Driver Details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-xl shadow-lg p-4"
        >
          <h3 className="text-lg font-semibold text-gray-800 mb-3">Driver Details</h3>
          
          {driverAssigned && driverDetails ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <User className="w-6 h-6 text-gray-600" />
              </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-800">{driverDetails.name}</h4>
                  <p className="text-sm text-gray-600">{driverDetails.vehicle}</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <span className="text-yellow-500">★</span>
                    <span className="text-sm text-gray-600">{driverDetails.rating}</span>
                  </div>
                </div>
                <a href={`tel:${driverDetails.phone || ''}`} className="p-2 bg-green-100 text-green-600 rounded-full hover:bg-green-200">
                  <Phone className="w-4 h-4" />
                </a>
              </div>
              
              {/* Driver Tracking */}
              <div className={`rounded-lg p-4 text-center ${arrived ? 'bg-green-50 border border-green-200' : near ? 'bg-yellow-50 border border-yellow-200' : 'bg-gray-50'}`}>
                <div className="text-sm text-gray-600 mb-2">Verified Driver</div>
                <div className={`text-sm font-semibold ${arrived ? 'text-green-700' : near ? 'text-yellow-700' : 'text-gray-600'}`}>
                  {arrived ? '🚗 Driver has arrived at pickup location!' : 
                   near ? '📍 Driver is nearby (within 800m)' : 
                   driverLocation ? 'Live driver location updating…' : 'Driver is arriving shortly'}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="animate-pulse">
                <div className="w-12 h-12 bg-gray-200 rounded-full mx-auto mb-3"></div>
                <p className="text-sm text-gray-600 mb-2">Assigning driver…</p>
                <p className="text-lg font-semibold text-blue-600">{animationTexts[animationIndex]}</p>
              </div>
            </div>
          )}
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Ride Details</h2>
            <span className="text-sm text-gray-500">Ride ID: {state.rideId}</span>
          </div>
          {(arrived || near) && (
            <div className={`mb-3 text-sm ${arrived ? 'text-green-700' : 'text-yellow-700'}`}>
              {arrived ? 'Your driver has arrived' : 'Your driver is nearby'}
            </div>
          )}

          <div className="space-y-3">
            {/* Fare */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <IndianRupee className="w-4 h-4 text-green-600" />
                <span className="text-sm text-gray-600">Estimated Fare</span>
              </div>
              <span className="text-lg font-semibold text-green-600">₹{state.fare}</span>
            </div>

            {/* Duration */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-gray-600">Estimated Time</span>
              </div>
              <span className="text-sm font-medium text-gray-800">{state.duration}</span>
            </div>

            {/* Distance */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Navigation className="w-4 h-4 text-purple-600" />
                <span className="text-sm text-gray-600">Distance</span>
              </div>
              <span className="text-sm font-medium text-gray-800">
                {typeof state.distance === 'number' ? state.distance.toFixed(2) : state.distance} KM
              </span>
            </div>

            {/* Pickup */}
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-green-600 mt-0.5" />
                <div className="flex-1">
                <span className="text-xs text-gray-500">Pickup</span>
                <p className="text-sm text-gray-800">{state.pickupAddress}</p>
              </div>
                </div>

            {/* Drop */}
            <div className="flex items-start space-x-2">
              <MapPin className="w-4 h-4 text-red-600 mt-0.5" />
              <div className="flex-1">
                <span className="text-xs text-gray-500">Drop</span>
                <p className="text-sm text-gray-800">{state.dropAddress}</p>
              </div>
            </div>
          </div>
        </motion.div>


        {/* Complete / Cancel Buttons */}
        {/* Payment modal trigger button if pending */}
        <PaymentPrompt rideId={state.rideId} amount={state.fare} />
 
        {/* Cancel Ride Button */}
        {!driverAssigned && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="flex space-x-3"
          >
            <button
              onClick={handleCancelRide}
              disabled={isCancelling}
              className="flex-1 bg-red-500 text-white py-3 px-4 rounded-xl font-semibold hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isCancelling ? 'Cancelling...' : 'Cancel Ride'}
            </button>
          </motion.div>
        )}
          </div>
    </div>
  );
};

export default BookingConfirmationPage;

// Inline component: Payment modal on confirmation when payment is pending
const PaymentPrompt: React.FC<{ rideId?: string; amount?: number; }> = ({ rideId, amount }) => {
  const [status, setStatus] = React.useState<'pending'|'completed'|'cancelled'|'unknown'>('unknown');
  const [method, setMethod] = React.useState<'online'|'cash'|'unknown'>('unknown');
  const [orderId, setOrderId] = React.useState<string | null>(null);
  const [paymentId, setPaymentId] = React.useState<number | null>(null);
  const [modalOpen, setModalOpen] = React.useState<boolean>(false);
  const key = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string | undefined;
  // Runtime fetch for key if missing at build time
  const [runtimeKey, setRuntimeKey] = React.useState<string | null>(null);
  const [keyChecked, setKeyChecked] = React.useState(false);
  // Local prefill values (avoid referencing outer scope variables)
  const [prefillPhone, setPrefillPhone] = React.useState<string | undefined>(undefined);
  const [prefillEmail, setPrefillEmail] = React.useState<string | undefined>(undefined);
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (key) {
          setRuntimeKey(key);
          return;
        }
        const { getRazorpayKey } = await import('../services/razorpay');
        const k = await getRazorpayKey();
        if (mounted) setRuntimeKey(k);
      } catch {
        if (mounted) setRuntimeKey(null);
      } finally {
        if (mounted) setKeyChecked(true);
      }
    })();
    return () => { mounted = false; };
  }, [key]);
  
  // Debug: Log key status (only in development or when key is missing)
  React.useEffect(() => {
    if (!key) {
      console.warn('Razorpay key not found in environment variables', {
        hasEnv: !!(import.meta as any).env,
        envKeys: Object.keys((import.meta as any).env || {}),
        keyValue: key
      });
    } else {
      console.log('Razorpay key loaded successfully', { keyLength: key.length, keyPrefix: key.substring(0, 8) + '...' });
    }
  }, []);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        if (!rideId) return;
        const res = await api.get(`/bookings/details/${rideId}`);
        if (!mounted) return;
        const b = res.data?.booking;
        if (b?.payment_status) setStatus(b.payment_status);
        if (b?.payment_method) setMethod(b.payment_method);
        // Use phone from booking for Razorpay prefill contact
        try {
          const phoneFromBooking = b?.phone_number || b?.phone || res.data?.phoneNumber;
          if (phoneFromBooking && mounted) setPrefillPhone(String(phoneFromBooking));
        } catch {}
      } catch {}
    })();
    return () => { mounted = false; };
  }, [rideId]);

  // Fallback: fetch user profile for email/contact if available
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await api.get('/users/profile');
        if (!mounted) return;
        const u = res.data?.user || {};
        if (!prefillPhone) {
          const phone = u.phoneNumber || u.phone || u.mobile;
          if (phone) setPrefillPhone(String(phone));
        }
        const email = u.email || u.mail;
        if (email) setPrefillEmail(String(email));
      } catch {
        // ignore
      }
    })();
    return () => { mounted = false; };
  }, []); 

  if (!rideId) return null as any;
  if (status === 'completed') return null as any;

  const loadScript = (src: string) => new Promise<boolean>((resolve) => {
    if (document.querySelector(`script[src='${src}']`)) return resolve(true);
    const s = document.createElement('script'); s.src = src; s.onload = () => resolve(true); s.onerror = () => resolve(false); document.body.appendChild(s);
  });

  const onPay = async () => {
    console.log('[Razorpay] ========== PAYMENT FLOW STARTED ==========');
    console.log('[Razorpay] onPay called', { rideId, amount, paymentId, orderId, keyPresent: !!key, keyLength: key?.length });
    
    try {
      let currentPaymentId = paymentId;
      let currentOrderId = orderId;
      
      // Step 1: Create order if needed
      if (!currentPaymentId) {
        console.log('[Razorpay] Step 1: Creating payment order...', { rideId, amount: amount || 0 });
        try {
          const or = await api.post('/payments/create-order', { bookingId: rideId, amount: amount || 0 });
          console.log('[Razorpay] Order creation API response:', {
            status: or.status,
            data: or.data,
            success: or.data?.success,
            orderId: or.data?.orderId,
            paymentId: or.data?.paymentId
          });
          
          if (or.data?.success) {
            currentOrderId = or.data.orderId;
            currentPaymentId = or.data.paymentId;
            setOrderId(currentOrderId);
            setPaymentId(currentPaymentId);
            console.log('[Razorpay] ✅ Order created successfully', { currentOrderId, currentPaymentId });
          } else {
            console.error('[Razorpay] ❌ Order creation failed', { 
              rideId, 
              amount, 
              response: or.data,
              error: or.data?.message,
              status: or.status 
            });
            alert(or.data?.message || 'Failed to initiate online payment. Please try again or choose cash.');
            return;
          }
        } catch (orderErr: any) {
          console.error('[Razorpay] ❌ Order creation exception', {
            error: orderErr,
            message: orderErr?.message,
            response: orderErr?.response?.data,
            status: orderErr?.response?.status
          });
          alert('Failed to create payment order. Please try again or choose cash.');
          return;
        }
      } else {
        console.log('[Razorpay] Using existing order', { currentOrderId, currentPaymentId });
      }
      
      // Step 2: Validate order exists
      if (!currentOrderId) {
        console.error('[Razorpay] ❌ Payment order missing', { rideId, currentPaymentId, currentOrderId });
        alert('Unable to initiate payment right now. Please try again in a moment or choose cash.');
        return;
      }

      const isSimulationOrder = currentOrderId.startsWith('sim_');
      console.log('[Razorpay] Step 2: Order validation', { currentOrderId, isSimulationOrder });

      // Step 3: Check Razorpay key
      const effectiveKey = key || runtimeKey || '';
      if (!effectiveKey && !isSimulationOrder) {
        console.error('[Razorpay] ❌ Razorpay key missing for live payment', { 
          rideId, 
          currentOrderId,
          keyPresent: !!effectiveKey,
          envKeys: Object.keys((import.meta as any).env || {}),
          importMetaEnv: (import.meta as any).env
        });
        alert('Online payment gateway is temporarily unavailable. Please pay cash or try again later.');
        return;
      }

      // Step 4: Load Razorpay SDK and initialize
      if (effectiveKey && !isSimulationOrder) {
        console.log('[Razorpay] Step 3: Loading Razorpay SDK...', { keyPrefix: effectiveKey.substring(0, 8) + '...' });
        
        const scriptLoadStart = Date.now();
        const ok = await loadScript('https://checkout.razorpay.com/v1/checkout.js');
        const scriptLoadTime = Date.now() - scriptLoadStart;
        
        console.log('[Razorpay] SDK load result', { 
          success: ok, 
          loadTime: `${scriptLoadTime}ms`,
          windowRazorpay: !!(window as any).Razorpay 
        });
        
        if (!ok) {
          console.error('[Razorpay] ❌ Failed to load Razorpay SDK script');
          alert('Unable to load payment gateway. Please try again or choose cash.');
          return;
        }
        
        if (!(window as any).Razorpay) {
          console.error('[Razorpay] ❌ Razorpay SDK not available after script load', {
            windowKeys: Object.keys(window).filter(k => k.toLowerCase().includes('razor')),
            scriptLoaded: ok
          });
          alert('Unable to load Razorpay checkout. Please try again or choose cash.');
          return;
        }
        
        console.log('[Razorpay] Step 4: Initializing Razorpay checkout...', {
          key: effectiveKey.substring(0, 8) + '...',
          amount: Math.round(Number(amount || 0) * 100),
          currency: 'INR',
          orderId: currentOrderId
        });
        
        const rzp = new (window as any).Razorpay({
          key: effectiveKey,
          amount: Math.round(Number(amount || 0) * 100),
          currency: 'INR', 
          name: 'LocalToto', 
          description: 'Ride payment', 
          order_id: currentOrderId,
          handler: async (resp: any) => {
            console.log('[Razorpay] ========== PAYMENT HANDLER CALLED ==========');
            console.log('[Razorpay] Payment response received', {
              razorpay_order_id: resp.razorpay_order_id,
              razorpay_payment_id: resp.razorpay_payment_id,
              razorpay_signature: resp.razorpay_signature?.substring(0, 20) + '...',
              fullResponse: resp
            });
            
            try {
              console.log('[Razorpay] Step 5: Verifying payment with backend...', {
                bookingId: rideId,
                paymentId: currentPaymentId,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id
              });
              
              const verifyStart = Date.now();
              const vr = await api.post('/payments/verify-razorpay', {
                bookingId: rideId, 
                paymentId: currentPaymentId,
                razorpay_order_id: resp.razorpay_order_id,
                razorpay_payment_id: resp.razorpay_payment_id,
                razorpay_signature: resp.razorpay_signature
              });
              const verifyTime = Date.now() - verifyStart;
              
              console.log('[Razorpay] Verification API response', {
                status: vr.status,
                data: vr.data,
                success: vr.data?.success,
                verifyTime: `${verifyTime}ms`,
                fullResponse: vr.data
              });
              
              if (vr.data?.success) {
                console.log('[Razorpay] ✅ Payment verified successfully!');
                setStatus('completed');
                setModalOpen(false);
                console.log('[Razorpay] ========== PAYMENT FLOW COMPLETED ==========');
              } else {
                console.error('[Razorpay] ❌ Payment verification failed', { 
                  rideId, 
                  response: vr.data, 
                  currentPaymentId, 
                  currentOrderId, 
                  razorpay: resp,
                  error: vr.data?.message
                });
                alert(vr.data?.message || 'Payment verification failed. Please contact support or pay cash.');
              }
            } catch (verifyErr: any) {
              console.error('[Razorpay] ❌ Payment verification exception', {
                error: verifyErr,
                message: verifyErr?.message,
                response: verifyErr?.response?.data,
                status: verifyErr?.response?.status,
                stack: verifyErr?.stack
              });
              alert('Could not verify payment. Please try again or pay cash.');
            }
          },
          modal: {
            ondismiss: () => {
              console.log('[Razorpay] ⚠️ User dismissed/cancelled payment modal');
            }
          },
          prefill: {
            contact: prefillPhone || undefined,
            email: prefillEmail || undefined
          }
        });
        
        console.log('[Razorpay] Step 5: Opening Razorpay checkout modal...');
        rzp.on('payment.failed', (response: any) => {
          console.error('[Razorpay] ❌ Payment failed event', {
            error: response.error,
            description: response.error?.description,
            code: response.error?.code,
            source: response.error?.source,
            step: response.error?.step,
            reason: response.error?.reason,
            metadata: response.error?.metadata,
            fullResponse: response
          });
        });
        
        rzp.on('payment.authorized', (response: any) => {
          console.log('[Razorpay] ✅ Payment authorized event', response);
        });
        
        rzp.open();
        console.log('[Razorpay] Razorpay checkout modal opened');
        
      } else if (currentPaymentId && isSimulationOrder) {
        console.log('[Razorpay] Using simulation mode', { currentPaymentId, currentOrderId });
        const ver = await api.post('/payments/verify-payment', { bookingId: rideId, paymentId: currentPaymentId, success: true });
        console.log('[Razorpay] Simulated payment verification response', ver.data);
        if (ver.data?.success) {
          console.log('[Razorpay] ✅ Simulated payment completed');
          setStatus('completed');
          setModalOpen(false);
        } else {
          console.error('[Razorpay] ❌ Simulated payment verification failed', { rideId, response: ver.data, currentPaymentId });
        }
      } else {
        console.warn('[Razorpay] ⚠️ Unhandled payment scenario', { 
          keyPresent: !!key, 
          currentOrderId, 
          isSimulationOrder,
          currentPaymentId 
        });
      }
    } catch (err: any) {
      console.error('[Razorpay] ❌ Unexpected error during payment flow', {
        error: err,
        message: err?.message,
        stack: err?.stack,
        rideId,
        amount
      });
      alert('Something went wrong while processing payment. Please try again or choose cash.');
    }
  };

  return (
    <>
      <div className="w-full bg-white rounded-xl shadow p-4 border border-gray-100 mb-3">
        <div className="text-sm text-gray-800">Complete your payment now to avoid cash hassle.</div>
        <div className="mt-2 flex gap-2">
          <button onClick={() => setModalOpen(true)} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Complete Payment</button>
          <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg border border-gray-200">Later</button>
        </div>
      </div>
      
      {/* Payment Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setModalOpen(false)}></div>
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Complete Payment</h3>
            <p className="text-sm text-gray-600 mb-4">Amount due: <span className="font-semibold">₹{amount || 0}</span></p>
            <div className="flex gap-2">
              <button onClick={onPay} className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Pay Now</button>
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};