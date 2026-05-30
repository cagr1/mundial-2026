'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { Team } from '@/types/football'

const KEY = 'favoriteTeam'
const UPDATE_EVENT = 'favoriteTeam:update'

// useSyncExternalStore requires getSnapshot to return the same reference when the
// underlying value hasn't changed — JSON.parse creates a new object every call, which
// React treats as a changed snapshot and triggers infinite re-renders.
// We cache both the raw string and the parsed object so React gets a stable reference.
let _cachedRaw: string | null = undefined as unknown as string | null
let _cachedParsed: Team | null = null

function getSnapshot(): Team | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === _cachedRaw) return _cachedParsed
    _cachedRaw = raw
    _cachedParsed = raw ? (JSON.parse(raw) as Team) : null
    return _cachedParsed
  } catch {
    return null
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(UPDATE_EVENT, callback)
  return () => window.removeEventListener(UPDATE_EVENT, callback)
}

export function useFavoriteTeam() {
  const favorite = useSyncExternalStore(subscribe, getSnapshot, () => null)

  const saveFavorite = useCallback((team: Team | null) => {
    try {
      if (team) {
        localStorage.setItem(KEY, JSON.stringify(team))
      } else {
        localStorage.removeItem(KEY)
      }
    } catch {}
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }, [])

  return { favorite, saveFavorite }
}
