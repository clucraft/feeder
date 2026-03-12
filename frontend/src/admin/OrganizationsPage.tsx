import { useEffect, useState } from 'react'
import { Plus, RefreshCw, Trash2, X, Link as LinkIcon } from 'lucide-react'
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
  const [tempTokenId, setTempTokenId] = useState<string | null>(null)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    linkedin_organization_id: '',
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

  useEffect(() => {
    // Check URL params for OAuth callback
    const params = new URLSearchParams(window.location.search)
    const auth = params.get('auth')
    const token = params.get('token')
    const message = params.get('message')

    if (auth === 'success' && token) {
      setTempTokenId(token)
      setShowForm(true)
      setAuthMessage('LinkedIn connected! Enter the organization details below.')
      // Clean up URL
      window.history.replaceState({}, '', window.location.pathname)
    } else if (auth === 'error') {
      setAuthMessage(`LinkedIn connection failed: ${message || 'Unknown error'}`)
      window.history.replaceState({}, '', window.location.pathname)
    }

    load()
  }, [])

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await createOrganization({
        ...formData,
        temp_token_id: tempTokenId || undefined,
      })
      setFormData({ name: '', linkedin_organization_id: '' })
      setShowForm(false)
      setTempTokenId(null)
      setAuthMessage(null)
      load()
    } catch (err) {
      console.error(err)
      alert('Failed to create organization')
    } finally {
      setSubmitting(false)
    }
  }

  const handleConnectLinkedIn = () => {
    window.location.href = '/api/auth/linkedin'
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
          onClick={handleConnectLinkedIn}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <LinkIcon size={16} />
          Connect LinkedIn
        </button>
      </div>

      {/* Auth status message */}
      {authMessage && (
        <div
          className={`mb-4 px-4 py-3 rounded-lg text-sm ${
            tempTokenId
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {authMessage}
          {!tempTokenId && (
            <button
              onClick={() => setAuthMessage(null)}
              className="ml-2 text-gray-500 hover:text-gray-700"
            >
              <X size={14} />
            </button>
          )}
        </div>
      )}

      {/* Add Organization Form */}
      {showForm && (
        <div className="bg-white border border-gray-200 rounded-xl p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">New Organization</h2>
            <button
              onClick={() => {
                setShowForm(false)
                setTempTokenId(null)
                setAuthMessage(null)
              }}
              className="text-gray-400 hover:text-gray-600"
            >
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
            {tempTokenId && (
              <p className="text-sm text-green-600">
                LinkedIn access token acquired via OAuth. It will be associated with this organization.
              </p>
            )}
            {!tempTokenId && (
              <p className="text-sm text-amber-600">
                No LinkedIn token available. Please click &quot;Connect LinkedIn&quot; first to authenticate.
              </p>
            )}
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !tempTokenId}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {submitting ? 'Creating...' : 'Create'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setTempTokenId(null)
                  setAuthMessage(null)
                }}
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
          No organizations yet. Connect LinkedIn to get started.
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
