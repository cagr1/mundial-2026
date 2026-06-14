'use client'

import { Icon } from '@iconify/react'
import { useTranslations, useLocale } from 'next-intl'
import { Match, Prediction } from '@/types/football'
import { formatTime, isToday } from '@/lib/format-date'
import { TLA_ISO2, localizedCountry } from '@/lib/country-names'
import { useLiveClock } from '@/hooks/useLiveClock'
import PredictionBadge from './PredictionBadge'

const GROUP_LABEL_COLOR: Record<string, string> = {
  GROUP_A: 'var(--kinpaku)', GROUP_B: 'var(--patina)',
  GROUP_C: 'oklch(76% 0.14 145)', GROUP_D: 'oklch(74% 0.13 290)',
  GROUP_E: 'oklch(72% 0.14 25)', GROUP_F: 'var(--kinpaku-rich)',
  GROUP_G: 'oklch(75% 0.13 220)', GROUP_H: 'oklch(79% 0.16 130)',
  GROUP_I: 'oklch(73% 0.14 340)', GROUP_J: 'var(--patina-pale)',
  GROUP_K: 'oklch(70% 0.12 260)', GROUP_L: 'var(--vermilion)',
}

const LIVE_STATUSES = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE_STATUSES = new Set(['FINISHED', 'AWARDED'])

function TeamFlag({ tla, name }: { tla: string; name: string }) {
  const iso2 = TLA_ISO2[tla?.toUpperCase()]
  return (
    <div style={{
      width: 56, height: 56, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '2px solid var(--graphite)', background: 'var(--graphite)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {iso2 ? (
        <span
          className={`fi fi-${iso2}`}
          style={{ width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }}
          role="img"
          aria-label={name}
        />
      ) : (
        <span style={{ color: 'var(--text-faint)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
          {(tla ?? name ?? '?').slice(0, 3).toUpperCase()}
        </span>
      )}
    </div>
  )
}

function CenterBlock({ match }: { match: Match }) {
  const t = useTranslations('match')
  const isLive = LIVE_STATUSES.has(match.status)
  const isDone = DONE_STATUSES.has(match.status)
  const liveClock = useLiveClock(match.clock, isLive && match.status !== 'PAUSED')

  if (isLive || isDone) {
    const home = match.score.fullTime.home ?? 0
    const away = match.score.fullTime.away ?? 0
    return (
      <div className="flex flex-col items-center justify-center gap-1"
        style={{ background: 'var(--graphite)', borderRadius: 12, minWidth: 80, padding: '8px 16px' }}>
        {isLive ? (
          <div className="flex flex-col items-center gap-0.5">
            <div className="flex items-center gap-1.5">
              <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--live-green)' }} aria-hidden="true" />
              <span style={{ color: 'var(--live-green)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                {match.status === 'PAUSED' ? t('ht') : t('live')}
              </span>
            </div>
            {match.status !== 'PAUSED' && liveClock && (
              <span style={{ color: 'var(--text-faint)', fontSize: 10, fontWeight: 500, fontVariantNumeric: 'tabular-nums' }}>
                {liveClock}
              </span>
            )}
          </div>
        ) : (
          <span style={{ color: 'var(--text-faint)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            {t('final')}
          </span>
        )}
        <div style={{ fontSize: 22, fontWeight: 700, lineHeight: 1, color: 'var(--champagne)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>
          {home}
          <span style={{ color: 'var(--kinpaku-rich)', fontWeight: 400, margin: '0 6px' }}>–</span>
          {away}
        </div>
      </div>
    )
  }

  const statusLabel = match.status === 'TIMED' || match.status === 'SCHEDULED' ? t('upcoming') : match.status.replace(/_/g, ' ')

  return (
    <div className="flex flex-col items-center justify-center gap-1"
      style={{ background: 'var(--graphite)', borderRadius: 12, minWidth: 80, padding: '8px 16px' }}>
      <span style={{ color: 'var(--kinpaku)', fontSize: 22, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>VS</span>
      <span style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
        {statusLabel}
      </span>
    </div>
  )
}

interface Props { match: Match; timeZone: string; prediction?: Prediction; onPredict?: () => void; onSelect?: () => void }

export default function MatchCard({ match, timeZone, prediction, onPredict, onSelect }: Props) {
  const t = useTranslations('match')
  const locale = useLocale()
  const homeName = localizedCountry(match.homeTeam.tla, locale, match.homeTeam.shortName)
  const awayName = localizedCountry(match.awayTeam.tla, locale, match.awayTeam.shortName)
  const isLive = LIVE_STATUSES.has(match.status)
  const today = isToday(match.utcDate, timeZone)
  const groupKey = match.group ?? ''
  const groupLabel = groupKey ? groupKey.replace('GROUP_', 'GRUPO ') : match.stage.replace(/_/g, ' ')
  const labelColor = GROUP_LABEL_COLOR[groupKey] ?? 'var(--text-muted)'

  return (
    <article
      className={`match-card ${isLive ? 'is-live' : ''} ${today && !isLive ? 'is-today' : ''}`}
      style={{ background: 'var(--raised-lacquer)', borderRadius: 16, padding: 16, cursor: 'pointer', userSelect: 'none' }}
      onClick={onSelect}
      onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
      onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
      onTouchEnd={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      <div className="flex items-center justify-between gap-2 mb-4">
        <span style={{ color: labelColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'var(--graphite)', borderRadius: 999, padding: '3px 10px', lineHeight: 1.6 }}>
          {groupLabel}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          {onPredict && (
            <PredictionBadge match={match} prediction={prediction} onClick={onPredict} />
          )}
          <span style={{ color: 'var(--text-faint)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
            {formatTime(match.utcDate, timeZone)} {t('localTime')}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamFlag tla={match.homeTeam.tla} name={homeName} />
          <span className="text-center leading-tight truncate w-full" style={{ color: 'var(--text-warm)', fontSize: 15, fontWeight: 600 }}>
            {homeName}
          </span>
        </div>
        <CenterBlock match={match} />
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamFlag tla={match.awayTeam.tla} name={awayName} />
          <span className="text-center leading-tight truncate w-full" style={{ color: 'var(--text-warm)', fontSize: 15, fontWeight: 600 }}>
            {awayName}
          </span>
        </div>
      </div>

      {match.venue && (
        <div className="flex items-center justify-center gap-1 mt-3">
          <Icon icon="material-symbols:stadium-outline" width={12} height={12} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />
          <span style={{ color: 'var(--text-disabled)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', fontWeight: 500 }}>
            {match.venue.name}{match.venue.city ? ` · ${match.venue.city}` : ''}
          </span>
        </div>
      )}
    </article>
  )
}
