'use client'

import { Icon } from '@iconify/react'
import { useTranslations } from 'next-intl'

export default function StatsBento() {
  const t = useTranslations('stats')

  const ITEMS = [
    { label: t('stadiums'), value: '16', icon: 'material-symbols:stadium' },
    { label: t('teams'),    value: '48', icon: 'material-symbols:groups' },
  ]

  return (
    <div className="grid grid-cols-2 gap-3 mt-8">
      {ITEMS.map(({ label, value, icon }) => (
        <div key={label} style={{ position: 'relative', background: 'var(--graphite)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: '20px 16px 16px', overflow: 'hidden' }}>
          <Icon icon={icon} aria-hidden="true" style={{ position: 'absolute', right: -8, bottom: -8, width: 72, height: 72, color: 'var(--graphite-2)', opacity: 0.8, pointerEvents: 'none' }} />
          <p className="eyebrow" style={{ color: 'var(--text-faint)', letterSpacing: '0.1em', marginBottom: 6 }}>{label}</p>
          <p style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1, color: 'var(--text-warm)', letterSpacing: '-0.02em', fontVariantNumeric: 'tabular-nums' }}>{value}</p>
        </div>
      ))}
    </div>
  )
}
