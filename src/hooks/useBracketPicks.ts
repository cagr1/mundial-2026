'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { BracketPicks } from '@/types/football'

const KEY = 'bracket_picks_v1'
const UPDATE_EVENT = 'bracketPicks:update'

const EMPTY: BracketPicks = {}

let _cachedRaw: string | null = undefined as unknown as string | null
let _cachedParsed: BracketPicks = {}

function getSnapshot(): BracketPicks {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === _cachedRaw) return _cachedParsed
    _cachedRaw = raw
    _cachedParsed = raw ? (JSON.parse(raw) as BracketPicks) : {}
    return _cachedParsed
  } catch {
    return {}
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(UPDATE_EVENT, cb)
  return () => window.removeEventListener(UPDATE_EVENT, cb)
}

export function useBracketPicks() {
  const picks = useSyncExternalStore<BracketPicks>(subscribe, getSnapshot, () => EMPTY)

  const setPick = useCallback((matchId: number, teamId: number | null) => {
    try {
      const current = getSnapshot()
      const next = { ...current }
      if (teamId != null) {
        next[matchId] = teamId
      } else {
        delete next[matchId]
      }
      localStorage.setItem(KEY, JSON.stringify(next))
      _cachedRaw = null
    } catch {}
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }, [])

  return { picks, setPick }
}
