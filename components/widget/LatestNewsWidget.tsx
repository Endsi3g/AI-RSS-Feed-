import { getCategoryColor, getCategoryLabel, timeAgo } from '@/lib/utils'
import type { Article } from '@/types'

interface LatestNewsWidgetProps {
  articles: Article[]
  size?: 'small' | 'medium' | 'large'
}

const CATEGORY_DOT: Record<string, string> = {
  models:     '#007AFF',
  research:   '#AF52DE',
  startups:   '#FF9500',
  products:   '#34C759',
  regulation: '#FF3B30',
}

export default function LatestNewsWidget({ articles, size = 'medium' }: LatestNewsWidgetProps) {
  const shown = size === 'small' ? 1 : size === 'large' ? 6 : 3

  return (
    <div
      className="widget-root flex flex-col h-full overflow-hidden select-none"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, SF Pro Text, system-ui, sans-serif',
        WebkitFontSmoothing: 'antialiased',
      }}
    >
      {/* Widget header — Apple News style */}
      <div className="flex items-center gap-1.5 px-3.5 pt-3 pb-2">
        <div
          className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg,#0A84FF,#AF52DE)' }}
        >
          <svg viewBox="0 0 20 20" className="w-3 h-3" fill="none">
            <path d="M4 8C4 8 6 5 10 5C14 5 16 8 16 8" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <path d="M6 10.5C6 10.5 7.5 8.5 10 8.5C12.5 8.5 14 10.5 14 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="10" cy="14" r="2" fill="white"/>
          </svg>
        </div>
        <span
          className="text-[11px] font-bold uppercase tracking-wider"
          style={{ color: 'var(--text-tertiary, #8e8e93)' }}
        >
          AI Feed
        </span>
      </div>

      {/* Articles list */}
      <div className="flex-1 overflow-hidden">
        {articles.slice(0, shown).map((article, idx) => {
          const category = article.source?.category ?? 'research'
          const dotColor = CATEGORY_DOT[category] ?? '#8E8E93'
          const isLast = idx === Math.min(shown, articles.length) - 1

          return (
            <a
              key={article.id}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              <div
                className={`px-3.5 py-2 ${!isLast ? 'border-b' : ''}`}
                style={{ borderColor: 'var(--separator, rgba(60,60,67,0.12))' }}
              >
                {size !== 'small' && (
                  <div className="flex items-center gap-1 mb-0.5">
                    <span
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0"
                      style={{ background: dotColor }}
                    />
                    <span
                      className="text-[10px] font-semibold uppercase tracking-wider"
                      style={{ color: dotColor }}
                    >
                      {getCategoryLabel(category)}
                    </span>
                    <span
                      className="text-[10px] ml-auto"
                      style={{ color: 'var(--text-tertiary, #8e8e93)' }}
                    >
                      {timeAgo(article.published_at)}
                    </span>
                  </div>
                )}

                <p
                  className={`font-semibold leading-snug ${
                    size === 'small'
                      ? 'text-[15px] line-clamp-3'
                      : size === 'large'
                      ? 'text-[14px] line-clamp-2'
                      : 'text-[13px] line-clamp-2'
                  }`}
                  style={{ color: 'var(--text-primary, #000)' }}
                >
                  {article.title}
                </p>

                {size === 'small' && (
                  <p
                    className="text-[11px] mt-1"
                    style={{ color: 'var(--text-tertiary, #8e8e93)' }}
                  >
                    {article.source?.name} · {timeAgo(article.published_at)}
                  </p>
                )}

                {size === 'large' && article.description && (
                  <p
                    className="text-[12px] mt-0.5 line-clamp-1"
                    style={{ color: 'var(--text-secondary, rgba(60,60,67,0.85))' }}
                  >
                    {article.description}
                  </p>
                )}
              </div>
            </a>
          )
        })}
      </div>

      {/* Footer */}
      <div
        className="px-3.5 py-2 flex items-center justify-between border-t"
        style={{ borderColor: 'var(--separator, rgba(60,60,67,0.12))' }}
      >
        <span
          className="text-[10px]"
          style={{ color: 'var(--text-tertiary, #8e8e93)' }}
        >
          {articles.length > 0
            ? `Mis à jour ${timeAgo(articles[0].published_at)}`
            : 'Aucun article'}
        </span>
        <a
          href="/feed"
          className="text-[10px] font-semibold"
          style={{ color: 'var(--accent, #007AFF)' }}
        >
          Voir tout →
        </a>
      </div>
    </div>
  )
}
