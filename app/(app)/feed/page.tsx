'use client'

import { useState, useCallback } from 'react'
import useSWR from 'swr'
import { RefreshCw } from 'lucide-react'
import Header from '@/components/layout/Header'
import FilterChips from '@/components/feed/FilterChips'
import ArticleCard from '@/components/feed/ArticleCard'
import EmptyState from '@/components/ui/EmptyState'
import { SkeletonList } from '@/components/feed/SkeletonCard'
import type { Article, Category } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function FeedPage() {
  const [category, setCategory] = useState<Category | null>(null)
  const [page] = useState(1)

  const url = `/api/articles?page=${page}&limit=20${category ? `&category=${category}` : ''}`
  const { data, error, isLoading, mutate } = useSWR<{ articles: Article[]; total: number }>(url, fetcher)

  const handleBookmark = useCallback(async (id: string, type: 'favorite' | 'read_later') => {
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: id, type }),
    })
    mutate()
  }, [mutate])

  const handleRead = useCallback(async (id: string) => {
    await fetch('/api/read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ article_id: id }),
    })
  }, [])

  const articles = data?.articles ?? []

  return (
    <div className="safe-pb">
      <Header
        title="AI Feed"
        subtitle={`${data?.total ?? 0} articles`}
        right={
          <button
            onClick={() => mutate()}
            className="w-8 h-8 flex items-center justify-center rounded-full text-[var(--accent)] hover:bg-[var(--accent-light)] transition-colors press-scale"
          >
            <RefreshCw size={18} />
          </button>
        }
      />

      <FilterChips selected={category} onChange={setCategory} />

      {isLoading && <SkeletonList count={5} />}

      {error && (
        <EmptyState
          icon={<RefreshCw size={32} />}
          title="Erreur de chargement"
          description="Impossible de charger les articles. Vérifiez votre connexion."
          action={
            <button
              onClick={() => mutate()}
              className="text-[var(--accent)] font-semibold text-sm"
            >
              Réessayer
            </button>
          }
        />
      )}

      {!isLoading && !error && articles.length === 0 && (
        <EmptyState
          icon={
            <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
              <path d="M8 16C8 16 12 9 20 9C28 9 32 16 32 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M12 21C12 21 15 16 20 16C25 16 28 21 28 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="20" cy="28" r="3" fill="currentColor"/>
            </svg>
          }
          title="Aucun article"
          description={category
            ? `Aucun article dans la catégorie ${category} pour l'instant.`
            : "Votre feed est vide. Abonnez-vous à des sources dans Explore."}
        />
      )}

      {!isLoading && articles.length > 0 && (
        <div className="space-y-3 px-4 pb-4">
          {articles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              onBookmark={handleBookmark}
              onRead={handleRead}
            />
          ))}
        </div>
      )}
    </div>
  )
}
