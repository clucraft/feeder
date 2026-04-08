import { useState } from 'react'
import { ThumbsUp, MessageCircle, Share2 } from 'lucide-react'
import type { Post } from '../lib/api'

export type CardSize = 'compact' | 'standard' | 'large' | 'custom'

interface PostCardProps {
  post: Post
  fixedHeight?: boolean
  cardSize?: CardSize
  customHeight?: number
  showStats?: boolean
  style?: {
    shadow?: boolean
    borderRadius?: string
    theme?: 'light' | 'dark'
    accentColor?: string
  }
}

const TRUNCATE_LENGTH = 200

const PRESET_SIZES: Record<string, { height: number; imgMax: string; clamp: string; clampNoMedia: string }> = {
  compact:  { height: 380, imgMax: 'max-h-40',      clamp: 'line-clamp-4',    clampNoMedia: 'line-clamp-[10]' },
  standard: { height: 480, imgMax: 'max-h-60',      clamp: 'line-clamp-6',    clampNoMedia: 'line-clamp-[14]' },
  large:    { height: 600, imgMax: 'max-h-[300px]', clamp: 'line-clamp-[8]',  clampNoMedia: 'line-clamp-[20]' },
}

function getCardConfig(cardSize: CardSize, customHeight?: number) {
  if (cardSize !== 'custom') return PRESET_SIZES[cardSize]

  const h = customHeight || 480
  // Scale clamp lines and image height proportionally
  const clampLines = Math.max(2, Math.round((h - 140) / 22))
  const clampNoMediaLines = Math.max(4, Math.round((h - 90) / 22))
  const imgMaxPx = Math.max(80, Math.round(h * 0.4))

  return {
    height: h,
    imgMax: `max-h-[${imgMaxPx}px]`,
    clamp: `line-clamp-[${clampLines}]`,
    clampNoMedia: `line-clamp-[${clampNoMediaLines}]`,
  }
}

export default function PostCard({ post, style, fixedHeight, cardSize = 'compact', customHeight, showStats = true }: PostCardProps) {
  const [expanded, setExpanded] = useState(false)

  const shadow = style?.shadow !== false
  const borderRadius = style?.borderRadius ?? '0.75rem'
  const theme = style?.theme ?? 'light'
  const isDark = theme === 'dark'

  const bgColor = isDark ? 'bg-gray-800' : 'bg-white'
  const textColor = isDark ? 'text-gray-100' : 'text-gray-900'
  const subtextColor = isDark ? 'text-gray-400' : 'text-gray-500'
  const borderColor = isDark ? 'border-gray-700' : 'border-gray-200'

  const sizeConfig = getCardConfig(cardSize, customHeight)

  const needsTruncation = post.content.length > TRUNCATE_LENGTH
  const displayContent =
    !expanded && needsTruncation
      ? post.content.slice(0, TRUNCATE_LENGTH) + '...'
      : post.content

  const hasMedia = !!post.media_url

  return (
    <div
      className={`${bgColor} ${shadow ? 'shadow-md' : ''} border ${borderColor} overflow-hidden flex flex-col`}
      style={{ borderRadius, ...(fixedHeight ? { height: `${sizeConfig.height}px` } : {}) }}
    >
      {/* Hero image with overlaid author info */}
      {hasMedia ? (
        <div className="relative shrink-0">
          <img
            src={post.media_url!}
            alt="Post media"
            className={`w-full object-cover ${fixedHeight ? sizeConfig.imgMax : 'max-h-80'}`}
          />
          {/* Gradient overlay for readability */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
          {/* Author info overlaid on image */}
          <div className="absolute top-0 left-0 flex items-center gap-2.5 p-3">
            {post.author_avatar_url ? (
              <img
                src={post.author_avatar_url}
                alt={post.author_name}
                className="w-9 h-9 rounded-full object-cover border-2 border-white/80"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-white/80">
                {post.author_name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-semibold text-sm text-white truncate drop-shadow-sm">
                {post.author_name}
              </p>
              <p className="text-xs text-white/80 drop-shadow-sm">
                {new Date(post.published_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>
      ) : (
        /* No-image: normal header */
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
        </div>
      )}

      {/* Text content */}
      <div className={`flex-1 min-h-0 ${fixedHeight ? 'overflow-hidden' : ''}`}>
        <div className="px-4 py-3">
          <p className={`text-sm ${textColor} whitespace-pre-line leading-relaxed ${fixedHeight ? (hasMedia ? sizeConfig.clamp : sizeConfig.clampNoMedia) : ''}`}>
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
      </div>

      {/* Engagement stats */}
      {showStats && (
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
      )}
    </div>
  )
}
