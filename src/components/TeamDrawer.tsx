'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Team, TeamDetail, Player } from '@/types/football'

const POSITION_ORDER = ['Goalkeeper', 'Defence', 'Midfield', 'Offence'] as const
const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'Porteros',
  Defence: 'Defensas',
  Midfield: 'Mediocampistas',
  Offence: 'Delanteros',
}
const POSITION_COLOR: Record<string, string> = {
  Goalkeeper: 'var(--kinpaku)',
  Defence: 'var(--patina)',
  Midfield: 'oklch(74% 0.13 290)',
  Offence: 'var(--vermilion)',
}

function calcAge(dob: string): number {
  const diff = Date.now() - new Date(dob).getTime()
  return Math.floor(diff / (365.25 * 86_400_000))
}

function PlayerCard({ player }: { player: Player }) {
  const [flipped, setFlipped] = useState(false)
  const color = player.position ? POSITION_COLOR[player.position] : 'var(--text-muted)'
  const detailHref = player.profileUrl ?? `/jugador/${player.id}`
  const isExternalProfile = Boolean(player.profileUrl)

  return (
    <button
      onClick={() => setFlipped((f) => !f)}
      className="relative w-full text-left"
      style={{ perspective: '600px', height: '96px' }}
      aria-label={`${player.name} — ver detalles`}
    >
      <div
        className="absolute inset-0 transition-transform duration-500"
        style={{
          transformStyle: 'preserve-3d',
          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }}
      >
        {/* Front */}
        <div
          className="absolute inset-0 flex items-center gap-3 px-3"
          style={{
            backfaceVisibility: 'hidden',
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-md)',
            borderLeft: `3px solid ${color}`,
          }}
        >
          <div
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center text-xs font-bold"
            style={{ background: 'var(--graphite)', borderRadius: 'var(--r-xs)', color }}
          >
            {player.position === 'Goalkeeper' ? 'GK'
              : player.position === 'Defence' ? 'DF'
              : player.position === 'Midfield' ? 'MF'
              : player.position === 'Offence' ? 'FW'
              : '?'}
          </div>
          <span className="text-sm font-medium flex-1 truncate" style={{ color: 'var(--text-warm)' }}>
            {player.name}
            {player.club ? (
              <span className="block eyebrow mt-1 truncate" style={{ color: 'var(--text-disabled)', fontSize: '0.56rem' }}>
                {player.club}
              </span>
            ) : null}
          </span>
          <span className="eyebrow flex-shrink-0" style={{ color: 'var(--text-disabled)', fontSize: '0.6rem' }}>
            toca
          </span>
        </div>

        {/* Back */}
        <div
          className="absolute inset-0 flex items-center justify-between px-4 gap-3"
          style={{
            backfaceVisibility: 'hidden',
            transform: 'rotateY(180deg)',
            background: 'var(--graphite)',
            border: `1px solid ${color}`,
            borderRadius: 'var(--r-md)',
          }}
        >
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate" style={{ color: 'var(--champagne)' }}>{player.name}</p>
            <p className="eyebrow mt-0.5 truncate" style={{ color: 'var(--text-muted)' }}>
              {player.club ?? player.nationality}
            </p>
            {player.caps != null || player.goals != null ? (
              <p className="eyebrow mt-0.5 tabnum" style={{ color: 'var(--text-disabled)', fontSize: '0.56rem' }}>
                {player.caps ?? 0} PJ Â· {player.goals ?? 0} G
              </p>
            ) : null}
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {player.dateOfBirth ? (
              <div className="text-right">
                <p className="tabnum text-2xl font-bold leading-none" style={{ color }}>{calcAge(player.dateOfBirth)}</p>
                <p className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>años</p>
              </div>
            ) : null}
            <Link
              href={detailHref}
              className="eyebrow px-2 py-1 border"
              style={{ color: 'var(--kinpaku)', borderColor: 'var(--hairline-gold)', borderRadius: 'var(--r-xs)', textDecoration: 'none' }}
              onClick={(e) => e.stopPropagation()}
              target={isExternalProfile ? '_blank' : undefined}
              rel={isExternalProfile ? 'noreferrer' : undefined}
            >
              →
            </Link>
          </div>
        </div>
      </div>
    </button>
  )
}

interface Props {
  team: Team
  onClose: () => void
}

export default function TeamDrawer({ team, onClose }: Props) {
  const [detail, setDetail] = useState<TeamDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const handleClose = useCallback(() => onClose(), [onClose])

  useEffect(() => {
    const params = new URLSearchParams({
      name: team.name,
      shortName: team.shortName,
      tla: team.tla,
      crest: team.crest,
    })

    fetch(`/api/teams/${team.id}?${params}`)
      .then((r) => r.json())
      .then((d: TeamDetail) => {
        setDetail({ ...d, squad: Array.isArray(d.squad) ? d.squad : [] })
        setError(d.error ?? d.fallbackReason ?? null)
        setLoading(false)
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : 'No se pudo cargar el plantel'
        setDetail({ ...team, squad: [], squadSource: 'football-data.org', fallbackReason: message })
        setError(message)
        setLoading(false)
      })
  }, [team])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [handleClose])

  const squad = Array.isArray(detail?.squad) ? detail.squad : []
  const grouped = squad.reduce<Record<string, Player[]>>((acc, p) => {
    const pos = p.position ?? 'Unknown'
    acc[pos] = [...(acc[pos] ?? []), p]
    return acc
  }, {}) ?? {}

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ background: 'oklch(4% 0.004 95 / 0.85)' }}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        className="fixed bottom-0 left-0 right-0 z-50 max-h-[92dvh] flex flex-col sm:max-w-lg sm:right-auto sm:top-0 sm:bottom-0 sm:max-h-none overflow-hidden"
        style={{
          background: 'var(--lacquer)',
          borderTop: '1px solid var(--hairline-gold)',
          borderRight: '1px solid var(--hairline)',
          borderRadius: '12px 12px 0 0',
        }}
        role="dialog"
        aria-label={`Plantel de ${team.name}`}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-5 py-4 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--hairline)' }}
        >
          {team.crest ? (
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image src={team.crest} alt={team.name} fill className="object-contain" sizes="40px" unoptimized />
            </div>
          ) : null}
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate" style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}>
              {team.name}
            </h2>
            {detail && (
              <p className="eyebrow mt-0.5" style={{ color: 'var(--text-disabled)' }}>
                {squad.length} jugadores · {detail.squadSource ?? 'football-data.org'}
              </p>
            )}
          </div>
          <button
            onClick={handleClose}
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)] transition-colors"
            style={{ color: 'var(--text-muted)', borderRadius: 'var(--r-sm)' }}
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Coach */}
        {detail?.coach && (
          <div className="px-5 py-3 flex-shrink-0" style={{ borderBottom: '1px solid var(--hairline)' }}>
            <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>Técnico · </span>
            <span className="text-sm font-medium" style={{ color: 'var(--text-warm)' }}>{detail.coach.name}</span>
            <span className="eyebrow ml-2" style={{ color: 'var(--text-disabled)' }}>{detail.coach.nationality}</span>
          </div>
        )}

        {/* Squad list */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {loading ? (
            <div className="space-y-2">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="h-[96px] animate-pulse" style={{ background: 'var(--raised-lacquer)', borderRadius: 'var(--r-md)' }} />
              ))}
            </div>
          ) : squad.length ? (
            POSITION_ORDER.map((pos) => {
              const players = grouped[pos] ?? []
              if (!players.length) return null
              return (
                <section key={pos}>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-1 h-3" style={{ background: POSITION_COLOR[pos], borderRadius: '1px' }} aria-hidden="true" />
                    <h3 className="eyebrow" style={{ color: POSITION_COLOR[pos], letterSpacing: '0.14em' }}>
                      {POSITION_LABEL[pos]}
                    </h3>
                    <span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)' }}>{players.length}</span>
                  </div>
                  <div className="space-y-1.5">
                    {players.map((p) => <PlayerCard key={p.id} player={p} />)}
                  </div>
                </section>
              )
            })
          ) : (
            <div
              className="px-4 py-5 text-center"
              style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
            >
              <p className="eyebrow mb-2" style={{ color: 'var(--kinpaku)' }}>Plantel no disponible</p>
              <p className="text-sm leading-6" style={{ color: 'var(--text-muted)' }}>
                {error ?? 'No pudimos cargar jugadores para esta seleccion en este momento.'}
              </p>
            </div>
          )}
        </div>

        {/* Tip */}
        <div className="px-5 py-3 flex-shrink-0" style={{ borderTop: '1px solid var(--hairline)' }}>
          <p className="eyebrow text-center" style={{ color: 'var(--text-disabled)' }}>
            Plantel desde {detail?.squadSource ?? 'football-data.org'} · toca cada jugador para ver detalles
          </p>
        </div>
      </div>
    </>
  )
}
