'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError(error.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : error.message)
      return
    }
    router.push('/feed')
    router.refresh()
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-secondary)] flex flex-col">
      {/* Hero */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 pt-16 pb-8">
        <div
          className="w-20 h-20 rounded-3xl mb-6 flex items-center justify-center"
          style={{ background: 'linear-gradient(135deg, #0A84FF, #AF52DE)' }}
        >
          <svg viewBox="0 0 40 40" className="w-10 h-10" fill="none">
            <path d="M8 16C8 16 12 9 20 9C28 9 32 16 32 16" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <path d="M12 21C12 21 15 16 20 16C25 16 28 21 28 21" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
            <circle cx="20" cy="28" r="4" fill="white"/>
          </svg>
        </div>
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] mb-1">AI Feed</h1>
        <p className="text-[var(--text-secondary)] text-center mb-10">
          Votre veille IA en un seul endroit
        </p>

        {/* Form */}
        <form onSubmit={handleLogin} className="w-full max-w-sm space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="bg-[var(--bg-elevated)] rounded-xl overflow-hidden shadow-card">
            {/* Email */}
            <div className="flex items-center px-4 py-3 gap-3 border-b border-[var(--separator)]">
              <Mail size={18} className="text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[17px] outline-none"
              />
            </div>
            {/* Password */}
            <div className="flex items-center px-4 py-3 gap-3">
              <Lock size={18} className="text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[17px] outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="text-[var(--text-tertiary)] p-1 -mr-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <Button type="submit" fullWidth loading={loading} size="lg">
            Se connecter
          </Button>
        </form>

        <p className="mt-6 text-[var(--text-secondary)] text-sm">
          Pas encore de compte ?{' '}
          <Link href="/signup" className="text-[var(--accent)] font-semibold">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  )
}
