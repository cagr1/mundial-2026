import { Match } from '@/types/football'
import { groupMatchesByDay, formatDayHeading, isToday } from '@/lib/format-date'
import MatchCard from './MatchCard'

interface Props {
  matches: Match[]
  timeZone: string
}

export default function MatchList({ matches, timeZone }: Props) {
  const grouped = groupMatchesByDay(matches, timeZone)

  return (
    <div className="space-y-8">
      {Array.from(grouped.entries()).map(([dateKey, dayMatches]) => {
        const today = isToday(dayMatches[0].utcDate, timeZone)

        return (
          <section key={dateKey}>
            {/* Day heading */}
            <div className="flex items-center gap-3 mb-4">
              <h2
                className="eyebrow capitalize"
                style={{
                  color: today ? 'var(--kinpaku)' : 'var(--text-muted)',
                  letterSpacing: '0.12em',
                }}
                suppressHydrationWarning
              >
                {formatDayHeading(dayMatches[0].utcDate, timeZone)}
              </h2>
              {today ? (
                <span
                  className="eyebrow px-2 py-0.5 border"
                  style={{
                    color: 'var(--kinpaku)',
                    background: 'oklch(84% 0.19 80.46 / 0.08)',
                    borderColor: 'var(--hairline-gold)',
                    borderRadius: 'var(--r-xs)',
                  }}
                >
                  Hoy
                </span>
              ) : null}
              <div className="flex-1 h-px" style={{ background: 'var(--hairline)' }} />
              <span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)' }}>
                {dayMatches.length}
              </span>
            </div>

            {/* Match grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {dayMatches.map((match) => (
                <MatchCard key={match.id} match={match} timeZone={timeZone} />
              ))}
            </div>
          </section>
        )
      })}
    </div>
  )
}
