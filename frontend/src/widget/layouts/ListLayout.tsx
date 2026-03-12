import PostCard from '../PostCard'
import type { Post } from '../../lib/api'

interface ListLayoutProps {
  posts: Post[]
  cardStyle?: Record<string, unknown>
  config?: Record<string, unknown>
}

export default function ListLayout({ posts, cardStyle }: ListLayoutProps) {
  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} style={cardStyle as any} />
      ))}
    </div>
  )
}
