'use client'

import { Icon } from '@iconify/react'
import { Match } from '@/types/football'
import { formatTime, isToday } from '@/lib/format-date'

// ─── TLA → emojione-v1 flag name ─────────────────────────────────────────────
const TLA_FLAG: Record<string, string> = {
  // CONCACAF
  MEX: 'mexico', USA: 'united-states', CAN: 'canada',
  PAN: 'panama', CRC: 'costa-rica', HON: 'honduras',
  SLV: 'el-salvador', GTM: 'guatemala', JAM: 'jamaica',
  TRI: 'trinidad-and-tobago', HAI: 'haiti', CUB: 'cuba',
  NCA: 'nicaragua', GUY: 'guyana', SUR: 'suriname',
  // CONMEBOL
  ARG: 'argentina', BRA: 'brazil', COL: 'colombia',
  ECU: 'ecuador', URU: 'uruguay', CHI: 'chile',
  BOL: 'bolivia', PAR: 'paraguay', PER: 'peru', VEN: 'venezuela',
  // Europe
  FRA: 'france', GER: 'germany', ESP: 'spain', POR: 'portugal',
  NED: 'netherlands', BEL: 'belgium', ENG: 'united-kingdom',
  ITA: 'italy', CRO: 'croatia', SUI: 'switzerland',
  DEN: 'denmark', NOR: 'norway', SWE: 'sweden',
  POL: 'poland', CZE: 'czechia', SVK: 'slovakia',
  HUN: 'hungary', ROU: 'romania', SRB: 'serbia',
  UKR: 'ukraine', TUR: 'turkey', GRE: 'greece',
  ISL: 'iceland', SCO: 'scotland', WAL: 'wales',
  IRL: 'ireland', AUT: 'austria', SVN: 'slovenia',
  ALB: 'albania', GEO: 'georgia', MKD: 'north-macedonia',
  MNE: 'montenegro', BIH: 'bosnia-and-herzegovina',
  // Africa
  MAR: 'morocco', SEN: 'senegal', CMR: 'cameroon',
  GHA: 'ghana', NGA: 'nigeria', NGR: 'nigeria',
  EGY: 'egypt', RSA: 'south-africa', ALG: 'algeria',
  TUN: 'tunisia', CIV: 'cote-divoire', GUI: 'guinea',
  MLI: 'mali', BFA: 'burkina-faso', ZIM: 'zimbabwe',
  MOZ: 'mozambique', TAN: 'tanzania', UGA: 'uganda',
  // Asia
  KOR: 'south-korea', JPN: 'japan', IRN: 'iran',
  SAU: 'saudi-arabia', QAT: 'qatar', AUS: 'australia',
  CHN: 'china', IRQ: 'iraq', JOR: 'jordan',
  UAE: 'united-arab-emirates', IDN: 'indonesia',
  UZB: 'uzbekistan', TKM: 'turkmenistan', KUW: 'kuwait',
  OMN: 'oman', BHR: 'bahrain', IND: 'india',
  // Oceania
  NZL: 'new-zealand', FIJ: 'fiji',
}

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

function TeamFlag({ tla, name }: { tla: string; name: string }) {
  const flagName = TLA_FLAG[tla?.toUpperCase()]

  if (flagName) {
    return (
      <div
        style={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          overflow: 'hidden',
          flexShrink: 0,
          border: '2px solid var(--graphite)',
          background: 'var(--graphite)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon
          icon={`emojione-v1:flag-for-${flagName}`}
          style={{ width: 72, height: 72, display: 'block', flexShrink: 0 }}
        />
      </div>
    )
  }

  // Fallback for unknown TLA
  return (
    <div
      style={{
        width: 56,
        height: 56,
        borderRadius: '50%',
        flexShrink: 0,
        border: '2px solid var(--graphite-2)',
        background: 'var(--graphite)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <span style={{ color: 'var(--text-faint)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
        {(tla ?? name ?? '?').slice(0, 3).toUpperCase()}
      </span>
    </div>
  )
}

function CenterBlock({ match, timeZone }: { match: Match; timeZone: string }) {
  const isLive = LIVE_STATUSES.has(match.status)
  const isDone = DONE_STATUSES.has(match.status)

  if (isLive || isDone) {
    const home = match.score.fullTime.home ?? 0
    const away = match.score.fullTime.away ?? 0

    return (
      <div
        className="flex flex-col items-center justify-center gap-1"
        style={{ background: 'var(--graphite)', borderRadius: 12, minWidth: 80, padding: '8px 16px' }}
      >
        {isLive ? (
          <div className="flex items-center gap-1.5">
            <span className="live-dot w-1.5 h-1.5 rounded-full block" style={{ background: 'var(--patina)' }} aria-hidden="true" />
            <span style={{ color: 'var(--patina)', fontSize: 10, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
              {match.status === 'PAUSED' ? 'HT' : 'LIVE'}
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-faint)', fontSize: 10, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            Final
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

  const statusLabel =
    match.status === 'TIMED' || match.status === 'SCHEDULED' ? 'PRÓXIMO' : match.status.replace(/_/g, ' ')

  return (
    <div
      className="flex flex-col items-center justify-center gap-1"
      style={{ background: 'var(--graphite)', borderRadius: 12, minWidth: 80, padding: '8px 16px' }}
    >
      <span style={{ color: 'var(--kinpaku)', fontSize: 22, fontWeight: 600, lineHeight: 1, fontVariantNumeric: 'tabular-nums' }}>
        VS
      </span>
      <span style={{ color: 'var(--text-faint)', fontSize: 9, fontWeight: 600, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
        {statusLabel}
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
  const groupLabel = groupKey ? groupKey.replace('GROUP_', 'GRUPO ') : match.stage.replace(/_/g, ' ')
  const labelColor = GROUP_LABEL_COLOR[groupKey] ?? 'var(--text-muted)'

  return (
    <article
      className={`match-card ${isLive ? 'is-live' : ''} ${today && !isLive ? 'is-today' : ''}`}
      style={{ background: 'var(--raised-lacquer)', borderRadius: 16, padding: 16, cursor: 'pointer', userSelect: 'none' }}
      onMouseDown={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
      onMouseUp={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
      onTouchStart={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(0.97)' }}
      onTouchEnd={(e) => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)' }}
    >
      {/* Top row: group badge + time */}
      <div className="flex items-center justify-between gap-2 mb-4">
        <span style={{
          color: labelColor, fontSize: 10, fontWeight: 700, letterSpacing: '0.14em',
          textTransform: 'uppercase', background: 'var(--graphite)',
          borderRadius: 999, padding: '3px 10px', lineHeight: 1.6,
        }}>
          {groupLabel}
        </span>
        <span style={{ color: 'var(--text-faint)', fontSize: 11, fontWeight: 500, letterSpacing: '0.08em', fontVariantNumeric: 'tabular-nums' }} suppressHydrationWarning>
          {formatTime(match.utcDate, timeZone)} local
        </span>
      </div>

      {/* Main row: home — center — away */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamFlag tla={match.homeTeam.tla} name={match.homeTeam.name} />
          <span className="text-center leading-tight truncate w-full" style={{ color: 'var(--text-warm)', fontSize: 15, fontWeight: 600 }}>
            {match.homeTeam.shortName}
          </span>
        </div>

        <CenterBlock match={match} timeZone={timeZone} />

        <div className="flex flex-col items-center gap-2 flex-1 min-w-0">
          <TeamFlag tla={match.awayTeam.tla} name={match.awayTeam.name} />
          <span className="text-center leading-tight truncate w-full" style={{ color: 'var(--text-warm)', fontSize: 15, fontWeight: 600 }}>
            {match.awayTeam.shortName}
          </span>
        </div>
      </div>
    </article>
  )
}
