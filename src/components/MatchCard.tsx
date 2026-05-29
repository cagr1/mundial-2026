import Image from 'next/image'
import { Match } from '@/types/football'
import { formatTime, isToday } from '@/lib/format-date'

/* Group colors — hue-shifted within the kinpaku/patina OKLCH system */
const GROUP_LABEL_COLOR: Record<string, string> = {
  GROUP_A: 'color-mix(in oklch, var(--kinpaku) 100%, transparent)',
  GROUP_B: 'var(--patina)',
  GROUP_C: 'oklch(76% 0.14 145)',   // emerald
  GROUP_D: 'oklch(74% 0.13 290)',   // violet
  GROUP_E: 'oklch(72% 0.14 25)',    // rose
  GROUP_F: 'var(--kinpaku-rich)',
  GROUP_G: 'oklch(75% 0.13 220)',   // cyan
  GROUP_H: 'oklch(79% 0.16 130)',   // lime
  GROUP_I: 'oklch(73% 0.14 340)',   // pink
  GROUP_J: 'var(--patina-pale)',
  GROUP_K: 'oklch(70% 0.12 260)',   // indigo
  GROUP_L: 'var(--vermilion)',
}

const LIVE_STATUSES = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const DONE_STATUSES = new Set(['FINISHED', 'AWARDED'])

function TeamCrest({ crest, name }: { crest: string; name: string }) {
  if (!crest) {
    return (
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 rounded flex items-center justify-center flex-shrink-0"
        style={{ background: 'var(--graphite)', border: '1px solid var(--hairline)' }}
      >
        <span className="eyebrow text-[10px]" style={{ color: 'var(--text-faint)' }}>
          {(name ?? '?').slice(0, 3).toUpperCase()}
        </span>
      </div>
    )
  }
  return (
    <div className="relative w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0">
      <Image src={crest} alt={name} fill className="object-contain drop-shadow" sizes="48px" />
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
      <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
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
          className="tabnum text-3xl sm:text-4xl font-bold tracking-tight"
          style={{ fontFamily: 'var(--font-albert)', color: 'var(--champagne)' }}
        >
          {home}
          <span style={{ color: 'var(--hairline-gold)', margin: '0 6px' }}>–</span>
          {away}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-1.5 min-w-[80px]">
      <span className="eyebrow">Hora</span>
      <span
        className="tabnum text-2xl sm:text-3xl font-bold"
        style={{ color: 'var(--kinpaku)', fontFamily: 'var(--font-albert)' }}
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
      {/* Header row */}
      <div className="flex items-center justify-between gap-2 mb-4">
        {groupKey ? (
          <span className="eyebrow" style={{ color: labelColor }}>
            {groupLabel}
          </span>
        ) : (
          <span className="eyebrow">{match.stage.replace(/_/g, ' ')}</span>
        )}
        <span className="eyebrow" style={{ letterSpacing: '0.12em' }}>
          J{match.matchday}
        </span>
      </div>

      {/* Teams + score */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamCrest crest={match.homeTeam.crest} name={match.homeTeam.name} />
          <span
            className="text-xs sm:text-sm font-medium text-center leading-tight truncate w-full text-center"
            style={{ color: 'var(--text-warm)' }}
          >
            {match.homeTeam.shortName}
          </span>
        </div>

        <ScoreOrTime match={match} timeZone={timeZone} />

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamCrest crest={match.awayTeam.crest} name={match.awayTeam.name} />
          <span
            className="text-xs sm:text-sm font-medium text-center leading-tight truncate w-full text-center"
            style={{ color: 'var(--text-warm)' }}
          >
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>
    </article>
  )
}
