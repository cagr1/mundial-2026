'use client'

// PROTOTYPE variant C — "Sidebar App"
// Idea: desktop con sidebar izquierda fija (Airbnb/Notion-style) + contenido a la derecha.
// Móvil: bottom nav como siempre. El salto en desktop es lo que hace que parezca app,
// no una navbar horizontal de web.

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import MatchList from '@/components/MatchList'
import GroupStandings from '@/components/GroupStandings'
import TeamsGrid from '@/components/TeamsGrid'
import Countdown from '@/components/Countdown'
import FavoriteTeamCard from '@/components/FavoriteTeamCard'
import KnockoutBracket from '@/components/KnockoutBracket'
import CalendarButton from '@/components/CalendarButton'
import { useFavoriteTeam } from '@/hooks/useFavoriteTeam'
import { Match, Standing, Team } from '@/types/football'

type Tab = 'partidos' | 'grupos' | 'equipos' | 'bracket'

const TABS: { id: Tab; label: string; icon: string; iconActive: string }[] = [
  { id: 'partidos', label: 'Partidos', icon: 'material-symbols:calendar-month-outline', iconActive: 'material-symbols:calendar-month' },
  { id: 'grupos', label: 'Grupos', icon: 'material-symbols:grid-view-outline', iconActive: 'material-symbols:grid-view' },
  { id: 'equipos', label: 'Equipos', icon: 'material-symbols:shield-outline', iconActive: 'material-symbols:shield' },
  { id: 'bracket', label: 'Bracket', icon: 'material-symbols:account-tree-outline', iconActive: 'material-symbols:account-tree' },
]

interface Props {
  matches: Match[]
  standings: Standing[]
  teams: Team[]
  liveCount: number
  firstMatchDate: string
}

function MatchdayFilter({
  matchdays, selected, onSelect,
}: { matchdays: number[]; selected: number | null; onSelect: (md: number | null) => void }) {
  const base = 'flex-shrink-0 eyebrow px-3 py-1.5 border transition-colors'
  const active = 'text-[var(--lacquer-deep)] bg-[var(--kinpaku)] border-[var(--kinpaku)]'
  const idle = 'text-[var(--text-muted)] border-[var(--glass-border)]'
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' as const }}>
      <button onClick={() => onSelect(null)} className={`${base} ${selected === null ? active : idle}`} style={{ borderRadius: 'var(--r-sm)' }}>Todos</button>
      {matchdays.map(md => (
        <button key={md} onClick={() => onSelect(md)} className={`${base} ${selected === md ? active : idle}`} style={{ borderRadius: 'var(--r-sm)' }}>J{md}</button>
      ))}
    </div>
  )
}

export default function VariantC({ matches, standings, teams, liveCount, firstMatchDate }: Props) {
  const [tab, setTab] = useState<Tab>('partidos')
  const [timeZone, setTimeZone] = useState('UTC')
  const [selectedMatchday, setSelectedMatchday] = useState<number | null>(null)
  const { favorite, saveFavorite } = useFavoriteTeam()

  useEffect(() => {
    setTimeZone(Intl.DateTimeFormat().resolvedOptions().timeZone)
  }, [])

  const matchdays = Array.from(
    new Set(matches.map(m => m.matchday).filter((md): md is number => md != null)),
  ).sort((a, b) => a - b)

  const filteredMatches = selectedMatchday !== null
    ? matches.filter(m => m.matchday === selectedMatchday)
    : matches

  const handleToggle = useCallback(
    (team: Team) => saveFavorite(favorite?.id === team.id ? null : team),
    [favorite, saveFavorite],
  )

  const content = (
    <>
      {tab === 'partidos' && (
        <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {liveCount === 0 && <Countdown targetDate={firstMatchDate} />}
          {favorite && (
            <FavoriteTeamCard team={favorite} matches={matches} timeZone={timeZone} onRemove={() => saveFavorite(null)} />
          )}
          <MatchdayFilter matchdays={matchdays} selected={selectedMatchday} onSelect={setSelectedMatchday} />
          <MatchList matches={filteredMatches} timeZone={timeZone} />
        </div>
      )}
      {tab === 'grupos' && (
        <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {standings.length > 0
            ? standings.map(s => <GroupStandings key={s.group} standing={s} />)
            : <p className="eyebrow" style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '48px 0' }}>No disponible</p>
          }
        </div>
      )}
      {tab === 'equipos' && (
        <div className="tab-panel">
          <TeamsGrid teams={teams} favoriteId={favorite?.id ?? null} onToggleFavorite={handleToggle} />
        </div>
      )}
      {tab === 'bracket' && (
        <div className="tab-panel">
          <KnockoutBracket matches={matches} timeZone={timeZone} />
        </div>
      )}
    </>
  )

  return (
    <>
      {/* ── DESKTOP: sidebar + content ──────────────────────────────── */}
      <div
        className="hidden sm:flex"
        style={{
          maxWidth: 960,
          margin: '0 auto',
          height: '100dvh',
          width: '100%',
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            width: 200,
            flexShrink: 0,
            height: '100dvh',
            display: 'flex',
            flexDirection: 'column',
            borderRight: '1px solid var(--glass-border)',
            background: 'var(--lacquer)',
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          {/* App identity */}
          <div style={{ padding: '20px 16px 12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ position: 'relative', width: 28, height: 28, flexShrink: 0 }}>
                <Image src="/brand-mark.svg" alt="" fill sizes="28px" />
              </div>
              <span style={{
                color: 'var(--kinpaku)',
                fontWeight: 800,
                fontSize: '0.9rem',
                letterSpacing: '-0.01em',
                fontFamily: 'var(--font-hanken)',
              }}>
                World Cup
              </span>
            </div>
            <p style={{
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '0.6rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: 'var(--text-faint)',
              margin: 0,
              paddingLeft: 36,
            }}>
              2026
            </p>
          </div>

          {liveCount > 0 && (
            <div style={{ paddingInline: 16, marginBottom: 8 }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                padding: '5px 10px',
                borderRadius: 6,
                background: 'oklch(70% 0.12 188 / 0.1)',
                border: '1px solid oklch(70% 0.12 188 / 0.25)',
              }}>
                <span className="live-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--patina)', display: 'block', flexShrink: 0 }} />
                <span style={{ color: 'var(--patina)', fontFamily: 'var(--font-jetbrains)', fontSize: '0.62rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {liveCount} en vivo
                </span>
              </div>
            </div>
          )}

          {/* Nav items */}
          <nav style={{ flex: 1, padding: '8px 8px' }}>
            {TABS.map(t => {
              const isActive = tab === t.id
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '9px 10px',
                    borderRadius: 8,
                    background: isActive ? 'oklch(84% 0.19 80.46 / 0.1)' : 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: isActive ? 'var(--kinpaku)' : 'var(--text-muted)',
                    fontFamily: 'var(--font-hanken)',
                    fontWeight: isActive ? 700 : 400,
                    fontSize: '0.85rem',
                    textAlign: 'left',
                    transition: 'background 120ms, color 120ms',
                    WebkitTapHighlightColor: 'transparent',
                    marginBottom: 2,
                  }}
                >
                  <Icon icon={isActive ? t.iconActive : t.icon} width={18} height={18} />
                  {t.label}
                </button>
              )
            })}
          </nav>

          {/* Footer de sidebar */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--glass-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <a
              href="https://carlosgallardo.dev"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontFamily: 'var(--font-jetbrains)',
                fontSize: '0.6rem',
                fontWeight: 500,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-disabled)',
                textDecoration: 'none',
              }}
            >
              by Carlos Gallardo
            </a>
            <CalendarButton />
          </div>
        </aside>

        {/* Content area — scroll aislado dentro del panel derecho */}
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            padding: '24px 24px 32px',
          }}
        >
          {content}
        </main>
      </div>

      {/* ── MOBILE: bottom nav ─────────────────────────────────────── */}
      <div
        className="flex sm:hidden"
        style={{ flexDirection: 'column', height: '100dvh', background: 'var(--lacquer-deep)', overflow: 'hidden' }}
      >
        {/* Mobile header */}
        <header
          style={{
            height: 56,
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingInline: 18,
            borderBottom: '1px solid var(--glass-border)',
            background: 'var(--lacquer-deep)',
            paddingTop: 'env(safe-area-inset-top)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ position: 'relative', width: 24, height: 24 }}>
              <Image src="/brand-mark.svg" alt="" fill sizes="24px" />
            </div>
            <span style={{ color: 'var(--kinpaku)', fontWeight: 800, fontSize: '0.88rem', fontFamily: 'var(--font-hanken)' }}>
              World Cup 2026
            </span>
          </div>
          <CalendarButton />
        </header>

        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
            padding: '14px 14px 16px',
          }}
        >
          {content}
        </main>

        <nav
          style={{
            flexShrink: 0,
            display: 'flex',
            borderTop: '1px solid var(--glass-border)',
            background: 'var(--lacquer)',
            paddingBottom: 'env(safe-area-inset-bottom)',
          }}
          role="tablist"
        >
          {TABS.map(t => {
            const isActive = tab === t.id
            return (
              <button
                key={t.id}
                role="tab"
                aria-selected={isActive}
                aria-label={t.label}
                onClick={() => setTab(t.id)}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 4,
                  paddingBlock: 12,
                  color: isActive ? 'var(--kinpaku)' : 'var(--text-disabled)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  transition: 'color 120ms, opacity 100ms',
                  WebkitTapHighlightColor: 'transparent',
                  position: 'relative',
                }}
                onPointerDown={e => (e.currentTarget.style.opacity = '0.55')}
                onPointerUp={e => (e.currentTarget.style.opacity = '1')}
                onPointerLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                {isActive && (
                  <span style={{
                    position: 'absolute',
                    top: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 28,
                    height: 3,
                    background: 'var(--kinpaku)',
                    borderRadius: '0 0 3px 3px',
                  }} />
                )}
                <Icon icon={isActive ? t.iconActive : t.icon} width={24} height={24} />
                <span style={{
                  fontSize: 10,
                  fontFamily: 'var(--font-hanken)',
                  fontWeight: isActive ? 700 : 400,
                  letterSpacing: '0.03em',
                  lineHeight: 1,
                }}>
                  {t.label}
                </span>
              </button>
            )
          })}
        </nav>
      </div>
    </>
  )
}
