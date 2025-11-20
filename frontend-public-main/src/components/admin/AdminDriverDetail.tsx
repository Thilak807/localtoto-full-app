import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminApi from '../../services/adminApi'

const AdminDriverDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [driver, setDriver] = React.useState<any>(null)
  const [rides, setRides] = React.useState<any[]>([])

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await adminApi.get(`/admin/riders/${id}`)
        setDriver(res.data?.rider)
        setRides(res.data?.rides || [])
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load driver')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) return <div>Loading…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!driver) return <div>Not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Driver Details</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm border rounded-lg">Back</button>
      </div>

      <div className="bg-white rounded-xl border p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div><span className="text-gray-500">ID:</span> <span className="font-medium">{driver.id}</span></div>
          {driver.code && (<div><span className="text-gray-500">Code:</span> <span className="font-medium">{driver.code}</span></div>)}
          <div><span className="text-gray-500">Name:</span> <span className="font-medium">{driver.name}</span></div>
          <div><span className="text-gray-500">Phone:</span> <span className="font-medium">{driver.phone}</span></div>
          <div><span className="text-gray-500">Vehicle Type:</span> <span className="font-medium">{driver.vehicle_type || '—'}</span></div>
          <div><span className="text-gray-500">Vehicle Number:</span> <span className="font-medium">{driver.vehicle_number || '—'}</span></div>
          <div><span className="text-gray-500">Verified:</span> <span className="font-medium">{driver.is_verified ? 'Yes' : 'No'}</span></div>
          <div><span className="text-gray-500">Active:</span> <span className="font-medium">{driver.is_active ? 'Yes' : 'No'}</span></div>
          <div><span className="text-gray-500">Halted:</span> <span className="font-medium">{driver.halted ? 'Yes' : 'No'}</span></div>
          <div><span className="text-gray-500">Join Date:</span> <span className="font-medium">{driver.join_date || '—'}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-xl border">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-800">Recent Rides</h2>
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

export default AdminDriverDetail




