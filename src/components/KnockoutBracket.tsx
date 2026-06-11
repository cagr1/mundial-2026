'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useTranslations, useLocale } from 'next-intl'
import { Match, BracketPicks } from '@/types/football'
import { formatTime } from '@/lib/format-date'
import { localizedCountry } from '@/lib/country-names'

const STAGE_ORDER: Record<string, number> = {
  ROUND_OF_32: 0, LAST_16: 1, QUARTER_FINALS: 2, SEMI_FINALS: 3, THIRD_PLACE: 4, FINAL: 5,
}
const KNOCKOUT_STAGES = ['ROUND_OF_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL']
const DONE = new Set(['FINISHED', 'AWARDED'])
const LIVE = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const UPCOMING = new Set(['TIMED', 'SCHEDULED'])

const NODE_W = 152
const NODE_H = 68
const CONN_W = 20
const INNER_GAP = 8
const PAIR_GAP = 28

type PickState = 'picked' | 'correct' | 'wrong'

function isTbdName(name: string) {
  return !name ||
    /^(\d+[a-z]|[a-z]\d+|rd\d*|qf|sf|tbd)/i.test(name.trim()) ||
    /winner|ganador|semifin|quarter|runner|loser/i.test(name)
}

function TeamCrest({ crest, tla }: { crest: string; tla: string }) {
  const [imgError, setImgError] = useState(false)
  if (!crest || imgError) {
    return (
      <div className="w-5 h-5 flex-shrink-0 rounded-full flex items-center justify-center"
        style={{ background: 'var(--graphite-2)', border: '1px solid var(--hairline)' }}>
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

function TeamRow({ crest, name, tla, score, winner, tbd, pickState, onPick }: {
  crest: string; name: string; tla: string; score: number | null
  winner: boolean | null; tbd: string; pickState?: PickState; onPick?: () => void
}) {
  const isTbd = isTbdName(name)
  const canPick = !!onPick && !isTbd

  // Color logic: correct=green, picked=gold, wrong=muted, winner=gold, else warm
  const nameColor =
    pickState === 'correct' ? 'var(--patina)' :
    pickState === 'picked'  ? 'var(--kinpaku)' :
    pickState === 'wrong'   ? 'var(--text-disabled)' :
    isTbd                   ? 'var(--text-disabled)' :
    winner === true         ? 'var(--kinpaku)' :
                              'var(--text-warm)'

  const rowBg =
    pickState === 'correct' ? 'oklch(70% 0.12 188 / 0.12)' :
    pickState === 'picked'  ? 'oklch(84% 0.19 80 / 0.10)' :
    winner === true         ? 'oklch(84% 0.19 80.46 / 0.08)' :
                              'transparent'

  const accentBar =
    pickState === 'correct' ? 'var(--patina)' :
    pickState === 'picked'  ? 'var(--kinpaku)' :
                              'transparent'

  return (
    <div
      onClick={canPick ? onPick : undefined}
      style={{
        height: NODE_H / 2,
        background: rowBg,
        display: 'flex', alignItems: 'center', gap: 6, paddingLeft: 6, paddingRight: 8,
        cursor: canPick ? 'pointer' : 'default',
        borderLeft: `2px solid ${accentBar}`,
        transition: 'background 150ms, border-color 150ms',
        userSelect: 'none',
      }}
    >
      <TeamCrest crest={isTbd ? '' : crest} tla={tla} />
      <span className="flex-1 min-w-0 truncate text-xs font-semibold leading-none"
        style={{ color: nameColor, transition: 'color 150ms' }}>
        {isTbd ? tbd : (name || tla)}
      </span>
      {score !== null && !isTbd && (
        <span className="tabnum font-bold text-sm leading-none flex-shrink-0"
          style={{ color: pickState === 'correct' ? 'var(--patina)' : winner === true ? 'var(--kinpaku)' : 'var(--text-warm)' }}>
          {score}
        </span>
      )}
      {pickState === 'correct' && (
        <Icon icon="material-symbols:check-circle" width={11} height={11} style={{ color: 'var(--patina)', flexShrink: 0 }} />
      )}
      {canPick && !pickState && (
        <Icon icon="material-symbols:radio-button-unchecked" width={10} height={10} style={{ color: 'var(--text-disabled)', flexShrink: 0, opacity: 0.5 }} />
      )}
    </div>
  )
}

function MatchNode({ match, timeZone, dim, tbd, picks, onPick }: {
  match: Match | null; timeZone: string; dim?: boolean; tbd: string
  picks?: BracketPicks; onPick?: (matchId: number, teamId: number) => void
}) {
  const locale = useLocale()
  const isDone = match ? DONE.has(match.status) : false
  const isLive = match ? LIVE.has(match.status) : false
  const canPick = !dim && match != null && UPCOMING.has(match.status)

  const homeScore = isDone || isLive ? match?.score.fullTime.home ?? null : null
  const awayScore = isDone || isLive ? match?.score.fullTime.away ?? null : null
  const homeWon = isDone && homeScore !== null && awayScore !== null && homeScore > awayScore
  const awayWon = isDone && homeScore !== null && awayScore !== null && awayScore > homeScore

  const pickedTeamId = match ? picks?.[match.id] : undefined

  const getPickState = (teamId: number, won: boolean): PickState | undefined => {
    if (pickedTeamId !== teamId) return undefined
    if (isDone) return won ? 'correct' : 'wrong'
    return 'picked'
  }

  const homePickState = match ? getPickState(match.homeTeam.id, homeWon) : undefined
  const awayPickState = match ? getPickState(match.awayTeam.id, awayWon) : undefined

  return (
    <div style={{
      width: NODE_W, height: NODE_H, borderRadius: 'var(--r-md)',
      border: `1px solid ${pickedTeamId && !isDone ? 'oklch(84% 0.19 80 / 0.4)' : 'var(--glass-border)'}`,
      background: dim ? 'var(--raised-lacquer)' : 'var(--glass-bg)',
      overflow: 'hidden', opacity: dim ? 0.4 : 1, flexShrink: 0, position: 'relative',
    }}>
      {isLive && (
        <div className="absolute top-0 left-0 right-0 h-px" style={{ background: 'var(--patina)' }} aria-hidden="true" />
      )}
      <div style={{ borderBottom: '1px solid var(--hairline)' }}>
        <TeamRow
          crest={match?.homeTeam.crest ?? ''} name={localizedCountry(match?.homeTeam.tla, locale, match?.homeTeam.shortName ?? '')}
          tla={match?.homeTeam.tla ?? ''} score={homeScore} winner={isDone ? homeWon : null}
          tbd={tbd} pickState={homePickState}
          onPick={canPick && match ? () => onPick?.(match.id, match.homeTeam.id) : undefined}
        />
      </div>
      <TeamRow
        crest={match?.awayTeam.crest ?? ''} name={localizedCountry(match?.awayTeam.tla, locale, match?.awayTeam.shortName ?? '')}
        tla={match?.awayTeam.tla ?? ''} score={awayScore} winner={isDone ? awayWon : null}
        tbd={tbd} pickState={awayPickState}
        onPick={canPick && match ? () => onPick?.(match.id, match.awayTeam.id) : undefined}
      />
      {!isDone && match && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="tabnum" suppressHydrationWarning style={{
            fontSize: '0.6rem', color: isLive ? 'var(--patina)' : 'var(--text-disabled)',
            fontFamily: 'var(--font-hanken)', background: 'var(--raised-lacquer)',
            padding: '1px 4px', borderRadius: 2, letterSpacing: 1,
          }}>
            {isLive ? 'Live' : formatTime(match.utcDate, timeZone)}
          </span>
        </div>
      )}
    </div>
  )
}

function PairConnector({ top, mid, bottom }: { top: number; mid: number; bottom: number }) {
  return (
    <>
      <div style={{ position: 'absolute', right: 0, top, height: bottom - top, width: 1, background: 'var(--hairline-gold)' }} />
      <div style={{ position: 'absolute', right: 0, top: mid, width: CONN_W, height: 1, background: 'var(--hairline-gold)' }} />
    </>
  )
}

function EntryLine({ top }: { top: number }) {
  return (
    <div style={{
      position: 'absolute', left: 0, top, width: CONN_W, height: 1,
      background: 'var(--hairline-gold)', transform: 'translateX(-100%)',
    }} />
  )
}

function RoundList({ matches, timeZone, tbd, picks, onPick }: {
  matches: Match[]; timeZone: string; tbd: string
  picks?: BracketPicks; onPick?: (matchId: number, teamId: number) => void
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {matches.map((m) => (
        <MatchNode key={m.id} match={m} timeZone={timeZone} tbd={tbd} picks={picks} onPick={onPick} />
      ))}
    </div>
  )
}

function BracketTree({ qf, sf, final, timeZone, dim, tbd, champion: championLabel, picks, onPick }: {
  qf: (Match | null)[]; sf: (Match | null)[]; final: Match | null
  timeZone: string; dim: boolean; tbd: string; champion: string
  picks?: BracketPicks; onPick?: (matchId: number, teamId: number) => void
}) {
  const locale = useLocale()
  const pairH = NODE_H + INNER_GAP + NODE_H
  const totalH = pairH + PAIR_GAP + pairH

  const qf0c = NODE_H / 2, qf1c = NODE_H + INNER_GAP + NODE_H / 2
  const pair1c = (qf0c + qf1c) / 2
  const pair2Top = pairH + PAIR_GAP
  const qf2c = pair2Top + NODE_H / 2, qf3c = pair2Top + NODE_H + INNER_GAP + NODE_H / 2
  const pair2c = (qf2c + qf3c) / 2
  const sfCol1top = pair1c - NODE_H / 2, sfCol2top = pair2c - NODE_H / 2
  const sf1c = sfCol1top + NODE_H / 2, sf2c = sfCol2top + NODE_H / 2
  const finalTop = (sf1c + sf2c) / 2 - NODE_H / 2, finalCenter = finalTop + NODE_H / 2

  const champion =
    final && DONE.has(final.status)
      ? final.score.winner === 'HOME_TEAM' ? final.homeTeam
        : final.score.winner === 'AWAY_TEAM' ? final.awayTeam : null
      : null

  return (
    <div className="flex items-start" style={{ gap: CONN_W }}>
      {/* QF */}
      <div className="relative flex-shrink-0" style={{ width: NODE_W, height: totalH }}>
        <div style={{ position: 'absolute', top: 0 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: INNER_GAP }}>
            <MatchNode match={qf[0] ?? null} timeZone={timeZone} dim={dim} tbd={tbd} picks={picks} onPick={onPick} />
            <MatchNode match={qf[1] ?? null} timeZone={timeZone} dim={dim} tbd={tbd} picks={picks} onPick={onPick} />
          </div>
        </div>
        <div style={{ position: 'absolute', top: pairH + PAIR_GAP }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: INNER_GAP }}>
            <MatchNode match={qf[2] ?? null} timeZone={timeZone} dim={dim} tbd={tbd} picks={picks} onPick={onPick} />
            <MatchNode match={qf[3] ?? null} timeZone={timeZone} dim={dim} tbd={tbd} picks={picks} onPick={onPick} />
          </div>
        </div>
        <PairConnector top={qf0c} mid={pair1c} bottom={qf1c} />
        <PairConnector top={qf2c} mid={pair2c} bottom={qf3c} />
      </div>

      {/* SF */}
      <div className="relative flex-shrink-0" style={{ width: NODE_W, height: totalH }}>
        <div style={{ position: 'absolute', top: sfCol1top }}>
          <MatchNode match={sf[0] ?? null} timeZone={timeZone} dim={dim} tbd={tbd} picks={picks} onPick={onPick} />
        </div>
        <div style={{ position: 'absolute', top: sfCol2top }}>
          <MatchNode match={sf[1] ?? null} timeZone={timeZone} dim={dim} tbd={tbd} picks={picks} onPick={onPick} />
        </div>
        <EntryLine top={sf1c} />
        <EntryLine top={sf2c} />
        <PairConnector top={sf1c} mid={finalCenter} bottom={sf2c} />
      </div>

      {/* Final */}
      <div className="relative flex-shrink-0" style={{ width: NODE_W, height: totalH }}>
        <div style={{ position: 'absolute', top: finalTop }}>
          <MatchNode match={final} timeZone={timeZone} dim={dim} tbd={tbd} picks={picks} onPick={onPick} />
        </div>
        <EntryLine top={finalCenter} />
        {champion && (
          <div style={{ position: 'absolute', top: finalTop + NODE_H + 16, left: 0, right: 0 }}>
            <div className="flex flex-col items-center gap-2 px-2 py-3 text-center" style={{
              background: 'oklch(84% 0.19 80.46 / 0.10)',
              border: '1px solid var(--hairline-gold)', borderRadius: 'var(--r-lg)',
            }}>
              <Icon icon="material-symbols:emoji-events" width={24} height={24} style={{ color: 'var(--kinpaku)' }} />
              <span className="eyebrow" style={{ color: 'var(--kinpaku)', letterSpacing: '0.1em', fontSize: '0.55rem' }}>
                {championLabel}
              </span>
              {champion.crest && (
                <div className="relative" style={{ width: 32, height: 32 }}>
                  <Image src={champion.crest} alt={champion.name} fill unoptimized className="object-contain" sizes="32px" />
                </div>
              )}
              <span className="text-xs font-bold" style={{ color: 'var(--champagne)' }}>
                {localizedCountry(champion.tla, locale, champion.shortName ?? champion.name)}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function PhaseTabs({ stages, active, onSelect, labelFn }: {
  stages: string[]; active: string; onSelect: (s: string) => void; labelFn: (s: string) => string
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-5" style={{ paddingBottom: 2 }}>
      {stages.map((s) => {
        const isActive = active === s
        return (
          <button key={s} onClick={() => onSelect(s)} className="flex-shrink-0 soft-haptic focus-visible:outline-none"
            style={{
              padding: '7px 16px', borderRadius: 'var(--r-lg)',
              border: `1px solid ${isActive ? 'var(--kinpaku)' : 'var(--hairline)'}`,
              background: isActive ? 'oklch(84% 0.19 80.46 / 0.12)' : 'var(--graphite)',
              color: isActive ? 'var(--kinpaku)' : 'var(--text-muted)',
              fontSize: '12px', fontWeight: 700, letterSpacing: '0.05em',
              textTransform: 'uppercase', transition: 'all 150ms', whiteSpace: 'nowrap',
            }}>
            {labelFn(s)}
          </button>
        )
      })}
    </div>
  )
}

interface Props {
  matches: Match[]
  timeZone: string
  picks?: BracketPicks
  onPick?: (matchId: number, teamId: number) => void
}

export default function KnockoutBracket({ matches, timeZone, picks = {}, onPick }: Props) {
  const t = useTranslations('bracket')
  const stageLabel = (s: string) =>
    t(s as 'ROUND_OF_32' | 'LAST_16' | 'QUARTER_FINALS' | 'SEMI_FINALS' | 'THIRD_PLACE' | 'FINAL')

  const knockout = matches
    .filter((m) => STAGE_ORDER[m.stage] !== undefined)
    .sort((a, b) => STAGE_ORDER[a.stage] - STAGE_ORDER[b.stage] || a.utcDate.localeCompare(b.utcDate))

  const byStage = (stage: string) => knockout.filter((m) => m.stage === stage)
  const r32 = byStage('ROUND_OF_32')
  const r16 = byStage('LAST_16')
  const qf  = byStage('QUARTER_FINALS')
  const sf  = byStage('SEMI_FINALS')
  const thirdPlace = byStage('THIRD_PLACE')
  const finalMatch = byStage('FINAL')

  const hasData = knockout.length > 0
  const activeStages = KNOCKOUT_STAGES.filter((s) => byStage(s).length > 0)
  const [activePhase, setActivePhase] = useState<string>(activeStages[0] ?? 'ROUND_OF_32')
  const hasBracketData = qf.length > 0 || sf.length > 0 || finalMatch.length > 0

  const placeholderQf: (Match | null)[] = [null, null, null, null]
  const placeholderSf: (Match | null)[] = [null, null]

  // Count how many picks the user has made in knockout matches
  const pickableMatchIds = new Set(knockout.filter(m => UPCOMING.has(m.status)).map(m => m.id))
  const pickCount = Object.keys(picks).filter(id => pickableMatchIds.has(Number(id))).length

  return (
    <div>
      {/* Empty / coming soon */}
      {!hasData && (
        <div>
          <div className="flex items-center gap-3 mb-5 px-4 py-3" style={{
            background: 'oklch(84% 0.19 80.46 / 0.06)',
            border: '1px solid var(--hairline-gold)', borderRadius: 'var(--r-lg)',
          }}>
            <Icon icon="material-symbols:lock-clock" width={20} height={20} style={{ color: 'var(--kinpaku)', flexShrink: 0 }} />
            <div>
              <p className="text-sm font-semibold" style={{ color: 'var(--champagne)' }}>{t('available')}</p>
              <p className="eyebrow mt-0.5" style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>{t('availableSince')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar mb-4">
            {['ROUND_OF_32', 'LAST_16', 'QUARTER_FINALS', 'SEMI_FINALS', 'FINAL'].map((s) => (
              <div key={s} style={{
                padding: '7px 16px', borderRadius: 'var(--r-lg)',
                border: '1px solid var(--hairline)', background: 'var(--graphite)',
                color: 'var(--text-disabled)', fontSize: '12px', fontWeight: 700,
                letterSpacing: '0.05em', textTransform: 'uppercase', whiteSpace: 'nowrap',
                opacity: 0.4, flexShrink: 0,
              }}>
                {stageLabel(s)}
              </div>
            ))}
          </div>
          <div className="overflow-x-auto pb-4 hide-scrollbar">
            <div style={{ minWidth: 3 * NODE_W + 2 * CONN_W + 8 }}>
              <div className="flex items-center justify-between mb-3" style={{ width: 3 * NODE_W + 2 * CONN_W }}>
                {[t('colQF'), t('colSF'), t('colFinal')].map((label) => (
                  <span key={label} className="eyebrow" style={{ color: 'var(--text-disabled)', width: NODE_W, textAlign: 'center', letterSpacing: '0.1em' }}>
                    {label}
                  </span>
                ))}
              </div>
              <BracketTree qf={placeholderQf} sf={placeholderSf} final={null} timeZone={timeZone} dim={true} tbd={t('tbd')} champion={t('champion')} />
            </div>
          </div>
        </div>
      )}

      {/* Active bracket */}
      {hasData && (
        <div>
          {/* Pick counter hint */}
          {pickableMatchIds.size > 0 && (
            <div className="flex items-center gap-2 mb-4 px-3 py-2" style={{
              background: 'oklch(84% 0.19 80 / 0.06)', border: '1px solid var(--hairline-gold)',
              borderRadius: 'var(--r-md)',
            }}>
              <Icon icon="material-symbols:trophy-outline" width={14} height={14} style={{ color: 'var(--kinpaku)', flexShrink: 0 }} />
              <p className="eyebrow flex-1" style={{ color: 'var(--text-muted)', fontSize: '0.62rem' }}>
                {t('pickHint')}
              </p>
              <span className="eyebrow tabnum" style={{ color: 'var(--kinpaku)', fontSize: '0.62rem', fontWeight: 700 }}>
                {pickCount} / {pickableMatchIds.size}
              </span>
            </div>
          )}

          <PhaseTabs stages={activeStages} active={activePhase} onSelect={setActivePhase} labelFn={stageLabel} />

          <div className="tab-panel">
            {activePhase === 'ROUND_OF_32' && r32.length > 0 && (
              <RoundList matches={r32} timeZone={timeZone} tbd={t('tbd')} picks={picks} onPick={onPick} />
            )}
            {activePhase === 'LAST_16' && r16.length > 0 && (
              <RoundList matches={r16} timeZone={timeZone} tbd={t('tbd')} picks={picks} onPick={onPick} />
            )}
            {(activePhase === 'QUARTER_FINALS' || activePhase === 'SEMI_FINALS' || activePhase === 'FINAL') && hasBracketData && (
              <div className="overflow-x-auto pb-4 hide-scrollbar">
                <div style={{ minWidth: 3 * NODE_W + 2 * CONN_W + 8 }}>
                  <div className="flex items-center mb-3" style={{ gap: CONN_W }}>
                    {[
                      qf.length > 0 ? t('colQF') : null,
                      sf.length > 0 ? t('colSF') : null,
                      finalMatch.length > 0 ? t('colFinal') : null,
                    ].filter(Boolean).map((label) => (
                      <span key={label} className="eyebrow"
                        style={{ color: 'var(--text-faint)', width: NODE_W, textAlign: 'center', letterSpacing: '0.1em', flexShrink: 0 }}>
                        {label}
                      </span>
                    ))}
                  </div>
                  <BracketTree
                    qf={[qf[0] ?? null, qf[1] ?? null, qf[2] ?? null, qf[3] ?? null]}
                    sf={[sf[0] ?? null, sf[1] ?? null]}
                    final={finalMatch[0] ?? null}
                    timeZone={timeZone} dim={false} tbd={t('tbd')} champion={t('champion')}
                    picks={picks} onPick={onPick}
                  />
                </div>
              </div>
            )}
          </div>

          {thirdPlace.length > 0 && (
            <section className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <div style={{ width: 3, height: 16, background: 'var(--kinpaku)', borderRadius: 2, flexShrink: 0 }} aria-hidden="true" />
                <span className="eyebrow" style={{ color: 'var(--text-muted)', letterSpacing: '0.1em' }}>{t('thirdPlace')}</span>
              </div>
              <div style={{ maxWidth: NODE_W * 2 + 16 }}>
                <MatchNode match={thirdPlace[0]} timeZone={timeZone} tbd={t('tbd')} picks={picks} onPick={onPick} />
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  )
}
