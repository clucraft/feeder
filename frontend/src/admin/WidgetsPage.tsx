import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, ExternalLink, Code, Pencil, Trash2, Check } from 'lucide-react'
import { listWidgets, deleteWidget } from '../lib/api'
import type { WidgetConfig } from '../lib/api'

export default function WidgetsPage() {
  const [widgets, setWidgets] = useState<WidgetConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const load = () => {
    setLoading(true)
    listWidgets()
      .then(setWidgets)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this widget?')) return
    try {
      await deleteWidget(id)
      load()
    } catch (err) {
      console.error(err)
      alert('Failed to delete widget')
    }
  }

  const getEmbedCode = (id: string) => {
    const url = `${window.location.origin}/widget/${id}`
    return `<iframe src="${url}" style="width:100%;border:none;min-height:400px;" loading="lazy"></iframe>`
  }

  const copyEmbed = (id: string) => {
    navigator.clipboard.writeText(getEmbedCode(id))
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const layoutLabels: Record<string, string> = {
    carousel: 'Carousel',
    grid: 'Grid',
    list: 'List',
    masonry: 'Masonry',
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Widgets</h1>
        <Link
          to="/admin/widgets/new"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Plus size={16} />
          Create Widget
        </Link>
      </div>

      {loading ? (
        <div className="text-center py-12 text-gray-500">Loading...</div>
      ) : widgets.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          No widgets yet. Create one to get started.
        </div>
      ) : (
        <div className="grid gap-4">
          {widgets.map((widget) => (
            <div
              key={widget.id}
              className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{widget.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Layout: <span className="font-medium">{layoutLabels[widget.layout] || widget.layout}</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={`/widget/${widget.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    title="Preview"
                  >
                    <ExternalLink size={14} />
                    Preview
                  </a>
                  <button
                    onClick={() => copyEmbed(widget.id)}
                    className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
                    title="Copy embed code"
                  >
                    {copiedId === widget.id ? (
                      <><Check size={14} className="text-green-600" /> Copied</>
                    ) : (
                      <><Code size={14} /> Embed</>
                    )}
                  </button>
                  <Link
                    to={`/admin/widgets/${widget.id}`}
                    className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 hover:bg-blue-50 transition-colors"
                  >
                    <Pencil size={14} />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(widget.id)}
                    className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              {/* Embed code snippet */}
              <div className="mt-3 bg-gray-50 rounded-lg p-3">
                <code className="text-xs text-gray-600 break-all">{getEmbedCode(widget.id)}</code>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
