'use client'

import { useState } from 'react'
import { Bookmark, BookmarkCheck, ExternalLink } from 'lucide-react'
import { cn, timeAgo, truncate } from '@/lib/utils'
import Badge from '@/components/ui/Badge'
import type { Article } from '@/types'

interface ArticleCardProps {
  article: Article
  onBookmark?: (id: string, type: 'favorite' | 'read_later') => Promise<void>
  onRead?: (id: string) => void
}

export default function ArticleCard({ article, onBookmark, onRead }: ArticleCardProps) {
  const [bookmarked, setBookmarked] = useState(article.is_bookmarked ?? false)
  const [loading, setLoading] = useState(false)

  async function handleBookmark(e: React.MouseEvent) {
    e.preventDefault()
    e.stopPropagation()
    if (!onBookmark || loading) return
    setLoading(true)
    try {
      await onBookmark(article.id, 'favorite')
      setBookmarked((v) => !v)
    } finally {
      setLoading(false)
    }
  }

  function handleClick() {
    onRead?.(article.id)
  }

  const category = article.source?.category ?? 'research'
  const sourceName = article.source?.name ?? 'Source'
  const ago = timeAgo(article.published_at)

  return (
    <a
      href={article.url}
      target="_blank"
      rel="noopener noreferrer"
      onClick={handleClick}
      className={cn(
        'block bg-[var(--bg-elevated)] rounded-card p-4',
        'shadow-[0_1px_3px_rgba(0,0,0,0.06),0_1px_2px_rgba(0,0,0,0.04)]',
        'dark:shadow-[0_1px_3px_rgba(0,0,0,0.3)]',
        'press-scale transition-shadow hover:shadow-[0_3px_12px_rgba(0,0,0,0.1)]',
        article.is_read && 'opacity-60'
      )}
    >
      {/* Top row: badge + time */}
      <div className="flex items-center justify-between mb-2.5">
        <Badge category={category} />
        <span className="text-xs text-[var(--text-tertiary)] font-medium">{ago}</span>
      </div>

      {/* Title */}
      <h2 className="text-[17px] font-semibold text-[var(--text-primary)] leading-snug mb-2">
        {truncate(article.title, 120)}
      </h2>

      {/* Description */}
      {article.description && (
        <p className="text-[14px] text-[var(--text-secondary)] leading-relaxed mb-3">
          {truncate(article.description, 160)}
        </p>
      )}

      {/* Image preview */}
      {article.image_url && (
        <div className="w-full h-36 rounded-xl overflow-hidden mb-3 bg-[var(--bg-tertiary)]">
          <img
            src={article.image_url}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
          />
        </div>
      )}

      {/* Bottom row: source + bookmark */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-[var(--text-tertiary)]">
          <ExternalLink size={12} />
          <span className="text-[13px] font-medium">{sourceName}</span>
        </div>
        <button
          onClick={handleBookmark}
          className={cn(
            'w-8 h-8 flex items-center justify-center rounded-full transition-all duration-100',
            'hover:bg-[var(--accent-light)] active:scale-90',
            loading && 'opacity-50'
          )}
          aria-label={bookmarked ? 'Retirer des favoris' : 'Ajouter aux favoris'}
        >
          {bookmarked ? (
            <BookmarkCheck size={18} className="text-[var(--accent)]" />
          ) : (
            <Bookmark size={18} className="text-[var(--text-tertiary)]" />
          )}
        </button>
      </div>
    </a>
  )
}
