'use client'

import { useState, useEffect, useCallback, useSyncExternalStore } from 'react'
import { createPortal } from 'react-dom'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Match, Prediction } from '@/types/football'
import { getPredictionResult, PredictionResult } from '@/hooks/usePredictions'

const DONE = new Set(['FINISHED', 'AWARDED'])
const LIVE = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])

const RESULT_STYLE: Record<PredictionResult, { color: string; icon: string; bg: string; border: string }> = {
  exact:   { color: 'var(--patina)',    icon: 'material-symbols:check-circle',       bg: 'oklch(70% 0.12 188 / 0.12)', border: 'oklch(70% 0.12 188 / 0.4)' },
  correct: { color: 'var(--kinpaku)',   icon: 'material-symbols:radio-button-checked', bg: 'oklch(84% 0.19 80 / 0.10)',  border: 'oklch(84% 0.19 80 / 0.35)' },
  wrong:   { color: 'var(--vermilion)', icon: 'material-symbols:cancel',             bg: 'oklch(62% 0.22 27 / 0.10)',  border: 'oklch(62% 0.22 27 / 0.35)' },
}

interface Props {
  match: Match
  prediction?: Prediction
  onSave: (matchId: number, prediction: Prediction | null) => void
  onClose: () => void
}

function ScoreCounter({ value, onChange, disabled }: { value: number; onChange: (v: number) => void; disabled: boolean }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button
        onClick={() => onChange(Math.min(value + 1, 20))}
        disabled={disabled}
        style={{
          width: 40, height: 40, borderRadius: 'var(--r-sm)',
          background: disabled ? 'var(--graphite)' : 'var(--graphite-2)',
          border: '1px solid var(--hairline)',
          color: disabled ? 'var(--text-disabled)' : 'var(--text-warm)',
          fontSize: 22, fontWeight: 300, lineHeight: 1,
          cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        +
      </button>
      <span style={{
        fontSize: 44, fontWeight: 700, lineHeight: 1, color: disabled ? 'var(--text-muted)' : 'var(--champagne)',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.03em', minWidth: 48, textAlign: 'center',
      }}>
        {value}
      </span>
      <button
        onClick={() => onChange(Math.max(value - 1, 0))}
        disabled={disabled}
        style={{
          width: 40, height: 40, borderRadius: 'var(--r-sm)',
          background: disabled ? 'var(--graphite)' : 'var(--graphite-2)',
          border: '1px solid var(--hairline)',
          color: disabled ? 'var(--text-disabled)' : 'var(--text-warm)',
          fontSize: 26, fontWeight: 300, lineHeight: 1,
          cursor: disabled ? 'default' : 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        −
      </button>
    </div>
  )
}

function TeamDisplay({ name, crest, tla }: { name: string; crest: string; tla: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1, minWidth: 0 }}>
      {crest ? (
        <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
          <Image src={crest} alt={name} fill className="object-contain" sizes="44px" unoptimized />
        </div>
      ) : (
        <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--graphite-2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-faint)', fontWeight: 700 }}>{tla}</span>
        </div>
      )}
      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-warm)', textAlign: 'center', lineHeight: 1.2, wordBreak: 'break-word' }}>
        {name}
      </span>
    </div>
  )
}

export default function PredictionModal({ match, prediction, onSave, onClose }: Props) {
  const t = useTranslations('predictions')
  const mounted = useSyncExternalStore(() => () => {}, () => true, () => false)

  const isDone = DONE.has(match.status)
  const isLive = LIVE.has(match.status)
  const canEdit = !isDone && !isLive

  const [home, setHome] = useState(prediction?.home ?? 0)
  const [away, setAway] = useState(prediction?.away ?? 0)

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', handler); document.body.style.overflow = '' }
  }, [handleClose])

  const handleSave = () => {
    onSave(match.id, { home, away })
    onClose()
  }

  const handleDelete = () => {
    onSave(match.id, null)
    onClose()
  }

  const actualHome = match.score.fullTime.home
  const actualAway = match.score.fullTime.away
  const result: PredictionResult | null =
    isDone && prediction && actualHome !== null && actualAway !== null
      ? getPredictionResult(prediction, { home: actualHome, away: actualAway })
      : null

  if (!mounted) return null

  return createPortal(
    <>
      {/* Overlay */}
      <div
        onClick={handleClose}
        style={{ position: 'fixed', inset: 0, background: 'oklch(4% 0.004 95 / 0.7)', zIndex: 60 }}
        aria-hidden="true"
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-label={t('title')}
        style={{
          position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 61,
          background: 'var(--lacquer)',
          borderRadius: 'var(--r-lg) var(--r-lg) 0 0',
          border: '1px solid var(--hairline)',
          borderBottom: 'none',
          paddingBottom: 'env(safe-area-inset-bottom)',
          animation: 'slide-up 220ms cubic-bezier(0.32, 0.72, 0, 1)',
        }}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 12, paddingBottom: 4 }}>
          <div style={{ width: 36, height: 4, borderRadius: 2, background: 'var(--hairline)' }} />
        </div>

        {/* Title */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 20px 16px' }}>
          <h3 style={{ fontSize: 17, fontWeight: 700, color: 'var(--champagne)' }}>{t('title')}</h3>
          <button onClick={handleClose} aria-label={t('close')}
            style={{ color: 'var(--text-muted)', background: 'transparent', border: 'none', cursor: 'pointer', padding: 4 }}>
            ✕
          </button>
        </div>

        {/* Result banner (after match) */}
        {result && (
          <div style={{
            margin: '0 20px 16px',
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            background: RESULT_STYLE[result].bg,
            border: `1px solid ${RESULT_STYLE[result].border}`,
            display: 'flex', alignItems: 'center', gap: 10,
          }}>
            <Icon icon={RESULT_STYLE[result].icon} width={22} height={22} style={{ color: RESULT_STYLE[result].color, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: 14, fontWeight: 700, color: RESULT_STYLE[result].color, lineHeight: 1 }}>{t(result)}</p>
              <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, fontVariantNumeric: 'tabular-nums' }}>
                {t('yourPick')}: {prediction!.home}–{prediction!.away}
                {' · '}
                {t('actual')}: {actualHome}–{actualAway}
              </p>
            </div>
          </div>
        )}

        {/* Score input */}
        <div style={{ padding: '0 20px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <TeamDisplay name={match.homeTeam.shortName} crest={match.homeTeam.crest} tla={match.homeTeam.tla} />

          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
            <ScoreCounter value={home} onChange={setHome} disabled={!canEdit} />
            <span style={{ fontSize: 32, fontWeight: 300, color: 'var(--text-disabled)', lineHeight: 1 }}>–</span>
            <ScoreCounter value={away} onChange={setAway} disabled={!canEdit} />
          </div>

          <TeamDisplay name={match.awayTeam.shortName} crest={match.awayTeam.crest} tla={match.awayTeam.tla} />
        </div>

        {/* Lock message */}
        {isLive && (
          <div style={{ margin: '0 20px 16px', textAlign: 'center' }}>
            <p style={{ fontSize: 11, color: 'var(--text-disabled)', letterSpacing: '0.06em' }}>
              {t('lockMsg')}
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: 10, padding: '0 20px 20px' }}>
          {prediction && canEdit && (
            <button onClick={handleDelete}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 'var(--r-md)',
                background: 'transparent', border: '1px solid var(--hairline)',
                color: 'var(--vermilion)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              <Icon icon="material-symbols:delete-outline" width={16} height={16} />
              {t('delete')}
            </button>
          )}
          {canEdit ? (
            <button onClick={handleSave}
              style={{
                flex: 2, padding: '12px 16px', borderRadius: 'var(--r-md)',
                background: 'var(--kinpaku)', border: 'none',
                color: 'var(--lacquer-deep)', fontSize: 14, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}>
              <Icon icon="material-symbols:check" width={16} height={16} />
              {prediction ? t('update') : t('save')}
            </button>
          ) : (
            <button onClick={handleClose}
              style={{
                flex: 1, padding: '12px 16px', borderRadius: 'var(--r-md)',
                background: 'var(--graphite)', border: '1px solid var(--hairline)',
                color: 'var(--text-warm)', fontSize: 14, fontWeight: 600, cursor: 'pointer',
              }}>
              {t('close')}
            </button>
          )}
        </div>
      </div>
    </>,
    document.body,
  )
}
