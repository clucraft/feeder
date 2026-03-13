import { useState } from 'react'
import { ThumbsUp, MessageCircle, Share2, ExternalLink } from 'lucide-react'
import type { Post } from '../lib/api'

interface PostCardProps {
  post: Post
  fixedHeight?: boolean
  style?: {
    shadow?: boolean
    borderRadius?: string
    theme?: 'light' | 'dark'
    accentColor?: string
  }
  onClick?: () => void
}

const TRUNCATE_LENGTH = 200

export default function PostCard({ post, style, fixedHeight, onClick }: PostCardProps) {
  const [expanded, setExpanded] = useState(false)

  const shadow = style?.shadow !== false
  const borderRadius = style?.borderRadius ?? '0.75rem'
  const theme = style?.theme ?? 'light'
  const isDark = theme === 'dark'

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900'
  const subtextColor = isDark ? 'text-gray-400' : 'text-gray-500'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'

  const needsTruncation = post.content.length > TRUNCATE_LENGTH
  const displayContent =
    !expanded && needsTruncation
      ? post.content.slice(0, TRUNCATE_LENGTH) + '...'
      : post.content

  return (
    <div
      className={`${bgColor} ${shadow ? 'shadow-md' : ''} border ${borderColor} overflow-hidden flex flex-col ${onClick ? 'cursor-pointer hover:shadow-lg transition-shadow' : ''}`}
      style={{ borderRadius, ...(fixedHeight ? { height: '380px' } : {}) }}
      onClick={onClick}
    >
      {/* Author header */}
      <div className="flex items-center gap-3 p-4 pb-2">
        {post.author_avatar_url ? (
          <img
            src={post.author_avatar_url}
            alt={post.author_name}
            className="w-10 h-10 rounded-full object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm">
            {post.author_name.charAt(0).toUpperCase()}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className={`font-semibold text-sm ${textColor} truncate`}>
            {post.author_name}
          </p>
          <p className={`text-xs ${subtextColor}`}>
            {new Date(post.published_at).toLocaleDateString()}
          </p>
        </div>
        <a
          href={post.post_url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:text-blue-700 shrink-0"
          title="View on LinkedIn"
        >
          <ExternalLink size={16} />
        </a>
      </div>

      {/* Content + Media wrapper */}
      <div className={`flex-1 min-h-0 ${fixedHeight ? 'overflow-hidden' : ''}`}>
        <div className="px-4 pb-3">
          <p className={`text-sm ${textColor} whitespace-pre-line leading-relaxed ${fixedHeight ? 'line-clamp-4' : ''}`}>
            {fixedHeight ? post.content : displayContent}
          </p>
          {!fixedHeight && needsTruncation && (
            <button
              onClick={(e) => { e.stopPropagation(); setExpanded(!expanded) }}
              className="text-blue-600 hover:text-blue-700 text-sm font-medium mt-1"
            >
              {expanded ? 'Show less' : 'Read more'}
            </button>
          )}
        </div>

        {post.media_url && (
          <div className="px-4 pb-3">
            <img
              src={post.media_url}
              alt="Post media"
              className={`w-full rounded-lg object-cover ${fixedHeight ? 'max-h-40' : 'max-h-80'}`}
            />
          </div>
        )}
      </div>

      {/* Engagement stats */}
      <div className={`flex items-center gap-4 px-4 py-3 border-t ${borderColor} mt-auto`}>
        <span className={`flex items-center gap-1 text-xs ${subtextColor}`}>
          <ThumbsUp size={14} />
          {post.like_count}
        </span>
        <span className={`flex items-center gap-1 text-xs ${subtextColor}`}>
          <MessageCircle size={14} />
          {post.comment_count}
        </span>
        <span className={`flex items-center gap-1 text-xs ${subtextColor}`}>
          <Share2 size={14} />
          {post.share_count}
        </span>
      </div>
    </div>
  )
}
