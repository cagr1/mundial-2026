import { flagEmoji, calcAge } from '@/lib/flags'
import PlayerDetail from '@/components/PlayerDetail'

const POSITION_COLOR: Record<string, string> = {
  Goalkeeper: 'var(--kinpaku)',
  Defence:    'var(--patina)',
  Midfield:   'oklch(74% 0.13 290)',
  Offence:    'var(--vermilion)',
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
        headers: { 'Api-User-Agent': 'Mundial2026Promo/0.1' },
        next: { revalidate: 86400 },
      },
    )
    if (!res.ok) return null
    return res.json()
  } catch { return null }
}

async function getSportsDBPlayer(name: string): Promise<SportsDBPlayer | null> {
  try {
    const res = await fetch(
      `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encodeURIComponent(name)}`,
      { next: { revalidate: 86400 } },
    )
    if (!res.ok) return null
    const data = await res.json()
    return data.player?.[0] ?? null
  } catch { return null }
}

export default async function WikiPlayerPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ pos?: string; club?: string; caps?: string; goals?: string; nat?: string; dob?: string; from?: string }>
}) {
  const { slug } = await params
  const sp = await searchParams

  const decodedSlug = decodeURIComponent(slug)
  const displayName = decodedSlug.replace(/_/g, ' ')

  const [summary, sportsdb] = await Promise.all([
    getWikiSummary(decodedSlug),
    getSportsDBPlayer(displayName),
  ])

  const name         = summary?.title ?? displayName
  const photo        = sportsdb?.strThumb ?? sportsdb?.strCutout ?? summary?.thumbnail?.source ?? null
  const pos          = sp.pos ?? null
  const club         = sp.club ?? null
  const caps         = sp.caps != null ? Number(sp.caps) : null
  const goals        = sp.goals != null ? Number(sp.goals) : null
  const nationality  = sp.nat ?? null
  const dob          = sp.dob ?? null
  const backHref     = sp.from ? `/?tab=equipos&equipo=${sp.from}` : null
  const age          = dob ? calcAge(dob) : null
  const flag         = nationality ? flagEmoji(nationality) : null
  const posColor     = pos ? (POSITION_COLOR[pos] ?? 'var(--text-muted)') : 'var(--text-muted)'
  const posLabel     = pos ? (POSITION_LABEL[pos] ?? pos) : null
  const dobFormatted = dob
    ? new Intl.DateTimeFormat('es', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dob))
    : null
  const initials = name.split(' ').map((w: string) => w[0] ?? '').join('').slice(0, 2).toUpperCase()
  const photoSource = photo
    ? (sportsdb?.strThumb || sportsdb?.strCutout ? 'TheSportsDB' : 'Wikipedia')
    : null

  return (
    <PlayerDetail
      name={name}
      initials={initials}
      photoUrl={photo}
      posLabel={posLabel}
      posColor={posColor}
      shirtNumber={null}
      nationality={nationality}
      flag={flag}
      age={age}
      dobFormatted={dobFormatted}
      caps={caps}
      goals={goals}
      club={club}
      height={sportsdb?.strHeight ?? null}
      weight={sportsdb?.strWeight ?? null}
      birthLocation={sportsdb?.strBirthLocation ?? null}
      bio={summary?.extract ?? null}
      photoSource={photoSource}
      backHref={backHref}
    />
  )
}
