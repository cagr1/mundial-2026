import Image from 'next/image'
import { Match } from '@/types/football'
import { formatTime, isToday } from '@/lib/format-date'
import ShareButton from './ShareButton'

const GROUP_LABEL_COLOR: Record<string, string> = {
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

const LIVE_STATUSES = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE_STATUSES = new Set(['FINISHED', 'AWARDED'])

function TeamCrest({ crest, name }: { crest: string; name: string }) {
  if (!crest) {
    return (
      <div
        className="w-12 h-12 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--graphite)', border: '1px solid var(--glass-border)' }}
      >
        <span className="eyebrow text-[10px]" style={{ color: 'var(--text-faint)' }}>
          {(name ?? '?').slice(0, 3).toUpperCase()}
        </span>
      </div>
    )
  }
  return (
    <div className="relative w-12 h-12 flex-shrink-0">
      <Image src={crest} alt={name} fill unoptimized className="object-contain drop-shadow-lg" sizes="48px" />
    </div>
  )
}

function ScoreOrTime({ match, timeZone }: { match: Match; timeZone: string }) {
  const isLive = LIVE_STATUSES.has(match.status)
  const isDone = DONE_STATUSES.has(match.status)

  if (isLive || isDone) {
    const home = match.score.fullTime.home ?? 0
    const away = match.score.fullTime.away ?? 0
    return (
      <div className="flex flex-col items-center gap-1.5 min-w-[90px]">
        {isLive ? (
          <div className="flex items-center gap-1.5">
            <span
              className="live-dot w-1.5 h-1.5 rounded-full block"
              style={{ background: 'var(--patina)' }}
              aria-hidden="true"
            />
            <span className="eyebrow" style={{ color: 'var(--patina)', letterSpacing: '0.14em' }}>
              {match.status === 'PAUSED' ? 'HT' : 'Live'}
            </span>
          </div>
        ) : (
          <span className="eyebrow">Final</span>
        )}
        <div
          className="tabnum font-extrabold tracking-tight"
          style={{
            fontFamily: 'var(--font-hanken)',
            fontSize: '2.25rem',
            lineHeight: 1,
            color: 'var(--champagne)',
          }}
        >
          {home}
          <span style={{ color: 'var(--kinpaku-rich)', margin: '0 8px', fontWeight: 400 }}>–</span>
          {away}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[90px]">
      <span className="eyebrow">Hora</span>
      <span
        className="tabnum font-bold"
        style={{
          color: 'var(--kinpaku)',
          fontFamily: 'var(--font-hanken)',
          fontSize: '1.5rem',
          lineHeight: 1,
        }}
        suppressHydrationWarning
      >
        {formatTime(match.utcDate, timeZone)}
      </span>
    </div>
  )
}

interface Props {
  match: Match
  timeZone: string
}

export default function MatchCard({ match, timeZone }: Props) {
  const isLive = LIVE_STATUSES.has(match.status)
  const today = isToday(match.utcDate, timeZone)
  const groupKey = match.group ?? ''
  const groupLabel = groupKey.replace('GROUP_', 'Grupo ')
  const labelColor = GROUP_LABEL_COLOR[groupKey] ?? 'var(--text-muted)'

  return (
    <article
      className={`match-card p-4 sm:p-5 ${isLive ? 'is-live' : ''} ${today && !isLive ? 'is-today' : ''}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {groupKey ? (
          <span className="eyebrow" style={{ color: labelColor }}>
            {groupLabel}
          </span>
        ) : (
          <span className="eyebrow">{match.stage.replace(/_/g, ' ')}</span>
        )}
        <span className="eyebrow tabnum" style={{ letterSpacing: '0.12em' }}>
          J{match.matchday}
        </span>
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} />
          <span
            className="text-xs font-semibold text-center leading-tight truncate w-full"
            style={{ color: 'var(--text-warm)' }}
          >
            {match.homeTeam.shortName}
          </span>
        </div>

        <ScoreOrTime match={match} timeZone={timeZone} />

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamCrest crest={match.awayTeam.crest} name={match.awayTeam.name} />
          <span
            className="text-xs font-semibold text-center leading-tight truncate w-full"
            style={{ color: 'var(--text-warm)' }}
          >
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>

      {/* Footer — share */}
      <div className="flex justify-end mt-3 pt-2.5" style={{ borderTop: '1px solid var(--hairline)' }}>
        <ShareButton match={match} timeZone={timeZone} />
      </div>
    </article>
  )
}
