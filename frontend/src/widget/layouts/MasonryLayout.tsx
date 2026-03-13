import PostCard from '../PostCard'
import type { Post } from '../../lib/api'

interface MasonryLayoutProps {
  posts: Post[]
  cardStyle?: Record<string, unknown>
  config?: Record<string, unknown>
}

export default function MasonryLayout({ posts, cardStyle }: MasonryLayoutProps) {
  return (
    <div
      className="masonry-container gap-4"
      style={{
        columnCount: 3,
        columnGap: '1rem',
        touchAction: 'pan-y',
      }}
    >
      <style>{`
        @media (max-width: 1023px) {
          .masonry-container { column-count: 2 !important; }
        }
        @media (max-width: 639px) {
          .masonry-container { column-count: 1 !important; }
        }
      `}</style>
      {posts.map((post) => (
        <div key={post.id} className="break-inside-avoid mb-4">
          <PostCard post={post} style={cardStyle as any} />
        </div>
      ))}
    </div>
  )
}
