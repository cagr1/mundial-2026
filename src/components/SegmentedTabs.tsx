'use client'

interface Segment<T extends string> {
  id: T
  label: string
}

interface Props<T extends string> {
  segments: Segment<T>[]
  active: T
  onChange: (id: T) => void
  className?: string
}

// Toggle superior reutilizable (Calendario|Grupos, Goleadores|Datos, …)
export default function SegmentedTabs<T extends string>({ segments, active, onChange, className }: Props<T>) {
  return (
    <div
      className={`flex gap-1 mb-5 ${className ?? ''}`}
      role="tablist"
      style={{ background: 'var(--graphite)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)', padding: 4 }}
    >
      {segments.map((s) => {
        const isActive = active === s.id
        return (
          <button
            key={s.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(s.id)}
            className="flex-1 text-center transition-colors focus-visible:outline-none"
            style={{
              padding: '8px 12px',
              borderRadius: 'var(--r-md)',
              fontSize: 13,
              fontWeight: isActive ? 700 : 500,
              color: isActive ? 'var(--lacquer)' : 'var(--text-muted)',
              background: isActive ? 'var(--kinpaku)' : 'transparent',
              cursor: 'pointer',
            }}
          >
            {s.label}
          </button>
        )
      })}
    </div>
  )
}
