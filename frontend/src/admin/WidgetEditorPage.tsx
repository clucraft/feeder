import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  LayoutGrid,
  List,
  Columns3,
  GalleryHorizontal,
  Copy,
  Check,
  Save,
} from 'lucide-react'
import {
  listOrganizations,
  createWidget,
  updateWidget,
  fetchWidget,
  fetchWidgetPosts,
} from '../lib/api'
import type { Organization, Post } from '../lib/api'
import CarouselLayout from '../widget/layouts/CarouselLayout'
import GridLayout from '../widget/layouts/GridLayout'
import ListLayout from '../widget/layouts/ListLayout'
import MasonryLayout from '../widget/layouts/MasonryLayout'

const LAYOUTS = [
  { value: 'carousel', label: 'Carousel', icon: GalleryHorizontal },
  { value: 'grid', label: 'Grid', icon: LayoutGrid },
  { value: 'list', label: 'List', icon: List },
  { value: 'masonry', label: 'Masonry', icon: Columns3 },
] as const

type LayoutType = (typeof LAYOUTS)[number]['value']

interface WidgetFormData {
  name: string
  organization_id: string
  layout: LayoutType
  config: {
    autoRotate: boolean
    rotationSpeed: number
    postsVisible: number
    columns: number
    maxPosts: number
    shadow: boolean
    borderRadius: string
    theme: 'light' | 'dark'
    accentColor: string
  }
}

const defaultConfig: WidgetFormData['config'] = {
  autoRotate: true,
  rotationSpeed: 5,
  postsVisible: 3,
  columns: 3,
  maxPosts: 12,
  shadow: true,
  borderRadius: '0.75rem',
  theme: 'light',
  accentColor: '#2563eb',
}

export default function WidgetEditorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const isEditing = Boolean(id)

  const [orgs, setOrgs] = useState<Organization[]>([])
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState(false)
  const [previewPosts, setPreviewPosts] = useState<Post[]>([])

  const [form, setForm] = useState<WidgetFormData>({
    name: '',
    organization_id: '',
    layout: 'grid',
    config: { ...defaultConfig },
  })

  useEffect(() => {
    listOrganizations().then(setOrgs).catch(console.error)
  }, [])

  useEffect(() => {
    if (!id) return
    fetchWidget(id)
      .then(({ widget: w }) => {
        setForm({
          name: w.name,
          organization_id: w.organization_id,
          layout: w.layout,
          config: { ...defaultConfig, ...(w.config as any) },
        })
      })
      .catch(console.error)
  }, [id])

  useEffect(() => {
    if (!id) return
    fetchWidgetPosts(id).then(({ posts }) => setPreviewPosts(posts)).catch(console.error)
  }, [id])

  const updateForm = (updates: Partial<WidgetFormData>) => {
    setForm((f) => ({ ...f, ...updates }))
  }

  const updateConfig = (updates: Partial<WidgetFormData['config']>) => {
    setForm((f) => ({ ...f, config: { ...f.config, ...updates } }))
  }

  const handleSave = async () => {
    if (!form.name || !form.organization_id) {
      alert('Please fill in all required fields')
      return
    }
    setSaving(true)
    try {
      if (isEditing) {
        await updateWidget(id!, form)
      } else {
        await createWidget(form as any)
      }
      navigate('/admin/widgets')
    } catch (err) {
      console.error(err)
      alert('Failed to save widget')
    } finally {
      setSaving(false)
    }
  }

  const embedUrl = id ? `${window.location.origin}/widget/${id}` : ''
  const iframeCode = id
    ? `<iframe src="${embedUrl}" style="width:100%;border:none;min-height:400px;" loading="lazy"></iframe>`
    : ''
  const scriptCode = id
    ? `<script src="${window.location.origin}/embed.js" data-widget="${id}"></script>`
    : ''

  const [embedTab, setEmbedTab] = useState<'iframe' | 'script'>('script')

  const copyEmbed = () => {
    navigator.clipboard.writeText(embedTab === 'script' ? scriptCode : iframeCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const cardStyle = {
    shadow: form.config.shadow,
    borderRadius: form.config.borderRadius,
    theme: form.config.theme,
    accentColor: form.config.accentColor,
  }

  const limitedPosts = previewPosts.slice(0, form.config.maxPosts)

  const PreviewLayout = {
    carousel: CarouselLayout,
    grid: GridLayout,
    list: ListLayout,
    masonry: MasonryLayout,
  }[form.layout]

  return (
    <div className="max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        {isEditing ? 'Edit Widget' : 'Create Widget'}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Config panel */}
        <div className="lg:col-span-2 space-y-6">
          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Basic Info</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Widget Name</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => updateForm({ name: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g. Homepage Feed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Organization</label>
                <select
                  value={form.organization_id}
                  onChange={(e) => updateForm({ organization_id: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select organization...</option>
                  {orgs.map((org) => (
                    <option key={org.id} value={org.id}>{org.name}</option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Layout</h2>
            <div className="grid grid-cols-4 gap-3">
              {LAYOUTS.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => updateForm({ layout: value })}
                  className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-colors ${
                    form.layout === value
                      ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                      : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  <Icon size={24} />
                  <span className="text-xs font-medium">{label}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Configuration</h2>
            <div className="space-y-4">
              {form.layout === 'carousel' && (
                <>
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Auto-rotate</label>
                    <button
                      onClick={() => updateConfig({ autoRotate: !form.config.autoRotate })}
                      className={`relative w-11 h-6 rounded-full transition-colors ${
                        form.config.autoRotate ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          form.config.autoRotate ? 'translate-x-5' : ''
                        }`}
                      />
                    </button>
                  </div>
                  {form.config.autoRotate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Rotation Speed ({form.config.rotationSpeed}s)
                      </label>
                      <input
                        type="range"
                        min={2}
                        max={15}
                        value={form.config.rotationSpeed}
                        onChange={(e) => updateConfig({ rotationSpeed: Number(e.target.value) })}
                        className="w-full"
                      />
                    </div>
                  )}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Posts visible ({form.config.postsVisible})
                    </label>
                    <input
                      type="range"
                      min={1}
                      max={5}
                      value={form.config.postsVisible}
                      onChange={(e) => updateConfig({ postsVisible: Number(e.target.value) })}
                      className="w-full"
                    />
                  </div>
                </>
              )}

              {form.layout === 'grid' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Columns ({form.config.columns})
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={4}
                    value={form.config.columns}
                    onChange={(e) => updateConfig({ columns: Number(e.target.value) })}
                    className="w-full"
                  />
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Max Posts ({form.config.maxPosts})
                </label>
                <input
                  type="range"
                  min={1}
                  max={30}
                  value={form.config.maxPosts}
                  onChange={(e) => updateConfig({ maxPosts: Number(e.target.value) })}
                  className="w-full"
                />
              </div>

              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Card Shadow</label>
                <button
                  onClick={() => updateConfig({ shadow: !form.config.shadow })}
                  className={`relative w-11 h-6 rounded-full transition-colors ${
                    form.config.shadow ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <span
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      form.config.shadow ? 'translate-x-5' : ''
                    }`}
                  />
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Border Radius</label>
                <select
                  value={form.config.borderRadius}
                  onChange={(e) => updateConfig({ borderRadius: e.target.value })}
                  className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="0">None</option>
                  <option value="0.375rem">Small</option>
                  <option value="0.75rem">Medium</option>
                  <option value="1rem">Large</option>
                  <option value="1.5rem">Extra Large</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Theme</label>
                <div className="flex gap-3">
                  {(['light', 'dark'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => updateConfig({ theme: t })}
                      className={`flex-1 px-4 py-2 rounded-lg border-2 text-sm font-medium capitalize transition-colors ${
                        form.config.theme === t
                          ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400'
                          : 'border-gray-200 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500'
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Accent Color</label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={form.config.accentColor}
                    onChange={(e) => updateConfig({ accentColor: e.target.value })}
                    className="w-10 h-10 rounded-lg border border-gray-300 dark:border-gray-600 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={form.config.accentColor}
                    onChange={(e) => updateConfig({ accentColor: e.target.value })}
                    className="border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg px-3 py-2 text-sm font-mono w-32 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </section>

          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            <Save size={16} />
            {saving ? 'Saving...' : isEditing ? 'Update Widget' : 'Create Widget'}
          </button>

          {isEditing && (
            <section className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Embed Code</h2>
                <button
                  onClick={copyEmbed}
                  className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                >
                  {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                </button>
              </div>
              <div className="flex gap-2 mb-3">
                <button
                  onClick={() => setEmbedTab('script')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    embedTab === 'script'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  Script (recommended)
                </button>
                <button
                  onClick={() => setEmbedTab('iframe')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    embedTab === 'iframe'
                      ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  iFrame
                </button>
              </div>
              <pre className="bg-gray-50 dark:bg-gray-900/50 rounded-lg p-4 text-xs text-gray-700 dark:text-gray-300 overflow-x-auto">
                {embedTab === 'script' ? scriptCode : iframeCode}
              </pre>
              {embedTab === 'script' && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  Script embed injects the widget directly into the page, allowing modals to overlay the full page.
                </p>
              )}
            </section>
          )}
        </div>

        {/* Live preview */}
        <div className="lg:col-span-1">
          <div className="sticky top-8">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Preview</h2>
            <div className={`rounded-xl border border-gray-200 dark:border-gray-700 p-4 ${form.config.theme === 'dark' ? 'bg-gray-900' : 'bg-gray-50'}`}>
              {limitedPosts.length > 0 ? (
                <PreviewLayout posts={limitedPosts} cardStyle={cardStyle} config={form.config as any} />
              ) : (
                <div className="text-center py-12 text-gray-400 text-sm">
                  {isEditing ? 'No posts to preview' : 'Save the widget to see a preview'}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
