'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Icon } from '@iconify/react'
import TimezoneSelect from './TimezoneSelect'
import MatchList from './MatchList'
import GroupStandings from './GroupStandings'
import TeamsGrid from './TeamsGrid'
import Countdown from './Countdown'
import CalendarButton from './CalendarButton'
import { Match, Standing, Team } from '@/types/football'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

type Tab = 'partidos' | 'grupos' | 'equipos'

const TABS: { id: Tab; label: string; icon: string; iconActive: string }[] = [
  {
    id: 'partidos',
    label: 'Partidos',
    icon: 'material-symbols:calendar-month-outline',
    iconActive: 'material-symbols:calendar-month',
  },
  {
    id: 'grupos',
    label: 'Grupos',
    icon: 'material-symbols:grid-view-outline',
    iconActive: 'material-symbols:grid-view',
  },
  {
    id: 'equipos',
    label: 'Equipos',
    icon: 'material-symbols:shield-outline',
    iconActive: 'material-symbols:shield',
  },
]

interface Props {
  matches: Match[]
  standings: Standing[]
  teams: Team[]
  liveCount: number
  firstMatchDate: string
}

function MatchdayFilter({
  matchdays,
  selected,
  onSelect,
}: {
  matchdays: number[]
  selected: number | null
  onSelect: (md: number | null) => void
}) {
  const base =
    'flex-shrink-0 eyebrow px-3 py-1.5 border transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]'
  const active =
    'text-[var(--lacquer-deep)] bg-[var(--kinpaku)] border-[var(--kinpaku)]'
  const idle =
    'text-[var(--text-muted)] bg-transparent border-[var(--glass-border)] hover:border-[var(--hairline-gold)] hover:text-[var(--text-warm)]'

  return (
    <div
      className="flex items-center gap-1.5 overflow-x-auto pb-0.5"
      style={{ scrollbarWidth: 'none' }}
    >
      <button
        onClick={() => onSelect(null)}
        className={`${base} ${selected === null ? active : idle}`}
        style={{ borderRadius: 'var(--r-sm)' }}
      >
        Todos
      </button>
      {matchdays.map((md) => (
        <button
          key={md}
          onClick={() => onSelect(md)}
          className={`${base} ${selected === md ? active : idle}`}
          style={{ borderRadius: 'var(--r-sm)' }}
        >
          J{md}
        </button>
      ))}
    </div>
  )
}

export default function AppShell({
  matches,
  standings,
  teams,
  liveCount,
  firstMatchDate,
}: Props) {
  const [tab, setTab] = useState<Tab>('partidos')
  const [timeZone, setTimeZone] = useState('UTC')
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null)
  const [deferredInstall, setDeferredInstall] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstall, setShowInstall] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const detected = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timer = window.setTimeout(() => setTimeZone(detected), 0)
    return () => window.clearTimeout(timer)
  }, [])

  useEffect(() => {
    const alreadyInstalled =
      window.matchMedia('(display-mode: standalone)').matches ||
      (navigator as { standalone?: boolean }).standalone === true
    if (alreadyInstalled) return

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferredInstall(e as BeforeInstallPromptEvent)
      setShowInstall(true)
    }
    window.addEventListener('beforeinstallprompt', handler)

    // iOS Safari doesn't fire beforeinstallprompt — show install hint anyway
    const ua = navigator.userAgent
    const isIOS = /iphone|ipad|ipod/i.test(ua) && !/crios/i.test(ua)
    const isSafari = /^((?!chrome|android).)*safari/i.test(ua)
    if (isIOS && isSafari) setShowInstall(true)

    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstallClick = useCallback(async () => {
    if (deferredInstall) {
      await deferredInstall.prompt()
      const { outcome } = await deferredInstall.userChoice
      if (outcome === 'accepted') setShowInstall(false)
      setDeferredInstall(null)
    } else {
      router.push('/instalar')
    }
  }, [deferredInstall, router])

  const matchdays = Array.from(
    new Set(
      matches.map((m) => m.matchday).filter((md): md is number => md != null),
    ),
  ).sort((a, b) => a - b)

  const filteredMatches =
    selectedMatchday !== null
      ? matches.filter((m) => m.matchday === selectedMatchday)
      : matches

  return (
    <div className="flex-1 flex flex-col">

      {/* ── Fixed top header ────────────────────────────────────────────── */}
      <header
        className="fixed top-0 left-0 right-0 z-40"
        style={{
          background: 'rgba(22, 19, 12, 0.85)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14 gap-3">

            {/* Brand */}
            <div className="flex items-center gap-2.5 flex-shrink-0">
              <style>{`
                @keyframes nav-ball-spin {
                  from { transform: rotate(0deg); }
                  to   { transform: rotate(360deg); }
                }
              `}</style>
              <div
                className="relative flex-shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  animation: 'nav-ball-spin 1.4s cubic-bezier(0.22, 1, 0.36, 1) both',
                }}
              >
                <Image src="/brand-mark.svg" alt="" fill priority sizes="28px" />
              </div>
              <span
                className="font-extrabold tracking-tighter uppercase leading-none"
                style={{ color: 'var(--kinpaku)', fontSize: '1rem', fontFamily: 'var(--font-hanken)' }}
              >
                World Cup 2026
              </span>
              {liveCount > 0 && (
                <div
                  className="flex items-center gap-1.5 px-2 py-0.5 eyebrow"
                  style={{
                    color: 'var(--patina)',
                    border: '1px solid oklch(70% 0.12 188 / 0.35)',
                    background: 'oklch(70% 0.12 188 / 0.08)',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  <span
                    className="live-dot w-1.5 h-1.5 rounded-full block"
                    style={{ background: 'var(--patina)' }}
                    aria-hidden="true"
                  />
                  {liveCount} live
                </div>
              )}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {showInstall && (
                <button
                  onClick={handleInstallClick}
                  aria-label="Instalar app"
                  title="Instalar app"
                  className="w-8 h-8 flex items-center justify-center transition-colors"
                  style={{
                    color: 'var(--text-muted)',
                    borderRadius: 'var(--r-sm)',
                    border: '1px solid var(--glass-border)',
                    background: 'transparent',
                  }}
                  onMouseEnter={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--kinpaku)'
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--hairline-gold)'
                  }}
                  onMouseLeave={(e) => {
                    ;(e.currentTarget as HTMLButtonElement).style.color = 'var(--text-muted)'
                    ;(e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--glass-border)'
                  }}
                >
                  <Icon icon="material-symbols:install-mobile" width={18} height={18} />
                </button>
              )}
              <CalendarButton />
              <TimezoneSelect value={timeZone} onChange={setTimeZone} />
            </div>
          </div>

          {/* Desktop tab row — hidden on mobile (bottom nav takes over) */}
          <div className="hidden sm:flex gap-0" role="tablist">
            {TABS.map((t) => {
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  onClick={() => setTab(t.id)}
                  aria-selected={isActive}
                  className="flex items-center gap-1.5 px-4 py-2.5 -mb-px border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
                  style={{
                    fontFamily: 'var(--font-hanken)',
                    fontSize: '0.8rem',
                    fontWeight: 600,
                    letterSpacing: '0.04em',
                    borderBottomColor: isActive ? 'var(--kinpaku)' : 'transparent',
                    color: isActive ? 'var(--kinpaku)' : 'var(--text-faint)',
                  }}
                >
                  <Icon
                    icon={isActive ? t.iconActive : t.icon}
                    width={16}
                    height={16}
                  />
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Spacer under fixed header ───────────────────────────────────── */}
      {/* mobile: 56px header; desktop: 56px + 44px tabs */}
      <div className="h-14 sm:h-[100px] flex-shrink-0" />

      {/* ── Countdown (Partidos tab only, before tournament) ────────────── */}
      {tab === 'partidos' && liveCount === 0 && (
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 pt-5">
          <Countdown targetDate={firstMatchDate} />
        </div>
      )}

      {/* ── Main content ────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 pb-28 sm:pb-8">
        {tab === 'partidos' ? (
          <div key="partidos" className="tab-panel">
            <div className="mb-5">
              <MatchdayFilter
                matchdays={matchdays}
                selected={selectedMatchday}
                onSelect={setSelectedMatchday}
              />
            </div>
            <MatchList matches={filteredMatches} timeZone={timeZone} />
          </div>
        ) : tab === 'grupos' ? (
          <div key="grupos" className="tab-panel">
            {standings.length > 0 ? (
              <>
                <p
                  className="eyebrow mb-5"
                  style={{ color: 'var(--text-faint)' }}
                >
                  Los 2 primeros de cada grupo avanzan a la siguiente fase
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {standings.map((s) => (
                    <GroupStandings key={s.group} standing={s} />
                  ))}
                </div>
              </>
            ) : (
              <div className="py-12 text-center">
                <p
                  className="eyebrow"
                  style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}
                >
                  Grupos no disponibles en este momento
                </p>
              </div>
            )}
          </div>
        ) : (
          <div key="equipos" className="tab-panel">
            <TeamsGrid teams={teams} />
          </div>
        )}
      </main>

      {/* ── Footer (desktop only) ───────────────────────────────────────── */}
      <footer
        className="hidden sm:block py-4 text-center"
        style={{ borderTop: '1px solid var(--glass-border)' }}
      >
        <p
          className="eyebrow"
          style={{ letterSpacing: '0.1em', color: 'var(--text-disabled)' }}
        >
          Datos: <span translate="no">football-data.org</span> · Horarios en zona horaria local
        </p>
      </footer>

      {/* ── Bottom nav (mobile only) ────────────────────────────────────── */}
      <nav
        className="sm:hidden fixed bottom-0 left-0 right-0 z-40 flex"
        style={{
          background: 'rgba(22, 19, 12, 0.95)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderTop: '1px solid var(--glass-border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
        }}
        role="tablist"
        aria-label="Navegación principal"
      >
        {TABS.map((t) => {
          const isActive = tab === t.id
          return (
            <button
              key={t.id}
              role="tab"
              onClick={() => setTab(t.id)}
              aria-selected={isActive}
              aria-label={t.label}
              className="flex-1 flex flex-col items-center justify-center gap-1 py-2.5 transition-colors focus-visible:outline-none"
              style={{
                color: isActive ? 'var(--kinpaku)' : 'var(--text-muted)',
              }}
            >
              <Icon
                icon={isActive ? t.iconActive : t.icon}
                width={24}
                height={24}
              />
              <span
                className="eyebrow"
                style={{
                  fontSize: '0.58rem',
                  letterSpacing: '0.08em',
                  color: 'inherit',
                }}
              >
                {t.label}
              </span>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
