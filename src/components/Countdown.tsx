'use client'

import { useState, useEffect } from 'react'

interface Props {
  targetDate: string // ISO UTC
}

interface TimeLeft {
  days: number
  hours: number
  minutes: number
  seconds: number
  started: boolean
}

function calcTimeLeft(target: string): TimeLeft {
  const diff = new Date(target).getTime() - Date.now()
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, started: true }
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1_000),
    started: false,
  }
}

function Unit({ value, label }: { value: number; label: string }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div
        className="tabnum text-3xl sm:text-4xl font-bold leading-none"
        style={{ color: 'var(--kinpaku)', fontFamily: 'var(--font-albert)', minWidth: '2ch', textAlign: 'center' }}
        suppressHydrationWarning
      >
        {String(value).padStart(2, '0')}
      </div>
      <span className="eyebrow" style={{ fontSize: '0.6rem', color: 'var(--text-muted)', letterSpacing: '0.1em' }}>
        {label}
      </span>
    </div>
  )
}

export default function Countdown({ targetDate }: Props) {
  const [time, setTime] = useState<TimeLeft>(() => calcTimeLeft(targetDate))

  useEffect(() => {
    if (time.started) return
    const id = setInterval(() => setTime(calcTimeLeft(targetDate)), 1000)
    return () => clearInterval(id)
  }, [targetDate, time.started])

  if (time.started) return null

  return (
    <div
      className="mx-4 sm:mx-6 mb-6 flex items-center gap-4 sm:gap-6 px-5 py-4 overflow-hidden"
      style={{
        background: 'var(--raised-lacquer)',
        border: '1px solid var(--hairline-gold)',
        borderRadius: 'var(--r-lg)',
        maxWidth: '100%',
      }}
    >
      {/* Left label */}
      <div className="flex-shrink-0 hidden sm:block">
        <p className="eyebrow" style={{ color: 'var(--kinpaku)', letterSpacing: '0.14em' }}>
          Primer partido
        </p>
        <p className="eyebrow mt-1" style={{ color: 'var(--text-disabled)', letterSpacing: '0.08em' }}>
          MEX vs RSA · 11 Jun
        </p>
      </div>

      {/* Divider */}
      <div className="w-px h-10 hidden sm:block" style={{ background: 'var(--hairline-gold)' }} />

      {/* Units */}
      <div className="flex items-center gap-3 sm:gap-5">
        <Unit value={time.days} label="días" />
        <span className="text-lg font-bold" style={{ color: 'var(--kinpaku-deep)', marginBottom: '16px' }}>:</span>
        <Unit value={time.hours} label="horas" />
        <span className="text-lg font-bold" style={{ color: 'var(--kinpaku-deep)', marginBottom: '16px' }}>:</span>
        <Unit value={time.minutes} label="min" />
        <span className="text-lg font-bold" style={{ color: 'var(--kinpaku-deep)', marginBottom: '16px' }}>:</span>
        <Unit value={time.seconds} label="seg" />
      </div>

      {/* Right kinpaku seam decoration */}
      <div
        className="absolute right-0 top-0 bottom-0 w-1 hidden sm:block"
        style={{ background: 'linear-gradient(to bottom, var(--kinpaku), var(--kinpaku-deep), var(--kinpaku))', opacity: 0.4 }}
        aria-hidden="true"
      />
    </div>
  )
}
