import { flagEmoji, calcAge } from '@/lib/flags'
import PlayerDetail from '@/components/PlayerDetail'

interface PersonData {
  id: number
  name: string
  dateOfBirth: string
  nationality: string
  section: string
  position: string | null
  shirtNumber: number | null
  currentTeam?: { name: string; tla: string; crest: string; venue?: string }
}

interface SportsDbPlayer {
  strThumb?: string
  strCutout?: string
  strHeight?: string
  strWeight?: string
  strBirthLocation?: string
  strDescriptionEN?: string
}

interface WikipediaSummary {
  extract?: string
  thumbnail?: { source?: string }
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
  } catch { return null }
}

function clean(v?: string | null): string | null {
  const t = v?.trim(); return t || null
}

async function getSportsDb(name: string): Promise<SportsDbPlayer | null> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return null
    const data = await res.json() as { player?: SportsDbPlayer[] | null }
    return data.player?.[0] ?? null
  } catch { return null }
}

async function getWiki(name: string): Promise<WikipediaSummary | null> {
  try {
    const title = encodeURIComponent(name.replace(/\s+/g, '_'))
    const res = await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${title}`, {
      next: { revalidate: 86400 }, headers: { Accept: 'application/json' },
    })
    if (!res.ok) return null
    return res.json() as Promise<WikipediaSummary>
  } catch { return null }
}

export default async function PlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ from?: string }>
}) {
  const { id } = await params
  const sp = await searchParams
  const backHref = sp.from ? `/?tab=equipos&equipo=${sp.from}` : null
  const person = await getPerson(id)

  if (!person) {
    return (
      <div className="min-h-dvh flex items-center justify-center" style={{ background: 'var(--lacquer-deep)' }}>
        <div className="text-center space-y-3">
          <p className="eyebrow" style={{ color: 'var(--text-muted)' }}>Jugador no encontrado</p>
        </div>
      </div>
    )
  }

  const sportsdb = await getSportsDb(person.name)
  const photoUrl = clean(sportsdb?.strThumb) ?? clean(sportsdb?.strCutout) ?? null
  const wiki = (!photoUrl || !sportsdb?.strDescriptionEN) ? await getWiki(person.name) : null
  const bio = clean(sportsdb?.strDescriptionEN) ?? clean(wiki?.extract)
  const finalPhoto = photoUrl ?? clean(wiki?.thumbnail?.source)
  const photoSource = finalPhoto
    ? (photoUrl ? 'TheSportsDB' : 'Wikipedia')
    : null

  const pos = person.section ?? person.position ?? 'Unknown'
  const age = person.dateOfBirth ? calcAge(person.dateOfBirth) : null
  const dob = person.dateOfBirth
    ? new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(person.dateOfBirth))
    : null
  const initials = person.name.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('')

  return (
    <PlayerDetail
      name={person.name}
      initials={initials}
      photoUrl={finalPhoto}
      posLabel={SECTION_LABEL[pos] ?? pos}
      posColor={SECTION_COLOR[pos] ?? 'var(--text-muted)'}
      shirtNumber={person.shirtNumber}
      nationality={person.nationality}
      flag={flagEmoji(person.nationality)}
      age={age}
      dobFormatted={dob}
      caps={null}
      goals={null}
      club={person.currentTeam?.name ?? null}
      height={clean(sportsdb?.strHeight)}
      weight={clean(sportsdb?.strWeight)}
      birthLocation={clean(sportsdb?.strBirthLocation)}
      bio={bio}
      photoSource={photoSource}
      backHref={backHref}
    />
  )
}
