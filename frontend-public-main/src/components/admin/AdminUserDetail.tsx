import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import adminApi from '../../services/adminApi'

const AdminUserDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [user, setUser] = React.useState<any>(null)
  const [rides, setRides] = React.useState<any[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await adminApi.get(`/admin/users/${id}`)
        setUser(res.data?.user)
        setRides(res.data?.rides || [])
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load user')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) return <div>Loading…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!user) return <div>Not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">User Details</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm border rounded-lg">Back</button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">ID:</span> <span className="font-medium">{user.id}</span></div>
          {user.code && (<div><span className="text-gray-500">Code:</span> <span className="font-medium">{user.code}</span></div>)}
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{user.first_name} {user.last_name}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{user.phone}</span></div>
          {user.email && (<div><span className="text-gray-500">Email:</span> <span className="font-medium">{user.email}</span></div>)}
          <div><span className="text-gray-500">Joined:</span> <span className="font-medium">{user.joined_at || '—'}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Ride History</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="text-left p-3">ID</th>
                <th className="text-left p-3">Pickup</th>
                <th className="text-left p-3">Dropoff</th>
                <th className="text-left p-3">Fare</th>
                <th className="text-left p-3">Status</th>
                <th className="text-left p-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {rides.map((r) => (
                <tr key={r.id} className="border-t">
                  <td className="p-3">{r.id}</td>
                  <td className="p-3">{r.pickup}</td>
                  <td className="p-3">{r.dropoff}</td>
                  <td className="p-3">₹{(r.fare ?? 0).toFixed ? r.fare.toFixed(0) : r.fare}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3">{r.created_at || r.createdAt || ''}</td>
                </tr>
              ))}
              {rides.length === 0 && (
                <tr><td className="p-4 text-gray-500" colSpan={6}>No rides found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default AdminUserDetail




