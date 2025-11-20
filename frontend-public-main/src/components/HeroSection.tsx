import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
// BookingForm removed from hero layout
import LocationAutocomplete from './LocationAutocomplete';
import OlaMap from './OlaMap';
import { GeocodeResult, getCurrentLocation, isWithinServiceArea } from '../services/geocode';
import './HeroSection.css';

const HeroSection: React.FC = () => {
  // Removed Book/Schedule tabs
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropLocation, setDropLocation] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [isGettingLocation, setIsGettingLocation] = useState<boolean>(false);
  const [pickupSuggestions, setPickupSuggestions] = useState<GeocodeResult[]>([]);
  const [dropSuggestions, setDropSuggestions] = useState<GeocodeResult[]>([]);
  const [isPickupInputFocused, setIsPickupInputFocused] = useState<boolean>(false);
  const [isDropInputFocused, setIsDropInputFocused] = useState<boolean>(false);
  const [pickupSelected, setPickupSelected] = useState<boolean>(false);
  const [dropSelected, setDropSelected] = useState<boolean>(false);
  const [showArrow, setShowArrow] = useState<boolean>(false);
  const [rotatingText, setRotatingText] = useState<string>('Patna Junction');
  const [rotatingDropText, setRotatingDropText] = useState<string>('Airport, Patna');
  const [showPickupMap, setShowPickupMap] = useState<boolean>(false);
  const [showDropMap, setShowDropMap] = useState<boolean>(false);
  const [activeEditable, setActiveEditable] = useState<'pickup' | 'dropoff' | null>(null);
  const [isLocationLocked, setIsLocationLocked] = useState<boolean>(false);
  const navigate = useNavigate();

  // Get user's current location on component mount and set as pickup
  useEffect(() => {
    const fetchCurrentLocation = async () => {
      // Only set if pickup location is empty
      if (!pickupLocation && !pickupCoords) {
        setIsGettingLocation(true);
        try {
          const location = await getCurrentLocation();
          if (location) {
            setPickupLocation(location.address);
            setPickupCoords({ lat: location.lat, lng: location.lng });
            // Mark pickup as selected and show arrow to guide user to drop input
            setPickupSelected(true);
            setShowArrow(true);
          }
        } catch (error) {
          console.error('Failed to get current location:', error);
        } finally {
          setIsGettingLocation(false);
        }
      }
    };

    fetchCurrentLocation();
  }, []); // Only run once on mount

  // Rotating text animation for pickup
  React.useEffect(() => {
    const texts = ['Patna Junction', 'Gandhi Maidan, Patna', 'Boring Road'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setRotatingText(texts[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Rotating text animation for drop
  React.useEffect(() => {
    const texts = ['Airport, Patna', 'Railway Station', 'City Center'];
    let index = 0;
    const interval = setInterval(() => {
      index = (index + 1) % texts.length;
      setRotatingDropText(texts[index]);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handlePickupFocus = () => {
    // Only show suggestions if location is not locked
    if (!isLocationLocked) {
      setIsPickupInputFocused(true);
    }
  };

  const handlePickupBlur = () => {
    setIsPickupInputFocused(false);
  };

  const handleMarkerDrag = () => {
    // Clear suggestions and blur input when marker is dragged
    setIsPickupInputFocused(false);
    setPickupSuggestions([]);
    setIsDropInputFocused(false);
    setDropSuggestions([]);
    // Lock the location to prevent further suggestions
    setIsLocationLocked(true);
  };

  const handlePickupSuggestionSelect = (_suggestion: GeocodeResult) => {
    setPickupSelected(true);
    setShowArrow(true);
    setPickupSuggestions([]);
  };

  const handlePickupSuggestionsChange = (suggestions: GeocodeResult[]) => {
    setPickupSuggestions(suggestions);
  };

  const handleDropFocus = () => {
    // Only show suggestions if location is not locked
    if (!isLocationLocked) {
      setIsDropInputFocused(true);
    }
  };

  const handleDropBlur = () => {
    setIsDropInputFocused(false);
  };

  const handleDropSuggestionSelect = (_suggestion: GeocodeResult) => {
    setDropSelected(true);
    setDropSuggestions([]);
  };

  const handleDropSuggestionsChange = (suggestions: GeocodeResult[]) => {
    setDropSuggestions(suggestions);
  };

  const handleMapClick = async (coords: { lat: number; lng: number }) => {
    if (activeEditable === 'pickup') {
      setPickupCoords(coords);
      // Reverse geocode to update the pickup location text
      try {
        const { reverseGeocode } = await import('../services/geocode');
        const locationData = await reverseGeocode(coords.lat, coords.lng);
        if (locationData) {
          setPickupLocation(locationData.address);
        }
      } catch (error) {
        console.error('Failed to reverse geocode pickup location:', error);
      }
    } else if (activeEditable === 'dropoff') {
      setDropCoords(coords);
      // Reverse geocode to update the drop location text
      try {
        const { reverseGeocode } = await import('../services/geocode');
        const locationData = await reverseGeocode(coords.lat, coords.lng);
        if (locationData) {
          setDropLocation(locationData.address);
        }
      } catch (error) {
        console.error('Failed to reverse geocode drop location:', error);
      }
    }
  };

  const handleShowPickupMap = () => {
    if (!pickupCoords) {
      alert('Please select a pickup location first');
      return;
    }
    setShowPickupMap(!showPickupMap);
    setShowDropMap(false); // Close drop map if open
    if (!showPickupMap) {
      setActiveEditable('pickup');
    } else {
      setActiveEditable(null);
    }
  };

  const handleShowDropMap = () => {
    if (!dropCoords) {
      alert('Please select a drop location first');
      return;
    }
    setShowDropMap(!showDropMap);
    setShowPickupMap(false); // Close pickup map if open
    if (!showDropMap) {
      setActiveEditable('dropoff');
    } else {
      setActiveEditable(null);
    }
  };

  const handleClosePickupMap = () => {
    setShowPickupMap(false);
    setActiveEditable(null);
  };

  const handleCloseDropMap = () => {
    setShowDropMap(false);
    setActiveEditable(null);
  };

  return (
    <div className="relative min-h-screen flex items-start bg-gradient-to-br from-green-800 to-green-600 overflow-hidden pt-14">
      {/* Background animation */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -bottom-16 lg:-right-16 w-80 h-80 lg:w-96 lg:h-96 rounded-full bg-yellow-400 opacity-20 animate-pulse"></div>
        <div className="absolute top-32 -left-16 w-60 h-60 rounded-full bg-blue-500 opacity-10 animate-pulse"></div>
      </div>
      
      <div className="container-classic py-20 lg:py-24 z-10">
        <div className="grid grid-cols-1 gap-10 items-start">
          <div className="text-white space-y-6 animate-fade-in">
            <h1 
              className="text-4xl sm:text-5xl font-bold leading-tight flex flex-wrap items-baseline gap-1 sm:gap-2 pb-[60px]"
            >
              <span className="inline-block">Book an</span>
              <span className="text-yellow-400 inline-block"> e-Rickshaw</span>
              <span className="inline-block">in Your City</span>
            </h1>
            {/* Pickup & Drop (full width) and per-input info boxes; Book Now full width below */}
            <div className="mt-8">
              {/* Grid: 40% / 40% / 20% on md+ using 10-column grid */}
              <div className="grid grid-cols-1 md:grid-cols-10 gap-3 items-end">
                {/* Pickup column (40%) */}
                <div className="w-full md:col-span-4">
                  <label className="text-sm font-medium text-white/90 mb-2 block">Pickup</label>
                  <LocationAutocomplete
                    placeholder="Enter pickup location or use current location"
                    value={pickupLocation}
                    onChange={setPickupLocation}
                    onLocationSelect={(loc)=> { setPickupCoords({ lat: loc.lat, lng: loc.lng }); setPickupLocation(loc.address); setPickupSelected(true); setShowArrow(true); }}
                    onInputFocus={handlePickupFocus}
                    onInputBlur={handlePickupBlur}
                    onSuggestionsChange={handlePickupSuggestionsChange}
                    onSuggestionSelect={handlePickupSuggestionSelect}
                    showClearButton={true}
                    onClear={() => {
                      setPickupLocation('');
                      setPickupCoords(null);
                      setIsLocationLocked(false);
                      setPickupSelected(false);
                      setShowArrow(false);
                    }}
                  />
                </div>
                {/* Drop column (40%) */}
                <div className="w-full md:col-span-4">
                  <label className="text-sm font-medium text-white/90 mb-2 block">Drop</label>
                  <LocationAutocomplete
                    placeholder="Enter drop location"
                    value={dropLocation}
                    onChange={setDropLocation}
                    onLocationSelect={(loc)=> { setDropCoords({ lat: loc.lat, lng: loc.lng }); setDropLocation(loc.address); }}
                    onInputFocus={handleDropFocus}
                    onInputBlur={handleDropBlur}
                    onSuggestionsChange={handleDropSuggestionsChange}
                    onSuggestionSelect={handleDropSuggestionSelect}
                  />
                </div>
                {/* Book Now button (20%) */}
                <div className="w-full md:col-span-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (!pickupLocation || !dropLocation || !pickupCoords || !dropCoords) {
                        alert('Please select pickup and drop locations');
                        return;
                      }
                      // Validate locations are within service area
                      if (!isWithinServiceArea(pickupCoords.lat, pickupCoords.lng)) {
                        alert('Pickup location is outside our service area. We currently serve Patna and surrounding areas within 30km radius.');
                        return;
                      }
                      if (!isWithinServiceArea(dropCoords.lat, dropCoords.lng)) {
                        alert('Dropoff location is outside our service area. We currently serve Patna and surrounding areas within 30km radius.');
                        return;
                      }
                      try { sessionStorage.setItem('rideFlow', 'active'); } catch {}
                      navigate('/booking-details', {
                        replace: true,
                        state: {
                          rideType: 'solo',
                          pickupLocation,
                          dropLocation,
                          pickupCoords,
                          dropCoords,
                          isScheduled: false,
                        }
                      });
                    }}
                    className="w-full py-3 bg-white text-green-700 font-semibold rounded-full hover:bg-green-50 transition-colors duration-300 flex items-center justify-center"
                  >
                    Book Now
                  </button>
                </div>
              </div>
              {/* Two info boxes below, aligned to pickup and drop columns widths */}
              <div className="mt-4 grid grid-cols-1 md:grid-cols-10 gap-3">
                <div className="hidden md:flex rounded-xl border border-white/20 bg-white/10 backdrop-blur overflow-hidden w-full md:col-span-4 h-24 md:h-40 lg:h-[300px] items-center justify-center relative slide-in-left">
                  {showPickupMap && pickupCoords ? (
                    <div className="w-full h-full relative">
                      {/* Exit button */}
                      <button
                        onClick={handleClosePickupMap}
                        className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur rounded-full p-1.5 hover:bg-white transition-all duration-300 shadow-lg"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <OlaMap
                        pickup={pickupCoords!}
                        dropoff={dropCoords || undefined}
                        height="100%"
                        onMapClick={handleMapClick}
                        activeEditable="pickup"
                        focus="pickup"
                        onMarkerDrag={handleMarkerDrag}
                        className="rounded-lg"
                      />
                    </div>
                  ) : isPickupInputFocused && pickupSuggestions.length > 0 && !isLocationLocked ? (
                    <div className="w-full h-full bg-white/10 backdrop-blur rounded-lg p-2 overflow-auto">
                      {pickupSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.place_id}
                          className="cursor-pointer select-none py-2 px-3 text-sm text-white hover:bg-white/20 rounded"
                          onClick={() => handlePickupSuggestionSelect(suggestion)}
                        >
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-white mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="min-w-0">
                              <div className="truncate text-base">{suggestion.display_name}</div>
                              {suggestion.address?.city && (
                                <div className="text-xs text-white/70 truncate">
                                  {suggestion.address.city}, {suggestion.address.state || suggestion.address.country}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : pickupSelected ? (
                    <div className="flex items-center justify-between w-full px-8">
                      <div className="text-left text-white flex-1">
                        <div className="text-2xl font-bold mb-2">✅ Pickup Location Set!</div>
                        <div className="text-base opacity-90">{pickupLocation}</div>
                      </div>
                      {showArrow && (
                        <div className="arrow-slide">
                          <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center text-white fade-in-up px-4">
                      <div className="text-2xl font-semibold mb-4">Enter your pickup location</div>
                      <div className="text-xl font-medium mb-4 transition-opacity duration-300">{rotatingText}</div>
                      <div className="text-sm mt-6 opacity-70 flex items-center justify-center">
                        <span className="mr-2">or click</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="ml-2">to get current location</span>
                      </div>
                    </div>
                  )}
                  
                  {/* Show Map button for pickup */}
                  {pickupCoords && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                      <button
                        onClick={handleShowPickupMap}
                        className="bg-white/20 backdrop-blur border border-white/30 text-white px-3 py-1.5 rounded-full text-xs hover:bg-white/30 transition-all duration-300 flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>{showPickupMap ? 'Hide Map' : 'Show Map'}</span>
                      </button>
                    </div>
                  )}
                </div>
                <div className="hidden md:flex rounded-xl md:border md:border-white/20 md:bg-white/10 md:backdrop-blur overflow-hidden w-full md:col-span-4 h-24 md:h-40 lg:h-[300px] flex items-center justify-center relative slide-in-right">
                  {showDropMap && dropCoords ? (
                    <div className="w-full h-full relative">
                      {/* Exit button */}
                      <button
                        onClick={handleCloseDropMap}
                        className="absolute top-2 left-2 z-10 bg-white/90 backdrop-blur rounded-full p-1.5 hover:bg-white transition-all duration-300 shadow-lg"
                      >
                        <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                      <OlaMap
                        pickup={pickupCoords!}
                        dropoff={dropCoords || undefined}
                        height="100%"
                        onMapClick={handleMapClick}
                        activeEditable="dropoff"
                        focus="dropoff"
                        onMarkerDrag={handleMarkerDrag}
                        className="rounded-lg"
                      />
                    </div>
                  ) : isDropInputFocused && dropSuggestions.length > 0 && !isLocationLocked ? (
                    <div className="w-full h-full bg-white/10 backdrop-blur rounded-lg p-2 overflow-auto">
                      {dropSuggestions.map((suggestion) => (
                        <div
                          key={suggestion.place_id}
                          className="cursor-pointer select-none py-2 px-3 text-sm text-white hover:bg-white/20 rounded"
                          onClick={() => handleDropSuggestionSelect(suggestion)}
                        >
                          <div className="flex items-start">
                            <svg className="w-5 h-5 text-white mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <div className="min-w-0">
                              <div className="truncate text-base">{suggestion.display_name}</div>
                              {suggestion.address?.city && (
                                <div className="text-xs text-white/70 truncate">
                                  {suggestion.address.city}, {suggestion.address.state || suggestion.address.country}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : dropLocation ? (
                    <div className="flex items-center justify-between w-full px-8">
                      <div className="text-left text-white flex-1">
                        <div className="text-2xl font-bold mb-2">✅ Drop Location Set!</div>
                        <div className="text-base opacity-90">{dropLocation}</div>
                      </div>
                      {dropSelected && (
                        <div className="arrow-slide">
                          <svg className="w-16 h-16 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                          </svg>
                        </div>
                      )}
                    </div>
                  ) : showArrow ? (
                    <div className="text-center text-white fade-in-up px-4">
                      <div className="text-2xl font-semibold mb-4">Enter your drop location</div>
                      <div className="text-xl font-medium mb-4 transition-opacity duration-300">{rotatingDropText}</div>
                      <div className="text-sm mt-6 opacity-70 flex items-center justify-center">
                        <span className="mr-2">or click</span>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="ml-2">to get current location</span>
                      </div>
                    </div>
                  ) : (
                    <div className="hidden md:block text-center text-white opacity-50">
                      <div className="text-2xl font-semibold mb-2">Enter your drop location</div>
                      <div className="text-xl font-medium mb-4">Select pickup first</div>
                    </div>
                  )}
                  
                  {/* Show Map button for drop */}
                  {dropCoords && (
                    <div className="absolute bottom-3 left-1/2 transform -translate-x-1/2">
                      <button
                        onClick={handleShowDropMap}
                        className="bg-white/20 backdrop-blur border border-white/30 text-white px-3 py-1.5 rounded-full text-xs hover:bg-white/30 transition-all duration-300 flex items-center space-x-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                        </svg>
                        <span>{showDropMap ? 'Hide Map' : 'Show Map'}</span>
                      </button>
                    </div>
                  )}
                </div>
                {/* Empty spacer to align under Book Now (20%) */}
                <div className="hidden md:block md:col-span-2"></div>
              </div>
            </div>
            {/* CTA buttons moved to bottom of hero */}
          </div>
          {/* Right column removed to allow full-width content */}
        </div>
      </div>
      {/* Bottom CTA buttons (stick to bottom of hero) */}
      <div className="absolute inset-x-0 bottom-0 z-20">
        <div className="container-classic pb-8">
          <div className="flex flex-wrap gap-4">
          <button className="btn btn-primary bg-white text-green-700 hover:bg-green-50 border border-white/0 rounded-full flex items-center">
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none">
              <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor"/>
            </svg>
            Download App
          </button>
          <button 
            onClick={() => navigate('/learn-more')}
            className="btn btn-secondary border-2 border-white text-white hover:bg-white hover:text-green-700 rounded-full"
            style={{ color: 'rgb(21, 128, 61)' }}
          >
            Learn More
          </button>
          </div>
        </div>
      </div>
      
      {/* Bottom booking panel removed */}
    </div>
  );
};

export default HeroSection;