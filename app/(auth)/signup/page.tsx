'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'

export default function SignupPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [username, setUsername] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setLoading(true)
    const supabase = createClient()

    const { data, error: signupError } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username } },
    })

    setLoading(false)

    if (signupError) {
      setError(signupError.message)
      return
    }

    if (data.session) {
      // Subscribe to default sources
      const { data: sources } = await supabase
        .from('sources')
        .select('id')
        .eq('is_default', true)

      if (sources && data.session.user) {
        await supabase.from('user_sources').insert(
          sources.map((s) => ({ user_id: data.session!.user.id, source_id: s.id }))
        )
      }
      router.push('/feed')
      router.refresh()
    } else {
      setSuccess(true)
    }
  }

  if (success) {
    return (
      <div className="min-h-dvh bg-[var(--bg-secondary)] flex flex-col items-center justify-center px-6">
        <div className="w-20 h-20 rounded-full bg-green-500/15 flex items-center justify-center mb-6">
          <svg viewBox="0 0 40 40" className="w-10 h-10 text-green-500" fill="none">
            <path d="M8 20L16 28L32 12" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-3">Vérifiez vos emails</h2>
        <p className="text-[var(--text-secondary)] text-center mb-6">
          Un lien de confirmation a été envoyé à <strong>{email}</strong>.
          Cliquez dessus pour activer votre compte.
        </p>
        <Link href="/login" className="text-[var(--accent)] font-semibold">
          Retour à la connexion
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-[var(--bg-secondary)] flex flex-col">
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
        <h1 className="text-[32px] font-bold text-[var(--text-primary)] mb-1">Créer un compte</h1>
        <p className="text-[var(--text-secondary)] text-center mb-10">
          Commencez votre veille IA personnalisée
        </p>

        <form onSubmit={handleSignup} className="w-full max-w-sm space-y-4">
          {error && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-sm text-red-600 dark:text-red-400">
              {error}
            </div>
          )}

          <div className="bg-[var(--bg-elevated)] rounded-xl overflow-hidden shadow-card">
            <div className="flex items-center px-4 py-3 gap-3 border-b border-[var(--separator)]">
              <User size={18} className="text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                type="text"
                placeholder="Nom d'utilisateur"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                className="flex-1 bg-transparent text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-[17px] outline-none"
              />
            </div>
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
            <div className="flex items-center px-4 py-3 gap-3">
              <Lock size={18} className="text-[var(--text-tertiary)] flex-shrink-0" />
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Mot de passe (8 caractères min.)"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="new-password"
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
            Créer mon compte
          </Button>

          <p className="text-xs text-center text-[var(--text-tertiary)]">
            En créant un compte, vous acceptez les sources RSS publiques configurées dans l'app.
          </p>
        </form>

        <p className="mt-6 text-[var(--text-secondary)] text-sm">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-[var(--accent)] font-semibold">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  )
}
