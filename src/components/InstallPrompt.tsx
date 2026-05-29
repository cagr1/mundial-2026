'use client'

import { useState, useEffect, useSyncExternalStore } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isIOSSafari(): boolean {
  const ua = navigator.userAgent
  const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios/i.test(ua)
  const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
  return isIOS && isSafari
}

function isAlreadyInstalled(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if ((navigator as { standalone?: boolean }).standalone) return true
  return false
}

function getShowIOSSnapshot(): boolean {
  if (isAlreadyInstalled()) return false
  if (sessionStorage.getItem('pwa-prompt-dismissed')) return false
  return isIOSSafari()
}

// Static snapshot — iOS detection never changes after mount
const noop = () => () => {}

export default function InstallPrompt() {
  // Server renders false; client reads real browser state after hydration — no mismatch
  const showIOS = useSyncExternalStore(noop, getShowIOSSnapshot, () => false)

  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    if (showIOS) return
    if (isAlreadyInstalled()) return
    if (sessionStorage.getItem('pwa-prompt-dismissed')) return

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
      className="fixed bottom-0 left-0 right-0 z-50 flex items-center gap-3 px-4 py-3"
      style={{
        background: 'var(--lacquer-deep)',
        borderTop: '1px solid var(--hairline-gold)',
        paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
      }}
      role="dialog"
      aria-label="Instalar app"
    >
      <div className="flex-1 min-w-0">
        {showIOS ? (
          <p className="eyebrow leading-relaxed" style={{ color: 'var(--text-muted)' }}>
            Toca <span style={{ color: 'var(--kinpaku)' }}>Compartir ↑</span> →{' '}
            <span style={{ color: 'var(--kinpaku)' }}>&ldquo;Añadir a inicio&rdquo;</span>
          </p>
        ) : (
          <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>
            Instala la app en tu pantalla de inicio
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
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
