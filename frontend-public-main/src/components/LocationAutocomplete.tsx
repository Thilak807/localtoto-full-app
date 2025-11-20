import React from 'react';
import { MapPin, Navigation, X } from 'lucide-react';
import { searchAddresses, getCurrentLocation, GeocodeResult } from '../services/geocode';

interface LocationAutocompleteProps {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onLocationSelect?: (location: { lat: number; lng: number; address: string }) => void;
  onInputFocus?: () => void;
  onInputBlur?: () => void;
  onSuggestionsChange?: (suggestions: GeocodeResult[]) => void;
  onSuggestionSelect?: (suggestion: GeocodeResult) => void;
  showClearButton?: boolean;
  onClear?: () => void;
}

const DEBOUNCE_MS = 300;

const LocationAutocomplete: React.FC<LocationAutocompleteProps> = ({ 
  placeholder, 
  value, 
  onChange, 
  onLocationSelect,
  onInputFocus,
  onInputBlur,
  onSuggestionsChange,
  onSuggestionSelect,
  showClearButton = false,
  onClear
}) => {
  const [inputValue, setInputValue] = React.useState<string>(value);
  const [suggestions, setSuggestions] = React.useState<GeocodeResult[]>([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGettingLocation, setIsGettingLocation] = React.useState<boolean>(false);
  const abortRef = React.useRef<AbortController | null>(null);
  const timerRef = React.useRef<number | null>(null);
  const justSelectedRef = React.useRef<boolean>(false);
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const isExternalUpdateRef = React.useRef<boolean>(false);

  React.useEffect(() => {
    // Only update if value actually changed
    if (value !== inputValue) {
      isExternalUpdateRef.current = true; // Mark as external update
    setInputValue(value);
      // Close suggestions when value is set externally (e.g., auto-location)
      setIsOpen(false);
      setSuggestions([]);
    }
  }, [value, inputValue]);

  React.useEffect(() => {
    if (justSelectedRef.current) {
      // suppress reopening immediately after a selection
      justSelectedRef.current = false;
      return;
    }
    // If this is an external update (programmatic value change), don't search
    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false;
      return;
    }
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (!inputValue || inputValue.trim().length < 2) {
      setSuggestions([]);
      setIsOpen(false);
      return;
    }
    timerRef.current = window.setTimeout(async () => {
      try {
        if (abortRef.current) {
          abortRef.current.abort();
        }
        abortRef.current = new AbortController();
        setIsLoading(true);
        const results = await searchAddresses(inputValue);
        const limitedResults = results.slice(0, 6); // Limit to 6 suggestions
        setSuggestions(limitedResults);
        setIsOpen(limitedResults.length > 0);
        onSuggestionsChange?.(limitedResults);
      } catch (error) {
        if ((abortRef.current as any)?.signal?.aborted) return;
        console.error('Address search failed:', error);
        setSuggestions([]);
        setIsOpen(false);
      } finally {
        setIsLoading(false);
      }
    }, DEBOUNCE_MS);
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [inputValue]);

  const handleSelect = (suggestion: GeocodeResult) => {
    const address = suggestion.display_name;
    onChange(address);
    setInputValue(address);
    setIsOpen(false);
    justSelectedRef.current = true;
    
    if (onLocationSelect) {
      onLocationSelect({
        lat: suggestion.lat,
        lng: suggestion.lng,
        address: address
      });
    }
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion);
    }
  };

  // Close dropdown when clicking outside
  React.useEffect(() => {
    const onClickAway = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', onClickAway);
    return () => document.removeEventListener('mousedown', onClickAway);
  }, []);

  const handleGetCurrentLocation = async () => {
    setIsGettingLocation(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        // Mark as external update so search effect won't run
        isExternalUpdateRef.current = true;
        // Update input immediately without triggering suggestions
        setInputValue(location.address);
        setIsOpen(false);
        setSuggestions([]);
        // Propagate to parent (will also update value prop)
        onChange(location.address);
        if (onLocationSelect) {
          onLocationSelect(location);
        }
      } else {
        alert('Unable to get your current location. Please check your browser permissions.');
      }
    } catch (error) {
      console.error('Failed to get current location:', error);
      alert('Failed to get your current location. Please try again.');
    } finally {
      setIsGettingLocation(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setInputValue('');
    onChange('');
    setIsOpen(false);
    setSuggestions([]);
    if (onClear) {
      onClear();
    }
  };

  return (
    <div className="relative" ref={containerRef}>
      <div className="relative">
        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder={placeholder}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onChange(e.target.value);
          }}
          onFocus={() => {
            setIsOpen(!justSelectedRef.current && suggestions.length > 0);
            onInputFocus?.();
          }}
          onBlur={() => {
            onInputBlur?.();
          }}
          className={`block w-full pl-10 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-transparent text-gray-900 ${
            showClearButton && inputValue ? 'pr-24' : 'pr-20'
          }`}
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {showClearButton && inputValue && (
            <button
              type="button"
              onClick={handleClear}
              className="text-gray-400 hover:text-red-600 transition-colors"
              title="Clear location"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        <button
          type="button"
          onClick={handleGetCurrentLocation}
          disabled={isGettingLocation}
            className="text-gray-400 hover:text-green-600 disabled:opacity-50 transition-colors"
          title="Use current location"
        >
          <Navigation className="w-5 h-5" />
        </button>
        </div>
      </div>
      
      {isLoading && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          Searching...
        </div>
      )}
      
      {isGettingLocation && (
        <div className="absolute right-12 top-1/2 -translate-y-1/2 text-xs text-gray-400">
          Getting location...
        </div>
      )}
      
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-20 mt-1 max-h-80 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
          {suggestions.map((suggestion) => (
            <li
              key={suggestion.place_id}
              className="cursor-pointer select-none py-2 px-3 text-sm text-gray-700 hover:bg-gray-100"
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(suggestion);
              }}
            >
              <div className="flex items-start">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 mr-2 flex-shrink-0" />
                <div className="min-w-0">
                  <div className="truncate">{suggestion.display_name}</div>
                  {suggestion.address?.city && (
                    <div className="text-xs text-gray-500 truncate">
                      {suggestion.address.city}, {suggestion.address.state || suggestion.address.country}
                    </div>
                  )}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LocationAutocomplete;