'use client'

// PROTOTYPE — delete after variant is chosen
// Visible only in development builds

import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useCallback } from 'react'

const VARIANTS = ['A', 'B', 'C'] as const
type Variant = (typeof VARIANTS)[number]

const NAMES: Record<Variant, string> = {
  A: 'Capsule',
  B: 'Dense Native',
  C: 'Sidebar App',
}

export default function PrototypeSwitcher({ current }: { current: string }) {
  if (process.env.NODE_ENV === 'production') return null

  const router = useRouter()
  const searchParams = useSearchParams()

  const go = useCallback(
    (v: Variant) => {
      const p = new URLSearchParams(searchParams.toString())
      p.set('variant', v)
      router.replace(`/?${p.toString()}`)
    },
    [router, searchParams],
  )

  const idx = VARIANTS.indexOf(current as Variant)
  const prev = () => go(VARIANTS[(idx - 1 + VARIANTS.length) % VARIANTS.length])
  const next = () => go(VARIANTS[(idx + 1) % VARIANTS.length])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (document.activeElement as HTMLElement)?.tagName
      if (tag === 'INPUT' || tag === 'TEXTAREA') return
      if (e.key === 'ArrowLeft') prev()
      if (e.key === 'ArrowRight') next()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [idx])

  const label = VARIANTS.includes(current as Variant)
    ? `${current} — ${NAMES[current as Variant]}`
    : '? — sin variante'

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 90,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        background: '#fff',
        color: '#111',
        borderRadius: 999,
        padding: '7px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
        fontFamily: 'monospace',
        fontSize: 12,
        fontWeight: 700,
        userSelect: 'none',
        whiteSpace: 'nowrap',
      }}
    >
      <button
        onClick={prev}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: '0 2px', lineHeight: 1 }}
      >
        ←
      </button>
      <span>{label}</span>
      <button
        onClick={next}
        style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, padding: '0 2px', lineHeight: 1 }}
      >
        →
      </button>
    </div>
  )
}
