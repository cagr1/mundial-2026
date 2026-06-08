'use client'

// PROTOTYPE variant B — "Dense Native"
// Idea: edge-to-edge en móvil, max 540px en desktop, bottom nav sólo íconos con pill activo.
// Sin bordes de contenedor. Se siente como ESPN/Yahoo Sports app — denso, directo, táctil.
// El indicador activo es un pill translúcido DETRÁS del ícono, no una línea arriba.

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

const TABS: { id: Tab; icon: string; iconActive: string; label: string }[] = [
  { id: 'partidos', icon: 'material-symbols:calendar-month-outline', iconActive: 'material-symbols:calendar-month', label: 'Partidos' },
  { id: 'grupos', icon: 'material-symbols:grid-view-outline', iconActive: 'material-symbols:grid-view', label: 'Grupos' },
  { id: 'equipos', icon: 'material-symbols:shield-outline', iconActive: 'material-symbols:shield', label: 'Equipos' },
  { id: 'bracket', icon: 'material-symbols:account-tree-outline', iconActive: 'material-symbols:account-tree', label: 'Bracket' },
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
  return (
    <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' as const }}>
      {[null, ...matchdays].map(md => {
        const isActive = selected === md
        return (
          <button
            key={md ?? 'all'}
            onClick={() => onSelect(md)}
            style={{
              flexShrink: 0,
              fontFamily: 'var(--font-jetbrains)',
              fontSize: '0.65rem',
              fontWeight: 500,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              padding: '5px 10px',
              borderRadius: 4,
              border: isActive ? 'none' : '1px solid var(--glass-border)',
              background: isActive ? 'var(--kinpaku)' : 'transparent',
              color: isActive ? 'var(--lacquer-deep)' : 'var(--text-muted)',
              cursor: 'pointer',
              WebkitTapHighlightColor: 'transparent',
              transition: 'background 120ms, color 120ms',
            }}
          >
            {md === null ? 'Todos' : `J${md}`}
          </button>
        )
      })}
    </div>
  )
}

export default function VariantB({ matches, standings, teams, liveCount, firstMatchDate }: Props) {
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

  const NAV_H = 64

  return (
    <div
      style={{
        maxWidth: 540,
        margin: '0 auto',
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--lacquer-deep)',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header ultra-minimal — sin borde inferior, sólo separación de color */}
      <header
        style={{
          height: 48,
          flexShrink: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingInline: 16,
          background: 'var(--lacquer)',
          paddingTop: 'env(safe-area-inset-top)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', width: 22, height: 22, flexShrink: 0 }}>
            <Image src="/brand-mark.svg" alt="" fill sizes="22px" />
          </div>
          <span style={{
            color: 'var(--champagne)',
            fontWeight: 700,
            fontSize: '0.82rem',
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-hanken)',
          }}>
            WC 2026
          </span>
          {liveCount > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              padding: '2px 7px',
              borderRadius: 99,
              background: 'oklch(70% 0.12 188 / 0.12)',
              border: '1px solid oklch(70% 0.12 188 / 0.3)',
            }}>
              <span className="live-dot" style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--patina)', display: 'block' }} />
              <span style={{ color: 'var(--patina)', fontFamily: 'var(--font-jetbrains)', fontSize: '0.6rem', fontWeight: 500, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                {liveCount} live
              </span>
            </div>
          )}
        </div>
        <CalendarButton />
      </header>

      {/* Tab label strip — muestra qué sección está activa con nombre grande */}
      <div style={{
        flexShrink: 0,
        paddingInline: 16,
        paddingBlock: '10px 8px',
        background: 'var(--lacquer)',
      }}>
        <h1 style={{
          fontFamily: 'var(--font-hanken)',
          fontWeight: 800,
          fontSize: '1.3rem',
          color: 'var(--champagne)',
          letterSpacing: '-0.02em',
          margin: 0,
        }}>
          {TABS.find(t => t.id === tab)?.label}
        </h1>
      </div>

      {/* Contenido — scroll aislado, sin padding lateral en el wrapper */}
      <main
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          padding: '12px 14px 16px',
          background: 'var(--lacquer-deep)',
        }}
      >
        {tab === 'partidos' && (
          <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
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
          <div className="tab-panel" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
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

      {/* Bottom nav — íconos ÚNICAMENTE con pill activo detrás del ícono */}
      <nav
        style={{
          flexShrink: 0,
          height: NAV_H,
          display: 'flex',
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
              aria-label={t.label}
              aria-selected={isActive}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                WebkitTapHighlightColor: 'transparent',
                transition: 'opacity 100ms',
              }}
              onPointerDown={e => (e.currentTarget.style.opacity = '0.5')}
              onPointerUp={e => (e.currentTarget.style.opacity = '1')}
              onPointerLeave={e => (e.currentTarget.style.opacity = '1')}
            >
              {/* Pill container — el fondo aparece/desaparece con el estado activo */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 48,
                height: 32,
                borderRadius: 16,
                background: isActive ? 'oklch(84% 0.19 80.46 / 0.15)' : 'transparent',
                transition: 'background 150ms',
              }}>
                <Icon
                  icon={isActive ? t.iconActive : t.icon}
                  width={26}
                  height={26}
                  style={{ color: isActive ? 'var(--kinpaku)' : 'var(--text-disabled)' }}
                />
              </div>
            </button>
          )
        })}
      </nav>
    </div>
  )
}
