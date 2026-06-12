'use client'

import Image from 'next/image'
import { Icon } from '@iconify/react'
import { useTranslations, useLocale } from 'next-intl'
import { Standing } from '@/types/football'
import { localizedCountry } from '@/lib/country-names'

const GROUP_ACCENT: Record<string, string> = {
  'Group A': 'var(--kinpaku)', 'Group B': 'var(--patina)',
  'Group C': 'oklch(76% 0.14 145)', 'Group D': 'oklch(74% 0.13 290)',
  'Group E': 'oklch(72% 0.14 25)', 'Group F': 'var(--kinpaku-rich)',
  'Group G': 'oklch(75% 0.13 220)', 'Group H': 'oklch(79% 0.16 130)',
  'Group I': 'oklch(73% 0.14 340)', 'Group J': 'var(--patina-pale)',
  'Group K': 'oklch(70% 0.12 260)', 'Group L': 'var(--vermilion)',
}

interface Props { standing: Standing; onSelect?: (standing: Standing) => void }

export default function GroupStandings({ standing, onSelect }: Props) {
  const t = useTranslations('groups')
  const locale = useLocale()
  const label = standing.group.replace('GROUP_', 'Group ')
  const accent = GROUP_ACCENT[label] ?? 'var(--kinpaku)'

  return (
    <div
      className="glass-card overflow-hidden active:opacity-85 transition-opacity"
      style={{ borderRadius: 12, cursor: onSelect ? 'pointer' : 'default' }}
      onClick={() => onSelect?.(standing)}
      onKeyDown={(e) => {
        if (onSelect && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault()
          onSelect(standing)
        }
      }}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      aria-label={onSelect ? t('ariaDetails', { group: label }) : undefined}
    >
      <div className="w-full px-4 py-3 flex items-center gap-3 text-left" style={{ borderBottom: '1px solid var(--glass-border)' }}>
        <div className="w-1 h-5 shrink-0 rounded-full" style={{ background: accent }} aria-hidden="true" />
        <h3 className="font-semibold uppercase tracking-wide" style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-warm)', letterSpacing: '0.04em' }}>
          {label}
        </h3>
        <span className="eyebrow ml-auto" style={{ color: 'var(--text-muted)', opacity: 0.6, fontSize: '0.6rem', letterSpacing: '0.12em' }}>
          {t('qualificationRound')}
        </span>
        {onSelect && <Icon icon="material-symbols:chevron-right" width={18} height={18} style={{ color: 'var(--text-disabled)', flexShrink: 0 }} />}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr style={{ borderBottom: '1px solid var(--glass-border)' }}>
              <th className="text-left pl-4 pr-2 py-2 eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem', width: '2rem' }}>#</th>
              <th className="text-left px-2 py-2 eyebrow w-full" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{t('team')}</th>
              {['PJ', 'DG', 'PTS'].map((h) => (
                <th key={h} className="px-3 py-2 eyebrow tabnum text-center" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standing.table.map((entry, i) => {
              const qualifies = i < 2
              return (
                <tr key={entry.team.id} className="active:bg-(--graphite)/20"
                  style={{
                    borderBottom: i < standing.table.length - 1 ? '1px solid var(--glass-border)' : undefined,
                    borderLeft: qualifies ? `2px solid ${accent}` : '2px solid transparent',
                    background: qualifies ? `color-mix(in srgb, ${accent} 5%, transparent)` : undefined,
                  }}>
                  <td className="pl-4 pr-2 py-2.5">
                    <span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)', fontSize: '0.58rem' }}>{entry.position}</span>
                  </td>
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-2">
                      {entry.team.crest ? (
                        <div className="relative shrink-0 overflow-hidden rounded-sm" style={{ width: 24, height: 16 }}>
                          <Image src={entry.team.crest} alt={entry.team.name} fill unoptimized className="object-cover" sizes="24px" />
                        </div>
                      ) : (
                        <div className="shrink-0 rounded-sm" style={{ width: 24, height: 16, background: 'var(--graphite)' }} />
                      )}
                      <span className="text-xs font-semibold truncate" style={{ color: qualifies ? 'var(--text-warm)' : 'var(--text-muted)' }}>
                        {localizedCountry(entry.team.tla, locale, entry.team.shortName)}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>{entry.playedGames}</td>
                  <td className="px-3 py-2.5 text-center tabnum text-xs" style={{ color: 'var(--text-muted)' }}>
                    {entry.goalDifference > 0 ? `+${entry.goalDifference}` : entry.goalDifference}
                  </td>
                  <td className="px-3 py-2.5 text-center tabnum text-sm font-bold" style={{ color: 'var(--kinpaku)' }}>{entry.points}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
