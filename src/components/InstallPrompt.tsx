'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOSSafari(): boolean {
  if (typeof window === 'undefined') return false
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios/i.test(ua)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return isIOS && isSafari
}

function isAlreadyInstalled(): boolean {
  if (typeof window === 'undefined') return false
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if ((navigator as { standalone?: boolean }).standalone) return true
  return false
}

export default function InstallPrompt() {
  // Lazy initializer runs client-side only — avoids setState-in-effect
  const [showIOS] = useState<boolean>(() => {
    if (isAlreadyInstalled()) return false
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return false
    return isIOSSafari()
  })

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (isAlreadyInstalled()) return
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return
    if (showIOS) return // iOS handled via lazy state above

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [showIOS])

  const dismiss = () => {
    sessionStorage.setItem('pwa-prompt-dismissed', '1')
    setDeferredPrompt(null)
    setDismissed(true)
  }

  const install = async () => {
    if (!deferredPrompt) return
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') dismiss()
    else setDeferredPrompt(null)
  }

  if (dismissed || (!deferredPrompt && !showIOS)) return null

  return (
    <div
      className="fixed bottom-4 left-4 right-4 z-50 flex items-start gap-3 p-4 sm:left-auto sm:right-4 sm:max-w-sm"
      style={{
        background: 'var(--raised-lacquer)',
        border: '1px solid var(--hairline-gold)',
        borderRadius: 'var(--r-lg)',
        boxShadow: '0 8px 32px oklch(4% 0.004 95 / 0.6)',
      }}
      role="dialog"
      aria-label="Instalar app"
    >
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold" style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}>
          Instalar app
        </p>
        {showIOS ? (
          <p className="eyebrow mt-1 leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Toca <span style={{ color: 'var(--kinpaku)' }}>Compartir ↑</span> y luego{' '}
            <span style={{ color: 'var(--kinpaku)' }}>&ldquo;Añadir a inicio&rdquo;</span>
          </p>
        ) : (
          <p className="eyebrow mt-1" style={{ color: 'var(--text-muted)' }}>
            Accede rápido desde tu pantalla de inicio
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0 mt-0.5">
        {!showIOS && (
          <button
            onClick={install}
            className="eyebrow px-3 py-1.5 font-bold"
            style={{
              background: 'var(--kinpaku)',
              color: 'var(--lacquer-deep)',
              borderRadius: 'var(--r-sm)',
              border: 'none',
            }}
          >
            Instalar
          </button>
        )}
        <button
          onClick={dismiss}
          className="w-7 h-7 flex items-center justify-center"
          style={{ color: 'var(--text-muted)', borderRadius: 'var(--r-xs)' }}
          aria-label="Cerrar"
        >
          ✕
        </button>
      </div>
    </div>
  )
}
