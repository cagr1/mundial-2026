'use client'

import { useState, useEffect } from 'react'
import { Icon } from '@iconify/react'
import { useTranslations, useLocale } from 'next-intl'
import { localizedCountry, TLA_ISO2 } from '@/lib/country-names'
import SegmentedTabs from './SegmentedTabs'

type StatsView = 'scorers' | 'data'

interface Scorer {
  player: { id: number; name: string }
  team: { id: number; name: string; shortName: string; tla: string; crest: string }
  goals: number | null
  assists: number | null
}

interface TournamentData {
  matchesPlayed: number
  totalGoals: number
  yellowCards: number
  redCards: number
}

function Flag({ tla }: { tla: string }) {
  const iso2 = TLA_ISO2[tla?.toUpperCase()]
  return (
    <div style={{
      width: 22, height: 22, borderRadius: '50%', overflow: 'hidden', flexShrink: 0,
      border: '1px solid var(--hairline)', background: 'var(--graphite)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {iso2 ? (
        <span className={`fi fi-${iso2}`} style={{ width: '100%', height: '100%', backgroundSize: 'cover', backgroundPosition: 'center', display: 'block' }} aria-hidden="true" />
      ) : (
        <span style={{ color: 'var(--text-faint)', fontSize: 8, fontWeight: 700 }}>{(tla ?? '?').slice(0, 3)}</span>
      )}
    </div>
  )
}

function DataCard({ label, value, icon, accent }: { label: string; value: string; icon: string; accent?: string }) {
  return (
    <div style={{ position: 'relative', background: 'var(--graphite)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: '18px 16px 14px', overflow: 'hidden' }}>
      <Icon icon={icon} aria-hidden="true" style={{ position: 'absolute', right: -8, bottom: -8, width: 64, height: 64, color: 'var(--graphite-2)', opacity: 0.8, pointerEvents: 'none' }} />
      <p className="eyebrow" style={{ color: 'var(--text-faint)', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
      <p style={{ fontSize: '2.2rem', fontWeight: 700, lineHeight: 1, color: accent ?? 'var(--text-warm)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
    </div>
  )
}

export default function TournamentStats() {
  const t = useTranslations('tournament')
  const locale = useLocale()
  const [view, setView] = useState<StatsView>('scorers')

  const [scorers, setScorers] = useState<Scorer[] | null>(null)
  const [data, setData] = useState<TournamentData | null>(null)
  const [loadingScorers, setLoadingScorers] = useState(true)
  const [loadingData, setLoadingData] = useState(true)

  useEffect(() => {
    let active = true
    fetch('/api/scorers')
      .then((r) => r.json())
      .then((d) => { if (active) setScorers(Array.isArray(d.scorers) ? d.scorers : []) })
      .catch(() => { if (active) setScorers([]) })
      .finally(() => { if (active) setLoadingScorers(false) })
    fetch('/api/tournament-stats')
      .then((r) => r.json())
      .then((d) => { if (active) setData(d) })
      .catch(() => { if (active) setData(null) })
      .finally(() => { if (active) setLoadingData(false) })
    return () => { active = false }
  }, [])

  const avg = data && data.matchesPlayed > 0 ? (data.totalGoals / data.matchesPlayed).toFixed(1) : '0.0'

  return (
    <div>
      <SegmentedTabs<StatsView>
        segments={[{ id: 'scorers', label: t('scorers') }, { id: 'data', label: t('data') }]}
        active={view}
        onChange={setView}
      />

      {view === 'scorers' ? (
        loadingScorers ? (
          <div className="py-16 text-center">
            <Icon icon="material-symbols:progress-activity" width={26} height={26} className="animate-spin" style={{ color: 'var(--text-disabled)' }} />
          </div>
        ) : scorers && scorers.length > 0 ? (
          <div style={{ background: 'var(--graphite)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', overflow: 'hidden' }}>
            <div className="flex items-center gap-3 px-4 py-2" style={{ borderBottom: '1px solid var(--hairline)' }}>
              <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.55rem', width: 20 }}>#</span>
              <span className="eyebrow flex-1" style={{ color: 'var(--text-disabled)', fontSize: '0.55rem' }}>{t('player')}</span>
              <span className="eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.55rem' }}>{t('goals')}</span>
            </div>
            {scorers.map((s, i) => (
              <div key={s.player.id} className="flex items-center gap-3 px-4 py-2.5" style={{ borderBottom: i < scorers.length - 1 ? '1px solid var(--hairline)' : undefined }}>
                <span className="tabnum text-center" style={{ width: 20, fontSize: 13, fontWeight: 700, color: i < 3 ? 'var(--kinpaku)' : 'var(--text-muted)' }}>{i + 1}</span>
                <Flag tla={s.team.tla} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-warm)' }}>{s.player.name}</p>
                  <p className="truncate eyebrow" style={{ color: 'var(--text-disabled)', fontSize: '0.55rem' }}>{localizedCountry(s.team.tla, locale, s.team.shortName)}</p>
                </div>
                <span className="tabnum shrink-0" style={{ fontSize: 18, fontWeight: 700, color: 'var(--champagne)' }}>{s.goals ?? 0}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="py-16 text-center eyebrow" style={{ color: 'var(--text-muted)' }}>{t('noScorers')}</p>
        )
      ) : (
        loadingData ? (
          <div className="py-16 text-center">
            <Icon icon="material-symbols:progress-activity" width={26} height={26} className="animate-spin" style={{ color: 'var(--text-disabled)' }} />
          </div>
        ) : data ? (
          <div className="grid grid-cols-2 gap-3">
            <DataCard label={t('matchesPlayed')} value={String(data.matchesPlayed)} icon="material-symbols:sports-soccer" />
            <DataCard label={t('totalGoals')} value={String(data.totalGoals)} icon="material-symbols:scoreboard" />
            <DataCard label={t('avgGoals')} value={avg} icon="material-symbols:trending-up" />
            <DataCard label={t('stadiums')} value="16" icon="material-symbols:stadium" />
            <DataCard label={t('yellowCards')} value={String(data.yellowCards)} icon="material-symbols:rectangle" accent="var(--kinpaku)" />
            <DataCard label={t('redCards')} value={String(data.redCards)} icon="material-symbols:rectangle" accent="var(--vermilion)" />
          </div>
        ) : (
          <p className="py-16 text-center eyebrow" style={{ color: 'var(--text-muted)' }}>{t('noData')}</p>
        )
      )}
    </div>
  )
}
