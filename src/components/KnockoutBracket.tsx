'use client'

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

function TeamRow({ crest, name, tla, score, winner }: {
  crest: string
  name: string
  tla: string
  score: number | null
  winner: boolean | null
}) {
  const isTbd = !name || name.toLowerCase().includes('tbd') || name.toLowerCase().includes('winner') || name.toLowerCase().includes('ganador')

  return (
    <div
      className="flex items-center gap-1.5 px-2 py-1.5"
      style={{
        height: NODE_H / 2,
        background: winner === true ? 'oklch(84% 0.19 80.46 / 0.08)' : 'transparent',
      }}
    >
      {isTbd ? (
        <div
          className="w-5 h-5 flex-shrink-0 rounded flex items-center justify-center"
          style={{ background: 'var(--graphite)', border: '1px solid var(--hairline)' }}
        >
          <span style={{ fontSize: 7, color: 'var(--text-faint)' }}>?</span>
        </div>
      ) : crest ? (
        <div className="relative flex-shrink-0" style={{ width: 20, height: 20 }}>
          <Image src={crest} alt={tla} fill unoptimized className="object-contain" sizes="20px" />
        </div>
      ) : (
        <div
          className="w-5 h-5 flex-shrink-0 flex items-center justify-center rounded"
          style={{ background: 'var(--graphite)' }}
        >
          <span style={{ fontSize: 6, color: 'var(--text-faint)' }}>{tla}</span>
        </div>
      )}
      <span
        className="flex-1 min-w-0 truncate text-xs font-semibold leading-none"
        style={{ color: isTbd ? 'var(--text-disabled)' : winner === true ? 'var(--kinpaku)' : 'var(--text-warm)' }}
      >
        {isTbd ? 'Por definir' : (name || tla)}
      </span>
      {score !== null && (
        <span
          className="tabnum font-bold text-sm leading-none flex-shrink-0"
          style={{ color: winner === true ? 'var(--kinpaku)' : 'var(--text-warm)', fontFamily: 'var(--font-hanken)' }}
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
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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

// ─── Main component ───────────────────────────────────────────────────────────
export default function KnockoutBracket({ matches, timeZone }: { matches: Match[]; timeZone: string }) {
  const knockout = matches.filter((m) => STAGE_ORDER[m.stage] !== undefined)
    .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || a.utcDate.localeCompare(b.utcDate))

  const byStage = (stage: string) => knockout.filter((m) => m.stage === stage)

  const r32 = byStage('ROUND_OF_32')
  const r16 = byStage('LAST_16')
  const qf = byStage('QUARTER_FINALS')
  const sf = byStage('SEMI_FINALS')
  const thirdPlace = byStage('THIRD_PLACE')
  const finalMatch = byStage('FINAL')

  const hasData = knockout.length > 0

  // Placeholder data for the "coming soon" visual
  const placeholderQf: (Match | null)[] = [null, null, null, null]
  const placeholderSf: (Match | null)[] = [null, null]

  const activeStages = KNOCKOUT_STAGES.filter((s) => byStage(s).length > 0)
  const hasEarlyRounds = r32.length > 0 || r16.length > 0
  const hasBracketData = qf.length > 0 || sf.length > 0 || finalMatch.length > 0

  return (
    <div>
      {/* ── Empty / Coming soon state ────────────────────────────────── */}
      {!hasData && (
        <div>
          {/* Coming soon message */}
          <div
            className="flex items-center gap-3 mb-6 px-4 py-3"
            style={{
              background: 'oklch(84% 0.19 80.46 / 0.06)',
              border: '1px solid var(--hairline-gold)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <Icon icon="material-symbols:lock-clock" width={20} height={20} style={{ color: 'var(--kinpaku)', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--champagne)', fontFamily: 'var(--font-hanken)' }}>
                Bracket disponible en Fase Knockout
              </p>
              <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                Disponible desde ~Julio 2026 · Actualización automática
              </p>
            </div>
          </div>

          {/* Dimmed placeholder bracket */}
          <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
            <div style={{ minWidth: 3 * NODE_W + 2 * CONN_W + 8 }}>
              <div className="flex items-center justify-between mb-3" style={{ width: 3 * NODE_W + 2 * CONN_W }}>
                {['Cuartos', 'Semis', 'Final'].map((label) => (
                  <span key={label} className="eyebrow" style={{ color: 'var(--text-disabled)', width: NODE_W, textAlign: 'center', letterSpacing: '0.1em' }}>
                    {label}
                  </span>
                ))}
              </div>
              <BracketTree
                qf={placeholderQf}
                sf={placeholderSf}
                final={null}
                timeZone={timeZone}
                dim={true}
              />
            </div>
          </div>
        </div>
      )}

      {/* ── Active bracket ───────────────────────────────────────────── */}
      {hasData && (
        <div>
          {/* Available stages pills */}
          {activeStages.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap mb-4">
              {activeStages.map((s) => (
                <span
                  key={s}
                  className="eyebrow px-2.5 py-1"
                  style={{
                    color: 'var(--kinpaku)',
                    background: 'oklch(84% 0.19 80.46 / 0.08)',
                    border: '1px solid var(--hairline-gold)',
                    borderRadius: 'var(--r-sm)',
                    fontSize: '0.6rem',
                    letterSpacing: '0.1em',
                  }}
                >
                  {STAGE_LABELS[s] ?? s}
                </span>
              ))}
            </div>
          )}

          {/* R32 list */}
          {r32.length > 0 && (
            <section className="mb-6">
              <h3 className="eyebrow mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                Octavos de Final · {r32.length} partidos
              </h3>
              <RoundList matches={r32} timeZone={timeZone} />
            </section>
          )}

          {/* R16 list */}
          {r16.length > 0 && (
            <section className="mb-6">
              <h3 className="eyebrow mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                Dieciséis · {r16.length} partidos
              </h3>
              <RoundList matches={r16} timeZone={timeZone} />
            </section>
          )}

          {/* Visual bracket: QF → SF → Final */}
          {hasBracketData && (
            <section className="mb-6">
              {hasEarlyRounds && (
                <h3 className="eyebrow mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                  Cuartos de Final en adelante
                </h3>
              )}
              <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
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
                        style={{
                          color: 'var(--text-faint)',
                          width: NODE_W,
                          textAlign: 'center',
                          letterSpacing: '0.1em',
                          flexShrink: 0,
                        }}
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
            </section>
          )}

          {/* 3rd place */}
          {thirdPlace.length > 0 && (
            <section className="mb-6">
              <h3 className="eyebrow mb-3" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
                Tercer Puesto
              </h3>
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
