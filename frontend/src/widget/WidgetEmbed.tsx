import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { fetchWidget } from '../lib/api'
import type { WidgetConfig, Post } from '../lib/api'
import CarouselLayout from './layouts/CarouselLayout'
import GridLayout from './layouts/GridLayout'
import ListLayout from './layouts/ListLayout'
import MasonryLayout from './layouts/MasonryLayout'

export default function WidgetEmbed() {
  const { id } = useParams<{ id: string }>()
  const [widget, setWidget] = useState<WidgetConfig | null>(null)
  const [posts, setPosts] = useState<Post[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    fetchWidget(id)
      .then(({ widget: w, posts: p }) => {
        setWidget(w)
        const maxPosts = (w.config?.maxPosts as number) || p.length
        setPosts(p.slice(0, maxPosts))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [id])

  // Auto-resize for iframe embedding
  useEffect(() => {
    const observer = new ResizeObserver(() => {
      const height = document.documentElement.scrollHeight
      window.parent?.postMessage({ type: 'feeder-resize', height }, '*')
    })
    observer.observe(document.body)
    return () => observer.disconnect()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-red-500 text-sm">
        Failed to load widget
      </div>
    )
  }

  if (!widget || posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-gray-400 text-sm">
        No posts to display
      </div>
    )
  }

  const cardStyle = {
    shadow: (widget.config?.shadow as boolean) !== false,
    borderRadius: (widget.config?.borderRadius as string) ?? '0.75rem',
    theme: (widget.config?.theme as 'light' | 'dark') ?? 'light',
    accentColor: (widget.config?.accentColor as string) ?? '#2563eb',
  }

  const layoutProps = { posts, cardStyle, config: widget.config }

  const Layout = {
    carousel: CarouselLayout,
    grid: GridLayout,
    list: ListLayout,
    masonry: MasonryLayout,
  }[widget.layout]

  return (
    <div className="p-2">
      <Layout {...layoutProps} />
    </div>
  )
}
