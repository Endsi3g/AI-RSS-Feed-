'use client'

import { cn } from '@/lib/utils'
import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  fullWidth?: boolean
}

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  className,
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      disabled={disabled || loading}
      className={cn(
        'inline-flex items-center justify-center font-semibold rounded-xl transition-all duration-100 select-none',
        'active:scale-[0.97] active:opacity-80',
        'disabled:opacity-40 disabled:cursor-not-allowed disabled:active:scale-100',
        {
          'bg-[var(--accent)] text-white hover:opacity-90':  variant === 'primary',
          'bg-[var(--bg-tertiary)] text-[var(--text-primary)] hover:opacity-80': variant === 'secondary',
          'bg-transparent text-[var(--accent)] hover:bg-[var(--accent-light)]': variant === 'ghost',
          'bg-[var(--red)] text-white hover:opacity-90': variant === 'danger',
          'text-sm px-4 py-2.5': size === 'sm',
          'text-base px-5 py-3':  size === 'md',
          'text-lg px-6 py-4':    size === 'lg',
          'w-full': fullWidth,
        },
        className
      )}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Chargement…
        </span>
      ) : children}
    </button>
  )
}
