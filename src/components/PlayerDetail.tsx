import { Icon } from '@iconify/react'
import BackButton from './BackButton'
import PlayerPhoto from './PlayerPhoto'

export interface PlayerDetailProps {
  name: string
  initials: string
  photoUrl: string | null
  posLabel: string | null
  posColor: string
  shirtNumber: number | null
  nationality: string | null
  flag: string | null
  age: number | null
  dobFormatted: string | null
  caps: number | null
  goals: number | null
  club: string | null
  height: string | null
  weight: string | null
  birthLocation: string | null
  bio: string | null
  photoSource?: string | null
  /** If set, "Volver" links here instead of using router.back() */
  backHref?: string | null
}

/* Simple pentagonal radar — pure SVG, no deps */
function RadarChart({ color }: { color: string }) {
  const cx = 50
  const cy = 50
  const rings = [45, 30, 15]
  /* 5 vertices of a pentagon, rotated so flat edge is at top */
  const pts = (r: number) =>
    Array.from({ length: 5 }, (_, i) => {
      const a = (i * 72 - 90) * (Math.PI / 180)
      return [cx + r * Math.cos(a), cy + r * Math.sin(a)]
    })
  const toD = (r: number) => {
    const p = pts(r)
    return `M ${p.map((v) => v.join(' ')).join(' L ')} Z`
  }
  /* Approximate skill polygon (decorative) */
  const skills = pts(45).map(([x, y], i) => {
    const scales = [0.85, 0.72, 0.92, 0.68, 0.78]
    return [cx + (x - cx) * scales[i], cy + (y - cy) * scales[i]]
  })
  const skillD = `M ${skills.map((v) => v.join(' ')).join(' L ')} Z`
  const labels = ['Pace', 'Shoot', 'Pass', 'Drib', 'Def']
  const labelPts = pts(52)

  return (
    <div className="relative w-full max-w-[200px] aspect-square mx-auto">
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {rings.map((r) => (
          <path
            key={r}
            d={toD(r)}
            fill="none"
            stroke="rgba(161,161,170,0.12)"
            strokeWidth="0.5"
          />
        ))}
        {pts(45).map(([x, y], i) => (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={x}
            y2={y}
            stroke="rgba(161,161,170,0.1)"
            strokeWidth="0.5"
          />
        ))}
        <path
          d={skillD}
          fill={`${color}22`}
          stroke={color}
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
      {labelPts.map(([x, y], i) => (
        <span
          key={i}
          className="absolute eyebrow"
          style={{
            fontSize: '0.52rem',
            left: `${x}%`,
            top: `${y}%`,
            transform: 'translate(-50%,-50%)',
            color: 'var(--text-muted)',
          }}
        >
          {labels[i]}
        </span>
      ))}
    </div>
  )
}

function StatCard({
  icon,
  value,
  label,
  color = 'var(--kinpaku)',
}: {
  icon: string
  value: string | number
  label: string
  color?: string
}) {
  return (
    <div
      className="glass-card flex flex-col justify-between p-4 min-h-[110px]"
      style={{ borderRadius: 'var(--r-lg)' }}
    >
      <Icon icon={icon} width={20} height={20} style={{ color }} />
      <div>
        <div
          className="tabnum font-extrabold leading-none"
          style={{ fontSize: '2rem', color: 'var(--champagne)', fontFamily: 'var(--font-hanken)' }}
        >
          {value}
        </div>
        <div className="eyebrow mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>
          {label}
        </div>
      </div>
    </div>
  )
}

export default function PlayerDetail({
  name,
  initials,
  photoUrl,
  posLabel,
  posColor,
  shirtNumber,
  nationality,
  flag,
  age,
  dobFormatted,
  caps,
  goals,
  club,
  height,
  weight,
  birthLocation,
  bio,
  photoSource,
  backHref,
}: PlayerDetailProps) {
  const hasPhysical = height || weight || birthLocation
  const hasStats = goals != null || caps != null

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--lacquer-deep)' }}>

      {/* ── Top bar ──────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-40 flex items-center justify-between px-4 h-14"
        style={{
          background: 'rgba(22, 19, 12, 0.88)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid var(--glass-border)',
        }}
      >
        <BackButton href={backHref} />
        <span
          className="font-extrabold tracking-tighter uppercase text-sm"
          style={{ color: 'var(--kinpaku)', fontFamily: 'var(--font-hanken)' }}
        >
          World Cup 2026
        </span>
      </header>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative w-full" style={{ minHeight: '360px', maxHeight: '500px', height: '55vw' }}>
        {photoUrl ? (
          <PlayerPhoto photoUrl={photoUrl} name={name} initials={initials} posColor={posColor} />
        ) : (
          <div
            className="absolute inset-0 flex items-center justify-center"
            style={{ background: 'var(--raised-lacquer)' }}
          >
            <span
              className="font-bold select-none"
              style={{
                color: posColor,
                fontFamily: 'var(--font-hanken)',
                fontSize: 'clamp(72px, 22vw, 140px)',
                opacity: 0.18,
              }}
            >
              {initials}
            </span>
          </div>
        )}

        {/* Gradient overlay */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, var(--lacquer-deep) 0%, rgba(11,11,10,0.45) 45%, transparent 100%)',
          }}
          aria-hidden="true"
        />

        {/* Player info overlaid at bottom */}
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className="eyebrow px-2.5 py-0.5"
              style={{
                color: posColor,
                border: `1px solid ${posColor}`,
                background: `color-mix(in srgb, ${posColor} 12%, transparent)`,
                borderRadius: 'var(--r-sm)',
                fontSize: '0.62rem',
              }}
            >
              {posLabel ?? 'Jugador'}
            </span>
            {shirtNumber != null && (
              <span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)', fontSize: '0.62rem' }}>
                #{shirtNumber}
              </span>
            )}
          </div>

          <h1
            className="font-extrabold uppercase leading-none tracking-tight"
            style={{
              fontFamily: 'var(--font-hanken)',
              fontSize: 'clamp(1.75rem, 7vw, 3rem)',
              color: 'var(--champagne)',
            }}
          >
            {name}
          </h1>

          {(nationality || age != null) && (
            <div className="flex items-center gap-3 mt-1.5">
              {flag && <span aria-hidden="true" className="text-lg">{flag}</span>}
              {nationality && (
                <span className="eyebrow" style={{ color: 'var(--text-warm)', letterSpacing: '0.1em' }}>
                  {nationality}
                </span>
              )}
              {age != null && (
                <>
                  <span style={{ color: 'var(--glass-border)' }}>·</span>
                  <span className="eyebrow" style={{ color: 'var(--text-muted)' }}>
                    {age} años
                  </span>
                </>
              )}
            </div>
          )}

          {photoSource && (
            <span
              className="eyebrow mt-2 inline-block"
              style={{ color: 'var(--text-disabled)', fontSize: '0.52rem' }}
            >
              Foto: {photoSource}
            </span>
          )}
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────────────── */}
      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-5 space-y-4 pb-10">

        {/* Stats bento — 2×2 */}
        {hasStats && (
          <div className="grid grid-cols-2 gap-3">
            {goals != null && (
              <StatCard
                icon="material-symbols:sports-soccer"
                value={goals}
                label="Goles"
                color="var(--kinpaku)"
              />
            )}
            {caps != null && (
              <StatCard
                icon="material-symbols:flag"
                value={caps}
                label="Partidos int."
                color="var(--patina)"
              />
            )}
            {age != null && (
              <StatCard
                icon="material-symbols:cake-outline"
                value={age}
                label="Edad"
                color="var(--kinpaku-rich)"
              />
            )}
            {club && (
              <div
                className="glass-card flex flex-col justify-between p-4 min-h-[110px]"
                style={{ borderRadius: 'var(--r-lg)' }}
              >
                <Icon
                  icon="material-symbols:shield-outline"
                  width={20}
                  height={20}
                  style={{ color: 'var(--text-muted)' }}
                />
                <div>
                  <div
                    className="font-semibold leading-tight text-sm"
                    style={{ color: 'var(--champagne)', fontFamily: 'var(--font-hanken)' }}
                  >
                    {club}
                  </div>
                  <div className="eyebrow mt-1" style={{ color: 'var(--text-muted)', fontSize: '0.58rem' }}>
                    Club actual
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Technical Profile — decorative radar */}
        <div
          className="glass-card p-5"
          style={{ borderRadius: 'var(--r-lg)' }}
        >
          <h2 className="eyebrow mb-4" style={{ color: posColor, letterSpacing: '0.14em' }}>
            Perfil técnico
          </h2>
          <RadarChart color={posColor} />
          {(height || weight) && (
            <div className="mt-4 flex gap-3">
              {height && (
                <div className="flex-1 flex flex-col gap-1">
                  <span className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>PHY</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--graphite)' }}>
                      <div className="h-full" style={{ width: '72%', background: 'var(--kinpaku)' }} />
                    </div>
                    <span className="eyebrow tabnum" style={{ fontSize: '0.58rem', color: 'var(--champagne)' }}>
                      {height}
                    </span>
                  </div>
                </div>
              )}
              {weight && (
                <div className="flex-1 flex flex-col gap-1">
                  <span className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>PES</span>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1 rounded-full overflow-hidden" style={{ background: 'var(--graphite)' }}>
                      <div className="h-full" style={{ width: '55%', background: 'var(--kinpaku-rich)' }} />
                    </div>
                    <span className="eyebrow tabnum" style={{ fontSize: '0.58rem', color: 'var(--champagne)' }}>
                      {weight}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* DOB + birth location */}
        {(dobFormatted || birthLocation) && (
          <div className="grid grid-cols-1 gap-3">
            {dobFormatted && (
              <div
                className="glass-card flex items-center gap-4 px-4 py-3.5"
                style={{ borderRadius: 'var(--r-lg)' }}
              >
                <Icon
                  icon="material-symbols:calendar-today-outline"
                  width={18}
                  height={18}
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                />
                <div>
                  <span className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>
                    Nacimiento
                  </span>
                  <p className="text-sm font-medium capitalize mt-0.5" style={{ color: 'var(--text-warm)' }}>
                    {dobFormatted}
                  </p>
                </div>
              </div>
            )}
            {birthLocation && (
              <div
                className="glass-card flex items-center gap-4 px-4 py-3.5"
                style={{ borderRadius: 'var(--r-lg)' }}
              >
                <Icon
                  icon="material-symbols:location-on-outline"
                  width={18}
                  height={18}
                  style={{ color: 'var(--text-muted)', flexShrink: 0 }}
                />
                <div>
                  <span className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>
                    Lugar de nacimiento
                  </span>
                  <p className="text-sm font-medium mt-0.5" style={{ color: 'var(--text-warm)' }}>
                    {birthLocation}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Physical (if no bento) */}
        {hasPhysical && !hasStats && (
          <div className="grid grid-cols-2 gap-3">
            {height && (
              <div
                className="glass-card flex flex-col gap-1 px-4 py-4"
                style={{ borderRadius: 'var(--r-lg)' }}
              >
                <span className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>Altura</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--champagne)' }}>{height}</span>
              </div>
            )}
            {weight && (
              <div
                className="glass-card flex flex-col gap-1 px-4 py-4"
                style={{ borderRadius: 'var(--r-lg)' }}
              >
                <span className="eyebrow" style={{ fontSize: '0.58rem', color: 'var(--text-disabled)' }}>Peso</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--champagne)' }}>{weight}</span>
              </div>
            )}
          </div>
        )}

        {/* Bio */}
        {bio && (
          <div
            className="glass-card px-5 py-4"
            style={{ borderRadius: 'var(--r-lg)' }}
          >
            <h2 className="eyebrow mb-3" style={{ color: 'var(--kinpaku)', letterSpacing: '0.14em' }}>
              Sobre el jugador
            </h2>
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              {bio.length > 480 ? `${bio.slice(0, 480).trim()}…` : bio}
            </p>
          </div>
        )}

        {/* No data fallback */}
        {!hasStats && !bio && !hasPhysical && (
          <div className="py-10 text-center">
            <p className="eyebrow" style={{ color: 'var(--text-disabled)' }}>
              Sin datos adicionales disponibles
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
