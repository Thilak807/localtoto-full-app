import React, { useState } from 'react';
import { MapPin, Calendar, Clock, Compass, Map, Search } from 'lucide-react';
import LocationAutocomplete from './LocationAutocomplete';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { geocodeToCoords, getCurrentLocation } from '../services/geocode';

interface BookingFormProps {
  isScheduled: boolean;
}

const BookingForm: React.FC<BookingFormProps> = ({ isScheduled }) => {
  const navigate = useNavigate();
  const [rideType] = useState<'solo' | 'shared'>('solo');
  const [pickupLocation, setPickupLocation] = useState<string>('');
  const [dropLocation, setDropLocation] = useState<string>('');
  const [pickupCoords, setPickupCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [dropCoords, setDropCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [scheduledTime, setScheduledTime] = useState<string>('');
  // Fare estimate removed from hero per requirement
  const [isEstimating] = useState<boolean>(false);
  const [estimate] = useState<{ distance: number; duration: string; fare: number } | null>(null);
  const [estimateError] = useState<string>('');
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address: string } | null>(null);

  // Get user's current location on component mount
  React.useEffect(() => {
    getCurrentLocation().then(location => {
      if (location) {
        setCurrentLocation(location);
        if (!pickupLocation) {
          setPickupLocation(location.address);
          setPickupCoords({ lat: location.lat, lng: location.lng });
        }
      }
    });
  }, []);

  const handleProceed = () => {
    if (!pickupLocation || !dropLocation) {
      alert('Please enter pickup and drop locations');
      return;
    }

    if (!pickupCoords || !dropCoords) {
      alert('Please select valid locations using the map or search');
      return;
    }

    // Scheduling moved to Booking Details page

    navigate('/booking-details', {
      state: {
        rideType: 'solo',
        pickupLocation,
        dropLocation,
        pickupCoords,
        dropCoords,
        isScheduled,
      },
    });
  };

  const handlePickupLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setPickupCoords({ lat: location.lat, lng: location.lng });
  };

  const handleDropLocationSelect = (location: { lat: number; lng: number; address: string }) => {
    setDropCoords({ lat: location.lat, lng: location.lng });
  };
  
  // Fare estimate flow removed
  
  return (
    <div className="py-4">
      {/* Ride type selection moved to Booking Details page */}
      
      <div className="space-y-4">
        {/* Inline row: Pickup, Drop, Book Now */}
        <div className="w-full">
          <div className="flex flex-col md:flex-row md:items-end md:space-x-3 space-y-3 md:space-y-0">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Pickup</label>
              <LocationAutocomplete
                placeholder="Enter pickup location or use current location"
                value={pickupLocation}
                onChange={setPickupLocation}
                onLocationSelect={handlePickupLocationSelect}
              />
            </div>
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700 mb-2 block">Drop</label>
              <LocationAutocomplete
                placeholder="Enter drop location"
                value={dropLocation}
                onChange={setDropLocation}
                onLocationSelect={handleDropLocationSelect}
              />
            </div>
            <div className="md:w-auto">
              <button
                type="button"
                onClick={handleProceed}
                className="w-full md:w-[160px] py-3 bg-green-600 text-white font-semibold rounded-full hover:bg-green-700 transition-colors duration-300 flex items-center justify-center"
              >
                Book Now
              </button>
            </div>
          </div>
        </div>

        {/* Info/animation box placeholder below inputs */}
        <div className="mt-3 p-4 rounded-xl border border-gray-200 bg-gray-50">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-green-200 animate-pulse mr-3" />
            <div className="flex-1">
              <div className="h-3 w-2/3 bg-gray-200 rounded mb-2 animate-pulse" />
              <div className="h-3 w-1/3 bg-gray-200 rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default BookingForm;