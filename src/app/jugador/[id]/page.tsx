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

interface SportsDbPlayer {
  strPlayer?: string
  strThumb?: string
  strCutout?: string
  strHeight?: string
  strWeight?: string
  strBirthLocation?: string
  strDescriptionEN?: string
}

interface WikipediaSummary {
  extract?: string
  thumbnail?: {
    source?: string
  }
}

interface PlayerEnrichment {
  photoUrl: string | null
  height: string | null
  weight: string | null
  birthLocation: string | null
  bio: string | null
  source: 'TheSportsDB' | 'Wikipedia' | null
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

function cleanText(value?: string | null): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

async function getSportsDbPlayer(name: string): Promise<SportsDbPlayer | null> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return null
    const data = await res.json() as { player?: SportsDbPlayer[] | null }
    return data.player?.[0] ?? null
  } catch {
    return null
  }
}

async function getWikipediaSummary(name: string): Promise<WikipediaSummary | null> {
  try {
    const title = encodeURIComponent(name.replace(/\s+/g, '_'))
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
      next: { revalidate: 86400 },
      headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return res.json() as Promise<WikipediaSummary>
  } catch {
    return null
  }
}

async function getPlayerEnrichment(name: string): Promise<PlayerEnrichment> {
  const sportsDb = await getSportsDbPlayer(name)
  const sportsPhoto = cleanText(sportsDb?.strThumb) ?? cleanText(sportsDb?.strCutout)
  const sportsBio = cleanText(sportsDb?.strDescriptionEN)
  const hasSportsData = Boolean(
    sportsPhoto ||
    sportsBio ||
    sportsDb?.strHeight ||
    sportsDb?.strWeight ||
    sportsDb?.strBirthLocation,
  )

  if (hasSportsData) {
    const wiki = sportsPhoto ? null : await getWikipediaSummary(name)
    const wikiPhoto = cleanText(wiki?.thumbnail?.source)

    return {
      photoUrl: sportsPhoto ?? wikiPhoto,
      height: cleanText(sportsDb?.strHeight),
      weight: cleanText(sportsDb?.strWeight),
      birthLocation: cleanText(sportsDb?.strBirthLocation),
      bio: sportsBio ?? cleanText(wiki?.extract),
      source: sportsPhoto ? 'TheSportsDB' : wikiPhoto ? 'Wikipedia' : null,
    }
  }

  const wiki = await getWikipediaSummary(name)
  return {
    photoUrl: cleanText(wiki?.thumbnail?.source),
    height: null,
    weight: null,
    birthLocation: null,
    bio: cleanText(wiki?.extract),
    source: wiki?.thumbnail?.source || wiki?.extract ? 'Wikipedia' : null,
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
  const enrichment = await getPlayerEnrichment(person.name)
  const initials = person.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('')

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
        {/* Player photo */}
        <div
          className="relative overflow-hidden aspect-[4/5]"
          style={{
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--hairline)',
            borderRadius: 'var(--r-lg)',
          }}
        >
          {enrichment.photoUrl ? (
            <Image
              src={enrichment.photoUrl}
              alt={person.name}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 640px) 100vw, 512px"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-bold"
                style={{
                  color: posColor,
                  fontFamily: 'var(--font-albert)',
                  fontSize: 'clamp(64px, 28vw, 120px)',
                }}
              >
                {initials || person.name.slice(0, 1)}
              </span>
            </div>
          )}
          <div
            className="absolute inset-x-0 bottom-0 h-24"
            style={{ background: 'linear-gradient(to top, var(--lacquer), transparent)' }}
            aria-hidden="true"
          />
          {enrichment.photoUrl && enrichment.source ? (
            <span
              className="absolute left-3 bottom-3 eyebrow px-2 py-1 border"
              style={{
                color: 'var(--text-muted)',
                background: 'oklch(4% 0.004 95 / 0.74)',
                borderColor: 'var(--hairline)',
                borderRadius: 'var(--r-xs)',
              }}
            >
              Foto: {enrichment.source}
            </span>
          ) : null}
        </div>

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

        {(enrichment.height || enrichment.weight || enrichment.birthLocation) && (
          <div className="grid grid-cols-2 gap-3">
            {enrichment.height && (
              <div
                className="flex flex-col justify-center px-4 py-4 gap-1"
                style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
              >
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>Altura</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-warm)' }}>{enrichment.height}</span>
              </div>
            )}
            {enrichment.weight && (
              <div
                className="flex flex-col justify-center px-4 py-4 gap-1"
                style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
              >
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>Peso</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-warm)' }}>{enrichment.weight}</span>
              </div>
            )}
            {enrichment.birthLocation && (
              <div
                className="col-span-2 flex flex-col justify-center px-4 py-4 gap-1"
                style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
              >
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>Origen</span>
                <span className="text-sm font-semibold" style={{ color: 'var(--text-warm)' }}>{enrichment.birthLocation}</span>
              </div>
            )}
          </div>
        )}

        {enrichment.bio && (
          <section
            className="px-5 py-4 space-y-2"
            style={{ background: 'var(--raised-lacquer)', border: '1px solid var(--hairline)', borderRadius: 'var(--r-lg)' }}
          >
            <h2 className="eyebrow" style={{ color: 'var(--kinpaku)' }}>Perfil</h2>
            <p className="text-sm leading-6" style={{ color: 'var(--text-warm)' }}>
              {enrichment.bio.length > 420 ? `${enrichment.bio.slice(0, 420).trim()}...` : enrichment.bio}
            </p>
          </section>
        )}

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
