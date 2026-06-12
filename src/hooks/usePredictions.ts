'use client'

import { useSyncExternalStore, useCallback } from 'react'
import { Prediction, PredictionsMap } from '@/types/football'

const KEY = 'predictions_v1'
const UPDATE_EVENT = 'predictions:update'

const EMPTY: PredictionsMap = {}

// Same stable-reference pattern as useFavoriteTeam
let _cachedRaw: string | null = undefined as unknown as string | null
let _cachedParsed: PredictionsMap = {}

function getSnapshot(): PredictionsMap {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === _cachedRaw) return _cachedParsed
    _cachedRaw = raw
    _cachedParsed = raw ? (JSON.parse(raw) as PredictionsMap) : {}
    return _cachedParsed
  } catch {
    return {}
  }
}

function subscribe(callback: () => void) {
  window.addEventListener(UPDATE_EVENT, callback)
  return () => window.removeEventListener(UPDATE_EVENT, callback)
}

export function usePredictions() {
  const predictions = useSyncExternalStore<PredictionsMap>(subscribe, getSnapshot, () => EMPTY)

  const setPrediction = useCallback((matchId: number, prediction: Prediction | null) => {
    try {
      const current = getSnapshot()
      const next = { ...current }
      if (prediction) {
        next[matchId] = prediction
      } else {
        delete next[matchId]
      }
      localStorage.setItem(KEY, JSON.stringify(next))
      _cachedRaw = null // invalidate cache so next getSnapshot re-reads
    } catch {}
    window.dispatchEvent(new Event(UPDATE_EVENT))
  }, [])

  return { predictions, setPrediction }
}

export type PredictionResult = 'exact' | 'correct' | 'wrong'

export function getPredictionResult(
  prediction: Prediction,
  actual: { home: number; away: number },
): PredictionResult {
  if (prediction.home === actual.home && prediction.away === actual.away) return 'exact'
  const predResult = prediction.home > prediction.away ? 'home' : prediction.home < prediction.away ? 'away' : 'draw'
  const actualResult = actual.home > actual.away ? 'home' : actual.home < actual.away ? 'away' : 'draw'
  return predResult === actualResult ? 'correct' : 'wrong'
}
