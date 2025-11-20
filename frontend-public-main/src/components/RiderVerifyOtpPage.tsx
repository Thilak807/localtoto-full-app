import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../services/api';

const RiderVerifyOtpPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const phoneNumber = location?.state?.phoneNumber || '';
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!phoneNumber || !otp) {
      setError('Missing phone or OTP');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/riders/verify-otp', { phoneNumber, otp });
      const token = res?.data?.token;
      if (token) {
        localStorage.setItem('rider_token', token);
        navigate('/rider/dashboard', { replace: true });
      } else {
        setError('Invalid response');
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow p-6">
        <h1 className="text-2xl font-semibold mb-4 text-gray-900">Verify OTP (Rider)</h1>
        <form onSubmit={handleVerify} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              readOnly
              className="w-full border border-gray-200 bg-gray-50 rounded-lg px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">OTP</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-600"
              placeholder="Enter 4-digit OTP"
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-green-600 text-white rounded-lg py-2 font-semibold hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Verifying…' : 'Verify & Continue'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RiderVerifyOtpPage;



