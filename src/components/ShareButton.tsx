'use client'

import { useState, useCallback } from 'react'
import { Icon } from '@iconify/react'
import { useLocale } from 'next-intl'
import { Match } from '@/types/football'
import { localizedCountry } from '@/lib/country-names'

interface Props {
  match: Match
  timeZone: string
}

function buildOgUrl(match: Match, timeZone: string, locale: string): string {
  const p = new URLSearchParams({
    hname: localizedCountry(match.homeTeam.tla, locale, match.homeTeam.shortName ?? match.homeTeam.name),
    aname: localizedCountry(match.awayTeam.tla, locale, match.awayTeam.shortName ?? match.awayTeam.name),
    htla: match.homeTeam.tla ?? '',
    atla: match.awayTeam.tla ?? '',
    date: match.utcDate,
    status: match.status,
    tz: timeZone,
  })
  if (match.homeTeam.crest) p.set('hcrest', match.homeTeam.crest)
  if (match.awayTeam.crest) p.set('acrest', match.awayTeam.crest)
  if (match.group) p.set('group', match.group)
  if (match.stage) p.set('stage', match.stage)

  const hs = match.score.fullTime.home
  const as_ = match.score.fullTime.away
  if (hs !== null && as_ !== null) {
    p.set('hs', String(hs))
    p.set('as', String(as_))
  }
  return `/api/og/match?${p.toString()}`
}

type State = 'idle' | 'loading' | 'done' | 'error'

export default function ShareButton({ match, timeZone }: Props) {
  const [state, setState] = useState<State>('idle')
  const locale = useLocale()

  const handleShare = useCallback(async () => {
    if (state === 'loading') return
    setState('loading')

    try {
      const ogUrl = buildOgUrl(match, timeZone, locale)
      const res = await fetch(ogUrl)
      if (!res.ok) throw new Error(`OG fetch failed: ${res.status}`)
      const blob = await res.blob()

      const homeShort = localizedCountry(match.homeTeam.tla, locale, match.homeTeam.shortName ?? match.homeTeam.tla)
      const awayShort = localizedCountry(match.awayTeam.tla, locale, match.awayTeam.shortName ?? match.awayTeam.tla)
      const fileName = `${homeShort}-vs-${awayShort}.png`.replace(/\s+/g, '-')
      const file = new File([blob], fileName, { type: 'image/png' })

      const canShareFile = typeof navigator.canShare === 'function' && navigator.canShare({ files: [file] })

      if (canShareFile) {
        await navigator.share({
          files: [file],
          title: `${homeShort} vs ${awayShort} — FIFA World Cup 2026`,
        })
      } else {
        // Desktop fallback: download
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        a.click()
        URL.revokeObjectURL(url)
      }

      setState('done')
      setTimeout(() => setState('idle'), 2000)
    } catch (err) {
      // User cancelled share = AbortError — treat as idle
      if (err instanceof Error && err.name === 'AbortError') {
        setState('idle')
        return
      }
      console.error('Share failed:', err)
      setState('error')
      setTimeout(() => setState('idle'), 2500)
    }
  }, [match, timeZone, state, locale])

  const icon =
    state === 'loading'
      ? 'material-symbols:progress-activity'
      : state === 'done'
        ? 'material-symbols:check-circle-outline'
        : state === 'error'
          ? 'material-symbols:error-outline'
          : 'material-symbols:share-outline'

  const color =
    state === 'done'
      ? 'var(--patina)'
      : state === 'error'
        ? 'var(--vermilion)'
        : 'var(--text-disabled)'

  return (
    <button
      onClick={handleShare}
      aria-label="Compartir partido"
      title="Compartir"
      disabled={state === 'loading'}
      className="flex items-center gap-1 transition-colors focus-visible:outline-none"
      style={{ color, borderRadius: 'var(--r-sm)' }}
      onMouseEnter={(e) => {
        if (state === 'idle')
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--kinpaku)'
      }}
      onMouseLeave={(e) => {
        if (state === 'idle')
          (e.currentTarget as HTMLButtonElement).style.color = 'var(--text-disabled)'
      }}
    >
      <Icon
        icon={icon}
        width={15}
        height={15}
        className={state === 'loading' ? 'animate-spin' : ''}
      />
    </button>
  )
}
