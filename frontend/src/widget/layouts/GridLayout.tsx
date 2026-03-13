import PostCard from '../PostCard'
import type { Post } from '../../lib/api'

interface GridLayoutProps {
  posts: Post[]
  cardStyle?: Record<string, unknown>
  config?: Record<string, unknown>
}

export default function GridLayout({ posts, cardStyle }: GridLayoutProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" style={{ touchAction: 'pan-y' }}>
      {posts.map((post) => (
        <PostCard key={post.id} post={post} style={cardStyle as any} />
      ))}
    </div>
  )
}
