'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Match } from '@/types/football'
import { formatTime } from '@/lib/format-date'

// ─── Stage ordering ───────────────────────────────────────────────────────────
const STAGE_ORDER: Record<string, number> = {
  ROUND_OF_32: 0,
  LAST_16: 1,
  QUARTER_FINALS: 2,
  SEMI_FINALS: 3,
  THIRD_PLACE: 4,
  FINAL: 5,
}

const STAGE_LABELS: Record<string, string> = {
  ROUND_OF_32: 'Octavos',
  LAST_16: 'Dieciséis',
  QUARTER_FINALS: 'Cuartos',
  SEMI_FINALS: 'Semis',
  THIRD_PLACE: '3er Puesto',
  FINAL: 'Final',
}

const KNOCKOUT_STAGES = ['ROUND_OF_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']

const DONE = new Set(['FINISHED', 'AWARDED'])
const LIVE = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])

// ─── Bracket node ─────────────────────────────────────────────────────────────
const NODE_W = 152
const NODE_H = 68

function TeamCrest({ crest, tla }: { crest: string; tla: string }) {
  const [imgError, setImgError] = useState(false)
  if (!crest || imgError) {
    return (
      <div
        className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center"
        style={{ background: 'var(--graphite-2)', border: '1px solid var(--hairline)' }}
      >
        <Icon icon="material-symbols:shield-outline" width={11} height={11} style={{ color: 'var(--text-disabled)' }} />
      </div>
    )
  }
  return (
    <div className="relative flex-shrink-0" style={{ width: 20, height: 20 }}>
      <Image src={crest} alt={tla} fill unoptimized className="object-contain" sizes="20px" onError={() => setImgError(true)} />
    </div>
  )
}

function TeamRow({ crest, name, tla, score, winner }: {
  crest: string
  name: string
  tla: string
  score: number | null
  winner: boolean | null
}) {
  // Detect placeholder teams: no name, short group codes like "1A","2B", or qualifier patterns
  const isTbd = !name ||
    /^(\d+[a-z]|[a-z]\d+|rd\d*|qf|sf|tbd)/i.test(name.trim()) ||
    /winner|ganador|semifin|quarter|runner|loser/i.test(name)

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1.5"
      style={{
        height: NODE_H / 2,
        background: winner === true ? 'oklch(84% 0.19 80.46 / 0.08)' : 'transparent',
      }}
    >
      <TeamCrest crest={isTbd ? '' : crest} tla={tla} />
      <span
        className="flex-1 min-w-0 truncate text-xs font-semibold leading-none"
        style={{ color: isTbd ? 'var(--text-disabled)' : winner === true ? 'var(--kinpaku)' : 'var(--text-warm)' }}
      >
        {isTbd ? 'Por definir' : (name || tla)}
      </span>
      {score !== null && !isTbd && (
        <span
          className="tabnum font-bold text-sm leading-none flex-shrink-0"
          style={{ color: winner === true ? 'var(--kinpaku)' : 'var(--text-warm)' }}
        >
          {score}
        </span>
      )}
    </div>
  )
}

function MatchNode({ match, timeZone, dim }: { match: Match | null; timeZone: string; dim?: boolean }) {
  const isDone = match ? DONE.has(match.status) : false
  const isLive = match ? LIVE.has(match.status) : false

  const homeScore = isDone || isLive ? match?.score.fullTime.home ?? null : null
  const awayScore = isDone || isLive ? match?.score.fullTime.away ?? null : null
  const homeWon = isDone && homeScore !== null && awayScore !== null && homeScore > awayScore
  const awayWon = isDone && homeScore !== null && awayScore !== null && awayScore > homeScore

  return (
    <div
      style={{
        width: NODE_W,
        height: NODE_H,
        borderRadius: 'var(--r-md)',
        border: '1px solid var(--glass-border)',
        background: dim ? 'var(--raised-lacquer)' : 'var(--glass-bg)',
        overflow: 'hidden',
        opacity: dim ? 0.4 : 1,
        flexShrink: 0,
        position: 'relative',
      }}
    >
      {isLive && (
        <div
          className="absolute top-0 left-0 right-0 h-px"
          style={{ background: 'var(--patina)' }}
          aria-hidden="true"
        />
      )}
      <div style={{ borderBottom: '1px solid var(--hairline)' }}>
        <TeamRow
          crest={match?.homeTeam.crest ?? ''}
          name={match?.homeTeam.shortName ?? ''}
          tla={match?.homeTeam.tla ?? ''}
          score={homeScore}
          winner={isDone ? homeWon : null}
        />
      </div>
      <TeamRow
        crest={match?.awayTeam.crest ?? ''}
        name={match?.awayTeam.shortName ?? ''}
        tla={match?.awayTeam.tla ?? ''}
        score={awayScore}
        winner={isDone ? awayWon : null}
      />
      {!isDone && match && (
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ background: 'transparent' }}
        >
          <span
            className="tabnum"
            style={{
              fontSize: '0.6rem',
              color: isLive ? 'var(--patina)' : 'var(--text-disabled)',
              fontFamily: 'var(--font-hanken)',
              background: 'var(--raised-lacquer)',
              padding: '1px 4px',
              borderRadius: 2,
              letterSpacing: 1,
            }}
            suppressHydrationWarning
          >
            {isLive ? 'Live' : formatTime(match.utcDate, timeZone)}
          </span>
        </div>
      )}
    </div>
  )
}

// ─── Connector helpers ────────────────────────────────────────────────────────
const CONN_W = 20
const INNER_GAP = 8   // gap between the two matches in a pair
const PAIR_GAP = 28   // gap between pairs in same round

// Vertical line + horizontal stub between a pair and the next-round match
function PairConnector({ top, mid, bottom }: { top: number; mid: number; bottom: number }) {
  const height = bottom - top
  return (
    <>
      {/* Vertical bar spanning both matches in the pair */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top,
          height,
          width: 1,
          background: 'var(--hairline-gold)',
        }}
      />
      {/* Horizontal stub going right to the middle */}
      <div
        style={{
          position: 'absolute',
          right: 0,
          top: mid,
          width: CONN_W,
          height: 1,
          background: 'var(--hairline-gold)',
        }}
      />
    </>
  )
}

// Horizontal line on the left side of a later-round match
function EntryLine({ top }: { top: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top,
        width: CONN_W,
        height: 1,
        background: 'var(--hairline-gold)',
        transform: 'translateX(-100%)',
      }}
    />
  )
}

// ─── Round list (for R32 and R16) ────────────────────────────────────────────
function RoundList({ matches, timeZone }: { matches: Match[]; timeZone: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {matches.map((m) => (
        <MatchNode key={m.id} match={m} timeZone={timeZone} />
      ))}
    </div>
  )
}

// ─── Visual bracket tree (QF → SF → Final) ───────────────────────────────────
function BracketTree({
  qf,
  sf,
  final,
  timeZone,
  dim,
}: {
  qf: (Match | null)[]
  sf: (Match | null)[]
  final: Match | null
  timeZone: string
  dim: boolean
}) {
  // Calculate positions
  // QF pair 1: matches 0 and 1
  // QF pair 2: matches 2 and 3
  // Each node = NODE_H px tall, INNER_GAP between in pair, PAIR_GAP between pairs

  const pairH = NODE_H + INNER_GAP + NODE_H // height of one QF pair
  const totalH = pairH + PAIR_GAP + pairH   // total height of QF column

  // Centers of each match in pair
  const qf0center = NODE_H / 2
  const qf1center = NODE_H + INNER_GAP + NODE_H / 2
  const pair1center = (qf0center + qf1center) / 2  // center of pair 1 = 76 (with h=68, ig=8)

  const pair2Top = pairH + PAIR_GAP
  const qf2center = pair2Top + NODE_H / 2
  const qf3center = pair2Top + NODE_H + INNER_GAP + NODE_H / 2
  const pair2center = (qf2center + qf3center) / 2  // center of pair 2

  const sfCol1top = pair1center - NODE_H / 2  // SF match 1 top y
  const sfCol2top = pair2center - NODE_H / 2  // SF match 2 top y

  const sf1center = sfCol1top + NODE_H / 2
  const sf2center = sfCol2top + NODE_H / 2
  const finalTop = (sf1center + sf2center) / 2 - NODE_H / 2

  const finalCenter = finalTop + NODE_H / 2

  // Determine champion
  const champion =
    final && DONE.has(final.status)
      ? final.score.winner === 'HOME_TEAM'
        ? final.homeTeam
        : final.score.winner === 'AWAY_TEAM'
          ? final.awayTeam
          : null
      : null

  return (
    <div className="flex items-start" style={{ gap: CONN_W }}>
      {/* ── QF Column ──────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: NODE_W, height: totalH }}>
        {/* Pair 1 */}
        <div style={{ position: 'absolute', top: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: INNER_GAP }}>
            <MatchNode match={qf[0] ?? null} timeZone={timeZone} dim={dim} />
            <MatchNode match={qf[1] ?? null} timeZone={timeZone} dim={dim} />
          </div>
        </div>
        {/* Pair 2 */}
        <div style={{ position: 'absolute', top: pairH + PAIR_GAP }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: INNER_GAP }}>
            <MatchNode match={qf[2] ?? null} timeZone={timeZone} dim={dim} />
            <MatchNode match={qf[3] ?? null} timeZone={timeZone} dim={dim} />
          </div>
        </div>

        {/* Connectors from QF pairs to SF */}
        <PairConnector top={qf0center} mid={pair1center} bottom={qf1center} />
        <PairConnector top={qf2center} mid={pair2center} bottom={qf3center} />
      </div>

      {/* ── SF Column ──────────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: NODE_W, height: totalH }}>
        <div style={{ position: 'absolute', top: sfCol1top }}>
          <MatchNode match={sf[0] ?? null} timeZone={timeZone} dim={dim} />
        </div>
        <div style={{ position: 'absolute', top: sfCol2top }}>
          <MatchNode match={sf[1] ?? null} timeZone={timeZone} dim={dim} />
        </div>

        {/* Entry lines (left side, entering from QF connectors) */}
        <EntryLine top={sf1center} />
        <EntryLine top={sf2center} />

        {/* Connector from SF pair to Final */}
        <PairConnector top={sf1center} mid={finalCenter} bottom={sf2center} />
      </div>

      {/* ── Final Column ───────────────────────────────────────────── */}
      <div className="relative flex-shrink-0" style={{ width: NODE_W, height: totalH }}>
        <div style={{ position: 'absolute', top: finalTop }}>
          <MatchNode match={final} timeZone={timeZone} dim={dim} />
        </div>
        <EntryLine top={finalCenter} />

        {/* Champion display below final if done */}
        {champion && (
          <div
            style={{
              position: 'absolute',
              top: finalTop + NODE_H + 16,
              left: 0,
              right: 0,
            }}
          >
            <div
              className="flex flex-col items-center gap-2 px-2 py-3 text-center"
              style={{
                background: 'oklch(84% 0.19 80.46 / 0.10)',
                border: '1px solid var(--hairline-gold)',
                borderRadius: 'var(--r-lg)',
              }}
            >
              <Icon icon="material-symbols:emoji-events" width={24} height={24} style={{ color: 'var(--kinpaku)' }} />
              <span className="eyebrow" style={{ color: 'var(--kinpaku)', letterSpacing: '0.1em', fontSize: '0.55rem' }}>
                CAMPEÓN
              </span>
              {champion.crest && (
                <div className="relative" style={{ width: 32, height: 32 }}>
                  <Image src={champion.crest} alt={champion.name} fill unoptimized className="object-contain" sizes="32px" />
                </div>
              )}
              <span className="text-xs font-bold" style={{ color: 'var(--champagne)' }}>
                {champion.shortName ?? champion.name}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Phase tab bar ────────────────────────────────────────────────────────────
function PhaseTabs({
  stages,
  active,
  onSelect,
}: {
  stages: string[]
  active: string
  onSelect: (s: string) => void
}) {
  return (
    <div
      className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-5"
      style={{ paddingBottom: 2 }}
    >
      {stages.map((s) => {
        const isActive = active === s
        return (
          <button
            key={s}
            onClick={() => onSelect(s)}
            className="flex-shrink-0 soft-haptic focus-visible:outline-none"
            style={{
              padding: '7px 16px',
              borderRadius: 'var(--r-lg)',
              border: `1px solid ${isActive ? 'var(--kinpaku)' : 'var(--hairline)'}`,
              background: isActive ? 'oklch(84% 0.19 80.46 / 0.12)' : 'var(--graphite)',
              color: isActive ? 'var(--kinpaku)' : 'var(--text-muted)',
              fontSize: '12px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              transition: 'all 150ms',
              whiteSpace: 'nowrap',
            }}
          >
            {STAGE_LABELS[s] ?? s}
          </button>
        )
      })}
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function KnockoutBracket({ matches, timeZone }: { matches: Match[]; timeZone: string }) {
  const knockout = matches
    .filter((m) => STAGE_ORDER[m.stage] !== undefined)
    .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || a.utcDate.localeCompare(b.utcDate))

  const byStage = (stage: string) => knockout.filter((m) => m.stage === stage)

  const r32 = byStage('ROUND_OF_32')
  const r16 = byStage('LAST_16')
  const qf = byStage('QUARTER_FINALS')
  const sf = byStage('SEMI_FINALS')
  const thirdPlace = byStage('THIRD_PLACE')
  const finalMatch = byStage('FINAL')

  const hasData = knockout.length > 0
  const activeStages = KNOCKOUT_STAGES.filter((s) => byStage(s).length > 0)

  const [activePhase, setActivePhase] = useState<string>(activeStages[0] ?? 'ROUND_OF_32')

  const placeholderQf: (Match | null)[] = [null, null, null, null]
  const placeholderSf: (Match | null)[] = [null, null]

  const hasBracketData = qf.length > 0 || sf.length > 0 || finalMatch.length > 0

  return (
    <div>
      {/* ── Empty / Coming soon state ────────────────────────────────── */}
      {!hasData && (
        <div>
          <div
            className="flex items-center gap-3 mb-5 px-4 py-3"
            style={{
              background: 'oklch(84% 0.19 80.46 / 0.06)',
              border: '1px solid var(--hairline-gold)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <Icon icon="material-symbols:lock-clock" width={20} height={20} style={{ color: 'var(--kinpaku)', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--champagne)' }}>
                Bracket disponible en Fase Knockout
              </p>
              <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                Disponible desde ~Julio 2026 · Actualización automática
              </p>
            </div>
          </div>

          {/* Preview phase tabs */}
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-4">
            {['ROUND_OF_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'].map((s) => (
              <div
                key={s}
                style={{
                  padding: '7px 16px',
                  borderRadius: 'var(--r-lg)',
                  border: '1px solid var(--hairline)',
                  background: 'var(--graphite)',
                  color: 'var(--text-disabled)',
                  fontSize: '12px',
                  fontWeight: 700,
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                  whiteSpace: 'nowrap',
                  opacity: 0.4,
                  flexShrink: 0,
                }}
              >
                {STAGE_LABELS[s]}
              </div>
            ))}
          </div>

          {/* Dimmed placeholder bracket */}
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div style={{ minWidth: 3 * NODE_W + 2 * CONN_W + 8 }}>
              <div className="flex items-center justify-between mb-3" style={{ width: 3 * NODE_W + 2 * CONN_W }}>
                {['Cuartos', 'Semis', 'Final'].map((label) => (
                  <span key={label} className="eyebrow" style={{ color: 'var(--text-disabled)', width: NODE_W, textAlign: 'center', letterSpacing: '0.1em' }}>
                    {label}
                  </span>
                ))}
              </div>
              <BracketTree qf={placeholderQf} sf={placeholderSf} final={null} timeZone={timeZone} dim={true} />
            </div>
          </div>
        </div>
      )}

      {/* ── Active bracket ───────────────────────────────────────────── */}
      {hasData && (
        <div>
          {/* Phase tabs */}
          <PhaseTabs stages={activeStages} active={activePhase} onSelect={setActivePhase} />

          {/* Content for selected phase */}
          <div className="tab-panel">
            {(activePhase === 'ROUND_OF_32') && r32.length > 0 && (
              <RoundList matches={r32} timeZone={timeZone} />
            )}
            {(activePhase === 'LAST_16') && r16.length > 0 && (
              <RoundList matches={r16} timeZone={timeZone} />
            )}
            {(activePhase === 'QUARTER_FINALS' || activePhase === 'SEMI_FINALS' || activePhase === 'FINAL') && hasBracketData && (
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div style={{ minWidth: 3 * NODE_W + 2 * CONN_W + 8 }}>
                  <div className="flex items-center mb-3" style={{ gap: CONN_W }}>
                    {[
                      qf.length > 0 ? 'Cuartos' : null,
                      sf.length > 0 ? 'Semis' : null,
                      finalMatch.length > 0 ? 'Final' : null,
                    ].filter(Boolean).map((label) => (
                      <span
                        key={label}
                        className="eyebrow"
                        style={{ color: 'var(--text-faint)', width: NODE_W, textAlign: 'center', letterSpacing: '0.1em', flexShrink: 0 }}
                      >
                        {label}
                      </span>
                    ))}
                  </div>
                  <BracketTree
                    qf={[qf[0] ?? null, qf[1] ?? null, qf[2] ?? null, qf[3] ?? null]}
                    sf={[sf[0] ?? null, sf[1] ?? null]}
                    final={finalMatch[0] ?? null}
                    timeZone={timeZone}
                    dim={false}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3rd place — always shown when available */}
          {thirdPlace.length > 0 && (
            <section className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: 3, height: 16, background: 'var(--kinpaku)', borderRadius: 2, flexShrink: 0 }} aria-hidden="true" />
                <span className="eyebrow" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
                  Tercer Puesto
                </span>
              </div>
              <div style={{ maxWidth: NODE_W * 2 + 16 }}>
                <MatchNode match={thirdPlace[0]} timeZone={timeZone} />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
