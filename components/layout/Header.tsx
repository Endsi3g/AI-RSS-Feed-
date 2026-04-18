import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface HeaderProps {
  title: string
  subtitle?: string
  right?: ReactNode
  large?: boolean
  className?: string
}

export default function Header({ title, subtitle, right, large = true, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-40 px-4',
        'bg-[var(--bg-secondary)]',
        className
      )}
      style={{
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        paddingTop: 'calc(env(safe-area-inset-top, 0px) + 12px)',
        paddingBottom: '8px',
      }}
    >
      <div className="flex items-end justify-between">
        <div>
          {subtitle && (
            <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-0.5">
              {subtitle}
            </p>
          )}
          <h1
            className={cn(
              'font-bold text-[var(--text-primary)] leading-tight',
              large ? 'text-[28px]' : 'text-[22px]'
            )}
          >
            {title}
          </h1>
        </div>
        {right && <div className="flex items-center gap-2">{right}</div>}
      </div>
    </header>
  )
}
