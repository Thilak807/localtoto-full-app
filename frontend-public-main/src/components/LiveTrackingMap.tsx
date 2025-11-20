import React, { useEffect, useRef, useState } from 'react'
import prefetchOlaMapsAssets from '../utils/prefetchOlaMapsAssets'

interface LiveTrackingMapProps {
  pickup: { lat: number; lng: number }
  dropoff?: { lat: number; lng: number }
  driverLocation?: { lat: number; lng: number }
  routeData?: { coordinates?: Array<[number, number]> }
  height?: string
  showDrop?: boolean
  allowFullscreen?: boolean
}

const LiveTrackingMap: React.FC<LiveTrackingMapProps> = ({ pickup, dropoff, driverLocation, routeData, height = '260px', showDrop = false, allowFullscreen = true }) => {
  if (!pickup || typeof pickup.lat !== 'number') {
    return (
      <div className="bg-gray-100 rounded-lg flex items-center justify-center" style={{ height }}>
        <div className="text-sm text-gray-600">Loading map…</div>
      </div>
    )
  }

  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<any | null>(null)
  const driverMarkerRef = useRef<any | null>(null)
  const driverMarkerElRef = useRef<HTMLImageElement | null>(null)
  const dropMarkerRef = useRef<any | null>(null)
  const olaRef = useRef<any | null>(null)
  const [mapLoaded, setMapLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [followDriver, setFollowDriver] = useState<boolean>(true)
  const isInteractingRef = useRef<boolean>(false)
  const pendingDriverLocRef = useRef<{lat:number;lng:number} | null>(null)
  const pulseInjectedRef = useRef<boolean>(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const waitForOlaSdk = async (maxMs = 15000, intervalMs = 100): Promise<any | null> => {
    const start = Date.now()
    return new Promise((resolve) => {
      const check = () => {
        const anyWindow = window as any
        if (anyWindow && anyWindow.OlaMaps) {
          resolve(anyWindow.OlaMaps)
          return
        }
        if (Date.now() - start >= maxMs) {
          resolve(null)
          return
        }
        setTimeout(check, intervalMs)
      }
      check()
    })
  }

  useEffect(() => {
    if (!mapRef.current) return

    const initializeMap = async () => {
      try {
        const mapContainer = mapRef.current!

        const centerLat = (driverLocation && typeof driverLocation.lat === 'number') ? driverLocation.lat : pickup.lat
        const centerLng = (driverLocation && typeof driverLocation.lng === 'number') ? driverLocation.lng : pickup.lng

        if (mapInstanceRef.current) {
          try { mapInstanceRef.current.remove() } catch {}
          mapInstanceRef.current = null
        }

        const apiKey = (import.meta as any).env?.VITE_OLA_MAPS_API_KEY
        if (!apiKey) {
          setError('Missing Ola Maps key')
          return
        }
        // Debug which key/origin are used for Ola Maps to help allow-listing
        try {
          console.log('[Maps] Initializing Ola Maps', {
            keyPrefix: String(apiKey).substring(0, 8) + '...',
            locationOrigin: window.location.origin
          })
        } catch {}
        const OlaMapsCtor = await waitForOlaSdk()
        if (!OlaMapsCtor) {
          setError('Ola Web SDK not loaded')
          return
        }
        const ola = new (OlaMapsCtor as any)({ apiKey })
        olaRef.current = ola

        // Derive backend origin from VITE_API_URL to avoid relying on current origin
        const apiBase = (import.meta as any).env?.VITE_API_URL as string | undefined
          || (import.meta as any).env?.VITE_API_BASE_URL as string | undefined
        const backendOrigin = (() => {
          try {
            if (apiBase) return new URL(apiBase).origin
          } catch {}
          return window.location.origin
        })()
        const proxyStyleUrl = `${backendOrigin}/api/bookings/tiles/style.json?styleName=default-light-standard`
        const directStyleUrl = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${apiKey}`
        try {
          console.log('[Maps] Style URLs', { backendOrigin, proxyStyleUrl, directStyleUrl })
        } catch {}
        // Warm up assets in the background for faster renders across the app
        prefetchOlaMapsAssets(apiKey, backendOrigin)
        // Warm up style
        try { fetch(proxyStyleUrl, { cache: 'reload' }).catch(()=>{}) } catch {}
        const map = ola.init({ container: mapContainer, center: [centerLng, centerLat], zoom: 15, style: directStyleUrl })
        mapInstanceRef.current = map

        // Add pickup marker; add drop only if allowed
        ola.addMarker({ color: '#16a34a' }).setLngLat([pickup.lng, pickup.lat]).addTo(map)
        if (showDrop && dropoff && typeof dropoff.lat === 'number') {
          dropMarkerRef.current = ola.addMarker({ color: '#1d4ed8' }).setLngLat([dropoff.lng, dropoff.lat]).addTo(map)
        }

        map.on && map.on('styledata', () => { try { setError(null) } catch {} })
        const loadTimeout = setTimeout(() => {
          if (!mapLoaded) {
            try { map.setStyle(proxyStyleUrl) } catch {}
          }
        }, 1200)
        map.on && map.on('load', () => {
          try {
            clearTimeout(loadTimeout);
            const hasDriver = driverLocation && typeof driverLocation.lat === 'number' && typeof driverLocation.lng === 'number'
            if (hasDriver && (ola as any).LngLatBounds && (map as any).fitBounds) {
              const bounds = new (ola as any).LngLatBounds(
                [Math.min(pickup.lng, driverLocation!.lng), Math.min(pickup.lat, driverLocation!.lat)],
                [Math.max(pickup.lng, driverLocation!.lng), Math.max(pickup.lat, driverLocation!.lat)]
              )
              ;(map as any).fitBounds(bounds, { padding: 60, duration: 300 })
            }
            setMapLoaded(true)
          } catch {}
        })
        map.on && map.on('error', (e: any) => {
          const msg = e?.error?.message || ''
          if (msg.includes('403') || msg.includes('sprite') || msg.includes('glyph')) {
            try { map.setStyle(directStyleUrl) } catch {}
          }
        })
        map.on && map.on('movestart', () => { isInteractingRef.current = true })
        map.on && map.on('moveend', () => {
          isInteractingRef.current = false
          const pending = pendingDriverLocRef.current
          if (pending && driverMarkerRef.current) {
            try { driverMarkerRef.current.setLngLat([pending.lng, pending.lat]) } catch {}
            pendingDriverLocRef.current = null
          }
        })

        try {
          if (!pulseInjectedRef.current) {
            const styleTag = document.createElement('style')
            styleTag.textContent = `@keyframes wpPulse { 0% { transform: scale(0.8); opacity: .6 } 50% { transform: scale(1.15); opacity: .3 } 100% { transform: scale(0.8); opacity: .6 } }`
            document.head.appendChild(styleTag)
            pulseInjectedRef.current = true
          }
        } catch {}
      } catch (err) {
        setError('Failed to load map')
      }
    }

    initializeMap()
    return () => {
      if (mapInstanceRef.current) {
        try { mapInstanceRef.current.remove() } catch {}
        mapInstanceRef.current = null
      }
    }
  }, [pickup.lat, pickup.lng, dropoff?.lat, dropoff?.lng, showDrop])

  // Update driver marker when driverLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current
    if (!map || !mapLoaded) return
    if (!driverLocation) {
      if (driverMarkerRef.current) { try { driverMarkerRef.current.remove() } catch {} driverMarkerRef.current = null }
      return
    }
    const ola = olaRef.current
    const createRickshawElement = () => {
      const img = document.createElement('img') as HTMLImageElement
      img.src = '/icons/rickshaw.png'
      img.style.width = '40px'
      img.style.height = '38px'
      img.style.filter = 'brightness(0.85) contrast(1.15) drop-shadow(0 1px 2px rgba(0,0,0,0.35))'
      img.style.transform = 'translate(-50%, -50%) rotateZ(0deg)'
      img.style.transition = 'transform 160ms linear'
      driverMarkerElRef.current = img
      return img
    }
    if (!driverMarkerRef.current && ola) {
      driverMarkerRef.current = ola.addMarker({ element: createRickshawElement() }).setLngLat([driverLocation.lng, driverLocation.lat]).addTo(map)
    } else if (driverMarkerRef.current && driverMarkerRef.current.setLngLat) {
      if (isInteractingRef.current) {
        pendingDriverLocRef.current = driverLocation
      } else {
        driverMarkerRef.current.setLngLat([driverLocation.lng, driverLocation.lat])
      }
    }
    if (followDriver && !isInteractingRef.current) {
      try { (map as any).easeTo && (map as any).easeTo({ center: [driverLocation.lng, driverLocation.lat], duration: 300 }) } catch {}
    }
  }, [driverLocation, mapLoaded])

  // Rotate marker towards movement direction
  const prevDriverLocRef = useRef<{lat:number;lng:number} | null>(null)
  useEffect(() => {
    if (!mapLoaded || !driverLocation) return
    const prev = prevDriverLocRef.current
    prevDriverLocRef.current = driverLocation
    if (!prev || !driverMarkerElRef.current) return
    const toRad = (d: number) => d * Math.PI / 180
    const toDeg = (r: number) => r * 180 / Math.PI
    const lat1 = toRad(prev.lat)
    const lat2 = toRad(driverLocation.lat)
    const dLng = toRad(driverLocation.lng - prev.lng)
    const y = Math.sin(dLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.cos(lat2) * Math.cos(dLng) - Math.sin(lat1) * Math.sin(lat2)
    let brng = toDeg(Math.atan2(y, x))
    if (!Number.isFinite(brng)) brng = 0
    try { driverMarkerElRef.current.style.transform = `translate(-50%, -50%) rotateZ(${brng}deg)` } catch {}
  }, [driverLocation, mapLoaded])

  // Toggle drop marker when showDrop changes
  useEffect(() => {
    const map = mapInstanceRef.current
    const ola = olaRef.current
    if (!map || !ola || !mapLoaded) return
    try {
      if (!showDrop) {
        if (dropMarkerRef.current) { try { dropMarkerRef.current.remove() } catch {} dropMarkerRef.current = null }
      } else if (!dropMarkerRef.current && dropoff && typeof dropoff.lat === 'number') {
        dropMarkerRef.current = ola.addMarker({ color: '#1d4ed8' }).setLngLat([dropoff.lng, dropoff.lat]).addTo(map)
      }
    } catch {}
  }, [showDrop, mapLoaded, dropoff?.lat, dropoff?.lng])

  // Draw or update route polyline when routeData changes
  useEffect(() => {
    const map: any = mapInstanceRef.current
    if (!map || !mapLoaded) return
    try {
      if (map.getLayer && map.getSource) {
        if (map.getLayer('lt-route-layer')) map.removeLayer('lt-route-layer')
        if (map.getSource('lt-route-src')) map.removeSource('lt-route-src')
        if (routeData?.coordinates?.length) {
          const geojson = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: routeData.coordinates } } as any
          map.addSource('lt-route-src', { type: 'geojson', data: geojson })
          map.addLayer({ id: 'lt-route-layer', type: 'line', source: 'lt-route-src', paint: { 'line-color': '#2563eb', 'line-width': 4 } })
        }
      }
    } catch {}
  }, [routeData?.coordinates, mapLoaded])

  // ETA computation (semi-hard-coded speed tiers)
  const [etaText, setEtaText] = useState<string | null>(null)
  useEffect(() => {
    // Need driver location and a target
    const target = (showDrop && dropoff && typeof dropoff.lat === 'number')
      ? dropoff
      : pickup
    if (!driverLocation || !target) {
      setEtaText(null)
      return
    }
    const toRad = (d: number) => (d * Math.PI) / 180
    const haversineKm = (a: {lat:number;lng:number}, b: {lat:number;lng:number}) => {
      const R = 6371
      const dLat = toRad(b.lat - a.lat)
      const dLng = toRad(b.lng - a.lng)
      const s = Math.sin(dLat/2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng/2) ** 2
      return 2 * R * Math.asin(Math.sqrt(s))
    }
    const distanceKm = haversineKm(driverLocation, target)
    // Heuristics:
    // - Long distance (>= 8 km): best-case 25 km/h (more open roads)
    // - Medium (3–8 km): average 20 km/h
    // - Short (< 3 km): worst 15 km/h (stop-go traffic, final approach)
    const speedKmh = distanceKm >= 8 ? 25 : distanceKm >= 3 ? 20 : 15
    const minutes = Math.max(1, Math.min(120, Math.round((distanceKm / speedKmh) * 60)))
    setEtaText(`${minutes} min`)
  }, [driverLocation?.lat, driverLocation?.lng, pickup?.lat, pickup?.lng, dropoff?.lat, dropoff?.lng, showDrop])

  return (
    <div className={(isFullscreen ? 'fixed inset-0 z-50' : '') + ' bg-gray-100 rounded-lg overflow-hidden relative'} style={{ height: isFullscreen ? '100vh' : height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
      {/* Locate buttons / Fullscreen button */}
      <div className="absolute right-2 top-2 z-20 flex flex-col items-end space-y-2">
        {/* Locate Me button */}
        <button
          type="button"
          onClick={() => {
            try {
              const map: any = mapInstanceRef.current
              if (!map) return
              // Disable follow driver when locating user
              try { setFollowDriver(false) } catch {}
              const centerTo = (lat: number, lng: number) => {
                try {
                  if ((map as any).easeTo) (map as any).easeTo({ center: [lng, lat], zoom: 16, duration: 300 })
                  else if ((map as any).flyTo) (map as any).flyTo({ center: [lng, lat], zoom: 16, speed: 0.8 })
                } catch {}
              }
              if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                  (pos) => centerTo(pos.coords.latitude, pos.coords.longitude),
                  () => { if (pickup) centerTo(pickup.lat, pickup.lng) },
                  { enableHighAccuracy: true, maximumAge: 5000 }
                )
              } else if (pickup) {
                centerTo(pickup.lat, pickup.lng)
              }
            } catch {}
          }}
          className="bg-white/90 backdrop-blur rounded-full shadow px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
          aria-label="Locate me"
        >
          Locate Me
        </button>

        {/* Locate Driver button */}
        {driverLocation && (
          <button
            type="button"
            onClick={() => {
              try {
                const map: any = mapInstanceRef.current
                if (!map || !driverLocation) return
                try { setFollowDriver(true) } catch {}
                const centerTo = (lat: number, lng: number) => {
                  try {
                    if ((map as any).easeTo) (map as any).easeTo({ center: [lng, lat], zoom: 16, duration: 300 })
                    else if ((map as any).flyTo) (map as any).flyTo({ center: [lng, lat], zoom: 16, speed: 0.8 })
                  } catch {}
                }
                centerTo(driverLocation.lat, driverLocation.lng)
              } catch {}
            }}
            className="bg-white/90 backdrop-blur rounded-full shadow px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
            aria-label="Locate driver"
          >
            Locate Driver
          </button>
        )}

        {/* Fullscreen button */}
        {allowFullscreen && (
          <button
            type="button"
            onClick={() => setIsFullscreen((v) => !v)}
            className="md:hidden bg-white/90 backdrop-blur rounded-full shadow px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-white"
            aria-label="Toggle full screen"
          >
            {isFullscreen ? 'Close' : 'Full screen'}
          </button>
        )}
      </div>
      {/* ETA Badge (updates as distance changes) */}
      {etaText && (
        <div className="absolute left-2 top-2 z-20">
          <div className="bg-white/90 backdrop-blur rounded-full shadow px-3 py-2 text-sm font-semibold text-gray-700">
            ETA: {etaText}
          </div>
        </div>
      )}
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center text-sm text-gray-600 bg-gray-100">{error || 'Loading map…'}</div>
      )}
    </div>
  )
}

export default LiveTrackingMap


