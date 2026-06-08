'use client'

// PROTOTYPE variant A — "Capsule"
// Idea: constrain todo a max 430px (phone width) centrado en cualquier pantalla.
// Resultado: siempre se ve como una app de iPhone, nunca como un sitio web ancho.
// Scroll aislado por sección, bottom nav siempre visible.

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
  const idle = 'text-[var(--text-muted)] border-[var(--glass-border)] hover:border-[var(--hairline-gold)]'
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1" style={{ scrollbarWidth: 'none' }}>
      <button onClick={() => onSelect(null)} className={`${base} ${selected === null ? active : idle}`} style={{ borderRadius: 'var(--r-sm)' }}>Todos</button>
      {matchdays.map(md => (
        <button key={md} onClick={() => onSelect(md)} className={`${base} ${selected === md ? active : idle}`} style={{ borderRadius: 'var(--r-sm)' }}>J{md}</button>
      ))}
    </div>
  )
}

export default function VariantA({ matches, standings, teams, liveCount, firstMatchDate }: Props) {
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

  return (
    <div
      style={{
        maxWidth: 430,
        margin: '0 auto',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--lacquer-deep)',
        // Borde sutil en desktop para mostrar los límites de la "cápsula"
        outline: '1px solid var(--glass-border)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header compacto — logo centrado, acciones a los lados */}
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
          <div style={{ position: 'relative', width: 26, height: 26, flexShrink: 0 }}>
            <Image src="/brand-mark.svg" alt="" fill sizes="26px" />
          </div>
          <span style={{
            color: 'var(--kinpaku)',
            fontWeight: 800,
            fontSize: '0.88rem',
            letterSpacing: '-0.01em',
            fontFamily: 'var(--font-hanken)',
          }}>
            World Cup 2026
          </span>
          {liveCount > 0 && (
            <span
              className="live-dot"
              style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--patina)', display: 'block' }}
            />
          )}
        </div>
        <CalendarButton />
      </header>

      {/* Contenido — scroll aislado, nunca el body */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '16px 14px 16px',
        }}
      >
        {tab === 'partidos' && (
          <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {liveCount === 0 && <Countdown targetDate={firstMatchDate} />}
            {favorite && (
              <FavoriteTeamCard
                team={favorite}
                matches={matches}
                timeZone={timeZone}
                onRemove={() => saveFavorite(null)}
              />
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
      </main>

      {/* Bottom nav — siempre visible, igual en móvil y desktop */}
      <nav
        style={{
          flexShrink: 0,
          display: 'flex',
          borderTop: '1px solid var(--glass-border)',
          background: 'var(--lacquer-deep)',
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
  )
}
