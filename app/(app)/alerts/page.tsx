'use client'

import { useState, useEffect } from 'react'
import useSWR from 'swr'
import { Bell, BellOff, Plus, Trash2, Tag, Rss, CalendarClock } from 'lucide-react'
import Header from '@/components/layout/Header'
import Button from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import type { NotificationRule } from '@/types'

const fetcher = (url: string) => fetch(url).then((r) => r.json())

const RULE_TYPE_LABELS: Record<string, { label: string; Icon: React.FC<{ size: number; className?: string }> }> = {
  keyword:       { label: 'Mot-clé',         Icon: Tag },
  source:        { label: 'Source',           Icon: Rss },
  daily_digest:  { label: 'Résumé quotidien', Icon: CalendarClock },
}

export default function AlertsPage() {
  const [pushEnabled, setPushEnabled] = useState(false)
  const [permissionState, setPermissionState] = useState<NotificationPermission>('default')
  const [showAddRule, setShowAddRule] = useState(false)
  const [newKeyword, setNewKeyword] = useState('')

  const { data, mutate } = useSWR<{ rules: NotificationRule[] }>('/api/notifications/rules', fetcher)
  const rules = data?.rules ?? []

  useEffect(() => {
    if ('Notification' in window) {
      setPermissionState(Notification.permission)
      setPushEnabled(Notification.permission === 'granted')
    }
  }, [])

  async function requestPushPermission() {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) return
    const permission = await Notification.requestPermission()
    setPermissionState(permission)

    if (permission === 'granted') {
      const reg = await navigator.serviceWorker.ready
      const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
      if (!vapidKey) return
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: vapidKey,
      })
      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sub.toJSON()),
      })
      setPushEnabled(true)
    }
  }

  async function addKeywordRule() {
    if (!newKeyword.trim()) return
    await fetch('/api/notifications/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'keyword', value: newKeyword.trim() }),
    })
    setNewKeyword('')
    setShowAddRule(false)
    mutate()
  }

  async function addDailyDigest() {
    await fetch('/api/notifications/rules', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'daily_digest', value: null }),
    })
    mutate()
  }

  async function deleteRule(id: string) {
    await fetch(`/api/notifications/rules/${id}`, { method: 'DELETE' })
    mutate()
  }

  async function toggleRule(id: string, enabled: boolean) {
    await fetch(`/api/notifications/rules/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: !enabled }),
    })
    mutate()
  }

  return (
    <div className="safe-pb">
      <Header title="Alertes" subtitle="Notifications" />

      <div className="px-4 space-y-6 pb-4">

        {/* Push permission banner */}
        <section className="bg-[var(--bg-elevated)] rounded-card p-4 shadow-card">
          <div className="flex items-start gap-3">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
              pushEnabled ? 'bg-green-500/15' : 'bg-[var(--accent-light)]'
            }`}>
              {pushEnabled
                ? <Bell size={20} className="text-green-500" />
                : <BellOff size={20} className="text-[var(--accent)]" />
              }
            </div>
            <div className="flex-1">
              <p className="font-semibold text-[var(--text-primary)] text-[15px] mb-1">
                {pushEnabled ? 'Notifications activées' : 'Activer les notifications'}
              </p>
              <p className="text-[13px] text-[var(--text-secondary)]">
                {pushEnabled
                  ? 'Vous recevrez des alertes pour les articles importants.'
                  : 'Recevez des alertes personnalisées sur les articles IA qui vous intéressent.'
                }
              </p>
              {!pushEnabled && permissionState !== 'denied' && (
                <Button
                  variant="primary"
                  size="sm"
                  className="mt-3"
                  onClick={requestPushPermission}
                >
                  Activer
                </Button>
              )}
              {permissionState === 'denied' && (
                <p className="text-xs text-[var(--red)] mt-2">
                  Notifications bloquées. Autorisez-les dans les réglages de votre navigateur.
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Rules */}
        <section>
          <div className="flex items-center justify-between mb-3 px-1">
            <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
              Règles d'alerte
            </h2>
            <button
              onClick={() => setShowAddRule(true)}
              className="flex items-center gap-1 text-[var(--accent)] text-sm font-semibold press-scale"
            >
              <Plus size={16} />
              Ajouter
            </button>
          </div>

          {/* Add rule form */}
          {showAddRule && (
            <div className="bg-[var(--bg-elevated)] rounded-card p-4 shadow-card mb-3">
              <p className="text-sm font-semibold text-[var(--text-primary)] mb-3">Nouveau mot-clé</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ex: GPT-5, Llama, Claude…"
                  value={newKeyword}
                  onChange={(e) => setNewKeyword(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addKeywordRule()}
                  className="flex-1 bg-[var(--bg-tertiary)] rounded-xl px-3 py-2 text-sm text-[var(--text-primary)] placeholder-[var(--text-tertiary)] outline-none"
                  autoFocus
                />
                <Button size="sm" onClick={addKeywordRule}>OK</Button>
                <Button size="sm" variant="secondary" onClick={() => setShowAddRule(false)}>
                  Annuler
                </Button>
              </div>
            </div>
          )}

          {rules.length === 0 && !showAddRule && (
            <EmptyState
              icon={<Bell size={28} />}
              title="Aucune règle"
              description="Ajoutez des mots-clés ou activez le résumé quotidien pour rester informé."
              action={
                <div className="flex flex-col gap-2">
                  <Button size="sm" variant="secondary" onClick={() => setShowAddRule(true)}>
                    + Ajouter un mot-clé
                  </Button>
                  <Button size="sm" variant="ghost" onClick={addDailyDigest}>
                    Activer le résumé quotidien
                  </Button>
                </div>
              }
            />
          )}

          {rules.length > 0 && (
            <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
              {rules.map((rule, idx) => {
                const meta = RULE_TYPE_LABELS[rule.type]
                const Icon = meta?.Icon ?? Bell
                return (
                  <div
                    key={rule.id}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      idx < rules.length - 1 ? 'border-b border-[var(--separator)]' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-light)] flex items-center justify-center flex-shrink-0">
                      <Icon size={16} className="text-[var(--accent)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-medium text-[var(--text-primary)] truncate">
                        {rule.value ?? meta?.label ?? rule.type}
                      </p>
                      <p className="text-[12px] text-[var(--text-tertiary)]">{meta?.label}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {/* Toggle */}
                      <button
                        onClick={() => toggleRule(rule.id, rule.enabled)}
                        className={`relative w-10 h-6 rounded-full transition-colors ${
                          rule.enabled ? 'bg-[var(--accent)]' : 'bg-[var(--bg-tertiary)]'
                        }`}
                      >
                        <span
                          className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${
                            rule.enabled ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                        />
                      </button>
                      <button
                        onClick={() => deleteRule(rule.id)}
                        className="text-[var(--red)] p-1 press-scale"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Quick actions */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-1">
            Raccourcis
          </h2>
          <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
            <button
              onClick={addDailyDigest}
              className="w-full flex items-center gap-3 px-4 py-3 border-b border-[var(--separator)] press-scale"
            >
              <CalendarClock size={18} className="text-[var(--accent)]" />
              <span className="text-[15px] text-[var(--text-primary)]">Activer le résumé quotidien</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
