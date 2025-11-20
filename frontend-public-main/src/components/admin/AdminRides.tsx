import React, { useEffect, useMemo, useState } from 'react';
import DataTable, { TableColumn } from './DataTable';
import adminApi from '../../services/adminApi';

type Ride = {
  id: string;
  code?: string;
  userName: string;
  userId?: string;
  driverName: string;
  driverId?: string;
  origin: string;
  destination: string;
  fare: number;
  status: 'confirmed' | 'expired' | 'cancelled' | 'pending' | 'completed' | string;
  date: string;
};

const initialRides: Ride[] = [];

const AdminRides: React.FC = () => {
  const [rides, setRides] = useState<Ride[]>(initialRides);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [rideToRemove, setRideToRemove] = useState<Ride | null>(null);

  useEffect(() => {
    (async () => {
      try {
        console.log('[AdminRides] Starting to fetch rides...');
        const res = await adminApi.get('/admin/rides');
        console.log('[AdminRides] ✅ API Response received:', res);
        console.log('[AdminRides] ✅ Response data:', res.data);
        console.log('[AdminRides] ✅ Response status:', res.status);
        console.log('[AdminRides] ✅ Rides array:', res.data?.rides);
        console.log('[AdminRides] ✅ Rides count:', res.data?.rides?.length || 0);
        console.log('[AdminRides] ✅ Total:', res.data?.total);
        
        if (!res.data || !res.data.rides) {
          console.error('[AdminRides] ❌ No rides array in response!', res.data);
          setError('Invalid response format from server');
          return;
        }
        
        const list = (res.data.rides || []).map((r: any) => {
          console.log('[AdminRides] Mapping ride:', r);
          return {
          id: String(r.id),
          code: r.code,
          userName: r.user || '—',
          userId: r.user_id ? String(r.user_id) : undefined,
          driverName: r.driver || '—',
          driverId: r.driver_id ? String(r.driver_id) : undefined,
          origin: r.pickup || '',
          destination: r.dropoff || '',
          fare: Number(r.fare || 0),
          status: (r.status as any),
          date: r.date || ''
          };
        });
        console.log('[AdminRides] ✅ Mapped list:', list);
        console.log('[AdminRides] ✅ Mapped list count:', list.length);
        setRides(list);
        if (list.length === 0) {
          console.warn('[AdminRides] ⚠️ Warning: No rides found in response');
        }
      } catch (e: any) {
        console.error('[AdminRides] ❌ Error loading rides:', e);
        console.error('[AdminRides] ❌ Error details:', {
          message: e?.message,
          response: e?.response,
          status: e?.response?.status,
          data: e?.response?.data
        });
        setError(e?.response?.data?.message || e?.message || 'Failed to load rides');
      }
    })();
  }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<Ride, 'id'>>({
    userName: '',
    driverName: '',
    origin: '',
    destination: '',
    fare: 0,
    status: 'scheduled',
    date: new Date().toISOString().slice(0, 10),
  });

  const truncate = (value: string, max: number = 8) => {
    if (!value) return '';
    return value.length > max ? value.slice(0, max) + '...' : value;
  };

  const columns: TableColumn<Ride>[] = useMemo(() => [
    { key: 'code', header: 'Ride ID', sortable: true },
    { key: 'userId', header: 'User', sortable: true, render: (r) => (
      <span>{r.userId ? `u${String(r.userId).padStart(4,'0')}` : '—'}</span>
    ) },
    { key: 'driverId', header: 'Driver', sortable: true, render: (r) => (
      <span>{r.driverId ? `d${String(r.driverId).padStart(4,'0')}` : '—'}</span>
    ) },
    { key: 'origin', header: 'From', render: (r) => truncate(r.origin) },
    { key: 'destination', header: 'To', render: (r) => truncate(r.destination) },
    { key: 'fare', header: 'Fare', sortable: true, render: (r) => `₹${r.fare.toFixed(0)}` },
    { key: 'status', header: 'Status', sortable: true, render: (r) => (
      <span className={`px-2 py-1 rounded-md text-xs ${
        r.status === 'confirmed' ? 'bg-green-100 text-green-700' :
        r.status === 'expired' ? 'bg-gray-100 text-gray-700' :
        'bg-red-100 text-red-700'
      }`}>{r.status}</span>
    ) },
    { key: 'date', header: 'Date', sortable: true },
  ], []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ userName: '', driverName: '', origin: '', destination: '', fare: 0, status: 'scheduled', date: new Date().toISOString().slice(0, 10) });
    setIsFormOpen(true);
  };

  const openEdit = (ride: Ride) => {
    setEditingId(ride.id);
    setForm({ userName: ride.userName, driverName: ride.driverName, origin: ride.origin, destination: ride.destination, fare: ride.fare, status: ride.status, date: ride.date });
    setIsFormOpen(true);
  };

  const askRemove = (ride: Ride) => {
    setRideToRemove(ride);
    setConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!rideToRemove) return;
    try {
      await adminApi.post(`/admin/rides/${rideToRemove.id}/remove`);
      setRides((prev) => prev.filter((r) => r.id !== rideToRemove.id));
      setConfirmOpen(false);
      setRideToRemove(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to remove ride');
    }
  };

  const cancelRemove = () => {
    setConfirmOpen(false);
    setRideToRemove(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) {
      const nextId = rides.length ? Math.max(...rides.map((r) => r.id)) + 1 : 1;
      setRides((prev) => [
        { id: nextId, ...form },
        ...prev,
      ]);
    } else {
      setRides((prev) => prev.map((r) => (r.id === editingId ? { ...r, ...form } : r)));
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Rides</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Ride</button>
      </div>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      <DataTable
        data={rides}
        columns={columns}
        pageSize={8}
        searchableKeys={[ 'userName', 'driverName', 'origin', 'destination', 'status' ]}
        onRowClick={(row)=>{ window.location.href = `/admin/rides/${(row as any).id}`; }}
        actionsRender={(row) => (
          <div className="space-x-2">
            <button onClick={(e)=>{ e.stopPropagation(); openEdit(row); }} className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">Edit</button>
            <button onClick={(e)=>{ e.stopPropagation(); askRemove(row); }} className="px-2 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50">Delete</button>
          </div>
        )}
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-2xl bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editingId == null ? 'Add Ride' : 'Edit Ride'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">User</label>
                  <input
                    value={form.userName}
                    onChange={(e) => setForm((f) => ({ ...f, userName: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Driver</label>
                  <input
                    value={form.driverName}
                    onChange={(e) => setForm((f) => ({ ...f, driverName: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">From</label>
                  <input
                    value={form.origin}
                    onChange={(e) => setForm((f) => ({ ...f, origin: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">To</label>
                  <input
                    value={form.destination}
                    onChange={(e) => setForm((f) => ({ ...f, destination: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fare (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={form.fare}
                    onChange={(e) => setForm((f) => ({ ...f, fare: Number(e.target.value) }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Ride['status'] }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="scheduled">scheduled</option>
                    <option value="ongoing">ongoing</option>
                    <option value="completed">completed</option>
                    <option value="cancelled">cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setIsFormOpen(false)} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-gray-200">
            <div className="px-6 py-5 border-b">
              <h3 className="text-lg font-semibold text-gray-800">Remove Ride</h3>
            </div>
            <div className="px-6 py-5 space-y-2">
              <p className="text-gray-700">You are about to remove the following ride:</p>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                <div><span className="font-medium">Ride ID:</span> {rideToRemove?.code || rideToRemove?.id}</div>
                <div><span className="font-medium">User:</span> {rideToRemove?.userId ? `u${String(rideToRemove.userId).padStart(4,'0')}` : '—'}</div>
                <div><span className="font-medium">Driver:</span> {rideToRemove?.driverId ? `d${String(rideToRemove.driverId).padStart(4,'0')}` : '—'}</div>
                <div><span className="font-medium">From:</span> {truncate(rideToRemove?.origin || '')}</div>
                <div><span className="font-medium">To:</span> {truncate(rideToRemove?.destination || '')}</div>
              </div>
              <p className="text-sm text-gray-600">This action is permanent and cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={cancelRemove} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmRemove} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Remove Ride</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRides;

