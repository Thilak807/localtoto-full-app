import React, { useEffect, useState } from 'react'
import adminApi from '../../services/adminApi'

type AppItem = {
  id: number
  full_name: string
  phone: string
  email?: string
  address?: string
  vehicle_type?: string
  vehicle_number?: string
  experience?: string
  dob?: string
  status: string
  created_at?: string
  pan_file_url?: string
  aadhaar_file_url?: string
}

const DriversRequests: React.FC = () => {
  const [items, setItems] = useState<AppItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      const res = await adminApi.get('/admin/applications')
      setItems(res.data?.applications || [])
    } catch (e:any) {
      setError(e?.response?.data?.message || 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const approve = async (id:number) => {
    try { await adminApi.post(`/admin/applications/${id}/approve`); await load() } catch (e:any) { alert(e?.response?.data?.message || 'Failed to approve') }
  }
  const reject = async (id:number) => {
    try { await adminApi.post(`/admin/applications/${id}/reject`); await load() } catch (e:any) { alert(e?.response?.data?.message || 'Failed to reject') }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-semibold text-gray-800">Driver Requests</h1>
        <button onClick={load} className="px-3 py-2 text-sm border rounded-md">Refresh</button>
      </div>
      {error && <div className="text-sm text-red-600 mb-2">{error}</div>}
      {loading ? (
        <div className="text-gray-600">Loading…</div>
      ) : (
        <div className="space-y-4">
              {items.map(a => (
            <div key={a.id} className="bg-white rounded-xl border p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <div className="text-sm text-gray-600 mb-1">Name</div>
                  <div className="font-semibold">{a.full_name}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Phone</div>
                  <div>{a.phone}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Email</div>
                  <div>{a.email || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Vehicle Type</div>
                  <div className="capitalize">{a.vehicle_type || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Vehicle Number</div>
                  <div>{a.vehicle_number || '-'}</div>
                </div>
                <div>
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="capitalize">{a.status}</div>
                </div>
                {a.address && (
                  <div className="md:col-span-3">
                    <div className="text-sm text-gray-600 mb-1">Address</div>
                    <div>{a.address}</div>
                  </div>
                )}
              </div>
              
              {/* Documents Section */}
              <div className="mb-4">
                <div className="text-sm font-semibold text-gray-700 mb-3">Documents</div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {a.pan_file_url ? (
                    <div>
                      <div className="text-xs text-gray-600 mb-2">PAN Card</div>
                      <a 
                        href={a.pan_file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={a.pan_file_url} 
                          alt="PAN Card" 
                          className="max-w-full h-48 object-contain border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-green-500 transition-colors"
                        />
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-600 mb-2">PAN Card</div>
                      <div className="h-48 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm">No PAN Card uploaded</div>
                    </div>
                  )}
                  
                  {a.aadhaar_file_url ? (
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Aadhaar Card</div>
                      <a 
                        href={a.aadhaar_file_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="block"
                      >
                        <img 
                          src={a.aadhaar_file_url} 
                          alt="Aadhaar Card" 
                          className="max-w-full h-48 object-contain border border-gray-200 rounded-lg bg-gray-50 cursor-pointer hover:border-green-500 transition-colors"
                        />
                      </a>
                    </div>
                  ) : (
                    <div>
                      <div className="text-xs text-gray-600 mb-2">Aadhaar Card</div>
                      <div className="h-48 border border-gray-200 rounded-lg bg-gray-50 flex items-center justify-center text-gray-400 text-sm">No Aadhaar Card uploaded</div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t">
                <button 
                  onClick={()=>approve(a.id)} 
                  className="px-4 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Approve
                </button>
                <button 
                  onClick={()=>reject(a.id)} 
                  className="px-4 py-2 text-sm border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                >
                  Reject
                </button>
              </div>
            </div>
              ))}
              {items.length === 0 && (
            <div className="bg-white rounded-xl border p-8 text-center text-gray-500">
              No pending applications
            </div>
              )}
        </div>
      )}
    </div>
  )
}

export default DriversRequests


