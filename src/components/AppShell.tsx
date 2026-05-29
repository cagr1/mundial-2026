'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import TimezoneSelect from './TimezoneSelect'
import MatchList from './MatchList'
import GroupStandings from './GroupStandings'
import TeamsGrid from './TeamsGrid'
import Countdown from './Countdown'
import CalendarButton from './CalendarButton'
import { Match, Standing, Team } from '@/types/football'

type Tab = 'partidos' | 'grupos' | 'equipos'

const TABS: { id: Tab; label: string }[] = [
  { id: 'partidos', label: 'Partidos' },
  { id: 'grupos',   label: 'Grupos'   },
  { id: 'equipos',  label: 'Equipos'  },
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
  const base = 'flex-shrink-0 eyebrow px-3 py-1.5 border transition-colors focus-visible:outline-none focus-visible:ring-1'
  const active = 'text-[var(--lacquer-deep)] bg-[var(--kinpaku)] border-[var(--kinpaku)]'
  const idle  = 'text-[var(--text-muted)] bg-transparent border-[var(--hairline)] hover:border-[var(--hairline-gold)] hover:text-[var(--text-warm)]'

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5" style={{ scrollbarWidth: 'none' }}>
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

export default function AppShell({ matches, standings, teams, liveCount, firstMatchDate }: Props) {
  const [tab, setTab] = useState<Tab>('partidos')
  const [timeZone, setTimeZone] = useState('UTC')
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null)

  useEffect(() => {
    const detectedTimeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
    const timer = window.setTimeout(() => setTimeZone(detectedTimeZone), 0)
    return () => window.clearTimeout(timer)
  }, [])

  const matchdays = Array.from(
    new Set(matches.map((m) => m.matchday).filter((md): md is number => md != null)),
  ).sort((a, b) => a - b)

  const filteredMatches =
    selectedMatchday !== null ? matches.filter((m) => m.matchday === selectedMatchday) : matches

  function handleTabChange(newTab: Tab) {
    setTab(newTab)
  }

  return (
    <div className="flex-1 flex flex-col">
      {/* ── Header ───────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-30"
        style={{
          background: 'var(--lacquer-deep)',
          borderBottom: '1px solid var(--hairline)',
        }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          {/* Brand + timezone */}
          <div className="flex items-center justify-between h-14 gap-3">
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
              {/* Wordmark */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <div
                  className="relative w-8 h-8 flex-shrink-0"
                  style={{
                    filter: 'drop-shadow(0 0 10px oklch(84% 0.19 80.46 / 0.18))',
                  }}
                  aria-hidden="true"
                >
                  <Image src="/brand-mark.svg" alt="" fill priority sizes="32px" />
                </div>
                <h1
                  className="text-sm font-semibold leading-none whitespace-nowrap"
                  style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)', letterSpacing: '0.05em' }}
                >
                  Mundial <span style={{ color: 'var(--kinpaku)' }}>2026</span>
                </h1>
              </div>

              {liveCount > 0 ? (
                <div
                  className="flex items-center gap-1.5 px-2 py-1 border eyebrow"
                  style={{
                    color: 'var(--patina)',
                    borderColor: 'oklch(70% 0.12 188 / 0.35)',
                    background: 'oklch(70% 0.12 188 / 0.08)',
                    borderRadius: 'var(--r-sm)',
                  }}
                >
                  <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--patina)' }} aria-hidden="true" />
                  {liveCount} live
                </div>
              ) : null}
            </div>

            <div className="flex items-center gap-2">
              <CalendarButton />
              <TimezoneSelect value={timeZone} onChange={setTimeZone} />
            </div>
          </div>

          {/* ── Tabs ─────────────────────────────────────────────────── */}
          <div className="flex gap-0" role="tablist">
            {TABS.map((t) => {
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  role="tab"
                  onClick={() => handleTabChange(t.id)}
                  aria-selected={isActive}
                  aria-current={isActive ? 'page' : undefined}
                  className="px-4 py-2.5 -mb-px border-b-2 transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
                  style={{
                    fontFamily: 'var(--font-albert)',
                    fontSize: '0.8rem',
                    fontWeight: 500,
                    letterSpacing: '0.04em',
                    borderBottomColor: isActive ? 'var(--kinpaku)' : 'transparent',
                    color: isActive ? 'var(--kinpaku)' : 'var(--text-faint)',
                  }}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </header>

      {/* ── Countdown (only on Partidos tab, tournament not started) ── */}
      {tab === 'partidos' && liveCount === 0 && (
        <div className="max-w-7xl mx-auto w-full pt-5 relative">
          <Countdown targetDate={firstMatchDate} />
        </div>
      )}

      {/* ── Content ──────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        {tab === 'partidos' ? (
            <div key="partidos" className="tab-panel">
              <div className="mb-5">
                <MatchdayFilter matchdays={matchdays} selected={selectedMatchday} onSelect={setSelectedMatchday} />
              </div>
              <MatchList matches={filteredMatches} timeZone={timeZone} />
            </div>
          ) : tab === 'grupos' ? (
            <div key="grupos" className="tab-panel">
              <p className="eyebrow mb-5" style={{ color: 'var(--text-faint)' }}>
                Los 2 primeros de cada grupo avanzan a la siguiente fase
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {standings.map((s) => (
                  <GroupStandings key={s.group} standing={s} />
                ))}
              </div>
            </div>
          ) : (
            <div key="equipos" className="tab-panel">
              <TeamsGrid teams={teams} />
            </div>
          )}
      </main>

      {/* ── Footer ───────────────────────────────────────────────────── */}
      <footer
        className="py-4 text-center"
        style={{ borderTop: '1px solid var(--hairline)' }}
      >
        <p className="eyebrow" style={{ letterSpacing: '0.1em', color: 'var(--text-disabled)' }}>
          Datos: <span translate="no">football-data.org</span> · Horarios en zona horaria local
        </p>
      </footer>
    </div>
  )
}
