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

// ── Team-name → Wikipedia page title overrides ────────────────────────────────
// Generic fallback: `${teamName.replace(/\s+/g, '_')}_national_football_team`
// Only add here when the generic pattern doesn't match.

const WIKIPEDIA_TEAM_PAGES: Record<string, string> = {
  // TLA-keyed (tried first)
  USA: "United_States_men%27s_national_soccer_team",
  KOR: 'South_Korea_national_football_team',
  IRN: 'Iran_national_football_team',
  SCO: 'Scotland_national_football_team',
  WAL: 'Wales_national_football_team',
  // Name-keyed (tried second)
  'United States': "United_States_men%27s_national_soccer_team",
  England: 'England_national_football_team',
  Scotland: 'Scotland_national_football_team',
  Wales: 'Wales_national_football_team',
  'Korea Republic': 'South_Korea_national_football_team',
  'South Korea': 'South_Korea_national_football_team',
  Iran: 'Iran_national_football_team',
  'IR Iran': 'Iran_national_football_team',
  Turkey: 'Turkey_national_football_team',
  Türkiye: 'Turkey_national_football_team',
  // football-data.org uses non-standard names for several teams
  'Bosnia-Herzegovina': 'Bosnia_and_Herzegovina_national_football_team',
  'Bosnia and Herzegovina': 'Bosnia_and_Herzegovina_national_football_team',
  'Congo DR': 'DR_Congo_national_football_team',
  'DR Congo': 'DR_Congo_national_football_team',
  'Cape Verde Islands': 'Cape_Verde_national_football_team',
  'Ivory Coast': 'Ivory_Coast_national_football_team',
  "Côte d'Ivoire": 'Ivory_Coast_national_football_team',
  Curaçao: 'Curaçao_national_football_team',
  'Saudi Arabia': 'Saudi_Arabia_national_football_team',
  'South Africa': 'South_Africa_national_football_team',
  'New Zealand': 'New_Zealand_national_football_team',
  'Czech Republic': 'Czech_Republic_national_football_team',
  Czechia: 'Czech_Republic_national_football_team',
  Netherlands: 'Netherlands_national_football_team',
  Norway: 'Norway_national_football_team',
  Sweden: 'Sweden_national_football_team',
  Switzerland: 'Switzerland_national_football_team',
}

// ── Position maps ─────────────────────────────────────────────────────────────

const POSITION_MAP: Record<string, PlayerPosition> = {
  // Standard abbreviations (nat-fs tables)
  GK: 'Goalkeeper',
  DF: 'Defence',
  MF: 'Midfield',
  FW: 'Offence',
  // Full names (some wikitables use these)
  Goalkeeper: 'Goalkeeper',
  Defender: 'Defence',
  Midfielder: 'Midfield',
  Forward: 'Offence',
  Winger: 'Offence',
  Attacker: 'Offence',
}

// ── Wikipedia page title resolver ─────────────────────────────────────────────

function wikiPageForTeam(teamName: string, tla?: string): string {
  const mapped =
    WIKIPEDIA_TEAM_PAGES[tla ?? ''] ??
    WIKIPEDIA_TEAM_PAGES[teamName]
  if (mapped) return mapped
  return `${teamName.replace(/\s+/g, '_')}_national_football_team`
}

// ── HTML utilities ────────────────────────────────────────────────────────────

function decodeHtml(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCharCode(Number(code)))
    .replace(/&#x([\da-f]+);/gi, (_, code: string) =>
      String.fromCharCode(parseInt(code, 16))
    )
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

function cellLinks(
  cellHtml: string
): { href: string | null; label: string | null }[] {
  const links: { href: string | null; label: string | null }[] = []
  const linkRegex = /<a\b[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi
  let match: RegExpExecArray | null
  while ((match = linkRegex.exec(cellHtml))) {
    const href = decodeHtml(match[1])
    const label = stripTags(match[2])
    links.push({
      href: href.startsWith('/wiki/')
        ? `https://en.wikipedia.org${href}`
        : href,
      label: label || null,
    })
  }
  return links
}

function firstTextLink(
  cellHtml: string
): { href: string | null; label: string | null } {
  return (
    cellLinks(cellHtml).find((link) => link.label) ?? {
      href: null,
      label: null,
    }
  )
}

function lastTextLink(
  cellHtml: string
): { href: string | null; label: string | null } {
  return (
    cellLinks(cellHtml)
      .filter((link) => link.label)
      .at(-1) ?? { href: null, label: null }
  )
}

function extractDateOfBirth(cellHtml: string): string {
  // Class-based (nat-fs template)
  const bdayMatch = cellHtml.match(/class="bday">([^<]+)</i)
  if (bdayMatch) return bdayMatch[1]
  // ISO date in plain text: YYYY-MM-DD
  const isoMatch = stripTags(cellHtml).match(/\b(\d{4}-\d{2}-\d{2})\b/)
  if (isoMatch) return isoMatch[1]
  return ''
}

function stableNegativeId(value: string): number {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) | 0
  }
  return -Math.abs(hash || 1)
}

// ── Parser 1: nat-fs-player rows (used by {{Fs player}} template) ─────────────

function parseNatFsRows(html: string, nationality: string): Player[] {
  const players: Player[] = []
  const rowRegex =
    /<tr\b[^>]*class="[^"]*nat-fs-player[^"]*"[^>]*>([\s\S]*?)<\/tr>/gi
  let rowMatch: RegExpExecArray | null

  while ((rowMatch = rowRegex.exec(html))) {
    const cells = getCells(rowMatch[1])
    if (cells.length < 7) continue

    const rawPosition = stripTags(cells[1]).replace(/[0-9]/g, '').trim()
    const position = POSITION_MAP[rawPosition] ?? null
    const playerLink = firstTextLink(cells[2])
    const name = playerLink.label ?? stripTags(cells[2])
    const dateOfBirth = extractDateOfBirth(cells[3])
    const clubLink = lastTextLink(cells[6])

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

// ── Parser 2: generic wikitable (Germany, Spain, France, etc.) ────────────────
// Handles sortable wikitables where the header row defines column layout.
// Common column order: # | Pos. | Player | DOB (age) | Caps | Goals | Club

function parseWikitable(html: string, nationality: string): Player[] {
  // Extract all wikitable blocks from the section HTML
  const tableRegex =
    /<table\b[^>]*class="[^"]*wikitable[^"]*"[^>]*>([\s\S]*?)<\/table>/gi
  let tableMatch: RegExpExecArray | null

  while ((tableMatch = tableRegex.exec(html))) {
    const tableHtml = tableMatch[1]

    // Pull all <tr> rows
    const allRows: string[] = []
    const rowRegex = /<tr\b[^>]*>([\s\S]*?)<\/tr>/gi
    let rowMatch: RegExpExecArray | null
    while ((rowMatch = rowRegex.exec(tableHtml))) {
      allRows.push(rowMatch[1])
    }
    if (allRows.length < 5) continue

    // Find the first header row (contains <th> elements)
    const headerRow = allRows.find((r) => /<th\b/i.test(r))
    if (!headerRow) continue

    const headers = getCells(headerRow).map((c) =>
      stripTags(c).toLowerCase().replace(/[^a-z]/g, ' ').trim()
    )

    // Locate key columns by header text
    const posIdx = headers.findIndex(
      (h) => h === 'pos' || h === 'pos ' || h.startsWith('pos')
    )
    const playerIdx = headers.findIndex(
      (h) => h === 'player' || h === 'name'
    )
    const capsIdx = headers.findIndex(
      (h) => h === 'caps' || h === 'ap' || h === 'apps' || h === 'appearances'
    )
    const goalsIdx = headers.findIndex(
      (h) => h === 'goals' || h === 'gls' || h === 'g'
    )
    const dobIdx = headers.findIndex(
      (h) =>
        h.includes('dob') ||
        h.includes('birth') ||
        h.includes('born') ||
        h.includes('age')
    )
    const clubIdx = headers.reduce(
      (last, h, i) =>
        h === 'club' || h.includes('club') ? i : last,
      -1
    )

    if (posIdx === -1 || playerIdx === -1) continue

    const players: Player[] = []

    for (const row of allRows) {
      // Skip header rows
      if (/<th\b/i.test(row)) continue
      const cells = getCells(row)
      if (cells.length <= Math.max(posIdx, playerIdx)) continue

      const rawPos = stripTags(cells[posIdx])
        .replace(/\[.*?\]/g, '')  // remove footnote references like [1]
        .trim()
      const position = POSITION_MAP[rawPos] ?? null
      if (!position) continue

      const playerLink = firstTextLink(cells[playerIdx])
      const name =
        playerLink.label ??
        stripTags(cells[playerIdx]).replace(/\[.*?\]/g, '').trim()
      if (!name) continue

      const dateOfBirth = dobIdx >= 0 ? extractDateOfBirth(cells[dobIdx] ?? '') : ''

      const caps =
        capsIdx >= 0
          ? Number(
              stripTags(cells[capsIdx] ?? '')
                .replace(/\[.*?\]/g, '')
                .replace(/[^\d]/g, '')
            ) || null
          : null

      const goals =
        goalsIdx >= 0
          ? Number(
              stripTags(cells[goalsIdx] ?? '')
                .replace(/\[.*?\]/g, '')
                .replace(/[^\d]/g, '')
            ) || null
          : null

      let club: string | null = null
      if (clubIdx >= 0 && cells[clubIdx]) {
        const clubLink = lastTextLink(cells[clubIdx])
        const clubText = stripTags(cells[clubIdx]).replace(/\[.*?\]/g, '').trim()
        club = clubLink.label ?? (clubText || null)
      }

      players.push({
        id: stableNegativeId(`${nationality}:${name}`),
        name,
        position,
        dateOfBirth,
        nationality,
        club,
        caps,
        goals,
        profileUrl: playerLink.href,
        source: 'Wikipedia',
      })
    }

    if (players.length >= 5) return players
  }

  return []
}

// ── Section HTML parser — tries nat-fs first, then wikitable ─────────────────

function deduplicateByName(players: Player[]): Player[] {
  const seen = new Set<string>()
  return players.filter((p) => {
    const key = p.name.toLowerCase().trim()
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

function parseCurrentSquad(html: string, nationality: string): Player[] {
  const natFs = deduplicateByName(parseNatFsRows(html, nationality))
  if (natFs.length > 0) return natFs
  return deduplicateByName(parseWikitable(html, nationality))
}

// ── Wikipedia API helpers ─────────────────────────────────────────────────────

async function wikipediaJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate: 86400 },
      headers: {
        Accept: 'application/json',
        'Api-User-Agent':
          'Mundial2026Promo/0.1 (https://github.com/cagr1/mundial-2026)',
      },
    })
    if (!res.ok) return null
    return res.json() as Promise<T>
  } catch {
    return null
  }
}

// ── Exported function ─────────────────────────────────────────────────────────

export async function getWikipediaCurrentSquad(
  teamName: string,
  tla?: string
): Promise<Player[]> {
  const page = wikiPageForTeam(teamName, tla)
  const encodedPage = page.startsWith('United_States_men')
    ? page  // already encoded
    : encodeURIComponent(page.replace(/_/g, ' '))

  const sectionsUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedPage}&prop=sections&format=json`
  const sectionsData =
    await wikipediaJson<WikiSectionsResponse>(sectionsUrl)

  // Accept several common section heading variants
  const squadSection = sectionsData?.parse?.sections?.find((section) => {
    const line = section.line.toLowerCase().trim()
    return (
      line === 'current squad' ||
      line === 'squad' ||
      line === 'current squads' ||
      line.startsWith('current squad')
    )
  })

  if (!squadSection) return []

  const sectionUrl = `https://en.wikipedia.org/w/api.php?action=parse&page=${encodedPage}&prop=text&section=${squadSection.index}&format=json&disabletoc=1`
  const sectionData =
    await wikipediaJson<WikiSectionHtmlResponse>(sectionUrl)
  const html = sectionData?.parse?.text?.['*']
  if (!html) return []

  return parseCurrentSquad(html, teamName)
}
