'use client'

import { useEffect, useRef } from 'react'
import { useTranslations, useLocale } from 'next-intl'

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

/** Short uppercase month abbreviation using locale (e.g. "JUN", "JUN", "6月") */
function shortMonth(dateKey: string, timeZone: string, locale: string): string {
  const d = new Date(dateKey + 'T12:00:00Z')
  return new Intl.DateTimeFormat(locale, { month: 'short', timeZone }).format(d).toUpperCase()
}

/** Short uppercase weekday abbreviation using locale (e.g. "MON", "LUN", "周一") */
function shortWeekday(dateKey: string, timeZone: string, locale: string): string {
  const d = new Date(dateKey + 'T12:00:00Z')
  return new Intl.DateTimeFormat(locale, { weekday: 'short', timeZone }).format(d).toUpperCase()
}

interface Props {
  dates: string[]
  selected: string | null
  onSelect: (date: string | null) => void
  timeZone: string
  phaseLabel: string
}

export default function DateCarousel({ dates, selected, onSelect, timeZone, phaseLabel }: Props) {
  const t = useTranslations('carousel')
  const locale = useLocale()
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = todayKey(timeZone)

  const displayDate = selected ?? today
  const { month, year } = parseDateParts(
    dates.includes(displayDate) ? displayDate : (dates[0] ?? displayDate),
    timeZone,
  )

  // Long month name for the header (e.g. "Junio 2026", "June 2026", "2026年6月")
  const headerDate = new Date(year, month, 1)
  const monthLabel = new Intl.DateTimeFormat(locale, { month: 'long', year: 'numeric' }).format(headerDate)

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
      onSelect(dates.find(d => d >= today) ?? null)
    }
  }

  return (
    <div style={{ marginBottom: 20 }}>
      {/* Phase + Month header */}
      <div className="flex items-end justify-between gap-2 mb-4" suppressHydrationWarning>
        <div>
          <p className="eyebrow" style={{ color: 'var(--kinpaku)', letterSpacing: '0.1em', marginBottom: 4 }}>
            {phaseLabel}
          </p>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-warm)', letterSpacing: '-0.02em' }}
            suppressHydrationWarning>
            {monthLabel}
          </h2>
        </div>

        <button onClick={handleTodayClick} className="soft-haptic focus-visible:outline-none flex-shrink-0"
          style={{
            padding: '6px 16px', borderRadius: 'var(--r-lg)', background: 'var(--graphite)',
            border: '1px solid var(--hairline)', color: 'var(--text-muted)',
            fontSize: '13px', fontWeight: 600, letterSpacing: '0.02em', marginBottom: 4,
          }}>
          {t('today')}
        </button>
      </div>

      {/* Date tiles */}
      <div ref={scrollRef} className="flex gap-3 overflow-x-auto hide-scrollbar" style={{ paddingBottom: 4 }}>
        {dates.map((dateKey) => {
          const isActive = selected === dateKey
          const isToday = dateKey === today
          const { day } = parseDateParts(dateKey, timeZone)
          const topLabel = isToday ? shortMonth(dateKey, timeZone, locale) : shortWeekday(dateKey, timeZone, locale)

          return (
            <button key={dateKey} data-date={dateKey}
              onClick={() => onSelect(isActive ? null : dateKey)}
              className="soft-haptic focus-visible:outline-none flex-shrink-0"
              style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                gap: 4, width: 64, height: 76, borderRadius: 'var(--r-lg)',
                border: `1px solid ${isActive ? 'var(--kinpaku)' : 'var(--hairline)'}`,
                background: isActive ? 'var(--kinpaku)' : 'var(--graphite)',
                transition: 'all 150ms',
              }}>
              <span style={{
                fontSize: '10px', fontWeight: 700, letterSpacing: '0.08em', lineHeight: 1,
                color: isActive ? 'var(--lacquer-deep)' : isToday ? 'var(--kinpaku)' : 'var(--text-faint)',
              }}>
                {topLabel}
              </span>
              <span style={{
                fontSize: '28px', fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em',
                color: isActive ? 'var(--lacquer-deep)' : 'var(--text-warm)',
                fontVariantNumeric: 'tabular-nums',
              }}>
                {day}
              </span>
              <div aria-hidden="true" style={{
                width: 5, height: 5, borderRadius: '50%', transition: 'background 150ms',
                background: isActive ? 'var(--lacquer-deep)' : isToday ? 'var(--kinpaku)' : 'transparent',
              }} />
            </button>
          )
        })}
      </div>
    </div>
  )
}
