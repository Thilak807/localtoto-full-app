import React, { useMemo, useState } from 'react';
import DataTable, { TableColumn } from './DataTable';
import { useEffect } from 'react';
import adminApi from '../../services/adminApi';

type Driver = {
  id: string;
  code?: string;
  name: string;
  phone: string;
  vehicleNumber?: string;
  rating?: number;
  status: 'active' | 'offline' | 'banned';
  joinedAt?: string;
};

const initialDrivers: Driver[] = [];

const AdminDrivers: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Driver, 'id' | 'joinedAt'>>({
    name: '',
    phone: '',
    vehicleNumber: '',
    rating: 4.5,
    status: 'offline',
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/admin/riders');
        const list = (res.data?.riders || []).map((r: any) => ({
          id: String(r.id),
          code: r.code,
          name: r.name || r.phone,
          phone: r.phone,
          vehicleNumber: r.vehicle_number,
          status: r.is_active ? 'active' : 'offline',
          joinedAt: r.join_date || ''
        }));
        setDrivers(list);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load riders');
      }
    })();
  }, []);

  const columns: TableColumn<Driver>[] = useMemo(() => [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'phone', header: 'Phone' },
    { key: 'vehicleNumber', header: 'Vehicle' },
    { key: 'rating', header: 'Rating', sortable: true },
    { key: 'status', header: 'Status', sortable: true, render: (r) => (
      <span className={`px-2 py-1 rounded-md text-xs ${r.status === 'active' ? 'bg-green-100 text-green-700' : r.status === 'offline' ? 'bg-gray-100 text-gray-700' : 'bg-red-100 text-red-700'}`}>{r.status}</span>
    ) },
    { key: 'joinedAt', header: 'Joined', sortable: true },
  ], []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', phone: '', vehicleNumber: '', rating: 4.5, status: 'offline' });
    setIsFormOpen(true);
  };

  const openEdit = (driver: Driver) => {
    setEditingId(driver.id);
    setForm({ name: driver.name, phone: driver.phone, vehicleNumber: driver.vehicleNumber || '', rating: driver.rating || 4.5, status: driver.status });
    setIsFormOpen(true);
  };

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [driverToRemove, setDriverToRemove] = useState<Driver | null>(null);

  const askRemove = (driver: Driver) => {
    setDriverToRemove(driver);
    setConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!driverToRemove) return;
    try {
      await adminApi.post(`/admin/riders/${driverToRemove.id}/remove`);
      setDrivers((prev) => prev.filter((d) => d.id !== driverToRemove.id));
      setConfirmOpen(false);
      setDriverToRemove(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to remove driver');
    }
  };

  const cancelRemove = () => {
    setConfirmOpen(false);
    setDriverToRemove(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (editingId == null) {
        // Create new driver
        const response = await adminApi.post('/admin/riders/create', {
          name: form.name,
          phone: form.phone,
          vehicleNumber: form.vehicleNumber,
          vehicleType: 'auto',
          status: form.status
        });
        if (response.data?.success) {
          // Reload drivers list
          const res = await adminApi.get('/admin/riders');
          const list = (res.data?.riders || []).map((r: any) => ({
            id: String(r.id),
            code: r.code,
            name: r.name || r.phone,
            phone: r.phone,
            vehicleNumber: r.vehicle_number,
            status: r.is_active ? 'active' : 'offline',
            joinedAt: r.join_date || ''
          }));
          setDrivers(list);
          setIsFormOpen(false);
        }
      } else {
        // Update existing driver
        const response = await adminApi.put(`/admin/riders/${editingId}/update`, {
          name: form.name,
          phone: form.phone,
          vehicleNumber: form.vehicleNumber,
          vehicleType: 'auto',
          status: form.status
        });
        if (response.data?.success) {
          // Reload drivers list
          const res = await adminApi.get('/admin/riders');
          const list = (res.data?.riders || []).map((r: any) => ({
            id: String(r.id),
            code: r.code,
            name: r.name || r.phone,
            phone: r.phone,
            vehicleNumber: r.vehicle_number,
            status: r.is_active ? 'active' : 'offline',
            joinedAt: r.join_date || ''
          }));
          setDrivers(list);
          setIsFormOpen(false);
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save driver');
      console.error('Error saving driver:', err);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Drivers</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add Driver</button>
      </div>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      <div className="mb-4">
        <div className="text-sm text-gray-700">Verify rider by ID</div>
        <form className="flex gap-2 mt-2" onSubmit={async (e) => {
          e.preventDefault();
          const formEl = e.target as HTMLFormElement;
          const input = formEl.querySelector('input[name="rid"]') as HTMLInputElement | null;
          const id = input?.value?.trim();
          if (!id) {
            alert('Please enter a rider ID');
            return;
          }
          try {
            console.log('[AdminDrivers] Verifying rider:', id);
            const response = await adminApi.post(`/admin/riders/${id}/verify`);
            console.log('[AdminDrivers] Verification response:', response.data);
            alert('Rider verified successfully');
            // Clear the input
            if (input) input.value = '';
            // Refresh the riders list
            window.location.reload();
          } catch (err: any) {
            console.error('[AdminDrivers] Verification error:', err);
            const errorMessage = err?.response?.data?.message || err?.message || 'Failed to verify rider';
            alert(`Error: ${errorMessage}`);
          }
        }}>
          <input name="rid" placeholder="Rider ID" className="w-64 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500" />
          <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Search</button>
        </form>
      </div>

      <DataTable
        data={drivers}
        columns={columns}
        pageSize={8}
        searchableKeys={[ 'name', 'phone', 'vehicleNumber', 'status' ]}
        onRowClick={(row) => { window.location.href = `/admin/drivers/${(row as any).id}`; }}
        actionsRender={(row) => (
          <div className="space-x-2">
            <button onClick={(e)=>{ e.stopPropagation(); openEdit(row); }} className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">Edit</button>
            <button onClick={(e)=>{ e.stopPropagation(); askRemove(row); }} className="px-2 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50">Remove</button>
          </div>
        )}
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editingId == null ? 'Add Driver' : 'Edit Driver'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle</label>
                  <input
                    value={form.vehicleNumber}
                    onChange={(e) => setForm((f) => ({ ...f, vehicleNumber: e.target.value }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Rating</label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    step={0.1}
                    value={form.rating}
                    onChange={(e) => setForm((f) => ({ ...f, rating: Number(e.target.value) }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Driver['status'] }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">active</option>
                    <option value="offline">offline</option>
                    <option value="banned">banned</option>
                  </select>
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
              <h3 className="text-lg font-semibold text-gray-800">Remove Driver</h3>
            </div>
            <div className="px-6 py-5 space-y-2">
              <p className="text-gray-700">You are about to remove the following driver:</p>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                <div><span className="font-medium">Name:</span> {driverToRemove?.name}</div>
                <div><span className="font-medium">Phone:</span> {driverToRemove?.phone}</div>
                {driverToRemove?.code && (
                  <div><span className="font-medium">Code:</span> {driverToRemove.code}</div>
                )}
                {driverToRemove?.vehicleNumber && (
                  <div><span className="font-medium">Vehicle:</span> {driverToRemove.vehicleNumber}</div>
                )}
              </div>
              <p className="text-sm text-gray-600">This action is permanent and cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={cancelRemove} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmRemove} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Remove Driver</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDrivers;

