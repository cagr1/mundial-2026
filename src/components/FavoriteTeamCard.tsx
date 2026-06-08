'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Team, Match } from '@/types/football'
import { formatTime, formatDayHeading } from '@/lib/format-date'

const UPCOMING = new Set(['TIMED', 'SCHEDULED'])
const DONE = new Set(['FINISHED', 'AWARDED'])
const LIVE = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])

interface CountdownValue { days: number; hours: number; minutes: number; seconds: number; done: boolean }

function calcCountdown(target: string): CountdownValue {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, done: true }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    done: false,
  }
}

function MiniCountdown({ targetDate }: { targetDate: string }) {
  const [time, setTime] = useState<CountdownValue>(() => calcCountdown(targetDate))

  useEffect(() => {
    if (time.done) return
    const id = setInterval(() => setTime(calcCountdown(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate, time.done])

  if (time.done) return null

  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div className="flex items-center gap-1.5 mt-2">
      {[
        { val: time.days, label: 'd' },
        { val: time.hours, label: 'h' },
        { val: time.minutes, label: 'm' },
        { val: time.seconds, label: 's' },
      ].map(({ val, label }, i) => (
        <span key={label} className="flex items-baseline gap-0.5">
          {i > 0 && <span className="tabnum" style={{ color: 'var(--kinpaku-deep)', marginRight: 2 }}>:</span>}
          <span className="tabnum font-bold" style={{ fontFamily: 'var(--font-inter)', fontSize: '1.1rem', color: 'var(--kinpaku)', lineHeight: 1 }}>
            {pad(val)}
          </span>
          <span className="eyebrow" style={{ fontSize: '0.5rem', color: 'var(--text-disabled)' }}>{label}</span>
        </span>
      ))}
    </div>
  )
}

interface Props { team: Team; matches: Match[]; timeZone: string; onRemove: () => void }

export default function FavoriteTeamCard({ team, matches, timeZone, onRemove }: Props) {
  const t = useTranslations('favorite')
  const teamMatches = matches.filter((m) => m.homeTeam.id === team.id || m.awayTeam.id === team.id)

  const nextMatch = teamMatches.filter((m) => UPCOMING.has(m.status)).sort((a, b) => new Date(a.utcDate).getTime() - new Date(b.utcDate).getTime())[0]
  const liveMatch = teamMatches.find((m) => LIVE.has(m.status))
  const lastMatch = teamMatches.filter((m) => DONE.has(m.status)).sort((a, b) => new Date(b.utcDate).getTime() - new Date(a.utcDate).getTime())[0]
  const displayMatch = liveMatch ?? nextMatch ?? lastMatch ?? null

  function getOpponent(match: Match) { return match.homeTeam.id === team.id ? match.awayTeam : match.homeTeam }
  function getScore(match: Match) {
    const h = match.score.fullTime.home ?? 0, a = match.score.fullTime.away ?? 0
    return match.homeTeam.id === team.id ? `${h} – ${a}` : `${a} – ${h}`
  }

  return (
    <div className="glass-card relative overflow-hidden mb-5" style={{ borderRadius: 'var(--r-lg)', borderLeft: '3px solid var(--kinpaku)' }}>
      <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'linear-gradient(to right, var(--kinpaku), transparent)' }} aria-hidden="true" />
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <span className="eyebrow flex items-center gap-1.5" style={{ color: 'var(--kinpaku)', letterSpacing: '0.12em' }}>
            <Icon icon="material-symbols:star" width={12} height={12} />
            {t('title')}
          </span>
          <button onClick={onRemove} aria-label={t('removeAria')} className="flex items-center gap-1 transition-colors" style={{ color: 'var(--text-disabled)' }}
            onMouseEnter={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--vermilion)')}
            onMouseLeave={(e) => ((e.currentTarget as HTMLButtonElement).style.color = 'var(--text-disabled)')}>
            <Icon icon="material-symbols:close" width={14} height={14} />
            <span className="eyebrow" style={{ fontSize: '0.6rem' }}>{t('remove')}</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mb-4">
          {team.crest ? (
            <div className="relative w-12 h-12 flex-shrink-0">
              <Image src={team.crest} alt={team.name} fill unoptimized className="object-contain" sizes="48px" />
            </div>
          ) : (
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--graphite)', borderRadius: 'var(--r-sm)' }}>
              <span className="eyebrow text-[9px]" style={{ color: 'var(--text-faint)' }}>{team.tla}</span>
            </div>
          )}
          <div>
            <p className="font-bold leading-tight" style={{ color: 'var(--champagne)', fontSize: '1.1rem' }}>{team.shortName ?? team.name}</p>
            <p className="eyebrow mt-0.5" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{team.tla}</p>
          </div>
        </div>

        {displayMatch ? (
          <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--glass-border)' }}>
            {liveMatch ? (
              <p className="eyebrow flex items-center gap-1.5 mb-2" style={{ color: 'var(--patina)' }}>
                <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--patina)' }} aria-hidden="true" />
                {t('live')}
              </p>
            ) : nextMatch ? (
              <p className="eyebrow mb-2" style={{ color: 'var(--text-faint)' }}>{t('next')}</p>
            ) : (
              <p className="eyebrow mb-2" style={{ color: 'var(--text-faint)' }}>{t('last')}</p>
            )}
            <div className="flex items-center gap-2.5">
              {getOpponent(displayMatch).crest ? (
                <div className="relative w-8 h-8 flex-shrink-0">
                  <Image src={getOpponent(displayMatch).crest} alt={getOpponent(displayMatch).name} fill unoptimized className="object-contain" sizes="32px" />
                </div>
              ) : (
                <div className="w-8 h-8 flex items-center justify-center flex-shrink-0" style={{ background: 'var(--graphite)', borderRadius: 'var(--r-sm)' }}>
                  <span className="eyebrow text-[8px]" style={{ color: 'var(--text-faint)' }}>{getOpponent(displayMatch).tla}</span>
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold leading-tight truncate" style={{ color: 'var(--text-warm)' }}>
                  {getOpponent(displayMatch).shortName ?? getOpponent(displayMatch).name}
                </p>
                <p className="eyebrow mt-0.5" style={{ fontSize: '0.6rem', color: 'var(--text-disabled)' }} suppressHydrationWarning>
                  {DONE.has(displayMatch.status) || LIVE.has(displayMatch.status)
                    ? getScore(displayMatch)
                    : `${formatDayHeading(displayMatch.utcDate, timeZone)} · ${formatTime(displayMatch.utcDate, timeZone)}`}
                </p>
              </div>
            </div>
            {nextMatch && !liveMatch && <MiniCountdown targetDate={nextMatch.utcDate} />}
          </div>
        ) : (
          <div className="rounded-lg px-3 py-2.5" style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--glass-border)' }}>
            <p className="eyebrow" style={{ color: 'var(--text-disabled)' }}>{t('noMatches')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
