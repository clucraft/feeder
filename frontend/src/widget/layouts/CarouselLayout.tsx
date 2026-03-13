import { useState, useEffect, useCallback, useRef } from 'react'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import PostCard from '../PostCard'
import type { Post } from '../../lib/api'

interface CarouselLayoutProps {
  posts: Post[]
  cardStyle?: Record<string, unknown>
  config?: Record<string, unknown>
}

export default function CarouselLayout({ posts, cardStyle, config }: CarouselLayoutProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isHovered, setIsHovered] = useState(false)
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null)
  const expandedListRef = useRef<HTMLDivElement>(null)

  const autoRotate = (config?.autoRotate as boolean) !== false
  const rotationSpeed = ((config?.rotationSpeed as number) || 5) * 1000
  const desktopVisible = (config?.postsVisible as number) || 3

  const [visibleCount, setVisibleCount] = useState(desktopVisible)

  useEffect(() => {
    function handleResize() {
      const w = window.innerWidth
      if (w < 640) setVisibleCount(1)
      else if (w < 1024) setVisibleCount(Math.min(2, desktopVisible))
      else setVisibleCount(desktopVisible)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [desktopVisible])

  const maxIndex = Math.max(0, posts.length - visibleCount)

  const goNext = useCallback(() => {
    setCurrentIndex((i) => (i >= maxIndex ? 0 : i + 1))
  }, [maxIndex])

  const goPrev = useCallback(() => {
    setCurrentIndex((i) => (i <= 0 ? maxIndex : i - 1))
  }, [maxIndex])

  useEffect(() => {
    if (!autoRotate || isHovered || posts.length <= visibleCount) return
    const timer = setInterval(goNext, rotationSpeed)
    return () => clearInterval(timer)
  }, [autoRotate, isHovered, goNext, rotationSpeed, posts.length, visibleCount])

  // Scroll to clicked post when modal opens
  useEffect(() => {
    if (expandedIndex !== null && expandedListRef.current) {
      const postEl = expandedListRef.current.children[expandedIndex] as HTMLElement
      if (postEl) {
        postEl.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }
    }
  }, [expandedIndex])

  // Close modal on Escape
  useEffect(() => {
    if (expandedIndex === null) return
    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setExpandedIndex(null)
    }
    document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [expandedIndex])

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (expandedIndex !== null) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [expandedIndex])

  if (posts.length === 0) return null

  const dotCount = maxIndex + 1

  return (
    <>
      <div
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {posts.length > visibleCount && (
          <>
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 -ml-3 transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft size={20} className="text-gray-700" />
            </button>
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-lg rounded-full p-2 -mr-3 transition-colors"
              aria-label="Next"
            >
              <ChevronRight size={20} className="text-gray-700" />
            </button>
          </>
        )}

        <div className="overflow-hidden mx-4">
          <div
            className="flex transition-transform duration-500 ease-in-out"
            style={{
              transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
            }}
          >
            {posts.map((post, i) => (
              <div
                key={post.id}
                className="shrink-0 px-2"
                style={{ width: `${100 / visibleCount}%` }}
              >
                <PostCard
                  post={post}
                  style={cardStyle as any}
                  fixedHeight
                  onClick={() => setExpandedIndex(i)}
                />
              </div>
            ))}
          </div>
        </div>

        {posts.length > visibleCount && (
          <div className="flex justify-center gap-2 mt-4">
            {Array.from({ length: dotCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentIndex(i)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  i === currentIndex ? 'bg-blue-600' : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Expanded feed modal */}
      {expandedIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={() => setExpandedIndex(null)}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Modal */}
          <div
            className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-gray-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-700 shrink-0">
              <h3 className="font-semibold text-gray-900 dark:text-white">Feed</h3>
              <button
                onClick={() => setExpandedIndex(null)}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                aria-label="Close"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable post list */}
            <div
              ref={expandedListRef}
              className="flex-1 overflow-y-auto p-4 space-y-4"
            >
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  style={cardStyle as any}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
