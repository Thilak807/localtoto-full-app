import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import OlaMap from './OlaMap'
import api from '../services/api'
import olaMapsService, { RouteResponse } from '../services/olaMapsService'

interface OngoState {
  rideId: string
  fare?: number
  pickupAddress?: string
  dropAddress?: string
  pickupCoords?: { lat: number; lng: number }
  dropCoords?: { lat: number; lng: number }
}

const UserOngoPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const state = (location.state || {}) as OngoState
  const [fare, setFare] = useState<number>(state.fare || 0)
  const [drop, setDrop] = useState<{lat:number;lng:number}>(state.dropCoords || { lat: 0, lng: 0 })
  const [userLoc, setUserLoc] = useState<{lat:number;lng:number} | null>(null)
  const [route, setRoute] = useState<RouteResponse | null>(null)
  const routeTimer = useRef<number | null>(null)
  const [rideCompleted, setRideCompleted] = useState<boolean>(false)
  const [showPaymentModal, setShowPaymentModal] = useState<boolean>(false)
  const [showRatingModal, setShowRatingModal] = useState<boolean>(false)
  const [driverRating, setDriverRating] = useState<number>(0)
  const [driverFeedback, setDriverFeedback] = useState<string>('')

  // Load most recent ride details to ensure fare/drop available
  useEffect(() => {
    const load = async () => {
      try {
        if (!state.rideId) return
        const res = await api.get(`/bookings/details/${state.rideId}`)
        const b = res.data?.booking
        if (b) {
          setFare(typeof b.fare === 'number' ? b.fare : parseFloat(String(b.fare || 0)))
          if (!drop.lat) setDrop({ lat: b.dropoff_lat, lng: b.dropoff_lng })
          
          // Check if ride is completed
          if (b.status === 'completed') {
            setRideCompleted(true)
            setShowPaymentModal(true)
          }
        }
      } catch {}
    }
    load()
  }, [state.rideId])

  // Listen for ride completion via WebSocket
  useEffect(() => {
    if (!state.rideId || rideCompleted) return
    
    const ws = new WebSocket(`ws://localhost:8001/ws/bookings/ride/${state.rideId}/`)
    
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        if (data.type === 'ride_event' && data.data?.status === 'completed') {
          setRideCompleted(true)
          setShowPaymentModal(true)
        }
      } catch {}
    }
    
    return () => ws.close()
  }, [state.rideId, rideCompleted])

  // Watch user geolocation for live updates
  useEffect(() => {
    const watch = navigator.geolocation?.watchPosition((pos) => {
      const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude }
      setUserLoc(coords)
    }, undefined, { enableHighAccuracy: true, maximumAge: 5000 })
    return () => { if (watch) navigator.geolocation.clearWatch(watch) }
  }, [])

  // Throttle route fetch user -> drop using proper olaMapsService
  const fetchRoute = async (origin: {lat:number;lng:number}) => {
    try {
      const route = await olaMapsService.getRoute(origin, drop)
      if (route) {
        setRoute(route)
      }
    } catch (error) {
      console.error('Error fetching route:', error)
    }
  }
  useEffect(() => {
    if (!userLoc || !drop || !drop.lat) return
    if (routeTimer.current) window.clearTimeout(routeTimer.current)
    routeTimer.current = window.setTimeout(() => fetchRoute(userLoc), 1000)
    return () => { if (routeTimer.current) window.clearTimeout(routeTimer.current); routeTimer.current = null }
  }, [userLoc?.lat, userLoc?.lng, drop?.lat, drop?.lng])

  const fareText = useMemo(() => `₹${(fare||0).toFixed(2)}`, [fare])

  // Handle payment completion
  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    setShowRatingModal(true)
  }

  // Handle rating submission
  const handleRatingSubmit = async () => {
    try {
      await api.post(`/bookings/${state.rideId}/rate`, {
        rating: driverRating,
        feedback: driverFeedback
      })
      setShowRatingModal(false)
      navigate('/')
    } catch (error) {
      alert('Failed to submit rating')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-3">
        <div className="bg-white rounded-2xl shadow p-4 flex items-center justify-between">
          <div className="text-lg font-semibold">Amount to Pay</div>
          <div className="text-2xl font-bold text-green-700">{fareText}</div>
        </div>
        {rideCompleted ? (
          <div className="bg-green-50 border border-green-200 rounded-2xl shadow p-6 text-center">
            <div className="text-green-600 text-4xl mb-2">✓</div>
            <h3 className="text-xl font-semibold text-green-800 mb-2">Ride Completed!</h3>
            <p className="text-green-700">Please complete payment to continue</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow p-3">
            <OlaMap
              pickup={userLoc || { lat: 0, lng: 0 }}
              dropoff={drop}
              routeData={route || undefined}
              liveLocation={userLoc}
              height="380px"
              className="rounded-xl"
              enableGeolocate={false}
              focus={userLoc ? 'pickup' : null}
              liveMarkerElement="rickshaw"
            />
            <div className="mt-3">
              <a
                href={userLoc ? `https://www.google.com/maps/dir/?api=1&origin=${userLoc.lat},${userLoc.lng}&destination=${drop.lat},${drop.lng}&travelmode=driving` : undefined}
                target="_blank"
                rel="noreferrer"
                className={`w-full inline-flex items-center justify-center rounded-xl px-3 py-2.5 text-base font-semibold ${userLoc ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-300 text-gray-600 cursor-not-allowed'}`}
                onClick={(e)=>{ if(!userLoc){ e.preventDefault(); } }}
              >
                Open in Google Maps
              </a>
            </div>
          </div>
        )}

        {/* Payment Modal */}
        {showPaymentModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
              <h3 className="text-xl font-bold mb-4">Complete Payment</h3>
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-green-600">{fareText}</div>
                <div className="text-sm text-gray-600">Total fare</div>
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handlePaymentComplete}
                  className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
                >
                  Pay Cash
                </button>
                <button 
                  disabled
                  className="w-full bg-gray-300 text-gray-500 py-3 rounded-lg font-semibold cursor-not-allowed"
                >
                  Online Payment (Coming Soon)
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Rating Modal */}
        {showRatingModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 max-w-sm mx-4">
              <h3 className="text-xl font-bold mb-4">Rate Your Driver</h3>
              
              <div className="mb-6">
                <div className="flex justify-center space-x-2 mb-4">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setDriverRating(star)}
                      className={`text-3xl ${star <= driverRating ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className="text-center text-sm text-gray-600">
                  {driverRating === 0 ? 'Tap to rate' : 
                   driverRating === 1 ? 'Poor' :
                   driverRating === 2 ? 'Fair' :
                   driverRating === 3 ? 'Good' :
                   driverRating === 4 ? 'Very Good' : 'Excellent'}
                </div>
              </div>
              
              <div className="mb-4">
                <textarea
                  value={driverFeedback}
                  onChange={(e) => setDriverFeedback(e.target.value)}
                  placeholder="Optional feedback..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-none"
                  rows={3}
                />
              </div>
              
              <div className="space-y-3">
                <button 
                  onClick={handleRatingSubmit}
                  className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700"
                >
                  Submit Rating
                </button>
                <button 
                  onClick={() => navigate('/')}
                  className="w-full bg-gray-300 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-400"
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default UserOngoPage


