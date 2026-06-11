'use client'

import { useLocale } from 'next-intl'
import { Match, PredictionsMap } from '@/types/football'
import { groupMatchesByDay, isToday } from '@/lib/format-date'
import MatchCard from './MatchCard'

interface Props {
  matches: Match[]
  timeZone: string
  predictions?: PredictionsMap
  onPredict?: (match: Match) => void
  onSelect?: (match: Match) => void
}

function formatDayLabel(utcDate: string, timeZone: string, locale: string): { day: string; date: string } {
  const d = new Date(utcDate)
  const day = new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone }).format(d).toUpperCase()
  const date = new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'short', timeZone }).format(d).toUpperCase()
  return { day, date }
}

export default function MatchList({ matches, timeZone, predictions = {}, onPredict, onSelect }: Props) {
  const locale = useLocale()
  const grouped = groupMatchesByDay(matches, timeZone)

  if (!matches.length) {
    return (
      <div className="py-12 text-center">
        <p className="eyebrow" style={{ color: 'var(--text-muted)', letterSpacing: '0.12em' }}>
          No hay partidos disponibles
        </p>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
      {Array.from(grouped.entries()).map(([dateKey, dayMatches]) => {
        const today = isToday(dayMatches[0].utcDate, timeZone)
        const { day, date } = formatDayLabel(dayMatches[0].utcDate, timeZone, locale)

        return (
          <section key={dateKey}>
            <div className="flex items-center gap-3 mb-3" suppressHydrationWarning>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '4px 10px', borderRadius: 'var(--r-lg)',
                background: today ? 'oklch(84% 0.19 80.46 / 0.12)' : 'var(--graphite)',
                border: `1px solid ${today ? 'var(--hairline-gold)' : 'var(--hairline)'}`,
                flexShrink: 0,
              }}>
                <span style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.06em', color: today ? 'var(--kinpaku)' : 'var(--text-faint)', lineHeight: 1 }}>
                  {day}
                </span>
                <span style={{ width: 1, height: 10, background: today ? 'var(--hairline-gold)' : 'var(--hairline)', borderRadius: 1 }} aria-hidden="true" />
                <span style={{ fontSize: '11px', fontWeight: today ? 700 : 500, letterSpacing: '0.04em', color: today ? 'var(--kinpaku)' : 'var(--text-muted)', lineHeight: 1 }}>
                  {date}
                </span>
                {today && (
                  <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--kinpaku)', display: 'inline-block', flexShrink: 0 }} aria-hidden="true" />
                )}
              </div>
              <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
              <span style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-disabled)', fontVariantNumeric: 'tabular-nums', flexShrink: 0 }}>
                {dayMatches.length}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {dayMatches.map((match) => (
                <MatchCard
                  key={match.id}
                  match={match}
                  timeZone={timeZone}
                  prediction={predictions[match.id]}
                  onPredict={onPredict ? () => onPredict(match) : undefined}
                  onSelect={onSelect ? () => onSelect(match) : undefined}
                />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
