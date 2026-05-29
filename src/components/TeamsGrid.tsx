import Image from 'next/image'
import { Team } from '@/types/football'

function TeamCard({ team }: { team: Team }) {
  return (
    <div
      className="flex flex-col items-center gap-3 p-4 cursor-default group transition-colors"
      style={{
        background: 'var(--raised-lacquer)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-lg)',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--hairline-gold)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--graphite)'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLDivElement).style.borderColor = 'var(--hairline)'
        ;(e.currentTarget as HTMLDivElement).style.background = 'var(--raised-lacquer)'
      }}
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
    </div>
  )
}

export default function TeamsGrid({ teams }: { teams: Team[] }) {
  return (
    <div>
      <p className="eyebrow mb-5 tabnum" style={{ color: 'var(--text-faint)' }}>
        {teams.length} selecciones clasificadas
      </p>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2.5">
        {teams.map((team) => (
          <TeamCard key={team.id} team={team} />
        ))}
      </div>
    </div>
  )
}
