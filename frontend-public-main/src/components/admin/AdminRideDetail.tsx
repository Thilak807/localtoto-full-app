import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import adminApi from '../../services/adminApi'

const AdminRideDetail: React.FC = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const [ride, setRide] = React.useState<any>(null)

  React.useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        const res = await adminApi.get(`/admin/rides/${id}`)
        setRide(res.data?.ride)
      } catch (e: any) {
        setError(e?.response?.data?.message || 'Failed to load ride')
      } finally {
        setLoading(false)
      }
    }
    if (id) load()
  }, [id])

  if (loading) return <div>Loading…</div>
  if (error) return <div className="text-red-600">{error}</div>
  if (!ride) return <div>Not found</div>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold text-gray-800">Ride Details</h1>
        <button onClick={() => navigate(-1)} className="px-3 py-2 text-sm border rounded-lg">Back</button>
      </div>
      <div className="bg-white rounded-xl border p-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
        <div><span className="text-gray-500">Ride ID:</span> <span className="font-medium">{ride.code || ride.id}</span></div>
        <div><span className="text-gray-500">Date:</span> <span className="font-medium">{ride.date || '—'}</span></div>
        <div><span className="text-gray-500">User:</span> <span className="font-medium">{ride.user}{ride.user_id ? ` (u${String(ride.user_id).padStart(4,'0')})` : ''}</span></div>
        <div><span className="text-gray-500">Driver:</span> <span className="font-medium">{ride.driver}{ride.driver_id ? ` (d${String(ride.driver_id).padStart(4,'0')})` : ''}</span></div>
        <div className="sm:col-span-2"><span className="text-gray-500">From:</span> <span className="font-medium">{ride.pickup}</span></div>
        <div className="sm:col-span-2"><span className="text-gray-500">To:</span> <span className="font-medium">{ride.dropoff}</span></div>
        <div><span className="text-gray-500">Fare:</span> <span className="font-medium">₹{Number(ride.fare || 0).toFixed(0)}</span></div>
        <div><span className="text-gray-500">Status:</span> <span className="font-medium">{ride.status}</span></div>
      </div>
    </div>
  )
}

export default AdminRideDetail


