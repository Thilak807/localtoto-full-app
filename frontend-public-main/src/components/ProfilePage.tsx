import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ firstName: string; lastName: string; email?: string; phoneNumber: string; profilePhoto?: { url?: string } } | null>(null);

  const [avatarUrl, setAvatarUrl] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (!token) {
      navigate('/signin', { replace: true });
      return;
    }
    (async () => {
      try {
        const res = await api.get('/users/profile');
        setUser(res.data?.user);
        setAvatarUrl(res.data?.user?.profilePhoto?.url || '');
      } catch (e: any) {
        if (e?.response?.status === 401) {
          navigate('/signin', { replace: true });
          return;
        }
        alert(e?.response?.data?.message || 'Failed to load profile');
      }
    })();
  }, [navigate]);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please select a valid image file.');
      return;
    }

    const maxSizeBytes = 3 * 1024 * 1024; // 3MB
    if (file.size > maxSizeBytes) {
      alert('Image must be less than 3MB.');
      return;
    }

    const form = new FormData();
    form.append('profilePhoto', file);
    (async () => {
      try {
        // Let axios set the multipart boundary automatically
        const res = await api.post('/users/profile/photo', form);
        const url = res.data?.profilePhoto?.url;
        if (url) {
          setAvatarUrl(`${url}?t=${Date.now()}`);
          setUser((prev) => (prev ? { ...prev, profilePhoto: { url } } : prev));
        }
      } catch (e: any) {
        alert(e?.response?.data?.message || 'Failed to upload photo');
      }
    })();
  };

  const [bookings, setBookings] = useState<any[]>([]);
  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/bookings/history');
        setBookings(res.data?.bookings || []);
      } catch {}
    })();
  }, []);

  return (
    <main className="pt-24 pb-16 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <section className="lg:col-span-1 bg-white rounded-2xl shadow p-6">
            <div className="flex flex-col items-center text-center">
              <img
                src={avatarUrl || 'https://via.placeholder.com/200x200.png?text=User'}
                alt={user ? `${user.firstName} ${user.lastName}` : 'User'}
                className="w-28 h-28 rounded-full object-cover border-4 border-green-100"
                crossOrigin="anonymous"
              />
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
              <button
                onClick={handleOpenFilePicker}
                className="mt-3 px-3 py-1.5 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Change Photo
              </button>
              <h1 className="mt-4 text-xl font-bold text-gray-900">{user ? `${user.firstName} ${user.lastName}` : ''}</h1>
              <div className="mt-5 w-full space-y-2 text-sm">
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-gray-600">Email</span>
                  <span className="font-medium text-gray-800">{user?.email || '-'}</span>
                </div>
                <div className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-2">
                  <span className="text-gray-600">Phone</span>
                  <span className="font-medium text-gray-800">{user?.phoneNumber || '-'}</span>
                </div>
              </div>
              <div className="mt-6 flex gap-3">
                <button className="px-4 py-2 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition-colors">
                  Edit Profile
                </button>
                <button className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors" onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('refreshToken'); navigate('/signin', { replace: true }); }}>
                  Log out
                </button>
              </div>
            </div>
          </section>

          <section className="lg:col-span-2 space-y-8">
            {/* Summary widgets can be wired later when backend supports stats per user */}

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900">Recent Rides</h2>
              <ul className="mt-4 divide-y divide-gray-100">
                {bookings.slice(0,3).map((b) => (
                  <li key={b.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-800">{`${b.pickup_description ?? ''} → ${b.dropoff_description ?? ''}`}</p>
                      <p className="text-sm text-gray-500">{(b.status || '').toString()} • ₹{b.fare}</p>
                    </div>
                    <button
                      className="text-sm font-medium text-green-700 hover:text-green-800"
                      onClick={() => navigate('/booking-confirmation', {
                        state: {
                          rideId: b.id,
                          pickupAddress: b.pickup_description,
                          dropAddress: b.dropoff_description,
                          pickupCoords: { lat: b.pickup_lat, lng: b.pickup_lng },
                          dropCoords: { lat: b.dropoff_lat, lng: b.dropoff_lng },
                          fare: b.fare,
                          distance: b.distance_km,
                          duration: b.duration_text
                        }
                      })}
                    >
                      View
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow p-6">
              <h2 className="text-lg font-semibold text-gray-900">Ride History</h2>
              <div className="mt-4 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="text-left text-gray-500">
                      <th className="py-2 pr-4">Date</th>
                      <th className="py-2 pr-4">Ride</th>
                      <th className="py-2 pr-4">Status</th>
                      <th className="py-2 pr-0 text-right">Fare (₹)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {bookings.map((b) => (
                      <tr key={b.id} className="text-gray-800 cursor-pointer hover:bg-gray-50" onClick={() => navigate('/booking-confirmation', {
                        state: {
                          rideId: b.id,
                          pickupAddress: b.pickup_description,
                          dropAddress: b.dropoff_description,
                          pickupCoords: { lat: b.pickup_lat, lng: b.pickup_lng },
                          dropCoords: { lat: b.dropoff_lat, lng: b.dropoff_lng },
                          fare: b.fare,
                          distance: b.distance_km,
                          duration: b.duration_text
                        }
                      })}>
                        <td className="py-3 pr-4 whitespace-nowrap">{new Date(b.created_at).toLocaleDateString()}</td>
                        <td className="py-3 pr-4">{`${b.pickup_description ?? ''} → ${b.dropoff_description ?? ''}`}</td>
                        <td className="py-3 pr-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                              b.status === 'completed'
                                ? 'bg-green-50 text-green-700 border border-green-200'
                                : 'bg-yellow-50 text-yellow-700 border border-yellow-200'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="py-3 pr-0 text-right font-semibold">{b.fare}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default ProfilePage;


