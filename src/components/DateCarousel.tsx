'use client'

import { useEffect, useRef } from 'react'

const MONTH_ES: Record<number, string> = {
  0: 'Enero', 1: 'Febrero', 2: 'Marzo', 3: 'Abril',
  4: 'Mayo', 5: 'Junio', 6: 'Julio', 7: 'Agosto',
  8: 'Septiembre', 9: 'Octubre', 10: 'Noviembre', 11: 'Diciembre',
}

const WEEKDAY_SHORT: Record<number, string> = {
  0: 'DOM', 1: 'LUN', 2: 'MAR', 3: 'MIÉ', 4: 'JUE', 5: 'VIE', 6: 'SÁB',
}

const MONTH_SHORT: Record<number, string> = {
  0: 'ENE', 1: 'FEB', 2: 'MAR', 3: 'ABR',
  4: 'MAY', 5: 'JUN', 6: 'JUL', 7: 'AGO',
  8: 'SEP', 9: 'OCT', 10: 'NOV', 11: 'DIC',
}

function todayKey(timeZone: string): string {
  return new Intl.DateTimeFormat('en-CA', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone,
  }).format(new Date())
}

function parseDateParts(dateKey: string, timeZone: string) {
  const d = new Date(dateKey + 'T12:00:00Z')
  const local = new Intl.DateTimeFormat('en', {
    weekday: 'short', day: 'numeric', month: 'numeric', year: 'numeric', timeZone,
  }).formatToParts(d)
  const month = Number(local.find(p => p.type === 'month')?.value ?? 0) - 1
  const day = Number(local.find(p => p.type === 'day')?.value ?? 0)
  const wd = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    .indexOf(local.find(p => p.type === 'weekday')?.value ?? 'Mon')
  const year = Number(local.find(p => p.type === 'year')?.value ?? 2026)
  return { month, day, weekday: wd, year }
}

interface Props {
  dates: string[]          // ISO date keys "2026-06-11"
  selected: string | null  // null = all
  onSelect: (date: string | null) => void
  timeZone: string
  phaseLabel: string       // "FASE DE GRUPOS", "OCTAVOS DE FINAL", etc.
}

export default function DateCarousel({ dates, selected, onSelect, timeZone, phaseLabel }: Props) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = todayKey(timeZone)

  // Derive displayed month from selected date, or today, or first date
  const displayDate = selected ?? today
  const { month, year } = parseDateParts(
    dates.includes(displayDate) ? displayDate : (dates[0] ?? displayDate),
    timeZone,
  )

  // Auto-scroll active tile into view
  useEffect(() => {
    const container = scrollRef.current
    if (!container) return
    const activeKey = selected ?? today
    const btn = container.querySelector<HTMLElement>(`[data-date="${activeKey}"]`)
    if (!btn) return
    const cLeft = container.getBoundingClientRect().left
    const bLeft = btn.getBoundingClientRect().left
    const bCenter = bLeft + btn.offsetWidth / 2
    const targetScroll = container.scrollLeft + (bCenter - cLeft) - container.offsetWidth / 2
    container.scrollTo({ left: targetScroll, behavior: 'smooth' })
  }, [selected, today])

  const handleTodayClick = () => {
    if (dates.includes(today)) {
      onSelect(today)
    } else {
      // No matches today — go to nearest upcoming date
      const upcoming = dates.find(d => d >= today) ?? null
      onSelect(upcoming)
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* ── Phase + Month header ────────────────────────────────────── */}
      <div className="flex items-end justify-between gap-2 mb-4" suppressHydrationWarning>
        <div>
          <p
            className="eyebrow"
            style={{ color: 'var(--kinpaku)', letterSpacing: '0.1em', marginBottom: 4 }}
          >
            {phaseLabel}
          </p>
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              lineHeight: 1,
              color: 'var(--text-warm)',
              letterSpacing: '-0.02em',
            }}
            suppressHydrationWarning
          >
            {MONTH_ES[month]} {year}
          </h2>
        </div>

        {/* Hoy button */}
        <button
          onClick={handleTodayClick}
          className="soft-haptic focus-visible:outline-none flex-shrink-0"
          style={{
            padding: '6px 16px',
            borderRadius: 'var(--r-lg)',
            background: 'var(--graphite)',
            border: '1px solid var(--hairline)',
            color: 'var(--text-muted)',
            fontSize: '13px',
            fontWeight: 600,
            letterSpacing: '0.02em',
            marginBottom: 4,
          }}
        >
          Hoy
        </button>
      </div>

      {/* ── Date tiles ─────────────────────────────────────────────── */}
      <div
        ref={scrollRef}
        className="flex gap-3 overflow-x-auto hide-scrollbar"
        style={{ paddingBottom: 4 }}
      >
        {dates.map((dateKey) => {
          const isActive = selected === dateKey
          const isToday = dateKey === today
          const { month: dm, day, weekday } = parseDateParts(dateKey, timeZone)

          const topLabel = isToday ? MONTH_SHORT[dm] : WEEKDAY_SHORT[weekday] ?? '---'

          return (
            <button
              key={dateKey}
              data-date={dateKey}
              onClick={() => onSelect(isActive ? null : dateKey)}
              className="soft-haptic focus-visible:outline-none flex-shrink-0"
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                width: 64,
                height: 76,
                borderRadius: 'var(--r-lg)',
                border: `1px solid ${isActive ? 'var(--kinpaku)' : 'var(--hairline)'}`,
                background: isActive ? 'var(--kinpaku)' : 'var(--graphite)',
                transition: 'all 150ms',
              }}
            >
              <span
                style={{
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.08em',
                  color: isActive ? 'var(--lacquer-deep)' : isToday ? 'var(--kinpaku)' : 'var(--text-faint)',
                  lineHeight: 1,
                }}
              >
                {topLabel}
              </span>
              <span
                style={{
                  fontSize: '28px',
                  fontWeight: 700,
                  lineHeight: 1,
                  color: isActive ? 'var(--lacquer-deep)' : 'var(--text-warm)',
                  letterSpacing: '-0.02em',
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {day}
              </span>
              {/* Dot indicator for today or active */}
              <div
                aria-hidden="true"
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: '50%',
                  background: isActive
                    ? 'var(--lacquer-deep)'
                    : isToday
                      ? 'var(--kinpaku)'
                      : 'transparent',
                  transition: 'background 150ms',
                }}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
