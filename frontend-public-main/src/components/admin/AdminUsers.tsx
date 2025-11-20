import React, { useEffect, useMemo, useState } from 'react';
import DataTable, { TableColumn } from './DataTable';
import adminApi from '../../services/adminApi';

type AdminUser = {
  id: string;
  code?: string;
  name: string;
  phone?: string;
  role: 'user' | 'admin';
  status?: 'active' | 'blocked';
  joinedAt?: string;
};

const initialUsers: AdminUser[] = [];

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>(initialUsers);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [userToRemove, setUserToRemove] = useState<AdminUser | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await adminApi.get('/admin/users');
        const u = (res.data?.users || []).map((x: any) => ({
          id: String(x.id),
          code: x.code,
          name: `${x.first_name ?? ''} ${x.last_name ?? ''}`.trim() || x.phone,
          phone: x.phone,
          role: 'user',
          status: 'active',
          joinedAt: x.joined_at
        }));
        setUsers(u);
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load users');
      }
    })();
  }, []);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<Omit<AdminUser, 'id' | 'createdAt'>>({
    name: '',
    email: '',
    role: 'user',
    status: 'active',
  });

  const columns: TableColumn<AdminUser>[] = useMemo(() => [
    { key: 'id', header: 'ID', sortable: true },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'phone', header: 'Phone', sortable: true },
    { key: 'role', header: 'Role', sortable: true, render: (r) => (
      <span className={`px-2 py-1 rounded-md text-xs ${r.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>{r.role}</span>
    ) },
    { key: 'joinedAt', header: 'Joined', sortable: true },
  ], []);

  const openCreate = () => {
    setEditingId(null);
    setForm({ name: '', email: '', role: 'user', status: 'active' });
    setIsFormOpen(true);
  };

  const openEdit = (user: AdminUser) => {
    setEditingId(user.id);
    setForm({ name: user.name, email: user.email, role: user.role, status: user.status });
    setIsFormOpen(true);
  };

  const askRemove = (user: AdminUser) => {
    setUserToRemove(user);
    setConfirmOpen(true);
  };

  const confirmRemove = async () => {
    if (!userToRemove) return;
    try {
      await adminApi.post(`/admin/users/${userToRemove.id}/remove`);
      setUsers((prev) => prev.filter((u) => u.id !== userToRemove.id));
      setConfirmOpen(false);
      setUserToRemove(null);
    } catch (e: any) {
      alert(e?.response?.data?.message || 'Failed to remove user');
    }
  };

  const cancelRemove = () => {
    setConfirmOpen(false);
    setUserToRemove(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId == null) {
      const nextId = users.length ? Math.max(...users.map((u) => u.id)) + 1 : 1;
      setUsers((prev) => [
        { id: nextId, createdAt: new Date().toISOString().slice(0, 10), ...form },
        ...prev,
      ]);
    } else {
      setUsers((prev) => prev.map((u) => (u.id === editingId ? { ...u, ...form } : u)));
    }
    setIsFormOpen(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Users</h1>
        <button onClick={openCreate} className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">Add User</button>
      </div>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}

      <DataTable
        data={users}
        columns={columns}
        pageSize={8}
        searchableKeys={[ 'name', 'phone', 'role', 'status' ]}
        onRowClick={(row)=>{ window.location.href = `/admin/users/${(row as any).id}`; }}
        actionsRender={(row) => (
          <div className="space-x-2">
            <button onClick={(e)=>{ e.stopPropagation(); openEdit(row); }} className="px-2 py-1 text-sm border border-gray-300 rounded-md hover:bg-gray-100">Edit</button>
            <button onClick={(e)=>{ e.stopPropagation(); askRemove(row); }} className="px-2 py-1 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50">Delete</button>
          </div>
        )}
      />

      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-md bg-white rounded-xl border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">{editingId == null ? 'Add User' : 'Edit User'}</h2>
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as AdminUser['role'] }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="user">user</option>
                    <option value="admin">admin</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as AdminUser['status'] }))}
                    className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                  >
                    <option value="active">active</option>
                    <option value="blocked">blocked</option>
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
              <h3 className="text-lg font-semibold text-gray-800">Remove User</h3>
            </div>
            <div className="px-6 py-5 space-y-2">
              <p className="text-gray-700">You are about to remove the following user:</p>
              <div className="rounded-lg bg-gray-50 p-3 text-sm text-gray-800">
                <div><span className="font-medium">Name:</span> {userToRemove?.name}</div>
                {userToRemove?.phone && (
                  <div><span className="font-medium">Phone:</span> {userToRemove.phone}</div>
                )}
                {userToRemove?.code && (
                  <div><span className="font-medium">Code:</span> {userToRemove.code}</div>
                )}
                {userToRemove?.joinedAt && (
                  <div><span className="font-medium">Joined:</span> {userToRemove.joinedAt}</div>
                )}
              </div>
              <p className="text-sm text-gray-600">This action is permanent and cannot be undone.</p>
            </div>
            <div className="px-6 py-4 border-t flex justify-end gap-2">
              <button onClick={cancelRemove} className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">Cancel</button>
              <button onClick={confirmRemove} className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">Remove User</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

