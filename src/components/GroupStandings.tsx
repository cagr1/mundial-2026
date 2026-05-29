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
  const accent = GROUP_ACCENT[label] ?? 'var(--kinpaku)'

  return (
    <div
      className="glass-card overflow-hidden"
      style={{ borderRadius: 'var(--r-lg)' }}
    >
      {/* Group header */}
      <div
        className="px-4 py-3 flex items-center gap-2.5"
        style={{ borderBottom: '1px solid var(--glass-border)' }}
      >
        <div
          className="w-1 h-4 flex-shrink-0"
          style={{ background: accent, borderRadius: '1px' }}
          aria-hidden="true"
        />
        <h3
          className="eyebrow"
          style={{ color: accent, letterSpacing: '0.16em' }}
        >
          {label}
        </h3>
        <span className="eyebrow ml-auto" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>
          QUALIFICATION ROUND
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th
                className="text-left px-4 py-2 eyebrow w-full"
                style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}
              >
                Equipo
              </th>
              {['PJ', 'DG', 'Pts'].map((h) => (
                <th
                  key={h}
                  className="px-3 py-2 eyebrow tabnum"
                  style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}
                >
                  {h}
                </th>
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
                    borderBottom:
                      i < standing.table.length - 1
                        ? '1px solid var(--glass-border)'
                        : undefined,
                    borderLeft: qualifies
                      ? `2px solid ${accent}`
                      : '2px solid transparent',
                    background: qualifies
                      ? `color-mix(in srgb, ${accent} 4%, transparent)`
                      : undefined,
                  }}
                >
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-2">
                      <span
                        className="eyebrow tabnum w-3 text-right flex-shrink-0"
                        style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}
                      >
                        {entry.position}
                      </span>
                      {entry.team.crest ? (
                        <div className="relative w-5 h-5 flex-shrink-0">
                          <Image
                            src={entry.team.crest}
                            alt={entry.team.name}
                            fill
                            className="object-contain"
                            sizes="20px"
                          />
                        </div>
                      ) : (
                        <div
                          className="w-5 h-5 rounded flex-shrink-0"
                          style={{ background: 'var(--graphite)' }}
                        />
                      )}
                      <span
                        className="text-xs font-semibold truncate"
                        style={{ color: qualifies ? 'var(--champagne)' : 'var(--text-warm)' }}
                      >
                        {entry.team.shortName}
                      </span>
                    </div>
                  </td>
                  <td
                    className="px-3 py-2.5 text-center tabnum text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {entry.playedGames}
                  </td>
                  <td
                    className="px-3 py-2.5 text-center tabnum text-xs"
                    style={{ color: 'var(--text-muted)' }}
                  >
                    {entry.goalDifference > 0
                      ? `+${entry.goalDifference}`
                      : entry.goalDifference}
                  </td>
                  <td
                    className="px-3 py-2.5 text-center tabnum text-sm font-bold"
                    style={{ color: qualifies ? accent : 'var(--champagne)' }}
                  >
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
