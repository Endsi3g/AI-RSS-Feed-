'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Compass, Bookmark, Bell, Settings } from 'lucide-react'
import { cn } from '@/lib/utils'

const TABS = [
  { href: '/feed',    label: 'Feed',     Icon: Home },
  { href: '/explore', label: 'Explore',  Icon: Compass },
  { href: '/saved',   label: 'Sauvés',   Icon: Bookmark },
  { href: '/alerts',  label: 'Alertes',  Icon: Bell },
  { href: '/settings',label: 'Profil',   Icon: Settings },
]

export default function BottomTabBar() {
  const pathname = usePathname()

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[428px] z-50"
      style={{
        background: 'var(--bg-elevated)',
        borderTop: '1px solid var(--separator)',
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
      }}
    >
      <div className="flex items-center justify-around">
        {TABS.map(({ href, label, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 py-2 px-3 min-w-[44px] min-h-[44px] justify-center',
                'transition-opacity duration-100 press-scale'
              )}
            >
              <Icon
                size={24}
                className="transition-all duration-150"
                style={{
                  color: active ? 'var(--accent)' : 'var(--text-tertiary)',
                  fill: active && href === '/feed' ? 'var(--accent)' : 'none',
                  strokeWidth: active ? 2.2 : 1.8,
                }}
              />
              <span
                className="text-[10px] font-medium leading-none"
                style={{ color: active ? 'var(--accent)' : 'var(--text-tertiary)' }}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
