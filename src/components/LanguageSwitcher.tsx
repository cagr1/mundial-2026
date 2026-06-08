'use client'

import { useState, useEffect, useRef } from 'react'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from '@/i18n/navigation'

const LOCALES = [
  { code: 'es', label: 'Español',  short: 'ES', flag: '🇲🇽' },
  { code: 'en', label: 'English',  short: 'EN', flag: '🇺🇸' },
  { code: 'zh', label: '中文',     short: '中文', flag: '🇨🇳' },
  { code: 'hi', label: 'हिन्दी',  short: 'HI', flag: '🇮🇳' },
]

export default function LanguageSwitcher() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const current = LOCALES.find(l => l.code === locale) ?? LOCALES[0]

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const switchTo = (code: string) => {
    setOpen(false)
    router.replace(pathname, { locale: code })
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-1 soft-haptic focus-visible:outline-none"
        style={{
          padding: '4px 8px',
          borderRadius: 'var(--r-sm)',
          border: '1px solid var(--hairline)',
          background: open ? 'var(--graphite-2)' : 'transparent',
          color: 'var(--text-muted)',
          fontSize: '11px',
          fontWeight: 700,
          letterSpacing: '0.06em',
          lineHeight: 1,
          gap: 5,
        }}
        aria-label="Change language"
        aria-expanded={open}
      >
        <span style={{ fontSize: '15px', lineHeight: 1 }}>{current.flag}</span>
        <span>{current.short}</span>
      </button>

      {open && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            right: 0,
            background: 'var(--lacquer)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            overflow: 'hidden',
            minWidth: 148,
            boxShadow: '0 8px 24px oklch(0% 0 0 / 0.5)',
            zIndex: 200,
          }}
        >
          {LOCALES.map(l => {
            const isActive = l.code === locale
            return (
              <button
                key={l.code}
                onClick={() => switchTo(l.code)}
                className="w-full flex items-center gap-3 soft-haptic focus-visible:outline-none"
                style={{
                  padding: '10px 14px',
                  background: isActive ? 'var(--graphite-2)' : 'transparent',
                  borderBottom: '1px solid var(--hairline)',
                  textAlign: 'left',
                }}
              >
                <span style={{ fontSize: '18px', lineHeight: 1 }}>{l.flag}</span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '13px', fontWeight: 600, color: isActive ? 'var(--kinpaku)' : 'var(--text-warm)', lineHeight: 1 }}>
                    {l.label}
                  </p>
                  <p style={{ fontSize: '10px', color: 'var(--text-disabled)', marginTop: 2, letterSpacing: '0.06em' }}>
                    {l.code.toUpperCase()}
                  </p>
                </div>
                {isActive && (
                  <span style={{ fontSize: '12px', color: 'var(--kinpaku)' }}>✓</span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
