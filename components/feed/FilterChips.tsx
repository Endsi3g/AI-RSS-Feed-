'use client'

import { cn, getCategoryColor, getCategoryLabel } from '@/lib/utils'
import type { Category } from '@/types'
import { CATEGORIES } from '@/types'

interface FilterChipsProps {
  selected: Category | null
  onChange: (category: Category | null) => void
  className?: string
}

export default function FilterChips({ selected, onChange, className }: FilterChipsProps) {
  return (
    <div
      className={cn(
        'flex gap-2 px-4 pb-3 overflow-x-auto',
        className
      )}
      style={{ scrollbarWidth: 'none' }}
    >
      {/* All chip */}
      <button
        onClick={() => onChange(null)}
        className={cn(
          'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150',
          'press-scale whitespace-nowrap',
          selected === null
            ? 'bg-[var(--text-primary)] text-[var(--bg-primary)]'
            : 'bg-[var(--bg-tertiary)] text-[var(--text-secondary)]'
        )}
      >
        Tout
      </button>

      {CATEGORIES.map(({ value, label }) => {
        const active = selected === value
        const color = getCategoryColor(value)
        return (
          <button
            key={value}
            onClick={() => onChange(active ? null : value)}
            className={cn(
              'flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-150',
              'press-scale whitespace-nowrap'
            )}
            style={
              active
                ? { background: color, color: '#fff' }
                : {
                    background: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)',
                  }
            }
          >
            {label}
          </button>
        )
      })}
    </div>
  )
}
