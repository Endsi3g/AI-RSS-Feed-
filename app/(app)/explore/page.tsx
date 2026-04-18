'use client'

import { useState } from 'react'
import useSWR from 'swr'
import { Search, Plus, Check, ExternalLink } from 'lucide-react'
import Header from '@/components/layout/Header'
import Badge from '@/components/ui/Badge'
import { CATEGORIES } from '@/types'
import type { Source, Category } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

export default function ExplorePage() {
  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<Category | null>(null)

  const { data: sources = [], mutate } = useSWR<(Source & { subscribed: boolean })[]>(
    '/api/sources',
    fetcher
  )

  async function toggleSubscription(sourceId: string, subscribed: boolean) {
    await fetch('/api/sources/subscribe', {
      method: subscribed ? 'DELETE' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ source_id: sourceId }),
    })
    mutate()
  }

  const filtered = sources.filter((s) => {
    const matchesSearch = search
      ? s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
      : true
    const matchesCat = categoryFilter ? s.category === categoryFilter : true
    return matchesSearch && matchesCat
  })

  const grouped = CATEGORIES.reduce<Record<string, typeof filtered>>((acc, { value }) => {
    const items = filtered.filter((s) => s.category === value)
    if (items.length > 0) acc[value] = items
    return acc
  }, {})

  return (
    <div className="safe-pb">
      <Header title="Explorer" subtitle="Sources RSS" />

      {/* Search bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center gap-3 bg-[var(--bg-tertiary)] rounded-xl px-4 py-2.5">
          <Search size={16} className="text-[var(--text-tertiary)] flex-shrink-0" />
          <input
            type="search"
            placeholder="Rechercher une source…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[15px] outline-none"
          />
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 px-4 pb-4 overflow-x-auto" style={{ scrollbarWidth: 'none' }}>
        <button
          onClick={() => setCategoryFilter(null)}
          className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all
            ${!categoryFilter
              ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
              : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
        >
          Tout
        </button>
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setCategoryFilter(categoryFilter === value ? null : value)}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-semibold transition-all
              ${categoryFilter === value
                ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
                : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Sources grouped by category */}
      <div className="px-4 space-y-6 pb-4">
        {Object.entries(grouped).map(([cat, items]) => (
          <section key={cat}>
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-1">
              {CATEGORIES.find((c) => c.value === cat)?.label ?? cat}
            </h2>
            <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
              {items.map((source, idx) => (
                <div
                  key={source.id}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    idx < items.length - 1 ? 'border-b border-[var(--separator)]' : ''
                  }`}
                >
                  {/* Source info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[15px] font-semibold text-[var(--text-primary)] truncate">
                        {source.name}
                      </p>
                      {source.is_default && (
                        <span className="text-[10px] font-bold text-[var(--accent)] bg-[var(--accent-light)] px-1.5 py-0.5 rounded-full">
                          Défaut
                        </span>
                      )}
                    </div>
                    {source.description && (
                      <p className="text-[13px] text-[var(--text-tertiary)] truncate">{source.description}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--text-tertiary)] p-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink size={14} />
                    </a>
                    <button
                      onClick={() => toggleSubscription(source.id, source.subscribed)}
                      className={`w-7 h-7 rounded-full flex items-center justify-center transition-all press-scale ${
                        source.subscribed
                          ? 'bg-[var(--accent)] text-white'
                          : 'bg-[var(--bg-tertiary)] text-[var(--text-tertiary)]'
                      }`}
                    >
                      {source.subscribed ? <Check size={14} /> : <Plus size={14} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12 text-[var(--text-tertiary)] text-sm">
            Aucune source trouvée
          </div>
        )}
      </div>
    </div>
  )
}
