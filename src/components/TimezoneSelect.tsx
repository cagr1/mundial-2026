'use client'

import { COMMON_TIMEZONES } from '@/lib/format-date'

interface Props {
  value: string
  onChange: (tz: string) => void
}

export default function TimezoneSelect({ value, onChange }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="eyebrow hidden sm:block" style={{ color: 'var(--text-disabled)' }}>TZ</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label="Seleccionar zona horaria"
        className="eyebrow px-2 py-1.5 cursor-pointer transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
        style={{
          background: 'var(--graphite)',
          border: '1px solid var(--hairline)',
          borderRadius: 'var(--r-sm)',
          color: 'var(--text-warm)',
        }}
      >
        {COMMON_TIMEZONES.map((tz) => (
          <option key={tz.value} value={tz.value} style={{ background: 'var(--lacquer)' }}>
            {tz.label}
          </option>
        ))}
      </select>
    </div>
  )
}
