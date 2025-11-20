import React, { useEffect, useRef, useState } from 'react';
import prefetchOlaMapsAssets from '../utils/prefetchOlaMapsAssets';
import { getPatnaCenter, getServiceRadius } from '../services/geocode';
// Using Ola Web SDK (loaded via CDN in index.html)

interface OlaMapProps {
  pickup: { lat: number; lng: number };
  dropoff?: { lat: number; lng: number } | null;
  routeData?: any;
  driverLocation?: { lat: number; lng: number };
  onRouteLoad?: (route: any) => void;
  onDriverUpdate?: (location: { lat: number; lng: number }) => void;
  onMapClick?: (coords: { lat: number; lng: number }) => void;
  onMapReady?: (map: any) => void;
  height?: string;
  className?: string;
  enableGeolocate?: boolean;
  focus?: 'pickup' | 'dropoff' | null;
  activeEditable?: 'pickup' | 'dropoff' | null;
  // Static online driver pins (no live updates), render as rickshaw icons
  driverPins?: Array<{ lat: number; lng: number }>;
  // Callback when marker is dragged to blur input fields
  onMarkerDrag?: () => void;
}

const OlaMap: React.FC<OlaMapProps> = ({
  pickup,
  dropoff,
  routeData,
  driverLocation,
  onRouteLoad,
  onMapReady,
  height = '500px',
  className = '',
  onMapClick,
  enableGeolocate = false,
  focus = null,
  activeEditable = null,
  driverPins = [],
  onMarkerDrag
}) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any | null>(null);
  const driverMarkerRef = useRef<any | null>(null);
  const olaRef = useRef<any | null>(null);
  const didFitRef = useRef<boolean>(false);
  const liveMarkerRef = useRef<any | null>(null);
  const pickupMarkerRef = useRef<any | null>(null);
  const dropMarkerRef = useRef<any | null>(null);
  const onMapClickProp = onMapClick;
  const [mapLoaded, setMapLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const waveTimersRef = useRef<number[]>([]);
  const onlineDriverMarkersRef = useRef<any[]>([]);

  // Coordinate validation function
  const validateCoordinates = (coords: {lat: number, lng: number}) => {
    return {
      lat: Math.round(coords.lat * 1e6) / 1e6, // Round to 6 decimal places
      lng: Math.round(coords.lng * 1e6) / 1e6
    };
  };


  // Wait for Ola Web SDK to be available (script loads async via CDN)
  const waitForOlaSdk = async (maxMs = 15000, intervalMs = 100): Promise<any | null> => {
    const start = Date.now();
    return new Promise((resolve) => {
      const check = () => {
        const anyWindow = window as any;
        if (anyWindow && anyWindow.OlaMaps) {
          resolve(anyWindow.OlaMaps);
          return;
        }
        if (Date.now() - start >= maxMs) {
          resolve(null);
          return;
        }
        setTimeout(check, intervalMs);
      };
      check();
    });
  };

  useEffect(() => {
    if (!mapRef.current) return;

    const initializeMap = async () => {
      try {
        const mapContainer = mapRef.current!;
        
        // Center on the appropriate location based on focus
        let centerLat, centerLng;
        if (focus === 'dropoff' && dropoff) {
          centerLat = dropoff.lat;
          centerLng = dropoff.lng;
        } else if (pickup) {
          centerLat = pickup.lat;
          centerLng = pickup.lng;
        } else {
          // Default to Patna if no coordinates available
          centerLat = 25.5941;
          centerLng = 85.1376;
        }
        
        // Use optimal zoom level for pickup location
        const zoom = 16; // Higher zoom for better precision

        // Clean up existing map instance
        if (mapInstanceRef.current) {
          mapInstanceRef.current.remove();
          mapInstanceRef.current = null;
        }

        // Initialize Ola Web SDK
        const apiKey = (import.meta as any).env?.VITE_OLA_MAPS_API_KEY;
        const OlaMapsCtor = await waitForOlaSdk();
        if (!OlaMapsCtor) {
          console.error('Ola Web SDK not present on window. Ensure CDN script is loaded.');
          setError('Ola Web SDK not loaded. Hard refresh (CTRL+F5) and check network.');
          return;
        }
        if (!apiKey) {
          console.error('VITE_OLA_MAPS_API_KEY missing. Check frontend/.env.local and restart dev server.');
          setError('Missing Ola Web SDK key. Configure VITE_OLA_MAPS_API_KEY and restart.');
          return;
        }
        const ola = new (OlaMapsCtor as any)({ apiKey });
        olaRef.current = ola;
        const apiBase = (import.meta as any).env?.VITE_API_URL as string | undefined
          || (import.meta as any).env?.VITE_API_BASE_URL as string | undefined;
        const backendOrigin = (() => {
          try {
            if (apiBase) return new URL(apiBase).origin;
          } catch {}
          return window.location.origin;
        })();
        prefetchOlaMapsAssets(apiKey, backendOrigin);
        // Style URLs
        const proxyStyleUrl = `${backendOrigin}/api/bookings/tiles/style.json?styleName=default-light-standard`;
        const directStyleUrl = `https://api.olamaps.io/tiles/vector/v1/styles/default-light-standard/style.json?api_key=${apiKey}`;
        // Load direct style immediately to avoid initial wait; proxy only as backup
        const chosenStyle = directStyleUrl;
        const map = ola.init({
          container: mapContainer,
          center: [centerLng, centerLat],
          zoom,
          style: chosenStyle
        });

        mapInstanceRef.current = map;

        // Restrict map bounds to Patna service area (30km radius)
        try {
          const patnaCenter = getPatnaCenter();
          const radius = getServiceRadius();
          // Calculate approximate bounds (rough approximation for 30km radius)
          const latDelta = radius / 111; // ~111 km per degree latitude
          const lngDelta = radius / (111 * Math.cos(patnaCenter.lat * Math.PI / 180)); // Adjust for longitude
          const bounds = [
            [patnaCenter.lng - lngDelta, patnaCenter.lat - latDelta], // Southwest
            [patnaCenter.lng + lngDelta, patnaCenter.lat + latDelta]  // Northeast
          ];
          // Set max bounds to restrict panning outside service area
          map.setMaxBounds(bounds as any);
        } catch (error) {
          console.warn('Failed to set map bounds:', error);
        }

        // Call onMapReady callback if provided
        if (onMapReady) {
          onMapReady(map);
        }

        // Add timeout to catch loading issues and fallback to proxy URL (reverse direction)
        const loadTimeout = setTimeout(() => {
          if (!mapLoaded) {
            try { map.setStyle(proxyStyleUrl) } catch {}
          }
        }, 1200);

        map.on('load', () => {
          clearTimeout(loadTimeout);
          // Add navigation controls
        // Reduce error state if style begins loading
        map.on('styledata', () => {
          try { setError(null); } catch (_) {}
        });

        // Handle style loading errors and fallback
        map.on('error', (e: any) => {
          try {
            if (e?.error?.message?.includes('403')) {
              map.setStyle(directStyleUrl);
            }
          } catch (_) {}
        });
          try {
            const nav = ola.addNavigationControls({ showCompass: false, showZoom: true, visualizePitch: false });
            if (nav && typeof map.addControl === 'function') map.addControl(nav, 'top-right');
          } catch (_) {}

          // Optional: Geolocate control (trigger once on load)
          if (enableGeolocate) {
            try {
              const geolocate = ola.addGeolocateControls({
                positionOptions: { enableHighAccuracy: true },
                trackUserLocation: true,
              });
              map.addControl(geolocate);
              try { geolocate.trigger && geolocate.trigger(); } catch (_) {}
              geolocate.on && geolocate.on('error', () => {});
            } catch (_) {}
          }

          // Utility: ensure pulse keyframes once
          try {
            // Animation styles removed - no longer needed
          } catch (_) {}

          // Add pickup marker using Ola Maps built-in marker system
          if (pickup && pickup.lat && pickup.lng) {
          const validatedPickup = validateCoordinates(pickup);
            console.log('Creating pickup marker at:', validatedPickup);
          pickupMarkerRef.current = ola
              .addMarker({ color: 'green', draggable: activeEditable === 'pickup' })
            .setLngLat([validatedPickup.lng, validatedPickup.lat])
            .addTo(map);
            console.log('Pickup marker created:', pickupMarkerRef.current);
            
          pickupMarkerRef.current.on('dragend', () => {
            const pos = pickupMarkerRef.current.getLngLat?.();
            if (!pos) return;
            if (activeEditable === 'pickup' && onMapClickProp) {
              onMapClickProp({ lat: pos.lat ?? pos[1], lng: pos.lng ?? pos[0] });
                // Blur input fields when marker is dragged
                if (onMarkerDrag) {
                  onMarkerDrag();
                }
            }
          });
          }

          // Only show dropoff marker if dropoff coordinates exist and are different from pickup and not (0,0)
          // OR if we're in dropoff editing mode (for homepage single-location maps)
          if (dropoff && dropoff.lat && dropoff.lng && (((dropoff.lat !== pickup.lat || dropoff.lng !== pickup.lng) && 
              (dropoff.lat !== 0 || dropoff.lng !== 0)) || activeEditable === 'dropoff')) {
            const validatedDropoff = validateCoordinates(dropoff);
          dropMarkerRef.current = ola
              .addMarker({ color: 'red', draggable: activeEditable === 'dropoff' })
              .setLngLat([validatedDropoff.lng, validatedDropoff.lat])
            .addTo(map);
          dropMarkerRef.current.on('dragend', () => {
            const pos = dropMarkerRef.current.getLngLat?.();
            if (!pos) return;
            if (activeEditable === 'dropoff' && onMapClickProp) {
              onMapClickProp({ lat: pos.lat ?? pos[1], lng: pos.lng ?? pos[0] });
                // Blur input fields when marker is dragged
                if (onMarkerDrag) {
                  onMarkerDrag();
                }
            }
          });
          }

          // Add route polyline if provided (initial draw)
          if (routeData?.coordinates?.length) {
            // Ensure route coordinates are validated for precision
            const validatedRouteCoords = routeData.coordinates.map((coord: number[]) => 
              validateCoordinates({ lat: coord[1], lng: coord[0] })
            ).map((coord: {lat: number, lng: number}) => [coord.lng, coord.lat]);
            
            const addPolyline = (map as any).addPolyline;
            if (typeof addPolyline === 'function') {
              addPolyline.call(map, { path: validatedRouteCoords, strokeColor: '#22c55e', strokeWeight: 4 });
            } else {
              try {
                const geojson = { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: validatedRouteCoords } } as any;
                if ((map as any).getSource && (map as any).addSource) {
                  (map as any).addSource('route-src', { type: 'geojson', data: geojson });
                  (map as any).addLayer({ id: 'route-layer', type: 'line', source: 'route-src', paint: { 'line-color': '#22c55e', 'line-width': 4 } });
                }
              } catch (_) {}
            }
          }

          // Do not move camera automatically; respect initial center/zoom
          didFitRef.current = true;

          // Driver marker if available initially
          if (driverLocation) {
            if (driverMarkerRef.current) driverMarkerRef.current.remove();
            driverMarkerRef.current = ola
              .addMarker({ color: 'blue' })
              .setLngLat([driverLocation.lng, driverLocation.lat])
              .addTo(map);
          }

        setMapLoaded(true);
        
        if (onRouteLoad && routeData) {
          onRouteLoad(routeData);
        }
        });

        // Click handler to select coordinates on map
        map.on('click', (e: any) => {
          if (!e?.lngLat) return;
          const maybeArray = e.lngLat as any;
          const lng = Array.isArray(maybeArray) ? maybeArray[0] : maybeArray.lng;
          const lat = Array.isArray(maybeArray) ? maybeArray[1] : maybeArray.lat;
          
          // Validate clicked coordinates
          const validatedCoords = validateCoordinates({ lat, lng });
          
          if (activeEditable && typeof onMapClickProp === 'function') {
            onMapClickProp(validatedCoords);
            // Update marker position immediately for better UX
            if (activeEditable === 'pickup' && pickupMarkerRef.current) {
              try { pickupMarkerRef.current.setLngLat([validatedCoords.lng, validatedCoords.lat]); } catch (_) {}
            } else if (activeEditable === 'dropoff' && dropMarkerRef.current) {
              try { dropMarkerRef.current.setLngLat([validatedCoords.lng, validatedCoords.lat]); } catch (_) {}
            }
          }
        });

        // Provide fallback for missing sprite images (e.g., "airport") to avoid console noise
        map.on('styleimagemissing', (e: any) => {
          try {
            const id = e?.id || e;
            // Add a 1x1 transparent PNG as a placeholder; mark SDF to allow tinting if needed
            const img = new Image(1, 1);
            img.onload = () => {
              try { (map as any).addImage && (map as any).addImage(id, img, { sdf: true }); } catch (_) {}
            };
            img.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII=';
          } catch (_) {}
        });
        // Surface SDK errors to help diagnose stuck loads
        map.on('error', (e: any) => {
          try { setError(e?.error?.message || 'Map error'); } catch (_) {}
        });

      } catch (err) {
        console.error('Error initializing Ola Map:', err);
        setError('Failed to load map');
      }
    };

    initializeMap();

    // Cleanup function
    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
      pickupMarkerRef.current = null;
      dropMarkerRef.current = null;
      // Cleanup wave timers when effect cleans up
      try { waveTimersRef.current.forEach((id: number) => clearTimeout(id)); } catch (_) {}
    };
  }, [onRouteLoad, height]);

  // Render static online driver pins as image markers
  useEffect(() => {
    const map: any = mapInstanceRef.current;
    const ola = olaRef.current;
    if (!map || !ola || !mapLoaded) return;
    try { onlineDriverMarkersRef.current.forEach(m => { try { m.remove(); } catch (_) {} }); } catch (_) {}
    onlineDriverMarkersRef.current = [];
    if (!Array.isArray(driverPins) || !driverPins.length) return;
    const pins: Array<{lat:number;lng:number}> = driverPins;
    pins.forEach((p) => {
      try {
        const img = document.createElement('img');
        img.src = '/icons/rickshaw.png';
        img.style.width = '28px';
        img.style.height = '26px';
        img.style.filter = 'brightness(0.9) contrast(1.1) drop-shadow(0 1px 2px rgba(0,0,0,0.35))';
        img.style.transform = 'translate(-50%, -50%)';
        const marker = ola.addMarker({ element: img }).setLngLat([p.lng, p.lat]).addTo(map);
        onlineDriverMarkersRef.current.push(marker);
      } catch (_) {}
    });
  }, [driverPins?.length, mapLoaded]);

  // Draw or update route polyline when routeData changes, without reinitializing the map
  useEffect(() => {
    const map: any = mapInstanceRef.current;
    if (!map || !mapLoaded) return;
    const buildGeoJson = () => {
      const validatedRouteCoords = routeData.coordinates.map((coord: number[]) => 
        validateCoordinates({ lat: coord[1], lng: coord[0] })
      ).map((coord: {lat: number, lng: number}) => [coord.lng, coord.lat]);
      return { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: validatedRouteCoords } } as any;
    };

    if (!routeData?.coordinates?.length) {
      // If no route, remove layer and source once
    try {
      if (map.getLayer && map.getSource && map.removeLayer && map.removeSource) {
        if (map.getLayer('route-layer')) map.removeLayer('route-layer');
        if (map.getSource('route-src')) map.removeSource('route-src');
      }
    } catch (_) {}
      return;
    }

    try {
      if (map.getSource && map.getSource('route-src')) {
        // Update existing source data to avoid flicker
        (map.getSource('route-src') as any).setData(buildGeoJson());
      } else if (map.addSource && map.addLayer) {
        // First time: add source and layer
        map.addSource('route-src', { type: 'geojson', data: buildGeoJson() });
        map.addLayer({ id: 'route-layer', type: 'line', source: 'route-src', paint: { 'line-color': '#22c55e', 'line-width': 4 } });
        }
      } catch (_) {}
  }, [routeData, mapLoaded]);

  // Center on selected point when focus changes
  useEffect(() => {
    const map: any = mapInstanceRef.current;
    if (!map) return;
    if (focus === 'pickup' && pickup?.lat && pickup?.lng) {
      try { 
        map.flyTo && map.flyTo({ 
          center: [pickup.lng, pickup.lat], 
          zoom: 16, // Higher zoom for precision
          speed: 0.8 
        }); 
      } catch (_) {}
    } else if (focus === 'dropoff' && dropoff?.lat && dropoff?.lng) {
      try { 
        map.flyTo && map.flyTo({ 
          center: [dropoff.lng, dropoff.lat], 
          zoom: 16, // Higher zoom for precision
          speed: 0.8 
        }); 
      } catch (_) {}
    }
  }, [focus, dropoff, pickup]);

  // Update driver marker when driverLocation changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !mapLoaded) return;
    if (!driverLocation) {
      if (driverMarkerRef.current) {
        driverMarkerRef.current.remove();
        driverMarkerRef.current = null;
      }
      return;
    }
    const ola = olaRef.current;
    if (!driverMarkerRef.current && ola) {
      driverMarkerRef.current = ola
        .addMarker({ color: 'blue' })
        .setLngLat([driverLocation.lng, driverLocation.lat])
        .addTo(map);
    } else if (driverMarkerRef.current && driverMarkerRef.current.setLngLat) {
      driverMarkerRef.current.setLngLat([driverLocation.lng, driverLocation.lat]);
    }
  }, [driverLocation, mapLoaded]);

  // Update marker draggability and positions when activeEditable or coords change
  useEffect(() => {
    const map: any = mapInstanceRef.current;
    const ola = olaRef.current;
    if (!map || !ola || !mapLoaded) return;
    const refreshMarker = (
      ref: React.MutableRefObject<any>,
      color: string,
      draggable: boolean,
      lngLat: [number, number]
    ) => {
      try { if (ref.current) ref.current.remove(); } catch (_) {}
      ref.current = ola.addMarker({ color, draggable }).setLngLat(lngLat).addTo(map);
      ref.current.on && ref.current.on('dragend', () => {
        const pos = ref.current.getLngLat?.();
        if (!pos) return;
        if (draggable && typeof onMapClick === 'function') {
          onMapClick({ lat: pos.lat ?? pos[1], lng: pos.lng ?? pos[0] });
          // Blur input fields when marker is dragged
          if (onMarkerDrag) {
            onMarkerDrag();
          }
        }
      });
    };
    // Update pickup marker draggability only (don't recreate)
    if (pickupMarkerRef.current) {
      try { 
        pickupMarkerRef.current.setDraggable(activeEditable === 'pickup');
      } catch (_) {}
    }
    
    // Only show dropoff marker if dropoff coordinates exist AND (coordinates are different OR if we're in dropoff editing mode)
    const validatedDropoff = dropoff ? validateCoordinates(dropoff) : null;
    if (validatedDropoff && dropoff && ((dropoff.lat !== pickup.lat || dropoff.lng !== pickup.lng) || activeEditable === 'dropoff')) {
      refreshMarker(dropMarkerRef, 'red', activeEditable === 'dropoff', [validatedDropoff.lng, validatedDropoff.lat]);
    } else {
      // Remove dropoff marker if no dropoff coordinates or same as pickup
      try { if (dropMarkerRef.current) dropMarkerRef.current.remove(); } catch (_) {}
      dropMarkerRef.current = null;
    }
  }, [activeEditable, mapLoaded]);

  // Live location effect disabled - no blue rings
  useEffect(() => {
    // Remove any existing live markers to ensure clean map
    if (liveMarkerRef.current) { 
      try { liveMarkerRef.current.remove(); } catch (_) {} 
      liveMarkerRef.current = null; 
    }
  }, [mapLoaded]);

  return (
    <div className={`bg-gray-100 rounded-lg overflow-hidden relative ${className}`} style={{ height }}>
      <div ref={mapRef} style={{ width: '100%', height: '100%', minHeight: '200px' }} />
      {!mapLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
          <div className="text-center text-gray-600">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
            <div className="text-sm">Loading map…</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OlaMap;

