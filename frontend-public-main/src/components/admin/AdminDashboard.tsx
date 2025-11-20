import React, { useEffect, useState } from 'react';
import adminApi from '../../services/adminApi';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await adminApi.get('/admin/stats');
      setStats(res.data?.stats || null);
    } catch (e: any) {
      setError(e?.response?.data?.message || 'Failed to load stats');
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-gray-800">Dashboard</h1>
      {error && <div className="text-sm text-red-600">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Total Rides</div>
          <div className="text-2xl font-bold">{stats?.rides?.total ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Ongoing Rides</div>
            <button onClick={load} title="Refresh" className="text-gray-500 hover:text-gray-700">↻</button>
          </div>
          <div className="text-2xl font-bold">{stats?.rides?.ongoing ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Confirmed Rides</div>
          <div className="text-2xl font-bold">{stats?.rides?.completed ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Cancelled Rides</div>
          <div className="text-2xl font-bold">{stats?.rides?.cancelled ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Users</div>
          <div className="text-2xl font-bold">{stats?.users?.total ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Drivers</div>
          <div className="text-2xl font-bold">{stats?.riders?.total ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Transactions</div>
          <div className="text-2xl font-bold">₹{Number(stats?.transactions ?? 0).toFixed(0)}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-500">Online Drivers</div>
            <button onClick={load} title="Refresh" className="text-gray-500 hover:text-gray-700">↻</button>
          </div>
          <div className="text-2xl font-bold">{stats?.onlineDrivers ?? '-'}</div>
        </div>
        <div className="p-4 bg-white rounded-lg border border-gray-200">
          <div className="text-sm text-gray-500">Requests</div>
          <div className="text-2xl font-bold">{stats?.requests ?? '-'}</div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;



