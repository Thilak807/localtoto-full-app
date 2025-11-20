import React, { useState, useEffect, useRef, useMemo } from 'react';
import LoadingOverlay from './LoadingOverlay';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, User, AlertCircle } from 'lucide-react';
import api from '../services/api';
import OlaMap from './OlaMap';

interface RideInitiatePageState {
  pickupLocation: string;
  dropLocation: string;
  pickupCoords: { lat: number; lng: number };
  dropCoords: { lat: number; lng: number };
  selectedRideType: 'private' | 'shared' | 'scheduled';
  scheduledDate: string;
  scheduledTime: string;
  routeData: any;
  fareSolo: { fare: number; duration: string };
  fareShared: { fare: number; duration: string };
  autoStartWaiting?: boolean;
  phoneNumber?: string;
}

const RideInitiatePage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as RideInitiatePageState;

  // Authentication states
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

  // Booking states
  const [isBookingRide, setIsBookingRide] = useState<boolean>(false);
  const [showBookingAnimation, setShowBookingAnimation] = useState<boolean>(false);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [driverAssigned, setDriverAssigned] = useState<boolean>(false);
  const navigatedRef = useRef<boolean>(false);
  const [driverInfo, setDriverInfo] = useState<any>(null);
  const razorpayKey = (import.meta as any).env?.VITE_RAZORPAY_KEY_ID as string | undefined;
  // Default to online to consistently show payment UI; fall back inside Pay Now when key/order missing
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'online'>(
    ((state as any)?.paymentMethod === 'online') ? 'online' : 'online'
  );
  const [paymentPending, setPaymentPending] = useState<boolean>(false);
  const [paymentModalOpen, setPaymentModalOpen] = useState<boolean>(false);
  const [paymentOrderId, setPaymentOrderId] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<number | null>(null);
  const amountDue = useMemo(() => (state?.selectedRideType === 'shared' ? state?.fareShared?.fare : state?.fareSolo?.fare) || 0, [state?.selectedRideType, state?.fareShared?.fare, state?.fareSolo?.fare]);

  const loadScript = (src: string) =>
    new Promise<boolean>((resolve) => {
      if (document.querySelector(`script[src='${src}']`)) return resolve(true);
      const script = document.createElement('script');
      script.src = src;
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Preload Razorpay checkout to avoid 10s delay
  useEffect(() => {
    if (razorpayKey) {
      loadScript('https://checkout.razorpay.com/v1/checkout.js');
    }
  }, [razorpayKey]);

  // Waiting animation states
  const [waitingTime, setWaitingTime] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [searchStatus, setSearchStatus] = useState<string>('Finding drivers...');
  const [scanProgress, setScanProgress] = useState<number>(0);
  const MAX_WAIT_SECONDS = 180; // 3 minutes
  const [expired, setExpired] = useState<boolean>(false);
  const [bootLoading, setBootLoading] = useState<boolean>(true);

  // Distance warning states
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToPickup, setDistanceToPickup] = useState<number | null>(null);
  const [showDistanceWarning, setShowDistanceWarning] = useState<boolean>(false);
  const [bookingForSelf, setBookingForSelf] = useState<boolean>(true);
  const [onlineDrivers, setOnlineDrivers] = useState<Array<{ lat: number; lng: number }>>([]);
  const [onlineCount, setOnlineCount] = useState<number>(0);

  // Cancel feedback modal
  const [showCancelFeedback, setShowCancelFeedback] = useState<boolean>(false);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [cancelOtherText, setCancelOtherText] = useState<string>('');
  const [submittingFeedback, setSubmittingFeedback] = useState<boolean>(false);

  // Wave animation states
  const [pickupMarkerPosition, setPickupMarkerPosition] = useState<{ x: number; y: number } | null>(null);
  const [mapContainerSize, setMapContainerSize] = useState<{ w: number; h: number } | null>(null);
  const mapRef = useRef<any>(null);

  // Check authentication and redirect if no state data
  useEffect(() => {
    // short boot loader
    const t = setTimeout(() => setBootLoading(false), 400);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          const response = await api.get('/users/profile');
          if (response.data?.success) {
            setIsAuthenticated(true);
            console.log('User profile data:', response.data.user);
            setPhoneNumber(response.data.user.phoneNumber || '');
          }
        }
      } catch (error) {
        console.log('User not authenticated');
      }
    };

    checkAuth();
  }, []);

  // Ensure bottom action bar is available on load for online method
  useEffect(() => {
    if (paymentMethod === 'online') {
      try { setPaymentPending(true); } catch {}
    }
  }, [paymentMethod]);

  // Redirect if accessed directly without state data
  useEffect(() => {
    if (!state || !state.pickupLocation || !state.dropLocation) {
      navigate('/', { replace: true });
    }
  }, [state, navigate]);

  // Get user location and calculate distance to pickup
  useEffect(() => {
    if (navigator.geolocation && state?.pickupCoords) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLat = position.coords.latitude;
          const userLng = position.coords.longitude;
          setUserLocation({ lat: userLat, lng: userLng });

          // Calculate distance to pickup point
          const distance = calculateDistance(
            userLat,
            userLng,
            state.pickupCoords.lat,
            state.pickupCoords.lng
          );
          setDistanceToPickup(distance);

          // Show warning if distance > 200m
          if (distance > 200) {
            setShowDistanceWarning(true);
          }
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, [state?.pickupCoords]);

  // Fetch online driver count and sample pins, refresh periodically
  useEffect(() => {
    let cancelled = false;
    let timer: number | null = null;
    const load = async () => {
      try {
        const params: any = {};
        if (userLocation && typeof userLocation.lat === 'number' && typeof userLocation.lng === 'number') {
          params.lat = userLocation.lat; params.lng = userLocation.lng;
        }
        const res = await api.get('/riders/online-drivers', { params });
        const backendCount = typeof res.data?.count === 'number' ? res.data.count : 0;
        const drivers = Array.isArray(res.data?.drivers) ? res.data.drivers : [];
        if (!cancelled) { setOnlineDrivers(drivers); setOnlineCount(backendCount); }
      } catch {}
    };
    // initial fetch without waiting for geolocation
    load();
    // refresh every 10s
    // @ts-ignore
    timer = window.setInterval(load, 10000);
    return () => { cancelled = true; if (timer) window.clearInterval(timer); };
  }, [userLocation?.lat, userLocation?.lng]);

  // Calculate pickup marker position when booking animation starts
  useEffect(() => {
    if (showBookingAnimation) {
      // Small delay to ensure map is loaded
      const timer = setTimeout(() => {
        calculatePickupMarkerPosition();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showBookingAnimation]);

  // Memoize route data to avoid identity changes causing map layer flicker
  const memoRouteData = useMemo(() => {
    if (!state?.routeData) return undefined;
    const rd = state.routeData;
    return {
      coordinates: rd.coordinates as any,
      distance: rd.distance,
      duration: rd.duration,
      provider: rd.provider
    };
  }, [state?.routeData?.coordinates, state?.routeData?.distance, state?.routeData?.duration, state?.routeData?.provider]);

  // Waiting animation effects
  useEffect(() => {
    if (!showBookingAnimation) return;

    // Timer for waiting time
    const timerInterval = setInterval(() => {
      setWaitingTime(prev => prev + 1);
    }, 1000);

    // Step progression animation
    const stepInterval = setInterval(() => {
      setCurrentStep(prev => (prev + 1) % 4);
    }, 3000);

    // Scan progress animation
    const scanInterval = setInterval(() => {
      setScanProgress(prev => (prev + 2) % 100);
    }, 100);

    // Status updates based on time
    const statusInterval = setInterval(() => {
      const time = waitingTime;
      // progress percentage used by bar; computed in render
      if (time < 60) {
        setSearchStatus(`Finding drivers...`);
      } else if (time < 120) {
        setSearchStatus('Notifying nearby drivers...');
      } else if (time < MAX_WAIT_SECONDS) {
        setSearchStatus('Awaiting driver confirmation...');
      } else {
        setSearchStatus('No drivers available nearby');
      }
      setScanProgress((prev) => (prev + 2) % 100);
    }, 1000);

    return () => {
      clearInterval(timerInterval);
      clearInterval(stepInterval);
      clearInterval(scanInterval);
      clearInterval(statusInterval);
    };
  }, [showBookingAnimation, waitingTime]);

  // Expire the ride when maximum waiting time is reached
  useEffect(() => {
    if (!showBookingAnimation || expired) return;
    if (waitingTime >= MAX_WAIT_SECONDS) {
      (async () => {
        // Stop the search UI and mark as expired; do NOT auto-cancel so user can retry
        setExpired(true);
        setShowBookingAnimation(false);
        setPaymentModalOpen(false);
        setPaymentPending(false);
      })();
    }
  }, [waitingTime, showBookingAnimation, expired, bookingId, navigate]);

  const retrySearch = async () => {
    // Restart the 3-minute window; keep existing booking if any
    setExpired(false);
    setWaitingTime(0);
    setCurrentStep(0);
    setScanProgress(0);
    setSearchStatus('Finding drivers...');
    setShowBookingAnimation(true);
    // If there is no booking yet (edge case), create one
    if (!bookingId) {
      await handleBookRide();
    }
  };

  // Calculate distance between two points using Haversine formula
  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lng2 - lng1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in meters
  };

  // Calculate pickup marker position on map
  const calculatePickupMarkerPosition = () => {
    if (mapRef.current && state?.pickupCoords) {
      try {
        // Get the map instance from the ref
        const map = mapRef.current;
        console.log('Map instance:', map);
        console.log('Pickup coords:', state.pickupCoords);
        
        // Try different methods to get pixel coordinates
        if (map && typeof map.project === 'function') {
          // Method 1: Use map.project() if available
          const point = map.project([state.pickupCoords.lng, state.pickupCoords.lat]);
          console.log('Projected point:', point);
          setPickupMarkerPosition({ x: point.x, y: point.y });
        } else if (map && map.getContainer) {
          // Method 2: Calculate based on map bounds and container size
          const container = map.getContainer();
          const containerRect = container.getBoundingClientRect();
          setMapContainerSize({ w: containerRect.width, h: containerRect.height });
          const mapCenter = map.getCenter();
          const mapZoom = map.getZoom();
          
          console.log('Container rect:', containerRect);
          console.log('Map center:', mapCenter);
          console.log('Map zoom:', mapZoom);
          
          // Calculate approximate position based on lat/lng difference
          const latDiff = state.pickupCoords.lat - mapCenter.lat;
          const lngDiff = state.pickupCoords.lng - mapCenter.lng;
          
          // Approximate conversion (this is a rough calculation)
          const pixelsPerDegree = Math.pow(2, mapZoom) * 256 / 360;
          const x = containerRect.width / 2 + (lngDiff * pixelsPerDegree);
          const y = containerRect.height / 2 - (latDiff * pixelsPerDegree);
          
          console.log('Calculated position:', { x, y });
          setPickupMarkerPosition({ x, y });
        } else {
          // Method 3: Fallback to center
          console.log('Using fallback center position');
          setPickupMarkerPosition({ x: 192, y: 192 });
        }
      } catch (error) {
        console.log('Could not calculate marker position:', error);
        // Fallback to center if calculation fails
        setPickupMarkerPosition({ x: 192, y: 192 });
      }
    }
  };

  // Handle OTP sending
  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert('Please enter a valid 10-digit phone number');
      return;
    }

    setIsSendingOtp(true);
    try {
      const response = await api.post('/users/send-otp', { phoneNumber });
      if (response.data?.success) {
        setOtpSent(true);
        alert('OTP sent successfully!');
      } else {
        alert(response.data?.message || 'Failed to send OTP');
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      alert('Please enter a valid 6-digit OTP');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const response = await api.post('/users/verify-otp', { phoneNumber, otp });
      if (response.data?.success) {
        setIsAuthenticated(true);
        localStorage.setItem('token', response.data.token);
        alert('Phone number verified successfully!');
      } else {
        alert(response.data?.message || 'Invalid OTP');
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Handle ride booking
  const handleBookRide = async () => {
    if (!isAuthenticated) {
      alert('Please verify your phone number first');
      return;
    }

    setIsBookingRide(true);
    setShowBookingAnimation(true);
    setWaitingTime(0);
    setCurrentStep(0);
    setSearchStatus('Finding drivers...');
    setScanProgress(0);

    try {
      const rideType = state.selectedRideType === 'scheduled' ? 'private' : state.selectedRideType;

      const bookingData = {
        pickupLocation: { address: state.pickupLocation, coords: state.pickupCoords },
        dropoffLocation: { address: state.dropLocation, coords: state.dropCoords },
        rideType: rideType,
        paymentMethod: paymentMethod,
        firstName: 'User',
        lastName: '',
        phoneNumber: phoneNumber,
        scheduledDate: state.scheduledDate,
        scheduledTime: state.scheduledTime,
        bookingForSelf: bookingForSelf
      };

      const response = await api.post('/bookings/book', bookingData);

      if (response.data?.success) {
        const rideId = response.data.bookingId || response.data.rideId;
        setBookingId(rideId);
        // If online, immediately create order and open payment modal
        if (paymentMethod === 'online') {
          try {
            const orderRes = await api.post('/payments/create-order', { bookingId: rideId, amount: amountDue });
            if (orderRes.data?.success) {
              setPaymentPending(true);
              setPaymentOrderId(orderRes.data.orderId);
              setPaymentId(orderRes.data.paymentId);
              setPaymentModalOpen(true);
            }
          } catch (_) {
            setPaymentPending(true);
            setPaymentModalOpen(true);
          }
        }
        // Keep showing the map (waiting room) and poll for driver assignment
        // We will navigate once a driver confirms the ride
      } else {
        alert(response.data?.message || 'Failed to book ride');
        setShowBookingAnimation(false);
      }
    } catch (error: any) {
      alert(error?.response?.data?.message || 'Failed to book ride');
      setShowBookingAnimation(false);
    } finally {
      setIsBookingRide(false);
    }
  };

  // Handle driver assignment (simulated)
  const simulateDriverAssignment = () => {
    const mockDriver = {
      id: 'driver_123',
      name: 'Rajesh Kumar',
      phone: '+91 98765 43210',
      vehicle: {
        model: 'Maruti Swift',
        number: 'DL 01 AB 1234',
        color: 'White'
      },
      rating: 4.8,
      eta: '5 mins'
    };

    setDriverAssigned(true);
    setDriverInfo(mockDriver);

    // Navigate to booking confirmation page
    navigate('/booking-confirmation', {
      state: {
        bookingId,
        driverInfo: mockDriver,
        pickupLocation: state.pickupLocation,
        dropLocation: state.dropLocation,
        fare: state.selectedRideType === 'shared' ? state.fareShared.fare : state.fareSolo.fare,
        duration: state.selectedRideType === 'shared' ? state.fareShared.duration : state.fareSolo.duration
      }
    });
  };

  // After booking, poll assignment and navigate when confirmed
  useEffect(() => {
    if (!bookingId) return;
    let active = true;
    let inFlight = false;
    let intervalId: number | undefined;

    const tick = async () => {
      if (!active) return;
      if (document.visibilityState === 'hidden') return; // pause when tab hidden
      if (inFlight) return; // debounce overlapping requests
      inFlight = true;
      try {
        const res = await api.get(`/bookings/details/${bookingId}`);
        const booking = res.data?.booking;
        const assigned = !!(booking?.driver) || !!res.data?.driver;
        const payStatus = booking?.payment_status || 'pending';
        if (assigned) {
          setDriverAssigned(true);
          // Do not gate navigation on payment; user can complete payment from confirmation or earlier
          if (paymentMethod === 'online' && payStatus !== 'completed') {
            setPaymentPending(true);
            setPaymentModalOpen(false);
          }
          if (!navigatedRef.current) {
            navigatedRef.current = true;
            navigate('/booking-confirmation', {
              state: {
                rideId: bookingId,
                startOtp: res.data?.booking?.ride_start_otp || undefined,
                fare: booking?.fare,
                distance: booking?.distance,
                duration: booking?.duration,
                rideType: booking?.ride_type,
                pickupAddress: state.pickupLocation,
                dropAddress: state.dropLocation,
                pickupCoords: state.pickupCoords,
                dropCoords: state.dropCoords
              }
            });
          }
        }
      } catch {}
      finally {
        inFlight = false;
      }
    };

    // Kick an immediate request, then poll ~9s (8–10s target)
    tick();
    intervalId = window.setInterval(tick, 9000);

    const onVis = () => {
      if (document.visibilityState === 'visible') {
        tick();
      }
    };
    document.addEventListener('visibilitychange', onVis);

    return () => {
      active = false;
      if (intervalId) window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', onVis);
    };
  }, [bookingId, navigate, paymentMethod, state?.pickupLocation, state?.dropLocation, state?.pickupCoords, state?.dropCoords]);

  // Safety: if driverAssigned flag flips by any other means, navigate once
  useEffect(() => {
    if (driverAssigned && bookingId && !navigatedRef.current) {
      navigatedRef.current = true;
      navigate('/booking-confirmation', {
        state: {
          rideId: bookingId,
          startOtp: undefined,
          fare: state?.selectedRideType === 'shared' ? state?.fareShared?.fare : state?.fareSolo?.fare,
          distance: undefined,
          duration: state?.selectedRideType === 'shared' ? state?.fareShared?.duration : state?.fareSolo?.duration,
          rideType: state?.selectedRideType,
          pickupAddress: state.pickupLocation,
          dropAddress: state.dropLocation,
          pickupCoords: state.pickupCoords,
          dropCoords: state.dropCoords
        }
      });
    }
  }, [driverAssigned]);

  // Auto-start waiting map if autoStartWaiting is true
  useEffect(() => {
    if (state?.autoStartWaiting && !showBookingAnimation) {
      // kick off booking immediately and show waiting map
      setShowBookingAnimation(true);
      setWaitingTime(0);
      setCurrentStep(0);
      setSearchStatus('Finding drivers...');
      setScanProgress(0);
      (async () => {
        try {
          const rideType = state.selectedRideType === 'scheduled' ? 'private' : state.selectedRideType;
          const bookingData = {
            pickupLocation: { address: state.pickupLocation, coords: state.pickupCoords },
            dropoffLocation: { address: state.dropLocation, coords: state.dropCoords },
            rideType,
            paymentMethod: paymentMethod,
            firstName: 'User',
            lastName: '',
            phoneNumber: state.phoneNumber || phoneNumber,
            scheduledDate: state.scheduledDate,
            scheduledTime: state.scheduledTime,
            bookingForSelf: bookingForSelf
          };
          const response = await api.post('/bookings/book', bookingData);
          if (response.data?.success) {
            const rideId = response.data.bookingId || response.data.rideId;
            setBookingId(rideId);
            // If online payment is selected, create order immediately and open sheet
            if (paymentMethod === 'online') {
              try {
                const orderRes = await api.post('/payments/create-order', { bookingId: rideId, amount: amountDue });
                if (orderRes.data?.success) {
                  setPaymentOrderId(orderRes.data.orderId);
                  setPaymentId(orderRes.data.paymentId);
                  setPaymentPending(true);
                  setPaymentModalOpen(true);
                }
              } catch (_) {
                setPaymentPending(true);
                setPaymentModalOpen(true);
              }
            }
          } else {
            alert(response.data?.message || 'Failed to book ride');
            setShowBookingAnimation(false);
          }
        } catch (e: any) {
          alert(e?.response?.data?.message || 'Failed to book ride');
          setShowBookingAnimation(false);
        }
      })();
    }
  }, [state?.autoStartWaiting]);

  // Show loading screen if no state data
  if (!state) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <div className="text-gray-600">Loading ride details...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4 pt-20">
      {(bootLoading) && <LoadingOverlay message="Loading..." />}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Back button removed per request; users can cancel or complete payment below */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Ride Details Section removed per requirement */}

          {/* Interactive Waiting Map - Shows during booking animation */}
          {showBookingAnimation && (
            <motion.div
              className="col-span-2 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 relative overflow-hidden"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              {/* Animated gradient background */}
              <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 opacity-30">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
              </div>
              
              {/* Header with progress indicators */}
              <div className="relative z-10 text-center mb-6">
                <h2 className="text-xl font-bold text-gray-900 mb-2" aria-live="polite">
                  {searchStatus}
                </h2>
                
                {/* Progress dots with shimmer */}
                <div className="flex justify-center space-x-2 mb-4">
                  {[0, 1, 2, 3].map((step) => (
                    <div
                      key={step}
                      className={`w-3 h-3 rounded-full transition-all duration-500 ${
                        step <= currentStep
                          ? 'bg-green-500 shadow-lg shadow-green-500/50'
                          : 'bg-gray-300'
                      }`}
                    >
                      {step === currentStep && (
                        <div className="w-full h-full rounded-full bg-green-400 animate-ping"></div>
                      )}
                    </div>
                  ))}
                </div>

                {/* Count-up timer */}
                <div className="text-2xl font-mono font-bold text-green-600 mb-2">
                  Waiting {String(Math.floor(waitingTime / 60)).padStart(2, '0')}:{String(waitingTime % 60).padStart(2, '0')}
                </div>

                {/* Progress bar with steps */}
                <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className={`h-2 rounded-full transition-all duration-700 ease-out ${expired ? 'bg-red-500' : 'bg-gradient-to-r from-green-500 to-blue-500'}`}
                    style={{ width: `${Math.min(100, Math.round((waitingTime / MAX_WAIT_SECONDS) * 100))}%` }}
                  ></div>
                </div>

                {/* Step labels */}
                <div className="flex justify-between text-xs text-gray-600 mb-4">
                  <span className={currentStep >= 0 ? 'text-green-600 font-semibold' : ''}>Finding</span>
                  <span className={currentStep >= 1 ? 'text-green-600 font-semibold' : ''}>Notifying</span>
                  <span className={currentStep >= 2 ? 'text-green-600 font-semibold' : ''}>Awaiting</span>
                  <span className={currentStep >= 3 ? 'text-green-600 font-semibold' : ''}>{expired ? 'Expired' : 'Assigned'}</span>
                </div>
              </div>
              
              {/* Interactive Map with animations */}
              <div className="relative h-96 bg-gray-100 rounded-lg overflow-hidden">
                <OlaMap
                  pickup={state.pickupCoords}
                  dropoff={state.dropCoords}
                  routeData={memoRouteData}
                  height="384px"
                  enableGeolocate={false}
                  driverPins={onlineDrivers}
                  onMapReady={(map) => {
                    mapRef.current = map;
                    console.log('Map ready, setting up position calculation...');
                    
                    // Wait for map to be fully loaded before calculating position
                    map.on('load', () => {
                      console.log('Map loaded, calculating pickup position...');
                      setTimeout(() => {
                        calculatePickupMarkerPosition();
                      }, 1000);
                    });
                    
                    // Also try immediately in case map is already loaded
                    setTimeout(() => {
                      calculatePickupMarkerPosition();
                    }, 500);

                    // Keep ring locked to pickup during map interactions
                    try {
                      const recalc = () => calculatePickupMarkerPosition();
                      map.on('move', recalc);
                      map.on('zoom', recalc);
                      map.on('resize', recalc);
                    } catch (_) {}
                  }}
                />

                {/* Scan sweep animation */}
                <div 
                  className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-green-400 to-transparent opacity-60"
                  style={{
                    transform: `translateX(${scanProgress}%)`,
                    transition: 'transform 0.1s linear'
                  }}
                ></div>

                {/* Pulsing ring at pickup location - size scales with map container */}
                {pickupMarkerPosition && (
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      left: pickupMarkerPosition.x,
                      top: pickupMarkerPosition.y,
                      transform: 'translate(-50%, -50%)'
                    }}
                  >
                    <div
                      className="wave-ring-1"
                      style={{
                        width: `${Math.max(12, Math.min(20, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.03))) }px`,
                        height: `${Math.max(12, Math.min(20, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.03))) }px`
                      }}
                    ></div>
                    <div
                      className="wave-ring-2"
                      style={{
                        width: `${Math.max(28, Math.min(40, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.06))) }px`,
                        height: `${Math.max(28, Math.min(40, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.06))) }px`
                      }}
                    ></div>
                    <div
                      className="wave-ring-3"
                      style={{
                        width: `${Math.max(44, Math.min(60, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.09))) }px`,
                        height: `${Math.max(44, Math.min(60, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.09))) }px`
                      }}
                    ></div>
                    <div
                      className="wave-ring-4"
                      style={{
                        width: `${Math.max(60, Math.min(80, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.12))) }px`,
                        height: `${Math.max(60, Math.min(80, (Math.min(mapContainerSize?.w || 384, mapContainerSize?.h || 384) * 0.12))) }px`
                      }}
                    ></div>
                  </div>
                )}

                {/* Online drivers badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1 text-xs font-semibold text-gray-700 shadow-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span>{onlineCount} drivers online</span>
                  </div>
                </div>
                
                {/* ETA hint */}
                <div className="absolute bottom-3 left-3 bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs font-medium text-gray-700 shadow-lg">
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span>Most drivers accept in ~2-4 min</span>
                  </div>
                </div>
              </div>

              {/* Top-right Cancel button (fixed, consistent with driver offline button) */}
                <button
                  onClick={async () => {
                    try {
                    if (bookingId) {
                      await api.post(`/bookings/cancel/${bookingId}`);
                    }
                      setShowBookingAnimation(false);
                      setWaitingTime(0);
                      setCurrentStep(0);
                    setShowCancelFeedback(true);
                    } catch (e: any) {
                      alert(e?.response?.data?.message || 'Failed to cancel ride');
                    }
                  }}
                className="fixed top-0 right-0 z-40 p-3 px-3 py-1.5 bg-gray-700 text-white rounded-lg hover:bg-gray-800 transition-colors text-xs font-medium"
                >
                Cancel
                </button>

              {/* Custom CSS for animations */}
                <style>{`
                  .wave-ring-1 {
                    position: absolute;
                    width: 20px;
                    height: 20px;
                    background: rgba(34, 197, 94, 0.6);
                    border-radius: 50%;
                  animation: waveExpand 2s infinite;
                    transform: translate(-50%, -50%);
                  }
                  .wave-ring-2 {
                    position: absolute;
                    width: 40px;
                    height: 40px;
                    background: rgba(34, 197, 94, 0.5);
                    border-radius: 50%;
                  animation: waveExpand 2.5s infinite 0.3s;
                    transform: translate(-50%, -50%);
                  }
                  .wave-ring-3 {
                    position: absolute;
                    width: 60px;
                    height: 60px;
                    background: rgba(34, 197, 94, 0.4);
                    border-radius: 50%;
                  animation: waveExpand 3s infinite 0.6s;
                    transform: translate(-50%, -50%);
                  }
                  .wave-ring-4 {
                    position: absolute;
                    width: 80px;
                    height: 80px;
                    background: rgba(34, 197, 94, 0.3);
                    border-radius: 50%;
                  animation: waveExpand 3.5s infinite 0.9s;
                    transform: translate(-50%, -50%);
                  }
                  
                  @keyframes waveExpand {
                    0% {
                      transform: translate(-50%, -50%) scale(0.2);
                      opacity: 0.8;
                    }
                    30% {
                      opacity: 0.6;
                    }
                    70% {
                      opacity: 0.3;
                    }
                    100% {
                    transform: translate(-50%, -50%) scale(3);
                      opacity: 0;
                    }
                  }

                @keyframes shimmer {
                  0% { transform: translateX(-100%); }
                  100% { transform: translateX(100%); }
                }
              `}</style>
            </motion.div>
          )}

          {/* Authentication & Booking Section */}
          {!showBookingAnimation && !state?.autoStartWaiting && (
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Complete Your Ride</h2>
              {/* Payment Method */}
              <div className="mb-4">
                <div className="text-xs text-gray-500 uppercase tracking-wide mb-2">Payment Method</div>
                <div className="flex gap-2">
                  <button type="button" onClick={()=>setPaymentMethod('cash')} className={`px-3 py-2 rounded border ${paymentMethod==='cash'?'border-green-500 bg-green-50':'border-gray-200'}`}>Cash</button>
                  <button type="button" onClick={()=>setPaymentMethod('online')} className={`px-3 py-2 rounded border ${paymentMethod==='online'?'border-green-500 bg-green-50':'border-gray-200'}`}>Online</button>
                </div>
              </div>
              
              {/* Phone Verification Section */}
              {!isAuthenticated && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter 10-digit number"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        maxLength={10}
                      />
                      <button
                        onClick={handleSendOtp}
                        disabled={!phoneNumber || phoneNumber.length !== 10 || isSendingOtp}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSendingOtp ? 'Sending...' : 'Send OTP'}
                      </button>
                    </div>
                  </div>

                  {otpSent && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Enter OTP
                      </label>
                      <div className="flex space-x-2">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="Enter 6-digit OTP"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                          maxLength={6}
                        />
                        <button
                          onClick={handleVerifyOtp}
                          disabled={!otp || otp.length !== 6 || isVerifyingOtp}
                          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isVerifyingOtp ? 'Verifying...' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  )}

                  {otpSent && (
                    <button
                      onClick={handleBookRide}
                      disabled={isBookingRide || !isAuthenticated}
                      className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                      {isBookingRide ? 'Booking Ride...' : 'Book Ride Now'}
                    </button>
                  )}
                </div>
              )}

              {/* Authenticated User Section */}
              {isAuthenticated && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        placeholder="Enter 10-digit number"
                        className="w-full pr-10 pl-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                        maxLength={10}
                      />
                      <button
                        onClick={() => {
                          setIsAuthenticated(false);
                          setOtpSent(false);
                          setOtp('');
                        }}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-gray-500 hover:text-gray-700"
                        aria-label="Change phone"
                        title="Change phone"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5"><path d="M16.862 4.487l1.687-1.687a2.25 2.25 0 113.182 3.182L10.94 16.774a9 9 0 01-3.182 2.012l-2.592.973a.75.75 0 01-.948-.948l.973-2.592A9 9 0 018.203 13.04l9.66-8.553z"/><path d="M16.862 4.487L19.5 7.125"/></svg>
                      </button>
                    </div>
                    <div className="text-xs text-green-600 mt-1 flex items-center">
                      <User className="w-3 h-3 mr-1" />
                      Verified ✓
                    </div>
                  </div>

                  <button
                    onClick={handleBookRide}
                    disabled={isBookingRide}
                    className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                  >
                    {isBookingRide ? 'Booking Ride...' : 'Book Ride Now'}
                  </button>
                </div>
              )}

              {/* Distance Warning */}
              {isAuthenticated && showDistanceWarning && distanceToPickup && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
                  <div className="flex items-start">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-yellow-800">
                        You are {Math.round(distanceToPickup)}m away from pickup point
                      </h3>
                      <p className="text-sm text-yellow-700 mt-1">
                        Are you booking for yourself or someone else?
                      </p>
                      <div className="mt-3 space-x-2">
                        <button
                          onClick={() => setBookingForSelf(true)}
                          className={`px-3 py-1 text-sm rounded ${
                            bookingForSelf ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          For Myself
                        </button>
                        <button
                          onClick={() => setBookingForSelf(false)}
                          className={`px-3 py-1 text-sm rounded ${
                            !bookingForSelf ? 'bg-yellow-600 text-white' : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          For Someone Else
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {/* Cancel button only - payment removed from this page */}
          {showBookingAnimation && bookingId && (
            <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[90]">
              <button
                onClick={async ()=>{
                  try {
                    if (bookingId) {
                      try { await api.post(`/bookings/cancel/${bookingId}`); } catch (e:any) {
                        // If already cancelled or not found, proceed to feedback/home
                      }
                    }
                    setShowBookingAnimation(false);
                    setWaitingTime(0);
                    setCurrentStep(0);
                    setShowCancelFeedback(true);
                  } catch (e: any) {
                    alert(e?.response?.data?.message || 'Failed to cancel ride');
                  }
                }}
                className="bg-gray-200 text-gray-800 px-4 py-2 rounded-full shadow hover:bg-gray-300 text-sm"
              >
                Cancel Ride
              </button>
            </div>
          )}
        </div>
      </motion.div>

      {/* Cancel Feedback Modal */}
      {showCancelFeedback && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { /* force feedback flow */ }}></div>
          <div className="relative z-10 w-full max-w-md bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">Help us improve</h3>
            <p className="text-sm text-gray-600 mb-4">Why did you cancel the ride?</p>
            <div className="space-y-2">
              {['Driver taking too long', 'Change of plans', 'Booked by mistake', 'Price too high', 'Other'].map((opt) => (
                <label key={opt} className="flex items-center gap-2 text-sm text-gray-800">
                  <input
                    type="radio"
                    name="cancel-reason"
                    value={opt}
                    checked={cancelReason === opt}
                    onChange={() => setCancelReason(opt)}
                  />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
            {cancelReason === 'Other' && (
              <div className="mt-3">
                <input
                  type="text"
                  value={cancelOtherText}
                  onChange={(e) => setCancelOtherText(e.target.value)}
                  placeholder="Tell us more (optional)"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  maxLength={200}
                />
              </div>
            )}
            <div className="mt-5 flex justify-end gap-3">
              <button
                type="button"
                onClick={async () => {
                  // Submit feedback (best-effort), then redirect home
                  if (bookingId && cancelReason) {
                    setSubmittingFeedback(true);
                    try {
                      const reason = cancelReason === 'Other' ? (cancelOtherText || 'Other') : cancelReason;
                      await api.post(`/bookings/cancel-feedback/${bookingId}`, { reason });
                    } catch (_) {
                      // ignore errors
                    } finally {
                      setSubmittingFeedback(false);
                    }
                  }
                  setShowCancelFeedback(false);
                  navigate('/');
                }}
                disabled={submittingFeedback || !cancelReason}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                {submittingFeedback ? 'Submitting…' : 'Submit'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RideInitiatePage;