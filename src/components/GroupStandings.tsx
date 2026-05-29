import Image from 'next/image'
import { Standing } from '@/types/football'

const GROUP_ACCENT: Record<string, string> = {
  'Group A': 'var(--kinpaku)',
  'Group B': 'var(--patina)',
  'Group C': 'oklch(76% 0.14 145)',
  'Group D': 'oklch(74% 0.13 290)',
  'Group E': 'oklch(72% 0.14 25)',
  'Group F': 'var(--kinpaku-rich)',
  'Group G': 'oklch(75% 0.13 220)',
  'Group H': 'oklch(79% 0.16 130)',
  'Group I': 'oklch(73% 0.14 340)',
  'Group J': 'var(--patina-pale)',
  'Group K': 'oklch(70% 0.12 260)',
  'Group L': 'var(--vermilion)',
}

interface Props {
  standing: Standing
}

export default function GroupStandings({ standing }: Props) {
  const label = standing.group.replace('GROUP_', 'Group ')
  const accent = GROUP_ACCENT[label] ?? 'var(--text-muted)'

  return (
    <div
      className="overflow-hidden"
      style={{
        background: 'var(--raised-lacquer)',
        border: '1px solid var(--hairline)',
        borderRadius: 'var(--r-lg)',
      }}
    >
      {/* Group header */}
      <div
        className="px-4 py-3 flex items-center gap-2"
        style={{ borderBottom: '1px solid var(--hairline)' }}
      >
        <div
          className="w-1 h-4 flex-shrink-0"
          style={{ background: accent, borderRadius: '1px' }}
          aria-hidden="true"
        />
        <h3 className="eyebrow" style={{ color: accent, letterSpacing: '0.14em' }}>
          {label}
        </h3>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--hairline)' }}>
              <th className="text-left px-4 py-2 eyebrow w-full" style={{ color: 'var(--text-disabled)' }}>Equipo</th>
              {['PJ', 'G', 'E', 'P', 'DG', 'Pts'].map((h) => (
                <th key={h} className="px-3 py-2 eyebrow tabnum" style={{ color: 'var(--text-disabled)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standing.table.map((entry, i) => {
              const qualifies = i < 2
              return (
                <tr
                  key={entry.team.id}
                  style={{
                    borderBottom: i < standing.table.length - 1 ? '1px solid var(--hairline)' : undefined,
                    borderLeft: qualifies ? `2px solid ${accent}` : '2px solid transparent',
                  }}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span className="eyebrow tabnum w-3 text-right" style={{ color: 'var(--text-disabled)' }}>
                        {entry.position}
                      </span>
                      {entry.team.crest ? (
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image src={entry.team.crest} alt={entry.team.name} fill className="object-contain" sizes="20px" />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded flex-shrink-0" style={{ background: 'var(--graphite)' }} />
                      )}
                      <span className="text-xs font-medium truncate" style={{ color: 'var(--text-warm)' }}>
                        {entry.team.shortName}
                      </span>
                    </div>
                  </td>
                  {[
                    entry.playedGames,
                    entry.won,
                    entry.draw,
                    entry.lost,
                    entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference,
                  ].map((val, vi) => (
                    <td key={vi} className="px-3 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>
                      {val}
                    </td>
                  ))}
                  <td className="px-3 py-2.5 text-center tabnum text-xs font-bold" style={{ color: 'var(--champagne)' }}>
                    {entry.points}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
