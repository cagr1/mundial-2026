import Image from 'next/image'
import Link from 'next/link'
import { flagEmoji, calcAge } from '@/lib/flags'

interface PersonData {
  id: number
  name: string
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  section: string
  position: string | null
  shirtNumber: number | null
  currentTeam?: {
    id: number
    name: string
    shortName: string
    tla: string
    crest: string
    venue?: string
    founded?: number
    clubColors?: string
  }
}

const SECTION_COLOR: Record<string, string> = {
  Goalkeeper: 'var(--kinpaku)',
  Defence:    'var(--patina)',
  Midfield:   'oklch(74% 0.13 290)',
  Offence:    'var(--vermilion)',
}
const SECTION_LABEL: Record<string, string> = {
  Goalkeeper: 'Portero',
  Defence:    'Defensa',
  Midfield:   'Mediocampista',
  Offence:    'Delantero',
}

async function getPerson(id: string): Promise<PersonData | null> {
  try {
    const res = await fetch(`https://api.football-data.org/v4/persons/${id}`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_TOKEN ?? '' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export default async function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const person = await getPerson(id)

  if (!person) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--lacquer)' }}>
        <div className="text-center space-y-3">
          <p className="text-4xl">⚽</p>
          <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>Jugador no encontrado</p>
          <Link href="/" className="eyebrow underline" style={{ color: 'var(--kinpaku)' }}>Volver al inicio</Link>
        </div>
      </div>
    )
  }

  const age = person.dateOfBirth ? calcAge(person.dateOfBirth) : null
  const flag = flagEmoji(person.nationality)
  const pos = person.section ?? person.position ?? 'Unknown'
  const posColor = SECTION_COLOR[pos] ?? 'var(--text-muted)'
  const posLabel = SECTION_LABEL[pos] ?? pos
  const dob = person.dateOfBirth
    ? new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(person.dateOfBirth))
    : null

  return (
    <div className="min-h-dvh flex flex-col" style={{ background: 'var(--lacquer)' }}>
      {/* Back */}
      <div className="max-w-lg mx-auto w-full px-4 pt-5">
        <Link
          href="/"
          className="inline-flex items-center gap-2 eyebrow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--kinpaku)]"
          style={{ color: 'var(--text-muted)' }}
        >
          ← Volver
        </Link>
      </div>

      <main className="flex-1 max-w-lg mx-auto w-full px-4 py-6 space-y-4">
        {/* Hero card */}
        <div
          className="relative overflow-hidden px-6 py-8"
          style={{
            background: 'var(--raised-lacquer)',
            border: `1px solid ${posColor.replace(')', ' / 0.4)').replace('var(', 'var(')}`,
            borderLeft: `4px solid ${posColor}`,
            borderRadius: 'var(--r-lg)',
          }}
        >
          {/* Large number watermark */}
          {person.shirtNumber != null && (
            <div
              className="absolute right-4 top-1/2 -translate-y-1/2 tabnum font-bold select-none pointer-events-none"
              style={{
                fontSize: 'clamp(80px, 25vw, 140px)',
                color: posColor,
                opacity: 0.07,
                lineHeight: 1,
                fontFamily: 'var(--font-albert)',
              }}
              aria-hidden="true"
            >
              {person.shirtNumber}
            </div>
          )}

          <div className="relative z-10 space-y-3">
            {/* Position badge */}
            <div className="flex items-center gap-2">
              <span
                className="eyebrow px-2 py-0.5 border"
                style={{ color: posColor, borderColor: posColor, background: `${posColor.replace(')', ' / 0.1)').replace('var(', 'var(')}`, borderRadius: 'var(--r-xs)' }}
              >
                {posLabel}
              </span>
              {person.shirtNumber != null && (
                <span className="eyebrow tabnum" style={{ color: 'var(--text-disabled)' }}>
                  #{person.shirtNumber}
                </span>
              )}
            </div>

            {/* Name */}
            <h1
              className="text-2xl sm:text-3xl font-bold leading-tight"
              style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}
            >
              {person.name}
            </h1>

            {/* Nationality + flag */}
            <div className="flex items-center gap-2">
              <span className="text-xl" aria-hidden="true">{flag}</span>
              <span className="text-sm font-medium" style={{ color: 'var(--text-warm)' }}>{person.nationality}</span>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          {age != null && (
            <div
              className="flex flex-col items-center justify-center gap-1 py-4"
              style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
            >
              <span className="tabnum text-3xl font-bold" style={{ color: 'var(--kinpaku)', fontFamily: 'var(--font-albert)' }}>{age}</span>
              <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>años</span>
            </div>
          )}
          {dob && (
            <div
              className="col-span-2 flex flex-col justify-center px-4 py-4 gap-1"
              style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
            >
              <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>Nacimiento</span>
              <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-warm)' }}>{dob}</span>
            </div>
          )}
        </div>

        {/* Current team */}
        {person.currentTeam && (
          <div
            className="flex items-center gap-4 px-5 py-4"
            style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
          >
            {person.currentTeam.crest && (
              <div className="relative w-14 h-14 flex-shrink-0">
                <Image
                  src={person.currentTeam.crest}
                  alt={person.currentTeam.name}
                  fill
                  className="object-contain"
                  sizes="56px"
                  unoptimized
                />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="eyebrow mb-1" style={{ color: 'var(--text-disabled)' }}>Selección</p>
              <p className="text-base font-bold truncate" style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}>
                {person.currentTeam.name}
              </p>
              {person.currentTeam.venue && (
                <p className="eyebrow mt-1 truncate" style={{ color: 'var(--text-faint)', letterSpacing: '0.08em' }}>
                  {person.currentTeam.venue}
                </p>
              )}
            </div>
            <span
              className="eyebrow flex-shrink-0 px-2 py-1 border"
              style={{
                color: 'var(--kinpaku)',
                borderColor: 'var(--hairline-gold)',
                background: 'oklch(84% 0.19 80.46 / 0.07)',
                borderRadius: 'var(--r-sm)',
              }}
            >
              {person.currentTeam.tla}
            </span>
          </div>
        )}
      </main>
    </div>
  )
}
