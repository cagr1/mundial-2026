'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'
import { Prediction, Match } from '@/types/football'
import { getPredictionResult } from '@/hooks/usePredictions'

const DONE = new Set(['FINISHED', 'AWARDED'])
const LIVE = new Set(['LIVE', 'IN_PLAY', 'PAUSED'])
const UPCOMING = new Set(['TIMED', 'SCHEDULED'])

const RESULT_STYLE = {
  exact:   { color: 'var(--patina)',    bg: 'oklch(70% 0.12 188 / 0.15)', border: 'oklch(70% 0.12 188 / 0.5)',  icon: 'material-symbols:check-circle' },
  correct: { color: 'var(--kinpaku)',   bg: 'oklch(84% 0.19 80 / 0.12)',  border: 'oklch(84% 0.19 80 / 0.4)',   icon: 'material-symbols:radio-button-checked' },
  wrong:   { color: 'var(--vermilion)', bg: 'oklch(62% 0.22 27 / 0.12)',  border: 'oklch(62% 0.22 27 / 0.4)',   icon: 'material-symbols:cancel' },
}

interface Props {
  match: Match
  prediction?: Prediction
  onClick: () => void
}

export default function PredictionBadge({ match, prediction, onClick }: Props) {
  const t = useTranslations('predictions')
  const isDone = DONE.has(match.status)
  const isLive = LIVE.has(match.status)
  const isUpcoming = UPCOMING.has(match.status)

  // Nothing to show if no prediction and can't predict anymore
  if (!prediction && !isUpcoming) return null

  const actualHome = match.score.fullTime.home
  const actualAway = match.score.fullTime.away

  const result = isDone && prediction && actualHome !== null && actualAway !== null
    ? getPredictionResult(prediction, { home: actualHome, away: actualAway })
    : null

  const rs = result ? RESULT_STYLE[result] : null

  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick() }}
      aria-label={t('ariaLabel')}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: prediction ? '3px 8px 3px 6px' : '3px 7px',
        borderRadius: 999,
        background: rs ? rs.bg : prediction ? 'oklch(84% 0.19 80 / 0.08)' : 'var(--graphite)',
        border: `1px solid ${rs ? rs.border : prediction ? 'oklch(84% 0.19 80 / 0.3)' : 'var(--hairline)'}`,
        cursor: 'pointer',
        transition: 'all 150ms',
        flexShrink: 0,
      }}
    >
      {rs ? (
        <>
          <Icon icon={rs.icon} width={11} height={11} style={{ color: rs.color, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: rs.color, fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {prediction!.home}–{prediction!.away}
          </span>
        </>
      ) : prediction ? (
        <>
          <Icon
            icon={isLive ? 'material-symbols:lock' : 'material-symbols:edit'}
            width={10} height={10}
            style={{ color: 'var(--kinpaku)', flexShrink: 0 }}
          />
          <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--kinpaku)', fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em', lineHeight: 1 }}>
            {prediction.home}–{prediction.away}
          </span>
        </>
      ) : (
        // No prediction yet, match upcoming → pencil
        <Icon icon="material-symbols:edit-outline" width={12} height={12} style={{ color: 'var(--text-disabled)' }} />
      )}
    </button>
  )
}
