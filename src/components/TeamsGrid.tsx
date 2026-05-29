'use client'

import { useState, useMemo, useCallback, useEffect, useRef } from 'react'
import Image from 'next/image'
import { Icon } from '@iconify/react'
import { Team } from '@/types/football'
import TeamDrawer from './TeamDrawer'

function TeamCard({ team, onSelect }: { team: Team; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="glass-card flex items-center gap-3 p-3.5 w-full text-left group transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
      style={{ borderRadius: 'var(--r-lg)' }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'rgba(247, 207, 101, 0.35)'
        el.style.boxShadow = `inset 0 0 12px var(--stadium-glow)`
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = ''
        el.style.boxShadow = ''
      }}
      aria-label={`Ver plantel de ${team.name}`}
    >
      {/* Crest */}
      <div className="flex-shrink-0">
        {team.crest ? (
          <div className="relative w-10 h-10 transition-transform duration-150 group-hover:scale-110">
            <Image
              src={team.crest}
              alt={team.name}
              fill
              unoptimized
              loading="lazy"
              className="object-contain"
              sizes="40px"
            />
          </div>
        ) : (
          <div
            className="w-10 h-10 flex items-center justify-center transition-transform duration-150 group-hover:scale-110"
            style={{ background: 'var(--graphite)', borderRadius: 'var(--r-sm)' }}
          >
            <span className="eyebrow text-[9px]" style={{ color: 'var(--text-faint)' }}>
              {team.tla}
            </span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="min-w-0 flex-1">
        <p
          className="text-sm font-semibold leading-tight truncate"
          style={{ color: 'var(--champagne)' }}
        >
          {team.shortName ?? team.name}
        </p>
        <p
          className="eyebrow mt-0.5 truncate"
          style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}
        >
          {team.tla}
        </p>
      </div>

      {/* Arrow */}
      <Icon
        icon="material-symbols:chevron-right"
        width={16}
        height={16}
        className="flex-shrink-0 opacity-0 group-hover:opacity-60 transition-opacity"
        style={{ color: 'var(--kinpaku)' }}
      />
    </button>
  )
}

function blurActive() {
  if (document.activeElement instanceof HTMLElement) {
    document.activeElement.blur()
  }
}

function updateTeamUrl(teamId: number | null) {
  const params = new URLSearchParams(window.location.search)
  params.set('tab', 'equipos')
  if (teamId != null) {
    params.set('equipo', String(teamId))
  } else {
    params.delete('equipo')
  }
  const qs = params.toString()
  window.history.replaceState(null, '', qs ? `/?${qs}` : '/')
}

export default function TeamsGrid({ teams }: { teams: Team[] }) {
  const [selected, setSelected] = useState<Team | null>(null)
  const [query, setQuery] = useState('')
  const teamsRef = useRef(teams)

  // Reopen drawer on mount if URL has ?equipo= (e.g., after pressing back from player page)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const equipoId = params.get('equipo')
    if (!equipoId) return
    const team = teamsRef.current.find((t) => String(t.id) === equipoId)
    if (team) window.setTimeout(() => setSelected(team), 0)
  }, [])

  const openDrawer = useCallback((team: Team) => {
    const hadKeyboard =
      document.activeElement instanceof HTMLInputElement ||
      document.activeElement instanceof HTMLTextAreaElement

    blurActive()

    const openNow = () => {
      setSelected(team)
      updateTeamUrl(team.id)
    }

    if (!hadKeyboard) {
      openNow()
      return
    }

    // Use visualViewport API to wait for the iOS keyboard to actually close
    const vv = window.visualViewport
    if (vv) {
      const threshold = window.screen.height * 0.65
      if (vv.height > threshold) {
        openNow()
        return
      }
      const onResize = () => {
        if (vv.height > threshold) {
          vv.removeEventListener('resize', onResize)
          clearTimeout(fallback)
          openNow()
        }
      }
      vv.addEventListener('resize', onResize)
      const fallback = setTimeout(() => {
        vv.removeEventListener('resize', onResize)
        openNow()
      }, 600)
    } else {
      setTimeout(openNow, 300)
    }
  }, [])

  const filtered = useMemo(() => {
    if (!query.trim()) return teams
    const q = query.toLowerCase()
    return teams.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        (t.shortName ?? '').toLowerCase().includes(q) ||
        (t.tla ?? '').toLowerCase().includes(q),
    )
  }, [teams, query])

  return (
    <>
      {/* Search bar */}
      <div className="relative mb-5">
        <Icon
          icon="material-symbols:search"
          width={18}
          height={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
          style={{ color: 'var(--text-muted)' }}
        />
        <input
          type="search"
          placeholder="Buscar selección..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-9 pr-4 py-2.5 text-sm transition-colors focus:outline-none"
          style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: 'var(--r-lg)',
            color: 'var(--text-warm)',
            fontFamily: 'var(--font-hanken)',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--kinpaku-rich)')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--glass-border)')}
        />
      </div>

      {/* Count */}
      <p className="eyebrow mb-3 tabnum" style={{ color: 'var(--text-faint)' }}>
        {filtered.length} selecciones
        {query ? ` · "${query}"` : ' · toca para ver plantel'}
      </p>

      {/* Grid — 2 cols mobile, more on wider screens */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2.5">
        {filtered.map((team) => (
          <TeamCard key={team.id} team={team} onSelect={() => openDrawer(team)} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="py-16 text-center">
          <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>
            Sin resultados para &ldquo;{query}&rdquo;
          </p>
        </div>
      )}

      {selected ? (
        <TeamDrawer
          key={selected.id}
          team={selected}
          onClose={() => {
            blurActive()
            setSelected(null)
            updateTeamUrl(null)
          }}
        />
      ) : null}
    </>
  )
}
