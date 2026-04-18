'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Bookmark, Clock } from 'lucide-react'
import Header from '@/components/layout/Header'
import ArticleCard from '@/components/feed/ArticleCard'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/feed/SkeletonCard'
import type { Bookmark as BookmarkType } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

type Tab = 'favorite' | 'read_later'

export default function SavedPage() {
  const [tab, setTab] = useState<Tab>('favorite')

  const { data, isLoading, mutate } = useSWR<{ bookmarks: BookmarkType[] }>(
    `/api/bookmarks?type=${tab}`,
    fetcher
  )

  const bookmarks = data?.bookmarks ?? []

  async function handleBookmark(id: string, type: 'favorite' | 'read_later') {
    await fetch(`/api/bookmarks/${id}`, { method: 'DELETE' })
    mutate()
  }

  return (
    <div className="safe-pb">
      <Header title="Sauvegardés" />

      {/* Tab switcher */}
      <div className="flex mx-4 mb-4 bg-[var(--bg-tertiary)] rounded-xl p-1 gap-1">
        {([
          { value: 'favorite', label: 'Favoris', Icon: Bookmark },
          { value: 'read_later', label: 'À lire', Icon: Clock },
        ] as { value: Tab; label: string; Icon: React.FC<{ size: number }> }[]).map(({ value, label, Icon }) => (
          <button
            key={value}
            onClick={() => setTab(value)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-semibold transition-all press-scale ${
              tab === value
                ? 'bg-[var(--bg-elevated)] text-[var(--text-primary)] shadow-sm'
                : 'text-[var(--text-tertiary)]'
            }`}
          >
            <Icon size={14} />
            {label}
          </button>
        ))}
      </div>

      {isLoading && <SkeletonList count={3} />}

      {!isLoading && bookmarks.length === 0 && (
        <EmptyState
          icon={tab === 'favorite' ? <Bookmark size={32} /> : <Clock size={32} />}
          title={tab === 'favorite' ? 'Aucun favori' : 'Aucun article à lire'}
          description={
            tab === 'favorite'
              ? 'Appuyez sur l\'icône marque-page dans les articles pour les sauvegarder ici.'
              : 'Ajoutez des articles à lire plus tard depuis votre feed.'
          }
        />
      )}

      {!isLoading && bookmarks.length > 0 && (
        <div className="space-y-3 px-4 pb-4">
          {bookmarks.map((bookmark) =>
            bookmark.article ? (
              <ArticleCard
                key={bookmark.id}
                article={{ ...bookmark.article, is_bookmarked: true }}
                onBookmark={handleBookmark}
              />
            ) : null
          )}
        </div>
      )}
    </div>
  )
}
