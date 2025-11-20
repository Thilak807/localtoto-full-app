import React, { useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft } from 'lucide-react';
import { geocodeToCoords } from '../services/geocode';
import api from '../services/api';
import olaMapsService, { RouteResponse } from '../services/olaMapsService';
import LoadingOverlay from './LoadingOverlay';
import LocationAutocomplete from './LocationAutocomplete';

interface BookingState {
  rideType: 'solo' | 'shared';
  pickupLocation: string;
  dropLocation: string;
  isScheduled: boolean;
  scheduledDate?: string;
  scheduledTime?: string;
}

const BookingDetailsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state || {}) as BookingState;

  const [pickupAddress, setPickupAddress] = useState<string>(state.pickupLocation);
  const [dropAddress, setDropAddress] = useState<string>(state.dropLocation);
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(
    (location.state as any)?.pickupCoords || null
  );
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(
    (location.state as any)?.dropCoords || null
  );
  const [selectedRideType, setSelectedRideType] = useState<'private' | 'shared' | 'scheduled'>('private');
  const [fareSolo, setFareSolo] = useState<{ fare: number; duration: string } | null>(null);
  const [fareShared, setFareShared] = useState<{ fare: number; duration: string } | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  const [routeData, setRouteData] = useState<RouteResponse | null>(null);
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  // Lightweight auth for phone-only login on this page
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [phoneVerified, setPhoneVerified] = useState<boolean>(false);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [hasToken] = useState<boolean>(typeof window !== 'undefined' ? Boolean(localStorage.getItem('token')) : false);
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [otp, setOtp] = useState<string>('');
  const [otpSent, setOtpSent] = useState<boolean>(false);
  const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);
  const [isEditingPhone, setIsEditingPhone] = useState<boolean>(false);
  const [isEditingPickup, setIsEditingPickup] = useState<boolean>(false);
  const [isEditingDrop, setIsEditingDrop] = useState<boolean>(false);
  const [otpCooldown, setOtpCooldown] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = sessionStorage.getItem('otpCooldown');
    return stored ? Number(stored) || 0 : 0;
  });
  const [otpSendCount, setOtpSendCount] = useState<number>(() => {
    if (typeof window === 'undefined') return 0;
    const stored = sessionStorage.getItem('otpSendCount');
    return stored ? Number(stored) || 0 : 0;
  });
  const [otpFeedback, setOtpFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);
  const MAX_OTP_REQUESTS = 5;

  const pickupEditSnapshotRef = useRef<{ address: string; coords: { lat: number; lng: number } | null } | null>(null);
  const dropEditSnapshotRef = useRef<{ address: string; coords: { lat: number; lng: number } | null } | null>(null);

  const handlePickupInputChange = (value: string) => {
    setPickupAddress(value);
    if (!value) {
      setPickupCoords(null);
    }
  };

  const handleDropInputChange = (value: string) => {
    setDropAddress(value);
    if (!value) {
      setDropCoords(null);
    }
  };

  const handlePickupLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setPickupAddress(location.address);
    setPickupCoords({ lat: location.lat, lng: location.lng });
    pickupEditSnapshotRef.current = null;
    setIsEditingPickup(false);
  };

  const handleDropLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setDropAddress(location.address);
    setDropCoords({ lat: location.lat, lng: location.lng });
    dropEditSnapshotRef.current = null;
    setIsEditingDrop(false);
  };

  const openPickupEditor = () => {
    pickupEditSnapshotRef.current = { address: pickupAddress, coords: pickupCoords };
    setIsEditingPickup(true);
  };

  const cancelPickupEdit = () => {
    if (pickupEditSnapshotRef.current) {
      setPickupAddress(pickupEditSnapshotRef.current.address);
      setPickupCoords(pickupEditSnapshotRef.current.coords);
    }
    pickupEditSnapshotRef.current = null;
    setIsEditingPickup(false);
  };

  const openDropEditor = () => {
    dropEditSnapshotRef.current = { address: dropAddress, coords: dropCoords };
    setIsEditingDrop(true);
  };

  const cancelDropEdit = () => {
    if (dropEditSnapshotRef.current) {
      setDropAddress(dropEditSnapshotRef.current.address);
      setDropCoords(dropEditSnapshotRef.current.coords);
    }
    dropEditSnapshotRef.current = null;
    setIsEditingDrop(false);
  };


  // Initialize coords from given addresses for map (parallel), but don't gate UI on both
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        if (!pickupCoords) {
          const p = await geocodeToCoords(state.pickupLocation);
          if (!cancelled && p) setPickupCoords(p);
        }
      } catch {}
      try {
        if (!dropCoords) {
          const d = await geocodeToCoords(state.dropLocation);
          if (!cancelled && d) setDropCoords(d);
        }
      } catch {}
    })();
    return () => { cancelled = true; };
  }, [state.pickupLocation, state.dropLocation]);

  // Watch geolocation for live location
  useEffect(() => {
    // establish auth state (token present and valid profile)
    (async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        if (!token) { setIsAuthenticated(false); setAuthChecked(true); return; }
        const res = await api.get('/users/profile');
        if (res.data?.success) {
          setIsAuthenticated(true);
          setPhoneNumber(res.data?.user?.phoneNumber || '');
        } else {
          setIsAuthenticated(false);
        }
      } catch {
        setIsAuthenticated(false);
      } finally {
        setAuthChecked(true);
      }
    })();
    // removed geolocation watcher
  }, []);

  // Clear rideFlow flag on entering booking-details
  useEffect(() => { try { sessionStorage.removeItem('rideFlow'); } catch {} }, []);

  // Fetch route and fare estimates when both coordinates are available
  useEffect(() => {
    if (!pickupCoords || !dropCoords) return;

    const fetchRouteAndFares = async () => {
      setPageLoading(true);
      let route: RouteResponse | null = null;

      try {
        route = await olaMapsService.getRoute(pickupCoords, dropCoords);
        setRouteData(route);
      } catch (error) {
        console.error('Error fetching route:', error);
        setTimeout(() => setPageLoading(false), 200);
        return;
      }

      try {
        const [soloFareRes, sharedFareRes] = await Promise.all([
          api.post('/bookings/calculate-fare', {
            pickup: pickupCoords,
            dropoff: dropCoords,
            rideType: 'private'
          }),
          api.post('/bookings/calculate-fare', {
            pickup: pickupCoords,
            dropoff: dropCoords,
            rideType: 'shared'
          })
        ]);

        if (soloFareRes.data?.success) {
          setFareSolo({
            fare: soloFareRes.data.fare,
            duration: soloFareRes.data.duration
          });
        }

        if (sharedFareRes.data?.success) {
          setFareShared({
            fare: sharedFareRes.data.fare,
            duration: sharedFareRes.data.duration
          });
        }
      } catch (error) {
        console.error('Error fetching fares:', error);
        if (route) {
          const baseFare = Math.round(route.distance * 12 + 50);
          const durationText = `${Math.round(route.duration / 60)} mins`;
          setFareSolo({ fare: baseFare, duration: durationText });
          setFareShared({ fare: Math.round(baseFare * 0.7), duration: durationText });
        }
      } finally {
        setTimeout(() => setPageLoading(false), 200);
      }
    };

    fetchRouteAndFares();
  }, [pickupCoords, dropCoords]);

  const handleConfirm = () => {
    // Navigate to RideInitiatePage with booking details
    navigate('/ride-initiate', {
      state: {
        pickupLocation: pickupAddress,
        dropLocation: dropAddress,
        pickupCoords,
        dropCoords,
        selectedRideType,
        scheduledDate,
        scheduledTime,
        routeData,
        fareSolo,
        fareShared
      }
    });
  };

  // Phone-only OTP flow
  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('otpSendCount', String(otpSendCount));
  }, [otpSendCount]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    sessionStorage.setItem('otpCooldown', String(otpCooldown));
  }, [otpCooldown]);

  useEffect(() => {
    if (otpCooldown <= 0) return;
    const timer = window.setInterval(() => {
      setOtpCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => window.clearInterval(timer);
  }, [otpCooldown]);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      setOtpFeedback({ type: 'error', message: 'Enter a valid 10-digit phone number.' });
      return;
    }
    if (otpSendCount >= MAX_OTP_REQUESTS) {
      setOtpFeedback({ type: 'error', message: 'Maximum OTP requests reached for this session. Please try again later.' });
      return;
    }
    if (otpCooldown > 0) {
      setOtpFeedback({ type: 'info', message: `Please wait ${otpCooldown}s before requesting another OTP.` });
      return;
    }
    setIsSendingOtp(true);
    setOtpFeedback(null);
    try {
      const res = await api.post('/users/send-otp', { phoneNumber });
      if (res.data?.success) {
        setOtpSent(true);
        setOtpSendCount((count) => count + 1);
        setOtpCooldown(45);
        setOtpFeedback({ type: 'success', message: 'OTP sent successfully.' });
      } else {
        setOtpFeedback({ type: 'error', message: res.data?.message || 'Failed to send OTP. Please try again.' });
      }
    } catch (e: any) {
      setOtpFeedback({ type: 'error', message: e?.response?.data?.message || 'Failed to send OTP. Please try again.' });
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length !== 6) {
      setOtpFeedback({ type: 'error', message: 'Enter a valid 6-digit OTP.' });
      return;
    }
    setIsVerifyingOtp(true);
    try {
      const res = await api.post('/users/verify-otp', { phoneNumber, otp });
      if (res.data?.success) {
        try { localStorage.setItem('token', res.data?.token); } catch {}
        try { if (res.data?.refreshToken) localStorage.setItem('refreshToken', res.data.refreshToken); } catch {}
        setIsAuthenticated(true);
        setPhoneVerified(true);
        setOtpSent(false);
        setOtpFeedback({ type: 'success', message: 'Phone number verified successfully.' });
        setOtp('');
      } else {
        setOtpFeedback({ type: 'error', message: res.data?.message || 'Invalid OTP.' });
      }
    } catch (e: any) {
      setOtpFeedback({ type: 'error', message: e?.response?.data?.message || 'Failed to verify OTP. Please try again.' });
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
    if (!pickupCoords || !dropCoords) {
      alert('Please select both pickup and dropoff locations');
      return;
    }
    if (!phoneNumber || phoneNumber.length !== 10) {
      alert('Phone number required to create booking');
      return;
    }
    // Navigate to RideInitiatePage where booking + waiting happens
    navigate('/ride-initiate', {
      state: {
        pickupLocation: pickupAddress,
        dropLocation: dropAddress,
        pickupCoords,
        dropCoords,
        selectedRideType,
        scheduledDate,
        scheduledTime,
        routeData,
        fareSolo,
        fareShared,
        phoneNumber,
        autoStartWaiting: true
      }
    });
  };

  // Distance warning (user vs pickup)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [distanceToPickupKm, setDistanceToPickupKm] = useState<number | null>(null);
  useEffect(() => {
    const watchId = navigator.geolocation?.watchPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
      },
      undefined,
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 10000 }
    );
    return () => { if (watchId) navigator.geolocation.clearWatch(watchId); };
  }, []);
  const toRad = (d: number) => (d * Math.PI) / 180;
  const haversineKm = (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => {
    const R = 6371;
    const dLat = toRad(b.lat - a.lat);
    const dLng = toRad(b.lng - a.lng);
    const s = Math.sin(dLat/2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(s));
  };
  useEffect(() => {
    if (userLocation && pickupCoords) {
      setDistanceToPickupKm(parseFloat(haversineKm(userLocation, pickupCoords).toFixed(2)));
    }
  }, [userLocation, pickupCoords]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 flex items-center justify-center p-4 pt-20">
      {pageLoading && <LoadingOverlay message="Preparing your ride details..." />}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute top-40 left-40 w-80 h-80 bg-yellow-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <motion.div
        className="relative z-10 w-full max-w-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-6">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>

        {/* Phone Verification Section - Show first if not authenticated */}
        {(!hasToken || (hasToken && authChecked && !isAuthenticated)) && !phoneVerified && (
          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 mb-6"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Verify Your Phone Number</h2>
            <div className="space-y-4">
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
                    disabled={!phoneNumber || phoneNumber.length !== 10 || isSendingOtp || otpCooldown > 0 || otpSendCount >= MAX_OTP_REQUESTS}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSendingOtp
                      ? 'Sending...'
                      : otpSendCount >= MAX_OTP_REQUESTS
                        ? 'Limit reached'
                        : otpCooldown > 0
                          ? `Wait ${otpCooldown}s`
                          : 'Send OTP'}
                        </button>
                      </div>
                      {otpFeedback && (
                        <div
                          className={`mt-2 text-sm ${
                            otpFeedback.type === 'error'
                              ? 'text-red-600'
                              : otpFeedback.type === 'success'
                                ? 'text-green-600'
                                : 'text-gray-600'
                          }`}
                        >
                          {otpFeedback.message}
                        </div>
                      )}
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
            </div>
          </motion.div>
        )}

        {/* Main Content - Show after authentication */}
        {(isAuthenticated || (hasToken && authChecked && isAuthenticated)) && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Side - Ride Details */}
            <motion.div
              className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Ride Details</h2>
              <div className="space-y-4 min-h-[360px]">
                {/* Distance warning */}
                {typeof distanceToPickupKm === 'number' && (() => {
                  const dKm = distanceToPickupKm as number;
                  if (dKm < 0.2) return null; // Hide under 200m
                  const isGreen = dKm < 0.6; // Green for <600m, else yellow
                  const boxClass = isGreen
                    ? 'border-green-300 bg-green-50 text-green-800'
                    : 'border-yellow-300 bg-yellow-50 text-yellow-800';
                  const distanceLabel = dKm < 1
                    ? `${Math.round(dKm * 1000)} m`
                    : `${dKm} km`;
                  return (
                    <div className={`rounded-md border ${boxClass} px-3 py-2 text-sm`}>
                      You are approximately <span className="font-semibold">{distanceLabel}</span> away from the pickup point.
                  </div>
                  );
                })()}

                {/* Mobile Number */}
                <div className="flex items-center justify-between">
                  <div className="flex-1 mr-3">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">Mobile Number</div>
                    {isEditingPhone ? (
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        maxLength={10}
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900">{phoneNumber}</div>
                    )}
                  </div>
                  {isEditingPhone ? (
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(false)}
                      className="text-xs text-green-600 hover:underline"
                    >
                      Save
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(true)}
                      className="text-xs text-blue-600 hover:underline"
                    >
                      Change number
                    </button>
                  )}
                </div>

                {/* Pickup & Dropoff (editable) */}
                <div className="space-y-4">
                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-green-600 rounded-full mt-1.5 mr-3"></div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Pickup</div>
                          {!isEditingPickup && (
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {pickupAddress || 'Select pickup location'}
                            </div>
                          )}
                        </div>
                      </div>
                      {isEditingPickup ? (
                        <button
                          type="button"
                          onClick={cancelPickupEdit}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={openPickupEditor}
                          className="text-xs text-blue-600 hover:underline transition-colors"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    {isEditingPickup && (
                      <div className="mt-2 space-y-2">
                        <LocationAutocomplete
                          placeholder="Search pickup location"
                          value={pickupAddress}
                          onChange={handlePickupInputChange}
                          onLocationSelect={handlePickupLocationSelect}
                          showClearButton
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (pickupCoords) {
                                setIsEditingPickup(false);
                                pickupEditSnapshotRef.current = null;
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50"
                            disabled={!pickupCoords}
                          >
                            Use this location
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start">
                        <div className="w-3 h-3 bg-red-600 rounded-full mt-1.5 mr-3"></div>
                        <div>
                          <div className="text-xs text-gray-500 uppercase tracking-wide">Dropoff</div>
                          {!isEditingDrop && (
                            <div className="text-sm font-medium text-gray-900 break-words">
                              {dropAddress || 'Select dropoff location'}
                            </div>
                          )}
                        </div>
                      </div>
                      {isEditingDrop ? (
                        <button
                          type="button"
                          onClick={cancelDropEdit}
                          className="text-xs text-gray-500 hover:text-gray-700 transition-colors"
                        >
                          Cancel
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={openDropEditor}
                          className="text-xs text-blue-600 hover:underline transition-colors"
                        >
                          Change
                        </button>
                      )}
                    </div>
                    {isEditingDrop && (
                      <div className="mt-2 space-y-2">
                        <LocationAutocomplete
                          placeholder="Search drop location"
                          value={dropAddress}
                          onChange={handleDropInputChange}
                          onLocationSelect={handleDropLocationSelect}
                          showClearButton
                        />
                        <div className="flex justify-end">
                          <button
                            type="button"
                            onClick={() => {
                              if (dropCoords) {
                                setIsEditingDrop(false);
                                dropEditSnapshotRef.current = null;
                              }
                            }}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-green-600 rounded-lg disabled:opacity-50"
                            disabled={!dropCoords}
                          >
                            Use this location
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
            </div>
          </motion.div>

          <motion.div
            className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100 min-h-[360px]"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Choose Ride Type</h2>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => setSelectedRideType('private')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border ${selectedRideType==='private' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="text-left">
                  <div className="font-semibold">Solo</div>
                  <div className="text-xs text-gray-500">{fareSolo?.duration || '-'}</div>
                </div>
                <div className="font-bold">{fareSolo ? `₹${fareSolo.fare}` : '—'}</div>
              </button>
              <button
                type="button"
                onClick={() => setSelectedRideType('shared')}
                className={`w-full flex items-center justify-between p-3 rounded-lg border ${selectedRideType==='shared' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
              >
                <div className="text-left">
                  <div className="font-semibold">Shared</div>
                  <div className="text-xs text-gray-500">{fareShared?.duration || '-'}</div>
                </div>
                <div className="font-bold">{fareShared ? `₹${fareShared.fare}` : '—'}</div>
              </button>
              {/* Scheduled option */}
              <div className={`w-full p-3 rounded-lg border ${selectedRideType==='scheduled' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <button
                          type="button"
                  onClick={() => setSelectedRideType('scheduled')}
                  className="w-full flex items-center justify-between"
                >
                  <div className="text-left">
                    <div className="font-semibold">Schedule</div>
                    <div className="text-xs text-gray-500">Book for later</div>
                  </div>
                  <div className="font-bold">{fareSolo ? `₹${fareSolo.fare}` : '—'}</div>
                        </button>
                {selectedRideType==='scheduled' && (
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={(e) => setScheduledDate(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className="w-full px-2 py-2 border border-gray-300 rounded text-xs"
                      />
                    </div>
                    <div className="col-span-2 text-[11px] text-gray-600">
                      Scheduled fare: <span className="font-semibold">{fareSolo ? `₹${fareSolo.fare}` : '—'}</span>
                      </div>
                  </div>
                )}
              </div>

              {/* Auth block: if not signed in, ask only phone and OTP; else show Continue */}
              {!isAuthenticated ? (
                <div className="space-y-3 mt-4">
                  <div>
                    <label className="text-[11px] text-gray-500 block mb-1">Phone Number</label>
                    <div className="flex gap-2">
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={(e)=>setPhoneNumber(e.target.value)}
                        maxLength={10}
                        placeholder="10-digit phone"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded"
                      />
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        disabled={!phoneNumber || phoneNumber.length!==10 || isSendingOtp}
                        className="px-3 py-2 bg-green-600 text-white rounded disabled:opacity-50"
                      >
                        {isSendingOtp ? 'Sending…' : 'Send OTP'}
                      </button>
                    </div>
                  </div>
                  {otpSent && (
                    <div>
                      <label className="text-[11px] text-gray-500 block mb-1">Enter OTP</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={otp}
                          onChange={(e)=>setOtp(e.target.value)}
                          maxLength={6}
                          placeholder="6-digit OTP"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          disabled={!otp || otp.length!==6 || isVerifyingOtp}
                          className="px-3 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                        >
                          {isVerifyingOtp ? 'Verifying…' : 'Verify'}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <motion.button
                  type="button"
                  onClick={handleBookRide}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Book Ride
                </motion.button>
              )}
            </div>
          </motion.div>
        </div>

        )}

        <motion.div
          className="text-center mt-8 mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Link
            to="/"
            className="inline-flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Link>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default BookingDetailsPage;