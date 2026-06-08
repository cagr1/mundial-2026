'use client'

import { useState, useEffect, useCallback, useMemo, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import Link from 'next/link'
import { Icon } from '@iconify/react'
import { useTranslations, useLocale } from 'next-intl'
import { Team, TeamDetail, Player, Match } from '@/types/football'
import { formatTime, formatDateKey } from '@/lib/format-date'

const POSITION_ORDER = ['Goalkeeper', 'Defence', 'Midfield', 'Offence'] as const
const POSITION_COLOR: Record<string, string> = {
  Goalkeeper: 'var(--kinpaku)', Defence: 'var(--patina)',
  Midfield: 'oklch(74% 0.13 290)', Offence: 'var(--vermilion)',
}
const POSITION_ABBR: Record<string, string> = { Goalkeeper: 'GK', Defence: 'DF', Midfield: 'MF', Offence: 'FW' }

const LIVE_S = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE_S = new Set(['FINISHED', 'AWARDED'])

function calcAge(dob: string): number {
  return Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 86_400_000))
}

function playerInternalHref(player: Player, teamId: number): string {
  if (player.source === 'Wikipedia' && player.profileUrl) {
    const match = player.profileUrl.match(/\/wiki\/(.+)$/)
    if (match) {
      const slug = match[1]
      const sp = new URLSearchParams()
      if (player.position) sp.set('pos', player.position)
      if (player.club) sp.set('club', player.club)
      if (player.caps != null) sp.set('caps', String(player.caps))
      if (player.goals != null) sp.set('goals', String(player.goals))
      if (player.nationality) sp.set('nat', player.nationality)
      if (player.dateOfBirth) sp.set('dob', player.dateOfBirth)
      sp.set('from', String(teamId))
      const qs = sp.toString()
      return `/jugador/wiki/${slug}${qs ? `?${qs}` : ''}`
    }
  }
  return `/jugador/${player.id}?from=${teamId}`
}

function MatchRow({ match, teamId, timeZone }: { match: Match; teamId: number; timeZone: string }) {
  const t = useTranslations('team')
  const tMatch = useTranslations('match')
  const locale = useLocale()
  const isLive = LIVE_S.has(match.status)
  const isDone = DONE_S.has(match.status)
  const isHome = match.homeTeam.id === teamId
  const opponent = isHome ? match.awayTeam : match.homeTeam
  const myScore = isHome ? match.score.fullTime.home : match.score.fullTime.away
  const opScore = isHome ? match.score.fullTime.away : match.score.fullTime.home

  let resultColor = 'var(--text-muted)'
  if (isDone && myScore != null && opScore != null) {
    if (myScore > opScore) resultColor = 'var(--patina)'
    else if (myScore < opScore) resultColor = 'var(--vermilion)'
    else resultColor = 'var(--kinpaku)'
  }

  const dateStr = new Intl.DateTimeFormat(locale, { weekday: 'short', day: 'numeric', month: 'short', timeZone }).format(new Date(match.utcDate))

  return (
    <div className="flex items-center gap-3 px-4 py-3"
      style={{ borderBottom: '1px solid var(--hairline)', borderLeft: isLive ? '3px solid var(--patina)' : '3px solid transparent' }}>
      <div className="shrink-0 w-20">
        {isLive ? (
          <span className="eyebrow flex items-center gap-1" style={{ color: 'var(--patina)' }}>
            <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--patina)' }} />
            {t('liveNow')}
          </span>
        ) : (
          <>
            <p className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{dateStr}</p>
            <p className="eyebrow tabnum mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.65rem' }}>
              {isDone ? tMatch('ft') : formatTime(match.utcDate, timeZone)}
            </p>
          </>
        )}
      </div>

      <div className="flex items-center gap-2 flex-1 min-w-0">
        {opponent.crest ? (
          <div className="relative shrink-0" style={{ width: 24, height: 24 }}>
            <Image src={opponent.crest} alt={opponent.name} fill className="object-contain" sizes="24px" unoptimized />
          </div>
        ) : (
          <div className="shrink-0 w-6 h-6 flex items-center justify-center" style={{ background: 'var(--graphite)', borderRadius: 4 }}>
            <span style={{ fontSize: 8, color: 'var(--text-disabled)', fontWeight: 700 }}>{opponent.tla}</span>
          </div>
        )}
        <div className="min-w-0">
          <p className="text-xs font-semibold truncate" style={{ color: 'var(--text-warm)' }}>
            <span style={{ color: 'var(--text-disabled)', fontWeight: 400, marginRight: 4 }}>{isHome ? 'vs' : '@'}</span>
            {opponent.shortName}
          </p>
          <p className="eyebrow truncate mt-0.5" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>
            {match.group ? match.group.replace('GROUP_', 'Grupo ') : match.stage.replace(/_/g, ' ')}
          </p>
        </div>
      </div>

      {isDone || isLive ? (
        <span className="tabnum text-base font-bold shrink-0" style={{ color: resultColor, minWidth: 36, textAlign: 'right' }}>
          {myScore}–{opScore}
        </span>
      ) : (
        <span className="eyebrow shrink-0 tabnum" style={{ color: 'var(--text-disabled)', fontSize: '0.65rem', minWidth: 36, textAlign: 'right' }}>
          {formatTime(match.utcDate, timeZone)}
        </span>
      )}
    </div>
  )
}

function PlayerCard({ player, teamId }: { player: Player; teamId: number }) {
  const t = useTranslations('team')
  const [flipped, setFlipped] = useState(false)
  const color = player.position ? POSITION_COLOR[player.position] : 'var(--text-muted)'
  const detailHref = playerInternalHref(player, teamId)

  return (
    <button onClick={() => setFlipped((f) => !f)} className="relative w-full text-left"
      style={{ perspective: '600px', height: '88px' }} aria-label={`${player.name}`}>
      <div className="absolute inset-0 transition-transform duration-500"
        style={{ transformStyle: 'preserve-3d', transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}>
        <div className="absolute inset-0 flex items-center gap-3 px-3"
          style={{ backfaceVisibility: 'hidden', pointerEvents: flipped ? 'none' : 'auto', background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-md)', borderLeft: `3px solid ${color}` }}>
          <div className="shrink-0 w-7 h-7 flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--graphite)', borderRadius: 'var(--r-xs)', color }}>
            {POSITION_ABBR[player.position ?? ''] ?? '?'}
          </div>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-warm)' }}>
            {player.name}
            {player.club && (
              <span className="block eyebrow mt-0.5 truncate" style={{ color: 'var(--text-disabled)', fontSize: '0.56rem' }}>{player.club}</span>
            )}
          </span>
          <span className="eyebrow shrink-0" style={{ color: 'var(--text-disabled)', fontSize: '0.6rem' }}>{t('tap')}</span>
        </div>

        <div className="absolute inset-0 flex items-center justify-between px-4 gap-3"
          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)', pointerEvents: flipped ? 'auto' : 'none', background: 'var(--graphite)', border: `1px solid ${color}`, borderRadius: 'var(--r-md)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--champagne)' }}>{player.name}</p>
            <p className="eyebrow mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>{player.club ?? player.nationality}</p>
            {(player.caps != null || player.goals != null) && (
              <p className="eyebrow mt-0.5 tabnum" style={{ color: 'var(--text-disabled)', fontSize: '0.56rem' }}>
                {player.caps ?? 0} PJ · {player.goals ?? 0} G
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {player.dateOfBirth && (
              <div className="text-right">
                <p className="tabnum text-2xl font-bold leading-none" style={{ color }}>{calcAge(player.dateOfBirth)}</p>
                <p className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>{t('years')}</p>
              </div>
            )}
            <Link href={detailHref} className="eyebrow px-2 py-1 border"
              style={{ color: 'var(--kinpaku)', borderColor: 'var(--hairline-gold)', borderRadius: 'var(--r-xs)', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}>
              →
            </Link>
          </div>
        </div>
      </div>
    </button>
  )
}

interface Props { team: Team; onClose: () => void; allMatches?: Match[]; timeZone?: string }
type DrawerTab = 'partidos' | 'equipo'

export default function TeamDrawer({ team, onClose, allMatches = [], timeZone = 'UTC' }: Props) {
  const t = useTranslations('team')
  const locale = useLocale()
  const [drawerTab, setDrawerTab] = useState<DrawerTab>('partidos')
  const [detail, setDetail] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [posFilter, setPosFilter] = useState<string>('ALL')
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)
  const handleClose = useCallback(() => onClose(), [onClose])

  const teamMatches = useMemo(
    () => allMatches.filter((m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id).sort((a, b) => a.utcDate.localeCompare(b.utcDate)),
    [allMatches, team.id],
  )

  const matchesByDate = useMemo(() => {
    const map = new Map<string, Match[]>()
    for (const m of teamMatches) {
      const key = formatDateKey(m.utcDate, timeZone)
      map.set(key, [...(map.get(key) ?? []), m])
    }
    return map
  }, [teamMatches, timeZone])

  useEffect(() => {
    const params = new URLSearchParams({ name: team.name, shortName: team.shortName, tla: team.tla, crest: team.crest })
    fetch(`/api/teams/${team.id}?${params}`)
      .then((r) => r.json())
      .then((d: TeamDetail) => {
        setDetail({ ...d, squad: Array.isArray(d.squad) ? d.squad : [] })
        setError(d.error ?? d.fallbackReason ?? null)
        setLoading(false)
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : t('squadUnavailableDesc')
        setDetail({ ...team, squad: [], squadSource: 'football-data.org', fallbackReason: message })
        setError(message)
        setLoading(false)
      })
  }, [team, t])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [handleClose])

  const squad = Array.isArray(detail?.squad) ? detail.squad : []
  const grouped = squad.reduce<Record<string, Player[]>>((acc, p) => {
    const pos = p.position ?? 'Unknown'
    acc[pos] = [...(acc[pos] ?? []), p]
    return acc
  }, {})
  const positionsWithPlayers = POSITION_ORDER.filter((pos) => (grouped[pos] ?? []).length > 0)
  const visiblePositions = posFilter === 'ALL' ? positionsWithPlayers : positionsWithPlayers.filter((p) => p === posFilter)

  if (!mounted) return null

  const DRAWER_TABS: { id: DrawerTab; label: string }[] = [
    { id: 'partidos', label: t('tabMatches') },
    { id: 'equipo',   label: t('tabSquad') },
  ]

  return createPortal(
    <>
      <div className="hidden sm:block fixed inset-0 z-40" style={{ background: 'oklch(4% 0.004 95 / 0.85)' }} onClick={handleClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden sm:right-auto sm:max-w-lg"
        style={{ background: 'var(--lacquer)', borderRight: '1px solid var(--hairline)' }}
        role="dialog" aria-label={team.name}>
        <div className="shrink-0" style={{ paddingTop: 'env(safe-area-inset-top)', borderBottom: '1px solid var(--hairline)' }}>
          <div className="flex items-center gap-3 px-5 py-3">
            {team.crest && (
              <div className="relative w-9 h-9 shrink-0">
                <Image src={team.crest} alt={team.name} fill className="object-contain" sizes="36px" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="text-base font-bold truncate" style={{ color: 'var(--champagne)' }}>{team.name}</h2>
              {detail?.coach && (
                <p className="eyebrow truncate" style={{ color: 'var(--text-disabled)', marginTop: 1 }}>
                  {t('dt')} · {detail.coach.name}
                </p>
              )}
            </div>
            <button onClick={handleClose} className="shrink-0 w-8 h-8 flex items-center justify-center focus-visible:outline-none"
              style={{ color: 'var(--text-muted)', borderRadius: 'var(--r-sm)' }} aria-label={t('close')}>
              ✕
            </button>
          </div>

          <div className="flex px-5 pb-0" role="tablist">
            {DRAWER_TABS.map((tab) => {
              const isActive = drawerTab === tab.id
              return (
                <button key={tab.id} role="tab" aria-selected={isActive} onClick={() => setDrawerTab(tab.id)}
                  className="relative pb-2.5 pt-1 text-sm font-semibold transition-colors focus-visible:outline-none"
                  style={{ color: isActive ? 'var(--champagne)' : 'var(--text-muted)', marginRight: 24, background: 'transparent', border: 'none', cursor: 'pointer' }}>
                  {tab.label}
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full transition-all"
                    style={{ background: isActive ? 'var(--kinpaku)' : 'transparent' }} aria-hidden="true" />
                </button>
              )
            })}
          </div>
        </div>

        {drawerTab === 'partidos' && (
          <div className="overflow-y-auto flex-1 min-h-0" style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}>
            {teamMatches.length === 0 ? (
              <div className="py-16 text-center px-6">
                <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>{t('noMatches')}</p>
              </div>
            ) : (
              <div style={{ background: 'var(--raised-lacquer)' }}>
                {Array.from(matchesByDate.entries()).map(([dateKey, dayMatches]) => (
                  <div key={dateKey}>
                    <div className="px-4 py-2" style={{ background: 'var(--graphite)', borderBottom: '1px solid var(--hairline)' }}>
                      <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.6rem', letterSpacing: '0.1em' }}>
                        {new Intl.DateTimeFormat(locale, { weekday: 'long', day: 'numeric', month: 'long', timeZone }).format(new Date(dateKey + 'T12:00:00'))}
                      </span>
                    </div>
                    {dayMatches.map((m) => <MatchRow key={m.id} match={m} teamId={team.id} timeZone={timeZone} />)}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {drawerTab === 'equipo' && (
          <>
            {!loading && squad.length > 0 && (
              <div className="flex gap-2 px-5 py-2.5 shrink-0 overflow-x-auto" style={{ borderBottom: '1px solid var(--hairline)' }}>
                {(['ALL', ...positionsWithPlayers] as string[]).map((pos) => {
                  const isActive = posFilter === pos
                  const label = pos === 'ALL' ? t('all') : (POSITION_ABBR[pos] ?? pos)
                  const count = pos === 'ALL' ? squad.length : (grouped[pos] ?? []).length
                  return (
                    <button key={pos} onClick={() => setPosFilter(pos)} className="eyebrow shrink-0 flex items-center gap-1.5 transition-colors"
                      style={{ padding: '4px 10px', background: isActive ? 'var(--kinpaku)' : 'transparent', color: isActive ? 'var(--lacquer-deep)' : 'var(--text-muted)', border: `1px solid ${isActive ? 'var(--kinpaku)' : 'var(--hairline)'}`, borderRadius: 'var(--r-sm)', fontWeight: isActive ? 700 : 500 }}>
                      {label}
                      <span className="tabnum" style={{ fontSize: '0.58rem', color: isActive ? 'var(--lacquer-deep)' : 'var(--text-disabled)', fontWeight: isActive ? 700 : 400 }}>{count}</span>
                    </button>
                  )
                })}
              </div>
            )}

            <div className="overflow-y-auto flex-1 min-h-0 px-4 pt-3 space-y-4"
              style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(12px + env(safe-area-inset-bottom, 0px))' }}>
              {loading ? (
                <div className="space-y-2 pt-1">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-22 animate-pulse" style={{ background: 'var(--raised-lacquer)', borderRadius: 'var(--r-md)' }} />
                  ))}
                </div>
              ) : squad.length ? (
                visiblePositions.map((pos) => {
                  const players = grouped[pos] ?? []
                  if (!players.length) return null
                  return (
                    <section key={pos}>
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-1 h-3 shrink-0" style={{ background: POSITION_COLOR[pos], borderRadius: '1px' }} aria-hidden="true" />
                        <h3 className="eyebrow" style={{ color: POSITION_COLOR[pos], letterSpacing: '0.14em' }}>
                          {t(pos as 'Goalkeeper' | 'Defence' | 'Midfield' | 'Offence')}
                        </h3>
                        <span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)' }}>{players.length}</span>
                      </div>
                      <div className="space-y-1.5">
                        {players.map((p) => <PlayerCard key={p.id} player={p} teamId={team.id} />)}
                      </div>
                    </section>
                  )
                })
              ) : (
                <div className="px-4 py-5 text-center" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}>
                  <p className="eyebrow mb-2" style={{ color: 'var(--kinpaku)' }}>{t('squadUnavailable')}</p>
                  <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                    {error ?? t('squadUnavailableDesc')}
                  </p>
                </div>
              )}
            </div>

            <div className="px-5 pt-2.5 shrink-0" style={{ borderTop: '1px solid var(--hairline)', paddingBottom: 'calc(10px + env(safe-area-inset-bottom, 0px))' }}>
              <p className="eyebrow text-center" style={{ color: 'var(--text-disabled)' }}>
                {detail?.squadSource ?? 'Wikipedia'} · {t('playerTip')}
              </p>
            </div>
          </>
        )}
      </div>
    </>,
    document.body,
  )
}
