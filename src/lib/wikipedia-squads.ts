import { Player, PlayerPosition } from '@/types/football'

interface WikiSection {
  line: string
  index: string
}

interface WikiSectionsResponse {
  parse?: {
    sections?: WikiSection[]
  }
}

interface WikiSectionHtmlResponse {
  parse?: {
    text?: {
      '*': string
    }
  }
}

const WIKIPEDIA_TEAM_PAGES: Record<string, string> = {
  USA: "United States men's national soccer team",
  'United States': "United States men's national soccer team",
  England: 'England_national_football_team',
  Scotland: 'Scotland_national_football_team',
  Wales: 'Wales_national_football_team',
  'Korea Republic': 'South_Korea_national_football_team',
  'South Korea': 'South_Korea_national_football_team',
  Iran: 'Iran_national_football_team',
  'IR Iran': 'Iran_national_football_team',
  Turkey: 'Turkey_national_football_team',
  Türkiye: 'Turkey_national_football_team',
}

const POSITION_MAP: Record<string, PlayerPosition> = {
  GK: 'Goalkeeper',
  DF: 'Defence',
  MF: 'Midfield',
  FW: 'Offence',
}

function wikiPageForTeam(teamName: string, tla?: string): string {
  const mapped = WIKIPEDIA_TEAM_PAGES[tla ?? ''] ?? WIKIPEDIA_TEAM_PAGES[teamName]
  if (mapped) return mapped
  return `${teamName.replace(/\s+/g, '_')}_national_football_team`
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) => String.fromCharCode(parseInt(code, 16)))
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
}

function stripTags(value: string): string {
  return decodeHtml(value.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

function getCells(rowHtml: string): string[] {
  const cells: string[] = []
  const cellRegex = /<(td|th)\b[^>]*>([\s\S]*?)<\/\1>/gi
  let match: RegExpExecArray | null

  while ((match = cellRegex.exec(rowHtml))) {
    cells.push(match[2])
  }

  return cells
}

function firstLink(cellHtml: string): { href: string | null; label: string | null } {
  const match = cellHtml.match(/<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/i)
  if (!match) return { href: null, label: null }

  const href = decodeHtml(match[1])
  return {
    href: href.startsWith('/wiki/') ? `https://en.wikipedia.org${href}` : href,
    label: stripTags(match[2]),
  }
}

function extractDateOfBirth(cellHtml: string): string {
  const match = cellHtml.match(/class="bday">([^<]+)</i)
  return match?.[1] ?? ''
}

function stableNegativeId(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return -Math.abs(hash || 1)
}

function parseCurrentSquad(html: string, nationality: string): Player[] {
  const players: Player[] = []
  const rowRegex = /<tr\b[^>]*class="[^"]*nat-fs-player[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch: RegExpExecArray | null

  while ((rowMatch = rowRegex.exec(html))) {
    const cells = getCells(rowMatch[1])
    if (cells.length < 7) continue

    const rawPosition = stripTags(cells[1]).replace(/[0-9]/g, '').trim()
    const position = POSITION_MAP[rawPosition] ?? null
    const playerLink = firstLink(cells[2])
    const name = playerLink.label ?? stripTags(cells[2])
    const dateOfBirth = extractDateOfBirth(cells[3])
    const clubLink = firstLink(cells[6])

    if (!name || !position) continue

    players.push({
      id: stableNegativeId(`${nationality}:${name}`),
      name,
      position,
      dateOfBirth,
      nationality,
      club: clubLink.label ?? stripTags(cells[6]),
      caps: Number(stripTags(cells[4])) || null,
      goals: Number(stripTags(cells[5])) || null,
      profileUrl: playerLink.href,
      source: 'Wikipedia',
    })
  }

  return players
}

async function wikipediaJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: {
        Accept: 'application/json',
        'Api-User-Agent': 'Mundial2026Promo/0.1 (https://github.com/cagr1/mundial-2026)',
      },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

export async function getWikipediaCurrentSquad(teamName: string, tla?: string): Promise<Player[]> {
  const page = encodeURIComponent(wikiPageForTeam(teamName, tla))
  const sectionsUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=sections&format=json`
  const sectionsData = await wikipediaJson<WikiSectionsResponse>(sectionsUrl)
  const currentSquad = sectionsData?.parse?.sections?.find((section) => {
    return section.line.toLowerCase() === 'current squad'
  })

  if (!currentSquad) return []

  const sectionUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${page}&prop=text&section=${currentSquad.index}&format=json&disabletoc=1`
  const sectionData = await wikipediaJson<WikiSectionHtmlResponse>(sectionUrl)
  const html = sectionData?.parse?.text?.['*']
  if (!html) return []

  return parseCurrentSquad(html, teamName)
}
