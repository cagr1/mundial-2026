'use client'

import { useState } from 'react'

export default function CalendarButton() {
  const [open, setOpen] = useState(false)

  const icsUrl = '/api/calendar'
  const webcalUrl = icsUrl.replace(/^https?/, 'webcal').replace(/^\//, typeof window !== 'undefined' ? `webcal://${window.location.host}/` : 'webcal://mundial2026.app/')

  const isMobile = typeof navigator !== 'undefined' && /iPhone|iPad|Android/i.test(navigator.userAgent)

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-1.5 eyebrow px-3 py-1.5 border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
        style={{
          color: 'var(--kinpaku)',
          borderColor: 'var(--hairline-gold)',
          background: 'oklch(84% 0.19 80.46 / 0.07)',
          borderRadius: 'var(--r-sm)',
        }}
        aria-label="Agregar partidos al calendario"
      >
        <span aria-hidden="true">📅</span>
        <span className="hidden sm:inline">Calendario</span>
      </button>

      {open && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-50"
            style={{ background: 'oklch(4% 0.004 95 / 0.8)' }}
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Modal */}
          <div
            className="fixed bottom-0 left-0 right-0 z-50 sm:bottom-auto sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-sm sm:w-full p-6 space-y-5"
            style={{
              background: 'var(--lacquer)',
              border: '1px solid var(--hairline-gold)',
              borderRadius: '12px 12px 0 0',
            }}
            role="dialog"
            aria-label="Agregar al calendario"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-bold" style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}>
                  Agregar al calendario
                </h2>
                <p className="eyebrow mt-1" style={{ color: 'var(--text-disabled)' }}>
                  104 partidos · notificación 30 min antes
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center flex-shrink-0"
                style={{ color: 'var(--text-muted)', borderRadius: 'var(--r-sm)' }}
                aria-label="Cerrar"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2">
              {/* iOS/Android native subscribe */}
              <a
                href={isMobile ? webcalUrl : '#'}
                onClick={!isMobile ? (e) => { e.preventDefault(); window.location.href = webcalUrl } : undefined}
                className="flex items-center gap-3 px-4 py-3.5 w-full transition-colors"
                style={{
                  background: 'var(--kinpaku)',
                  color: 'var(--lacquer-deep)',
                  borderRadius: 'var(--r-md)',
                  textDecoration: 'none',
                }}
              >
                <span className="text-xl" aria-hidden="true">📲</span>
                <div>
                  <p className="text-sm font-bold" style={{ fontFamily: 'var(--font-albert)' }}>Suscribirse (recomendado)</p>
                  <p style={{ fontSize: '0.7rem', fontFamily: 'var(--font-albert)', opacity: 0.75 }}>
                    Se actualiza automáticamente · iOS y Android
                  </p>
                </div>
              </a>

              {/* Google Calendar */}
              <a
                href={`https://calendar.google.com/calendar/r?cid=${encodeURIComponent(typeof window !== 'undefined' ? `${window.location.origin}${icsUrl}` : `https://worldcup-kappa.vercel.app${icsUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-4 py-3.5 w-full transition-colors"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-md)',
                  textDecoration: 'none',
                }}
              >
                <span className="text-xl" aria-hidden="true">📆</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-warm)', fontFamily: 'var(--font-albert)' }}>Google Calendar</p>
                  <p className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.62rem' }}>Agregar desde Google</p>
                </div>
              </a>

              {/* Download ICS */}
              <a
                href={icsUrl}
                download="mundial-2026.ics"
                className="flex items-center gap-3 px-4 py-3.5 w-full transition-colors"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-md)',
                  textDecoration: 'none',
                }}
              >
                <span className="text-xl" aria-hidden="true">⬇️</span>
                <div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text-warm)', fontFamily: 'var(--font-albert)' }}>Descargar .ics</p>
                  <p className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.62rem' }}>Outlook · Apple Calendar · otros</p>
                </div>
              </a>
            </div>

            <p className="eyebrow text-center" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}>
              Todos los horarios en UTC — tu app los convierte automáticamente
            </p>
          </div>
        </>
      )}
    </>
  )
}
