'use client'

import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Standing, Match } from '@/types/football'
import { formatTime, formatDateKey } from '@/lib/format-date'

const LIVE_S = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE_S = new Set(['FINISHED', 'AWARDED'])

const GROUP_ACCENT: Record<string, string> = {
  GROUP_A: 'var(--kinpaku)',
  GROUP_B: 'var(--patina)',
  GROUP_C: 'oklch(76% 0.14 145)',
  GROUP_D: 'oklch(74% 0.13 290)',
  GROUP_E: 'oklch(72% 0.14 25)',
  GROUP_F: 'var(--kinpaku-rich)',
  GROUP_G: 'oklch(75% 0.13 220)',
  GROUP_H: 'oklch(79% 0.16 130)',
  GROUP_I: 'oklch(73% 0.14 340)',
  GROUP_J: 'var(--patina-pale)',
  GROUP_K: 'oklch(70% 0.12 260)',
  GROUP_L: 'var(--vermilion)',
}

interface Props {
  standing: Standing
  matches: Match[]
  timeZone: string
  onClose: () => void
}

function FixtureRow({ match, timeZone }: { match: Match; timeZone: string }) {
  const isLive = LIVE_S.has(match.status)
  const isDone = DONE_S.has(match.status)
  const dateLabel = new Intl.DateTimeFormat('es', {
    weekday: 'short', day: 'numeric', month: 'short', timeZone,
  }).format(new Date(match.utcDate))

  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        borderBottom: '1px solid var(--hairline)',
        borderLeft: isLive ? '3px solid var(--patina)' : '3px solid transparent',
      }}
    >
      {/* Date / status */}
      <div className="shrink-0 w-16 text-right">
        {isLive ? (
          <span className="eyebrow flex items-center gap-1 justify-end" style={{ color: 'var(--patina)' }}>
            <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--patina)' }} />
            LIVE
          </span>
        ) : (
          <>
            <p className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{dateLabel}</p>
            <p className="eyebrow tabnum" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
              {isDone ? 'FT' : formatTime(match.utcDate, timeZone)}
            </p>
          </>
        )}
      </div>

      {/* Home team */}
      <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
        <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-warm)' }}>
          {match.homeTeam.shortName}
        </span>
        {match.homeTeam.crest && (
          <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
            <Image src={match.homeTeam.crest} alt={match.homeTeam.name} fill className="object-contain" sizes="20px" unoptimized />
          </div>
        )}
      </div>

      {/* Score / VS */}
      <div
        className="shrink-0 flex items-center justify-center"
        style={{
          minWidth: 52,
          background: 'var(--raised-lacquer)',
          borderRadius: 6,
          padding: '4px 8px',
        }}
      >
        {isDone || isLive ? (
          <span className="tabnum text-sm font-bold" style={{ color: isLive ? 'var(--patina)' : 'var(--champagne)', letterSpacing: '-0.02em' }}>
            {match.score.fullTime.home ?? 0}–{match.score.fullTime.away ?? 0}
          </span>
        ) : (
          <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.65rem', fontWeight: 700 }}>VS</span>
        )}
      </div>

      {/* Away team */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {match.awayTeam.crest && (
          <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
            <Image src={match.awayTeam.crest} alt={match.awayTeam.name} fill className="object-contain" sizes="20px" unoptimized />
          </div>
        )}
        <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-warm)' }}>
          {match.awayTeam.shortName}
        </span>
      </div>
    </div>
  )
}

export default function GroupDrawer({ standing, matches, timeZone, onClose }: Props) {
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const handleClose = useCallback(() => onClose(), [onClose])

  const accent = GROUP_ACCENT[standing.group] ?? 'var(--kinpaku)'
  const label = standing.group.replace('GROUP_', 'Grupo ')

  const groupMatches = matches
    .filter((m) => m.group === standing.group)
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))

  // Group fixtures by matchday label (date bucket)
  const byDate = new Map<string, Match[]>()
  for (const m of groupMatches) {
    const key = formatDateKey(m.utcDate, timeZone)
    byDate.set(key, [...(byDate.get(key) ?? []), m])
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [handleClose])

  if (!mounted) return null

  return createPortal(
    <>
      <div
        className="hidden sm:block fixed inset-0 z-40"
        style={{ background: 'oklch(4% 0.004 95 / 0.85)' }}
        onClick={handleClose}
        aria-hidden="true"
      />

      <div
        className="fixed inset-0 z-50 flex flex-col overflow-hidden sm:right-auto sm:max-w-lg"
        style={{ background: 'var(--lacquer)', borderRight: '1px solid var(--hairline)' }}
        role="dialog"
        aria-label={`Detalles ${label}`}
      >
        {/* Header */}
        <div
          className="shrink-0"
          style={{ borderBottom: '1px solid var(--hairline)', paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="w-1.5 h-7 shrink-0 rounded-full" style={{ background: accent }} aria-hidden="true" />
            <h2 className="text-xl font-bold flex-1" style={{ color: 'var(--champagne)', letterSpacing: '0.02em' }}>
              {label}
            </h2>
            <button
              onClick={handleClose}
              className="shrink-0 w-8 h-8 flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-(--kinpaku) transition-colors"
              style={{ color: 'var(--text-muted)', borderRadius: 'var(--r-sm)' }}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Scrollable content */}
        <div
          className="overflow-y-auto flex-1 min-h-0"
          style={{
            overscrollBehavior: 'contain',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          {/* Standings table */}
          <div className="px-4 pt-4 pb-2">
            <p className="eyebrow mb-3" style={{ color: 'var(--text-disabled)', letterSpacing: '0.12em' }}>TABLA DE POSICIONES</p>
            <div className="overflow-hidden" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 10 }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
                    <th className="text-left pl-3 pr-2 py-2 eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem', width: '2rem' }}>#</th>
                    <th className="text-left px-2 py-2 eyebrow w-full" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>EQUIPO</th>
                    {['PJ', 'G', 'E', 'P', 'DG', 'PTS'].map((h) => (
                      <th key={h} className="px-2 py-2 eyebrow tabnum text-center" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {standing.table.map((entry, i) => {
                    const qualifies = i < 2
                    return (
                      <tr
                        key={entry.team.id}
                        style={{
                          borderBottom: i < standing.table.length - 1 ? '1px solid var(--hairline)' : undefined,
                          borderLeft: qualifies ? `2px solid ${accent}` : '2px solid transparent',
                          background: qualifies ? `color-mix(in srgb, ${accent} 5%, transparent)` : undefined,
                        }}
                      >
                        <td className="pl-3 pr-2 py-2.5">
                          <span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{entry.position}</span>
                        </td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            {entry.team.crest && (
                              <div className="relative shrink-0 overflow-hidden rounded-sm" style={{ width: 20, height: 14 }}>
                                <Image src={entry.team.crest} alt={entry.team.name} fill unoptimized className="object-cover" sizes="20px" />
                              </div>
                            )}
                            <span className="text-xs font-semibold truncate" style={{ color: qualifies ? 'var(--text-warm)' : 'var(--text-muted)' }}>
                              {entry.team.shortName}
                            </span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.playedGames}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.won}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.draw}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.lost}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>
                          {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                        </td>
                        <td className="px-2 py-2.5 text-center tabnum text-sm font-bold" style={{ color: 'var(--kinpaku)' }}>{entry.points}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Fixtures */}
          {groupMatches.length > 0 && (
            <div className="px-4 pt-4">
              <p className="eyebrow mb-3" style={{ color: 'var(--text-disabled)', letterSpacing: '0.12em' }}>PARTIDOS DEL GRUPO</p>
              <div style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 10, overflow: 'hidden' }}>
                {Array.from(byDate.entries()).map(([dateKey, dayMatches]) => (
                  <div key={dateKey}>
                    <div className="px-4 py-1.5" style={{ background: 'var(--graphite)', borderBottom: '1px solid var(--hairline)' }}>
                      <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.6rem' }}>
                        {new Intl.DateTimeFormat('es', { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(new Date(dateKey + 'T12:00:00'))}
                      </span>
                    </div>
                    {dayMatches.map((m) => <FixtureRow key={m.id} match={m} timeZone={timeZone} />)}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Venue legend if any match has venue */}
          {groupMatches.some((m) => m.venue) && (
            <div className="px-4 pt-3">
              {groupMatches.filter((m) => m.venue).map((m) => (
                <div key={m.id} className="flex items-center gap-1.5 mb-1">
                  <Icon icon="material-symbols:stadium-outline" width={11} height={11} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
                  <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>
                    {m.homeTeam.tla} vs {m.awayTeam.tla} · {m.venue!.name}, {m.venue!.city}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
