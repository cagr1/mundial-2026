'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { Team } from '@/types/football'

const KEY = 'favoriteTeam'
const UPDATE_EVENT = 'favoriteTeam:update'

function subscribe(callback: () => void) {
  window.addEventListener(UPDATE_EVENT, callback)
  return () => window.removeEventListener(UPDATE_EVENT, callback)
}

function getSnapshot(): Team | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Team) : null
  } catch {
    return null
  }
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
