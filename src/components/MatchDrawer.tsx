'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useTranslations, useLocale } from 'next-intl'
import { Match, MatchSummary, MatchEvent, TeamLineup, LineupPlayer } from '@/types/football'
import { localizedCountry } from '@/lib/country-names'
import { formatTime } from '@/lib/format-date'
import { useLiveClock } from '@/hooks/useLiveClock'

const LIVE_S = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE_S = new Set(['FINISHED', 'AWARDED'])

// Callbacks estables para useSyncExternalStore (evita el warning de snapshot no cacheado)
const emptySubscribe = () => () => {}
const getTrue = () => true
const getFalse = () => false

type DetailTab = 'lineup' | 'events' | 'stats'

// Estadísticas a mostrar, en orden, con su tratamiento.
const STAT_KEYS = [
  'possessionPct', 'totalShots', 'shotsOnTarget', 'wonCorners',
  'foulsCommitted', 'offsides', 'yellowCards', 'redCards',
  'totalPasses', 'totalTackles', 'saves',
] as const

function EventIcon({ type }: { type: MatchEvent['type'] }) {
  if (type === 'yellow-card' || type === 'red-card') {
    return (
      <span aria-hidden="true" style={{
        display: 'inline-block', width: 10, height: 14, borderRadius: 2,
        background: type === 'red-card' ? 'var(--vermilion)' : 'var(--kinpaku)',
      }} />
    )
  }
  if (type === 'substitution') {
    return <Icon icon="material-symbols:swap-horiz-rounded" width={16} height={16} style={{ color: 'var(--patina)' }} />
  }
  // goles (incl. penal / en propia)
  return <Icon icon="material-symbols:sports-soccer" width={16} height={16} style={{ color: 'var(--champagne)' }} />
}

function EventPlayers({ event }: { event: MatchEvent }) {
  const players = event.players.filter(Boolean)
  if (players.length === 0) return null

  if (event.type === 'substitution' && players.length >= 2) {
    return (
      <span className="flex min-w-0 items-center gap-1.5 text-xs leading-snug" style={{ color: 'var(--text-warm)' }}>
        <span className="truncate">{players[0]}</span>
        <Icon icon="material-symbols:arrow-forward-rounded" width={13} height={13} className="shrink-0" style={{ color: 'var(--text-disabled)' }} />
        <span className="truncate">{players[1]}</span>
      </span>
    )
  }

  return (
    <span className="min-w-0 truncate text-xs leading-snug" style={{ color: 'var(--text-warm)' }}>
      {players.join(' · ')}
    </span>
  )
}

function PlayerRow({ p, accent }: { p: LineupPlayer; accent: string }) {
  return (
    <div className="flex items-center gap-2 py-1">
      <span className="tabnum shrink-0 text-center" style={{
        width: 22, fontSize: 11, fontWeight: 700, color: accent,
        background: 'var(--graphite)', borderRadius: 4, padding: '1px 0',
      }}>
        {p.jersey || '–'}
      </span>
      <span className="truncate text-xs" style={{ color: 'var(--text-warm)', fontWeight: p.starter ? 600 : 500 }}>
        {p.name}
      </span>
      <span className="ml-auto shrink-0 flex items-center gap-1">
        {p.goals > 0 && (
          <span className="flex items-center gap-0.5">
            <Icon icon="material-symbols:sports-soccer" width={11} height={11} style={{ color: 'var(--text-faint)' }} />
            {p.goals > 1 && <span className="tabnum" style={{ fontSize: 9, color: 'var(--text-faint)' }}>{p.goals}</span>}
          </span>
        )}
        {p.redCards > 0
          ? <span style={{ width: 7, height: 10, borderRadius: 1, background: 'var(--vermilion)', display: 'inline-block' }} />
          : p.yellowCards > 0
            ? <span style={{ width: 7, height: 10, borderRadius: 1, background: 'var(--kinpaku)', display: 'inline-block' }} />
            : null}
        <span className="eyebrow shrink-0" style={{ fontSize: '0.5rem', color: 'var(--text-disabled)', minWidth: 24, textAlign: 'right' }}>
          {p.position}
        </span>
      </span>
    </div>
  )
}

function TeamLineupColumn({ lineup, name, accent, labels }: {
  lineup: TeamLineup; name: string; accent: string
  labels: { starters: string; bench: string; formation: string }
}) {
  return (
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2 mb-2">
        <span className="truncate font-bold text-sm" style={{ color: 'var(--champagne)' }}>{name}</span>
        {lineup.formation && (
          <span className="tabnum shrink-0 eyebrow" style={{ fontSize: '0.55rem', color: accent, letterSpacing: '0.06em' }}>
            {lineup.formation}
          </span>
        )}
      </div>
      <p className="eyebrow mb-1" style={{ color: 'var(--text-disabled)', fontSize: '0.52rem' }}>{labels.starters}</p>
      <div>{lineup.starters.map((p) => <PlayerRow key={p.id} p={p} accent={accent} />)}</div>
      {lineup.substitutes.length > 0 && (
        <>
          <p className="eyebrow mt-2 mb-1" style={{ color: 'var(--text-disabled)', fontSize: '0.52rem' }}>{labels.bench}</p>
          <div style={{ opacity: 0.75 }}>{lineup.substitutes.map((p) => <PlayerRow key={p.id} p={p} accent={accent} />)}</div>
        </>
      )}
    </div>
  )
}

function StatRow({ label, home, away }: { label: string; home: number; away: number }) {
  const total = home + away
  const homePct = total > 0 ? (home / total) * 100 : 50
  return (
    <div className="py-2">
      <div className="flex items-center justify-between mb-1">
        <span className="tabnum text-xs font-bold" style={{ color: 'var(--text-warm)' }}>{home % 1 === 0 ? home : home.toFixed(1)}</span>
        <span className="eyebrow" style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>{label}</span>
        <span className="tabnum text-xs font-bold" style={{ color: 'var(--text-warm)' }}>{away % 1 === 0 ? away : away.toFixed(1)}</span>
      </div>
      <div className="flex items-center gap-1" style={{ height: 4 }}>
        <div style={{ width: `${homePct}%`, height: '100%', background: 'var(--kinpaku)', borderRadius: 2, transition: 'width 0.3s' }} />
        <div style={{ width: `${100 - homePct}%`, height: '100%', background: 'var(--patina)', borderRadius: 2, transition: 'width 0.3s' }} />
      </div>
    </div>
  )
}

interface Props { match: Match; timeZone: string; onClose: () => void }

export default function MatchDrawer({ match, timeZone, onClose }: Props) {
  const t = useTranslations('matchDetail')
  const tMatch = useTranslations('match')
  const tStat = useTranslations('matchDetail.stat')
  const locale = useLocale()
  const mounted = useSyncExternalStore(emptySubscribe, getTrue, getFalse)
  const handleClose = useCallback(() => onClose(), [onClose])

  const isLive = LIVE_S.has(match.status)
  const isDone = DONE_S.has(match.status)
  const liveClock = useLiveClock(match.clock, isLive && match.status !== 'PAUSED')
  const homeName = localizedCountry(match.homeTeam.tla, locale, match.homeTeam.shortName)
  const awayName = localizedCountry(match.awayTeam.tla, locale, match.awayTeam.shortName)

  const [summary, setSummary] = useState<MatchSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [tab, setTab] = useState<DetailTab>(isLive || isDone ? 'events' : 'lineup')

  // Fetch del detalle; refresca cada 15s si el partido está en vivo.
  useEffect(() => {
    let active = true
    async function load(initial: boolean) {
      if (initial) setLoading(true)
      try {
        const res = await fetch(`/api/matches/${match.id}`)
        if (!res.ok) throw new Error(String(res.status))
        const data: MatchSummary = await res.json()
        if (active) { setSummary(data); setError(false) }
      } catch {
        if (active && initial) setError(true)
      } finally {
        if (active && initial) setLoading(false)
      }
    }
    load(true)
    if (!isLive) return () => { active = false }
    const interval = window.setInterval(() => load(false), 15_000)
    return () => { active = false; window.clearInterval(interval) }
  }, [match.id, isLive])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [handleClose])

  if (!mounted) return null

  const homeLineup = summary?.lineups.find((l) => l.isHome) ?? null
  const awayLineup = summary?.lineups.find((l) => !l.isHome) ?? null
  const events = summary?.events ?? []
  const eventsDesc = [...events].reverse()
  const stats = summary?.statistics ?? null

  const homeScore = match.score.fullTime.home ?? 0
  const awayScore = match.score.fullTime.away ?? 0
  const showScore = isLive || isDone

  const tabs: { id: DetailTab; label: string }[] = [
    { id: 'lineup', label: t('lineup') },
    { id: 'events', label: t('events') },
    { id: 'stats', label: t('stats') },
  ]

  return createPortal(
    <>
      <div className="hidden sm:block fixed inset-0 z-40" style={{ background: 'oklch(4% 0.004 95 / 0.85)' }} onClick={handleClose} aria-hidden="true" />
      <div className="fixed inset-0 z-50 flex flex-col overflow-hidden sm:right-auto sm:max-w-lg"
        style={{ background: 'var(--lacquer)', borderRight: '1px solid var(--hairline)' }}
        role="dialog" aria-label={`${homeName} vs ${awayName}`}>

        {/* Header */}
        <div className="shrink-0" style={{ borderBottom: '1px solid var(--hairline)', paddingTop: 'env(safe-area-inset-top)' }}>
          <div className="flex items-center justify-between px-4 pt-3">
            <span className="eyebrow" style={{ color: 'var(--text-disabled)', letterSpacing: '0.1em', fontSize: '0.58rem' }}>
              {match.group ? match.group.replace('GROUP_', 'Grupo ') : match.stage.replace(/_/g, ' ')}
            </span>
            <button onClick={handleClose} className="w-8 h-8 flex items-center justify-center focus-visible:outline-none"
              style={{ color: 'var(--text-muted)', borderRadius: 'var(--r-sm)' }} aria-label={t('events')}>✕</button>
          </div>
          <div className="flex items-center justify-center gap-4 px-4 pb-3 pt-1">
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              {match.homeTeam.crest && (
                <div className="relative" style={{ width: 36, height: 36 }}>
                  <Image src={match.homeTeam.crest} alt={homeName} fill unoptimized className="object-contain" sizes="36px" />
                </div>
              )}
              <span className="truncate text-xs font-semibold w-full text-center" style={{ color: 'var(--text-warm)' }}>{homeName}</span>
            </div>
            <div className="flex flex-col items-center shrink-0" style={{ minWidth: 72 }}>
              {showScore ? (
                <span className="tabnum font-bold" style={{ fontSize: 28, color: 'var(--champagne)', lineHeight: 1 }}>
                  {homeScore}<span style={{ color: 'var(--kinpaku-rich)', margin: '0 6px', fontWeight: 400 }}>–</span>{awayScore}
                </span>
              ) : (
                <span suppressHydrationWarning className="tabnum" style={{ fontSize: 15, color: 'var(--text-muted)', fontWeight: 600 }}>
                  {formatTime(match.utcDate, timeZone)}
                </span>
              )}
              {isLive ? (
                <span className="eyebrow flex items-center gap-1 mt-1" style={{ color: 'var(--live-green)', fontSize: '0.55rem' }}>
                  <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--live-green)' }} />
                  {match.status === 'PAUSED' ? tMatch('ht') : (liveClock || tMatch('live'))}
                </span>
              ) : isDone ? (
                <span className="eyebrow mt-1" style={{ color: 'var(--text-disabled)', fontSize: '0.55rem' }}>{tMatch('ft')}</span>
              ) : null}
            </div>
            <div className="flex flex-col items-center gap-1 flex-1 min-w-0">
              {match.awayTeam.crest && (
                <div className="relative" style={{ width: 36, height: 36 }}>
                  <Image src={match.awayTeam.crest} alt={awayName} fill unoptimized className="object-contain" sizes="36px" />
                </div>
              )}
              <span className="truncate text-xs font-semibold w-full text-center" style={{ color: 'var(--text-warm)' }}>{awayName}</span>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex">
            {tabs.map((tb) => (
              <button key={tb.id} onClick={() => setTab(tb.id)} className="flex-1 py-2.5 text-center transition-colors"
                style={{
                  fontSize: 12, fontWeight: tab === tb.id ? 700 : 500,
                  color: tab === tb.id ? 'var(--kinpaku)' : 'var(--text-muted)',
                  borderBottom: `2px solid ${tab === tb.id ? 'var(--kinpaku)' : 'transparent'}`,
                  background: 'transparent', cursor: 'pointer',
                }}>
                {tb.label}
              </button>
            ))}
          </div>
        </div>

        {/* Body */}
        <div className="overflow-y-auto flex-1 min-h-0 px-4 py-4"
          style={{ overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', paddingBottom: 'calc(20px + env(safe-area-inset-bottom, 0px))' }}>

          {loading ? (
            <div className="py-16 text-center">
              <Icon icon="material-symbols:progress-activity" width={28} height={28} className="animate-spin" style={{ color: 'var(--text-disabled)' }} />
              <p className="eyebrow mt-3" style={{ color: 'var(--text-disabled)' }}>{t('loading')}</p>
            </div>
          ) : error ? (
            <div className="py-16 text-center">
              <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>{t('error')}</p>
            </div>
          ) : tab === 'lineup' ? (
            homeLineup || awayLineup ? (
              <div className="flex gap-4">
                {homeLineup && <TeamLineupColumn lineup={homeLineup} name={homeName} accent="var(--kinpaku)" labels={{ starters: t('starters'), bench: t('bench'), formation: t('formation') }} />}
                {awayLineup && <TeamLineupColumn lineup={awayLineup} name={awayName} accent="var(--patina)" labels={{ starters: t('starters'), bench: t('bench'), formation: t('formation') }} />}
              </div>
            ) : (
              <p className="py-16 text-center eyebrow" style={{ color: 'var(--text-muted)' }}>{t('noLineup')}</p>
            )
          ) : tab === 'events' ? (
            eventsDesc.length > 0 ? (
              <div className="flex flex-col">
                {eventsDesc.map((e) => (
                  <div key={e.id} className="flex items-start gap-3 py-2" style={{ borderBottom: '1px solid var(--hairline)' }}>
                    <span className="tabnum shrink-0 text-right" style={{ width: 34, fontSize: 11, fontWeight: 700, color: e.isHome ? 'var(--kinpaku)' : 'var(--patina)' }}>
                      {e.minute}
                    </span>
                    <span className="shrink-0 mt-0.5 flex items-center justify-center" style={{ width: 18 }}><EventIcon type={e.type} /></span>
                    <EventPlayers event={e} />
                  </div>
                ))}
              </div>
            ) : (
              <p className="py-16 text-center eyebrow" style={{ color: 'var(--text-muted)' }}>{t('noEvents')}</p>
            )
          ) : (
            stats ? (
              <div>
                {STAT_KEYS.map((key) => {
                  const h = stats.home.find((s) => s.name === key)
                  const a = stats.away.find((s) => s.name === key)
                  if (!h && !a) return null
                  const hv = parseFloat(h?.value ?? '0') || 0
                  const av = parseFloat(a?.value ?? '0') || 0
                  return <StatRow key={key} label={tStat(key)} home={hv} away={av} />
                })}
              </div>
            ) : (
              <p className="py-16 text-center eyebrow" style={{ color: 'var(--text-muted)' }}>{t('noStats')}</p>
            )
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
