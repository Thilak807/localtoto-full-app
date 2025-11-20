import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { isAllowedAdmin } from './adminConfig';
import adminApi from '../../services/adminApi';

const AdminLogin: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation() as any;
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      console.log('[AdminLogin] Attempting login with phone:', phone);
      const res = await adminApi.post('/admin/login', { phone, password });
      console.log('[AdminLogin] Login response:', res.data);
      
      const access = res.data?.access;
      const refresh = res.data?.refresh;
      if (!access || !refresh) {
        setError('Login failed - invalid token response');
        return;
      }
      localStorage.setItem('adminAccess', access);
      localStorage.setItem('adminRefresh', refresh);
      localStorage.setItem('adminPhone', phone);
      
      const redirectTo = (location as any).state?.from?.pathname || '/admin';
      navigate(redirectTo, { replace: true });
    } catch (err: any) {
      console.error('[AdminLogin] Login error:', err);
      setError(err?.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-gray-800 mb-1">Admin Login</h1>
        <p className="text-sm text-gray-500 mb-6">Sign in to access the dashboard</p>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="Enter 10-digit number"
              maxLength={10}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <div className="text-sm text-red-600">{error}</div>}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLogin;


