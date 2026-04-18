'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  User, Moon, Sun, Monitor, LogOut, ChevronRight,
  RefreshCw, Rss, Info, LayoutDashboard
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Header from '@/components/layout/Header'
import type { User as SupabaseUser } from '@supabase/supabase-js'

export default function SettingsPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [syncing, setSyncing] = useState(false)
  const [syncResult, setSyncResult] = useState<string | null>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => setUser(data.user))
  }, [])

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  async function handleSync() {
    setSyncing(true)
    setSyncResult(null)
    try {
      const res = await fetch('/api/cron/fetch-feeds', {
        method: 'POST',
        headers: { 'x-cron-secret': 'manual' },
      })
      const data = await res.json()
      setSyncResult(`${data.inserted ?? 0} nouveaux articles ajoutés`)
    } catch {
      setSyncResult('Erreur lors de la synchronisation')
    } finally {
      setSyncing(false)
    }
  }

  return (
    <div className="safe-pb">
      <Header title="Profil" />

      <div className="px-4 space-y-6 pb-4">

        {/* User info */}
        {user && (
          <section className="bg-[var(--bg-elevated)] rounded-card p-4 shadow-card flex items-center gap-4">
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold"
              style={{ background: 'linear-gradient(135deg, #0A84FF, #AF52DE)' }}>
              {(user.email?.[0] ?? 'U').toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-[var(--text-primary)] truncate">
                {user.user_metadata?.username ?? 'Utilisateur'}
              </p>
              <p className="text-sm text-[var(--text-secondary)] truncate">{user.email}</p>
            </div>
          </section>
        )}

        {/* Feed settings */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-1">
            Données
          </h2>
          <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
            <button
              onClick={handleSync}
              disabled={syncing}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--separator)] press-scale disabled:opacity-50"
            >
              <RefreshCw size={18} className={`text-[var(--accent)] ${syncing ? 'animate-spin' : ''}`} />
              <div className="flex-1 text-left">
                <p className="text-[15px] text-[var(--text-primary)]">Synchroniser les feeds</p>
                {syncResult && (
                  <p className="text-[12px] text-[var(--text-tertiary)]">{syncResult}</p>
                )}
              </div>
              <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
            </button>
            <a
              href="/explore"
              className="flex items-center gap-3 px-4 py-3 border-b border-[var(--separator)] press-scale"
            >
              <Rss size={18} className="text-[var(--accent)]" />
              <p className="flex-1 text-[15px] text-[var(--text-primary)]">Gérer mes sources</p>
              <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
            </a>
            <a
              href="/widget-preview"
              className="flex items-center gap-3 px-4 py-3 press-scale"
            >
              <LayoutDashboard size={18} className="text-[var(--accent)]" />
              <p className="flex-1 text-[15px] text-[var(--text-primary)]">Widgets</p>
              <ChevronRight size={16} className="text-[var(--text-tertiary)]" />
            </a>
          </div>
        </section>

        {/* About */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-1">
            À propos
          </h2>
          <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--separator)]">
              <Info size={18} className="text-[var(--text-tertiary)]" />
              <p className="text-[15px] text-[var(--text-primary)]">AI Feed</p>
              <span className="ml-auto text-sm text-[var(--text-tertiary)]">v0.1.0 MVP</span>
            </div>
            <div className="flex items-center gap-3 px-4 py-3">
              <Monitor size={18} className="text-[var(--text-tertiary)]" />
              <p className="text-[15px] text-[var(--text-primary)]">Stack</p>
              <span className="ml-auto text-sm text-[var(--text-tertiary)]">Next.js · Supabase</span>
            </div>
          </div>
        </section>

        {/* Sign out */}
        <section>
          <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-3 press-scale"
            >
              <LogOut size={18} className="text-[var(--red)]" />
              <p className="text-[15px] text-[var(--red)] font-medium">Se déconnecter</p>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
