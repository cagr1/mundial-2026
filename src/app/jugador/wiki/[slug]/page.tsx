import Image from 'next/image'
import Link from 'next/link'
import { flagEmoji, calcAge } from '@/lib/flags'

// Position colors matching the rest of the app (Neo Kinpaku design system)
const POSITION_COLOR: Record<string, string> = {
  Goalkeeper: 'var(--kinpaku)',
  Defence:    'var(--patina)',
  Midfield:   'oklch(74% 0.13 290)',
  Offence:    'var(--vermilion)',
}
// Use explicit OKLCH values for badge backgrounds (var() can't take alpha modifier)
const POSITION_BG: Record<string, string> = {
  Goalkeeper: 'oklch(84% 0.19 80.46 / 0.1)',
  Defence:    'oklch(70% 0.12 188 / 0.1)',
  Midfield:   'oklch(74% 0.13 290 / 0.1)',
  Offence:    'oklch(58% 0.15 35 / 0.1)',
}
const POSITION_LABEL: Record<string, string> = {
  Goalkeeper: 'Portero',
  Defence:    'Defensa',
  Midfield:   'Mediocampista',
  Offence:    'Delantero',
}

interface WikiSummary {
  title: string
  extract?: string
  thumbnail?: { source: string }
}

interface SportsDBPlayer {
  strThumb?: string
  strCutout?: string
  strHeight?: string
  strWeight?: string
  strBirthLocation?: string
}

async function getWikiSummary(slug: string): Promise<WikiSummary | null> {
  try {
    const res = await fetch(
      `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(slug)}`,
      {
        headers: { 'Api-User-Agent': 'Mundial2026Promo/0.1 (https://github.com/cagr1/mundial-2026)' },
        next: { revalidate: 86400 },
      }
    )
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

async function getSportsDBPlayer(name: string): Promise<SportsDBPlayer | null> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } }
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.player?.[0] ?? null
  } catch {
    return null
  }
}

export default async function WikiPlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{
    pos?: string
    club?: string
    caps?: string
    goals?: string
    nat?: string
    dob?: string
  }>
}) {
  const { slug } = await params
  const sp = await searchParams

  // Next.js decodes percent-encoded path params; restore for Wikipedia API calls
  const decodedSlug = decodeURIComponent(slug)
  const displayName = decodedSlug.replace(/_/g, ' ')

  // Fetch enrichment in parallel
  const [summary, sportsdb] = await Promise.all([
    getWikiSummary(decodedSlug),
    getSportsDBPlayer(displayName),
  ])

  const name       = summary?.title ?? displayName
  const photo      = sportsdb?.strThumb ?? sportsdb?.strCutout ?? summary?.thumbnail?.source ?? null
  const pos        = sp.pos ?? null
  const club       = sp.club ?? null
  const caps       = sp.caps != null ? Number(sp.caps) : null
  const goals      = sp.goals != null ? Number(sp.goals) : null
  const nationality = sp.nat ?? null
  const dob        = sp.dob ?? null
  const age        = dob ? calcAge(dob) : null
  const flag       = nationality ? flagEmoji(nationality) : null
  const posColor   = pos ? (POSITION_COLOR[pos] ?? 'var(--text-muted)') : 'var(--text-muted)'
  const posBg      = pos ? (POSITION_BG[pos] ?? 'transparent') : 'transparent'
  const posLabel   = pos ? (POSITION_LABEL[pos] ?? pos) : null
  const dobFormatted = dob
    ? new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(
        new Date(dob)
      )
    : null

  // Initials fallback when no photo
  const initials = name
    .split(' ')
    .map((w: string) => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()

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
          className="overflow-hidden"
          style={{
            background: 'var(--raised-lacquer)',
            border: '1px solid var(--hairline)',
            borderLeft: `4px solid ${posColor}`,
            borderRadius: 'var(--r-lg)',
          }}
        >
          <div className="flex gap-4 px-6 py-7">
            {/* Photo or initials */}
            {photo ? (
              <div
                className="flex-shrink-0 relative w-20 h-20 overflow-hidden"
                style={{ borderRadius: 'var(--r-md)' }}
              >
                <Image
                  src={photo}
                  alt={name}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              </div>
            ) : (
              <div
                className="flex-shrink-0 w-20 h-20 flex items-center justify-center text-2xl font-bold"
                style={{ background: 'var(--graphite)', borderRadius: 'var(--r-md)', color: posColor }}
              >
                {initials}
              </div>
            )}

            <div className="flex-1 min-w-0 flex flex-col justify-center gap-2">
              {posLabel && (
                <span
                  className="eyebrow self-start px-2 py-0.5 border"
                  style={{
                    color: posColor,
                    borderColor: posColor,
                    background: posBg,
                    borderRadius: 'var(--r-xs)',
                  }}
                >
                  {posLabel}
                </span>
              )}

              <h1
                className="text-xl sm:text-2xl font-bold leading-tight"
                style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}
              >
                {name}
              </h1>

              {nationality && flag && (
                <div className="flex items-center gap-2">
                  <span className="text-lg" aria-hidden="true">{flag}</span>
                  <span className="text-sm font-medium" style={{ color: 'var(--text-warm)' }}>
                    {nationality}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Age + DOB */}
        {(age != null || dobFormatted) && (
          <div className="grid grid-cols-3 gap-3">
            {age != null && (
              <div
                className="flex flex-col items-center justify-center gap-1 py-4"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span
                  className="tabnum text-3xl font-bold"
                  style={{ color: 'var(--kinpaku)', fontFamily: 'var(--font-albert)' }}
                >
                  {age}
                </span>
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>años</span>
              </div>
            )}
            {dobFormatted && (
              <div
                className="col-span-2 flex flex-col justify-center px-4 py-4 gap-1"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>Nacimiento</span>
                <span className="text-sm font-medium capitalize" style={{ color: 'var(--text-warm)' }}>
                  {dobFormatted}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Club */}
        {club && (
          <div
            className="flex items-center px-5 py-4"
            style={{
              background: 'var(--raised-lacquer)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <div>
              <p className="eyebrow mb-1" style={{ color: 'var(--text-disabled)' }}>Club actual</p>
              <p
                className="text-base font-bold"
                style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}
              >
                {club}
              </p>
            </div>
          </div>
        )}

        {/* Caps & Goals */}
        {(caps != null || goals != null) && (
          <div className="grid grid-cols-2 gap-3">
            {caps != null && (
              <div
                className="flex flex-col items-center justify-center gap-1 py-5"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span
                  className="tabnum text-3xl font-bold"
                  style={{ color: 'var(--patina)', fontFamily: 'var(--font-albert)' }}
                >
                  {caps}
                </span>
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>partidos</span>
              </div>
            )}
            {goals != null && (
              <div
                className="flex flex-col items-center justify-center gap-1 py-5"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span
                  className="tabnum text-3xl font-bold"
                  style={{ color: 'var(--vermilion)', fontFamily: 'var(--font-albert)' }}
                >
                  {goals}
                </span>
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>goles</span>
              </div>
            )}
          </div>
        )}

        {/* Physical — from TheSportsDB */}
        {(sportsdb?.strHeight || sportsdb?.strWeight) && (
          <div className="grid grid-cols-2 gap-3">
            {sportsdb.strHeight && (
              <div
                className="flex flex-col items-center justify-center gap-1 py-4"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}
                >
                  {sportsdb.strHeight}
                </span>
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>altura</span>
              </div>
            )}
            {sportsdb.strWeight && (
              <div
                className="flex flex-col items-center justify-center gap-1 py-4"
                style={{
                  background: 'var(--raised-lacquer)',
                  border: '1px solid var(--hairline)',
                  borderRadius: 'var(--r-lg)',
                }}
              >
                <span
                  className="text-lg font-bold"
                  style={{ color: 'var(--champagne)', fontFamily: 'var(--font-albert)' }}
                >
                  {sportsdb.strWeight}
                </span>
                <span className="eyebrow" style={{ color: 'var(--text-disabled)' }}>peso</span>
              </div>
            )}
          </div>
        )}

        {/* Birth location — from TheSportsDB */}
        {sportsdb?.strBirthLocation && (
          <div
            className="px-5 py-4"
            style={{
              background: 'var(--raised-lacquer)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <p className="eyebrow mb-1" style={{ color: 'var(--text-disabled)' }}>Lugar de nacimiento</p>
            <p className="text-sm font-medium" style={{ color: 'var(--text-warm)' }}>
              {sportsdb.strBirthLocation}
            </p>
          </div>
        )}

        {/* Bio — Wikipedia extract (truncated) */}
        {summary?.extract && (
          <div
            className="px-5 py-4"
            style={{
              background: 'var(--raised-lacquer)',
              border: '1px solid var(--hairline)',
              borderRadius: 'var(--r-lg)',
            }}
          >
            <p className="eyebrow mb-2" style={{ color: 'var(--text-disabled)' }}>Sobre el jugador</p>
            <p className="text-sm leading-7" style={{ color: 'var(--text-muted)' }}>
              {summary.extract.length > 320
                ? `${summary.extract.slice(0, 320)}…`
                : summary.extract}
            </p>
          </div>
        )}

        {/* Source attribution */}
        <p className="eyebrow text-center pb-2" style={{ color: 'var(--text-disabled)' }}>
          Fuente: Wikipedia{sportsdb ? ' · TheSportsDB' : ''}
        </p>

      </main>
    </div>
  )
}
