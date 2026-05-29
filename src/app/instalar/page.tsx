'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Icon } from '@iconify/react'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

function isAlreadyInstalled(): boolean {
  if (window.matchMedia('(display-mode: standalone)').matches) return true
  if ((navigator as { standalone?: boolean }).standalone) return true
  return false
}

function Step({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex gap-3 items-start">
      <span
        className="eyebrow flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full"
        style={{
          background: 'var(--kinpaku)',
          color: 'var(--lacquer-deep)',
          fontSize: '0.65rem',
        }}
      >
        {n}
      </span>
      <p style={{ color: 'var(--text-warm)', fontSize: '0.9rem', lineHeight: 1.6 }}>
        {children}
      </p>
    </div>
  )
}

function PlatformCard({
  icon,
  title,
  steps,
  action,
}: {
  icon: string
  title: string
  steps: React.ReactNode[]
  action?: React.ReactNode
}) {
  return (
    <div
      className="glass-card rounded-lg p-5 flex flex-col gap-4"
      style={{ borderRadius: 'var(--r-lg)' }}
    >
      <div className="flex items-center gap-2.5">
        <Icon icon={icon} width={22} height={22} style={{ color: 'var(--kinpaku)' }} />
        <h2
          style={{
            fontFamily: 'var(--font-hanken)',
            fontWeight: 700,
            fontSize: '0.95rem',
            color: 'var(--champagne)',
          }}
        >
          {title}
        </h2>
      </div>

      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <Step key={i} n={i + 1}>
            {step}
          </Step>
        ))}
      </div>

      {action && <div className="pt-1">{action}</div>}
    </div>
  )
}

export default function InstalarPage() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [installed, setInstalled] = useState(false)
  const [installing, setInstalling] = useState(false)

  useEffect(() => {
    if (isAlreadyInstalled()) {
      setInstalled(true)
      return
    }
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    setInstalling(true)
    await deferredPrompt.prompt()
    const { outcome } = await deferredPrompt.userChoice
    if (outcome === 'accepted') setInstalled(true)
    setInstalling(false)
    setDeferredPrompt(null)
  }

  return (
    <div
      className="min-h-dvh flex flex-col"
      style={{ background: 'var(--lacquer-deep)' }}
    >
      {/* Header */}
      <header
        className="sticky top-0 z-40 flex items-center gap-3 px-4 py-3"
        style={{
          background: 'rgba(11, 11, 10, 0.9)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <Link
          href="/"
          className="flex items-center gap-1.5 eyebrow transition-colors"
          style={{ color: 'var(--text-muted)' }}
          aria-label="Volver a inicio"
        >
          <Icon icon="material-symbols:arrow-back" width={18} height={18} />
          Volver
        </Link>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-8 flex flex-col gap-6">

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <p className="eyebrow" style={{ color: 'var(--kinpaku)' }}>Mundial 2026</p>
          <h1
            style={{
              fontFamily: 'var(--font-hanken)',
              fontWeight: 800,
              fontSize: '1.6rem',
              lineHeight: 1.15,
              color: 'var(--champagne)',
            }}
          >
            Instala la app
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            Accede a partidos, grupos y horarios directamente desde tu pantalla de inicio.
          </p>
        </div>

        {/* Already installed */}
        {installed && (
          <div
            className="flex items-center gap-3 p-4 rounded-lg"
            style={{
              background: 'oklch(70% 0.12 188 / 0.12)',
              border: '1px solid oklch(70% 0.12 188 / 0.35)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <Icon
              icon="material-symbols:check-circle"
              width={20}
              height={20}
              style={{ color: 'var(--patina)', flexShrink: 0 }}
            />
            <p style={{ color: 'var(--patina)', fontSize: '0.9rem' }}>
              La app ya está instalada en tu dispositivo.
            </p>
          </div>
        )}

        {/* Android / Chrome — native install prompt */}
        {deferredPrompt && (
          <PlatformCard
            icon="material-symbols:android"
            title="Android · Chrome"
            steps={[
              'Tu navegador ha detectado que esta app es instalable.',
              'Toca el botón de abajo para añadirla a tu pantalla de inicio.',
            ]}
            action={
              <button
                onClick={handleInstall}
                disabled={installing}
                className="w-full py-2.5 eyebrow font-bold transition-opacity"
                style={{
                  background: 'var(--kinpaku)',
                  color: 'var(--lacquer-deep)',
                  borderRadius: 'var(--r-md)',
                  border: 'none',
                  opacity: installing ? 0.6 : 1,
                  cursor: installing ? 'wait' : 'pointer',
                }}
              >
                {installing ? 'Instalando…' : 'Añadir a pantalla de inicio'}
              </button>
            }
          />
        )}

        {/* iOS Safari */}
        <PlatformCard
          icon="material-symbols:phone-iphone"
          title="iPhone · iPad (Safari)"
          steps={[
            <>Abre esta página en <strong style={{ color: 'var(--champagne)' }}>Safari</strong> (no Chrome ni Firefox).</>,
            <>Toca el botón <strong style={{ color: 'var(--champagne)' }}>Compartir</strong> <Icon icon="material-symbols:ios-share" width={14} height={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> en la barra inferior.</>,
            <>Desliza hacia abajo y elige <strong style={{ color: 'var(--champagne)' }}>&ldquo;Añadir a pantalla de inicio&rdquo;</strong>.</>,
            <>Toca <strong style={{ color: 'var(--kinpaku)' }}>Añadir</strong> para confirmar.</>,
          ]}
        />

        {/* Desktop Chrome / Edge */}
        <PlatformCard
          icon="material-symbols:computer"
          title="Computadora · Chrome / Edge"
          steps={[
            <>Busca el ícono de <strong style={{ color: 'var(--champagne)' }}>instalar</strong> <Icon icon="material-symbols:install-desktop" width={14} height={14} style={{ display: 'inline', verticalAlign: 'middle' }} /> en la barra de direcciones (extremo derecho).</>,
            <>Haz clic y confirma con <strong style={{ color: 'var(--kinpaku)' }}>Instalar</strong>.</>,
            'La app se abrirá en su propia ventana sin la barra del navegador.',
          ]}
        />

      </main>
    </div>
  )
}
