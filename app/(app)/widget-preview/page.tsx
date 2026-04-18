'use client'

import { useState } from 'react'
import Header from '@/components/layout/Header'
import { ExternalLink } from 'lucide-react'

type Size = 'small' | 'medium' | 'large'

const SIZES: { value: Size; label: string; desc: string }[] = [
  { value: 'small',  label: 'Petit',  desc: '1 article · 160×160' },
  { value: 'medium', label: 'Moyen',  desc: '3 articles · 340×160' },
  { value: 'large',  label: 'Grand',  desc: '6 articles · 340×360' },
]

export default function WidgetPreviewPage() {
  const [size, setSize] = useState<Size>('medium')

  return (
    <div className="safe-pb">
      <Header title="Widgets" subtitle="Aperçu" />

      <div className="px-4 space-y-5 pb-4">

        {/* Size picker */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-1">
            Taille du widget
          </h2>
          <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
            {SIZES.map(({ value, label, desc }, idx) => (
              <button
                key={value}
                onClick={() => setSize(value)}
                className={`w-full flex items-center justify-between px-4 py-3 press-scale ${
                  idx < SIZES.length - 1 ? 'border-b border-[var(--separator)]' : ''
                }`}
              >
                <div className="text-left">
                  <p className="text-[15px] font-medium text-[var(--text-primary)]">{label}</p>
                  <p className="text-[12px] text-[var(--text-tertiary)]">{desc}</p>
                </div>
                {size === value && (
                  <div className="w-5 h-5 rounded-full bg-[var(--accent)] flex items-center justify-center">
                    <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
                      <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </section>

        {/* Live preview */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-1">
            Aperçu en direct
          </h2>
          <div
            className="w-full rounded-2xl overflow-hidden bg-[var(--bg-secondary)] flex items-center justify-center"
            style={{ minHeight: size === 'large' ? '400px' : '200px', padding: '24px' }}
          >
            <iframe
              src={`/widget?size=${size}&preview=1`}
              className="border-0 rounded-xl shadow-lg"
              style={{
                width:  size === 'small' ? '160px' : '340px',
                height: size === 'small' ? '160px' : size === 'large' ? '360px' : '160px',
              }}
              title="Widget preview"
            />
          </div>
        </section>

        {/* Install instructions */}
        <section>
          <h2 className="text-[13px] font-semibold uppercase tracking-wider text-[var(--text-tertiary)] mb-3 px-1">
            Ajouter à l'écran d'accueil
          </h2>
          <div className="bg-[var(--bg-elevated)] rounded-card shadow-card overflow-hidden">
            {[
              {
                platform: 'iPhone / iPad (Safari)',
                steps: 'Ouvrir le lien widget → Partager (⬆) → Sur l\'écran d\'accueil',
              },
              {
                platform: 'Android (Chrome)',
                steps: 'Ouvrir le lien widget → Menu (⋮) → Ajouter à l\'écran d\'accueil',
              },
              {
                platform: 'Windows 11',
                steps: 'Widgets Board supporte les PWA avec Adaptive Cards (manifest déclaré)',
              },
            ].map(({ platform, steps }, idx) => (
              <div
                key={platform}
                className={`px-4 py-3 ${idx < 2 ? 'border-b border-[var(--separator)]' : ''}`}
              >
                <p className="text-[14px] font-semibold text-[var(--text-primary)] mb-0.5">{platform}</p>
                <p className="text-[13px] text-[var(--text-secondary)]">{steps}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Open standalone */}
        <a
          href={`/widget?size=${size}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-[var(--accent-light)] text-[var(--accent)] font-semibold text-sm press-scale"
        >
          <ExternalLink size={16} />
          Ouvrir le widget en plein écran
        </a>
      </div>
    </div>
  )
}
