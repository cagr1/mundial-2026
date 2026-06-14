'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Ticks a live match clock (ESPN's displayClock, e.g. "45'" or "45+2'") every
 * second between API polls, so the UI shows MM:SS advancing smoothly instead
 * of jumping only when a new poll arrives.
 */
export function useLiveClock(clock: string | null | undefined, isLive: boolean): string | null {
  const [now, setNow] = useState(() => Date.now())
  const baseRef = useRef<{ raw: string; minute: number; receivedAt: number } | null>(null)

  useEffect(() => {
    if (!isLive || !clock) {
      baseRef.current = null
      return
    }
    if (baseRef.current?.raw !== clock) {
      const m = clock.match(/(\d+)/)
      baseRef.current = { raw: clock, minute: m ? parseInt(m[1], 10) : 0, receivedAt: Date.now() }
      setNow(Date.now())
    }
  }, [clock, isLive])

  useEffect(() => {
    if (!isLive || !clock) return
    const id = window.setInterval(() => setNow(Date.now()), 1000)
    return () => window.clearInterval(id)
  }, [isLive, clock])

  if (!isLive || !clock || !baseRef.current) return clock ?? null

  const elapsedSec = Math.max(0, Math.floor((now - baseRef.current.receivedAt) / 1000))
  const totalSec = baseRef.current.minute * 60 + elapsedSec
  const mm = Math.floor(totalSec / 60)
  const ss = totalSec % 60
  return `${mm}:${String(ss).padStart(2, '0')}`
}
