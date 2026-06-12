'use client'

import { useEffect, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useTranslations, useLocale } from 'next-intl'
import { Standing, Match } from '@/types/football'
import { formatTime, formatDateKey } from '@/lib/format-date'
import { localizedCountry } from '@/lib/country-names'

const LIVE_S = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE_S = new Set(['FINISHED', 'AWARDED'])

const GROUP_ACCENT: Record<string, string> = {
  GROUP_A: 'var(--kinpaku)', GROUP_B: 'var(--patina)',
  GROUP_C: 'oklch(76% 0.14 145)', GROUP_D: 'oklch(74% 0.13 290)',
  GROUP_E: 'oklch(72% 0.14 25)', GROUP_F: 'var(--kinpaku-rich)',
  GROUP_G: 'oklch(75% 0.13 220)', GROUP_H: 'oklch(79% 0.16 130)',
  GROUP_I: 'oklch(73% 0.14 340)', GROUP_J: 'var(--patina-pale)',
  GROUP_K: 'oklch(70% 0.12 260)', GROUP_L: 'var(--vermilion)',
}

interface Props { standing: Standing; matches: Match[]; timeZone: string; onClose: () => void; onSelectTeam?: (teamId: number) => void }

function TeamChip({ name, crest, align, onClick }: { name: string; crest: string; align: 'left' | 'right'; onClick?: () => void }) {
  const content = (
    <div className="flex items-center gap-2 flex-1 min-w-0" style={{ justifyContent: align === 'right' ? 'flex-end' : 'flex-start' }}>
      {align === 'right' && <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-warm)' }}>{name}</span>}
      {crest && (
        <div className="relative shrink-0" style={{ width: 20, height: 20 }}>
          <Image src={crest} alt={name} fill className="object-contain" sizes="20px" unoptimized />
        </div>
      )}
      {align === 'left' && <span className="text-xs font-semibold truncate" style={{ color: 'var(--text-warm)' }}>{name}</span>}
    </div>
  )

  if (!onClick) return content

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      className="flex-1 min-w-0 active:opacity-70 transition-opacity"
      style={{ background: 'transparent', border: 'none', padding: 0, cursor: 'pointer', textAlign: align }}
    >
      {content}
    </button>
  )
}

function FixtureRow({ match, timeZone, onSelectTeam }: { match: Match; timeZone: string; onSelectTeam?: (teamId: number) => void }) {
  const tMatch = useTranslations('match')
  const locale = useLocale()
  const isLive = LIVE_S.has(match.status)
  const isDone = DONE_S.has(match.status)
  const dateLabel = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone }).format(new Date(match.utcDate))

  return (
    <div className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: '1px solid var(--hairline)', borderLeft: isLive ? '3px solid var(--patina)' : '3px solid transparent' }}>
      <div className="shrink-0 w-16 text-right">
        {isLive ? (
          <span className="eyebrow flex items-center gap-1 justify-end" style={{ color: 'var(--patina)' }}>
            <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--patina)' }} />
            {tMatch('live')}
          </span>
        ) : (
          <>
            <p className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{dateLabel}</p>
            <p className="eyebrow tabnum" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
              {isDone ? tMatch('ft') : formatTime(match.utcDate, timeZone)}
            </p>
          </>
        )}
      </div>

      <TeamChip
        name={localizedCountry(match.homeTeam.tla, locale, match.homeTeam.shortName)}
        crest={match.homeTeam.crest}
        align="right"
        onClick={onSelectTeam ? () => onSelectTeam(match.homeTeam.id) : undefined}
      />

      <div className="shrink-0 flex items-center justify-center" style={{ minWidth: 52, background: 'var(--raised-lacquer)', borderRadius: 6, padding: '4px 8px' }}>
        {isDone || isLive ? (
          <span className="tabnum text-sm font-bold" style={{ color: isLive ? 'var(--patina)' : 'var(--champagne)', letterSpacing: '-0.02em' }}>
            {match.score.fullTime.home ?? 0}–{match.score.fullTime.away ?? 0}
          </span>
        ) : (
          <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.65rem', fontWeight: 700 }}>VS</span>
        )}
      </div>

      <TeamChip
        name={localizedCountry(match.awayTeam.tla, locale, match.awayTeam.shortName)}
        crest={match.awayTeam.crest}
        align="left"
        onClick={onSelectTeam ? () => onSelectTeam(match.awayTeam.id) : undefined}
      />
    </div>
  )
}

export default function GroupDrawer({ standing, matches, timeZone, onClose, onSelectTeam }: Props) {
  const t = useTranslations('groups')
  const tTeam = useTranslations('team')
  const locale = useLocale()
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const handleClose = useCallback(() => onClose(), [onClose])

  const accent = GROUP_ACCENT[standing.group] ?? 'var(--kinpaku)'
  const label = standing.group.replace('GROUP_', 'Grupo ')

  const groupMatches = matches
    .filter((m) => m.group === standing.group)
    .sort((a, b) => a.utcDate.localeCompare(b.utcDate))

  const byDate = new Map<string, Match[]>()
  for (const m of groupMatches) {
    const key = formatDateKey(m.utcDate, timeZone)
    byDate.set(key, [...(byDate.get(key) ?? []), m])
  }

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [handleClose])

  if (!mounted) return null

  return createPortal(
    <>
      <div className="hidden sm:block fixed inset-0 z-40" style={{ background: 'oklch(4% 0.004 95 / 0.85)' }} onClick={handleClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden sm:right-auto sm:max-w-lg"
        style={{ background: 'var(--lacquer)', borderRight: '1px solid var(--hairline)' }}
        role="dialog" aria-label={`${label}`}>
        <div className="shrink-0" style={{ borderBottom: '1px solid var(--hairline)', paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center gap-3 px-5 py-3">
            <div className="w-1.5 h-7 shrink-0 rounded-full" style={{ background: accent }} aria-hidden="true" />
            <h2 className="text-xl font-bold flex-1" style={{ color: 'var(--champagne)', letterSpacing: '0.02em' }}>{label}</h2>
            <button onClick={handleClose} className="shrink-0 w-8 h-8 flex items-center justify-center focus-visible:outline-none"
              style={{ color: 'var(--text-muted)', borderRadius: 'var(--r-sm)' }} aria-label={tTeam('close')}>
              ✕
            </button>
          </div>
        </div>

        <div className="overflow-y-auto flex-1 min-h-0" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
          <div className="px-4 pt-4 pb-2">
            <p className="eyebrow mb-3" style={{ color: 'var(--text-disabled)', letterSpacing: '0.12em' }}>{t('standings')}</p>
            <div className="overflow-hidden" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 10 }}>
              <table className="w-full">
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
                    <th className="text-left pl-3 pr-2 py-2 eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem', width: '2rem' }}>#</th>
                    <th className="text-left px-2 py-2 eyebrow w-full" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{t('team')}</th>
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
                        onClick={onSelectTeam ? () => onSelectTeam(entry.team.id) : undefined}
                        className={onSelectTeam ? 'active:bg-(--graphite)/30' : undefined}
                        style={{
                          borderBottom: i < standing.table.length - 1 ? '1px solid var(--hairline)' : undefined,
                          borderLeft: qualifies ? `2px solid ${accent}` : '2px solid transparent',
                          background: qualifies ? `color-mix(in srgb, ${accent} 5%, transparent)` : undefined,
                          cursor: onSelectTeam ? 'pointer' : undefined,
                        }}
                      >
                        <td className="pl-3 pr-2 py-2.5"><span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{entry.position}</span></td>
                        <td className="px-2 py-2.5">
                          <div className="flex items-center gap-2">
                            {entry.team.crest && (
                              <div className="relative shrink-0 overflow-hidden rounded-sm" style={{ width: 20, height: 14 }}>
                                <Image src={entry.team.crest} alt={entry.team.name} fill unoptimized className="object-cover" sizes="20px" />
                              </div>
                            )}
                            <span className="text-xs font-semibold truncate" style={{ color: qualifies ? 'var(--text-warm)' : 'var(--text-muted)' }}>{localizedCountry(entry.team.tla, locale, entry.team.shortName)}</span>
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.playedGames}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.won}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.draw}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.lost}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}</td>
                        <td className="px-2 py-2.5 text-center tabnum text-sm font-bold" style={{ color: 'var(--kinpaku)' }}>{entry.points}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {groupMatches.length > 0 && (
            <div className="px-4 pt-4">
              <p className="eyebrow mb-3" style={{ color: 'var(--text-disabled)', letterSpacing: '0.12em' }}>{t('fixtures')}</p>
              <div style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 10, overflow: 'hidden' }}>
                {Array.from(byDate.entries()).map(([dateKey, dayMatches]) => (
                  <div key={dateKey}>
                    <div className="px-4 py-1.5" style={{ background: 'var(--graphite)', borderBottom: '1px solid var(--hairline)' }}>
                      <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.6rem' }}>
                        {new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(new Date(dateKey + 'T12:00:00'))}
                      </span>
                    </div>
                    {dayMatches.map((m) => <FixtureRow key={m.id} match={m} timeZone={timeZone} onSelectTeam={onSelectTeam} />)}
                  </div>
                ))}
              </div>
            </div>
          )}

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
