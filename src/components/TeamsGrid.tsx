'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Team } from '@/types/football'
import TeamDrawer from './TeamDrawer'

function TeamCard({ team, onSelect }: { team: Team; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className="flex flex-col items-center gap-3 p-4 w-full text-left group transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
      style={{
        background: 'var(--raised-lacquer)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-lg)',
      }}
      onMouseEnter={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--hairline-gold)'
        el.style.background = 'var(--graphite)'
      }}
      onMouseLeave={(e) => {
        const el = e.currentTarget
        el.style.borderColor = 'var(--hairline)'
        el.style.background = 'var(--raised-lacquer)'
      }}
      aria-label={`Ver plantel de ${team.name}`}
    >
      {team.crest ? (
        <div className="relative w-12 h-12 transition-transform duration-150 group-hover:scale-110">
          <Image src={team.crest} alt={team.name} fill className="object-contain" sizes="48px" unoptimized />
        </div>
      ) : (
        <div
          className="w-12 h-12 flex items-center justify-center transition-transform duration-150 group-hover:scale-110"
          style={{ background: 'var(--graphite-2)', borderRadius: 'var(--r-sm)' }}
        >
          <span className="eyebrow text-[10px]" style={{ color: 'var(--text-faint)' }}>{team.tla}</span>
        </div>
      )}
      <div className="text-center">
        <p className="text-xs font-semibold leading-tight" style={{ color: 'var(--text-warm)' }}>
          {team.shortName}
        </p>
        <p className="eyebrow mt-0.5" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>
          {team.tla}
        </p>
      </div>
    </button>
  )
}

export default function TeamsGrid({ teams }: { teams: Team[] }) {
  const [selected, setSelected] = useState<Team | null>(null)

  return (
    <>
      <p className="eyebrow mb-5 tabnum" style={{ color: 'var(--text-faint)' }}>
        {teams.length} selecciones · toca para ver plantel
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} onSelect={() => setSelected(team)} />
        ))}
      </div>

      {selected ? (
        <TeamDrawer team={selected} onClose={() => setSelected(null)} />
      ) : null}
    </>
  )
}
