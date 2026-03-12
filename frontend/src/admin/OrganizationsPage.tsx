import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Trash2, X } from 'lucide-react'
import {
  listOrganizations,
  createOrganization,
  refreshPosts,
  deleteOrganization,
} from '../lib/api'
import type { Organization } from '../lib/api'

export default function OrganizationsPage() {
  const [orgs, setOrgs] = useState<Organization[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    linkedin_organization_id: '',
    access_token: '',
  })
  const [submitting, setSubmitting] = useState(false)
  const [refreshingId, setRefreshingId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    listOrganizations()
      .then(setOrgs)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createOrganization(formData)
      setFormData({ name: '', linkedin_organization_id: '', access_token: '' })
      setShowForm(false)
      load()
    } catch (err) {
      console.error(err)
      alert('Failed to create organization')
    } finally {
      setSubmitting(false)
    }
  }

  const handleRefresh = async (orgId: string) => {
    setRefreshingId(orgId)
    try {
      await refreshPosts(orgId)
      load()
    } catch (err) {
      console.error(err)
      alert('Failed to refresh posts')
    } finally {
      setRefreshingId(null)
    }
  }

  const handleDelete = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization?')) return
    try {
      await deleteOrganization(orgId)
      load()
    } catch (err) {
      console.error(err)
      alert('Failed to delete organization')
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Organizations</h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Add Organization
        </button>
      </div>

      {/* Add Organization Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New Organization</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600">
              <X size={20} />
            </button>
          </div>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Organization ID</label>
              <input
                type="text"
                required
                value={formData.linkedin_organization_id}
                onChange={(e) => setFormData({ ...formData, linkedin_organization_id: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="e.g. 12345678"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Access Token</label>
              <input
                type="password"
                required
                value={formData.access_token}
                onChange={(e) => setFormData({ ...formData, access_token: e.target.value })}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="LinkedIn API access token"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Organizations List */}
      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : orgs.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No organizations yet. Add one to get started.
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">LinkedIn ID</th>
                <th className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Posts</th>
                <th className="text-right text-xs font-medium text-gray-500 uppercase tracking-wider px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orgs.map((org) => (
                <tr key={org.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{org.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-500 font-mono">{org.linkedin_organization_id}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{org.post_count ?? '-'}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleRefresh(org.id)}
                        disabled={refreshingId === org.id}
                        className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 disabled:opacity-50"
                        title="Refresh Posts"
                      >
                        <RefreshCw size={14} className={refreshingId === org.id ? 'animate-spin' : ''} />
                        Refresh
                      </button>
                      <button
                        onClick={() => handleDelete(org.id)}
                        className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                        title="Delete"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
