import type { Match, MatchStatus, Team, Standing, StandingEntry } from '@/types/football'

const SITE = 'https://site.api.espn.com'
const LEAGUE = 'fifa.world'

// ─── Status mapping ───────────────────────────────────────────────────────────
const ESPN_STATUS: Record<string, MatchStatus> = {
  STATUS_SCHEDULED: 'SCHEDULED',
  STATUS_IN_PROGRESS: 'IN_PLAY',
  STATUS_HALFTIME: 'PAUSED',
  STATUS_FINAL: 'FINISHED',
  STATUS_FULL_TIME: 'FINISHED',
  STATUS_POSTPONED: 'POSTPONED',
  STATUS_CANCELED: 'CANCELLED',
  STATUS_SUSPENDED: 'SUSPENDED',
}

// ─── Stage labels ─────────────────────────────────────────────────────────────
const STAGE_LABELS: Record<string, string> = {
  'group-stage': 'GROUP_STAGE',
  'round-of-32': 'ROUND_OF_32',
  'round-of-16': 'LAST_16',
  'quarterfinals': 'QUARTER_FINALS',
  'semifinals': 'SEMI_FINALS',
  '3rd-place-match': 'THIRD_PLACE',
  'final': 'FINAL',
}

// Group stage: derive matchday (1/2/3) from date
// WC 2026 group stage: Jun 11-17 → MD1, Jun 18-24 → MD2, Jun 25-28 → MD3
function deriveMatchday(utcDate: string, stageSlug: string): number | null {
  if (stageSlug !== 'group-stage') return null
  const days = Math.floor(
    (new Date(utcDate).getTime() - new Date('2026-06-11T00:00:00Z').getTime()) /
      86_400_000,
  )
  if (days < 7) return 1
  if (days < 14) return 2
  return 3
}

function parseScore(s: string | undefined): number | null {
  if (s == null || s === '') return null
  const n = parseInt(s, 10)
  return isNaN(n) ? null : n
}

async function espnFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${SITE}${path}`, { next: { revalidate } })
  if (!res.ok) throw new Error(`ESPN ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

// ─── Teams ────────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapESPNTeam(t: any): Team {
  return {
    id: t.id,
    name: t.displayName,
    shortName: t.shortDisplayName ?? t.displayName,
    tla: t.abbreviation ?? '',
    crest: t.logos?.[0]?.href ?? '',
  }
}

export async function getESPNTeams(): Promise<Team[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await espnFetch<any>(
    `/apis/site/v2/sports/soccer/${LEAGUE}/teams?limit=60`,
    3600,
  )
  const teams: Team[] = []
  for (const item of data?.sports?.[0]?.leagues?.[0]?.teams ?? []) {
    teams.push(mapESPNTeam(item.team))
  }
  return teams
}

// ─── Standings ────────────────────────────────────────────────────────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function statVal(stats: any[], name: string): number {
  return stats?.find((s: { name: string; value: number }) => s.name === name)?.value ?? 0
}

export async function getESPNStandings(): Promise<Standing[]> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await espnFetch<any>(
    `/apis/v2/sports/soccer/${LEAGUE}/standings`,
    60,
  )
  const standings: Standing[] = []
  for (const child of data?.children ?? []) {
    const groupName: string = child.name ?? ''            // "Group A"
    const groupKey = groupName.replace('Group ', 'GROUP_') // "GROUP_A"
    const table: StandingEntry[] = []
    for (const entry of child?.standings?.entries ?? []) {
      const team = mapESPNTeam(entry.team)
      const stats = entry.stats ?? []
      const won = statVal(stats, 'wins')
      const lost = statVal(stats, 'losses')
      const draw = statVal(stats, 'ties')
      table.push({
        position: entry.rank ?? table.length + 1,
        team,
        playedGames: won + lost + draw,
        won,
        draw,
        lost,
        points: statVal(stats, 'points'),
        goalsFor: statVal(stats, 'pointsFor'),
        goalsAgainst: statVal(stats, 'pointsAgainst'),
        goalDifference: statVal(stats, 'pointsFor') - statVal(stats, 'pointsAgainst'),
        form: null,
      })
    }
    standings.push({ stage: 'GROUP_STAGE', type: 'TOTAL', group: groupKey, table })
  }
  return standings
}

// Build a team-id → group key map from standings
async function buildGroupMap(): Promise<Map<number, string>> {
  const map = new Map<number, string>()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await espnFetch<any>(
    `/apis/v2/sports/soccer/${LEAGUE}/standings`,
    300, // cache 5min — same as standings, group map rarely changes
  )
  for (const child of data?.children ?? []) {
    const groupKey: string = (child.name ?? '').replace('Group ', 'GROUP_')
    for (const entry of child?.standings?.entries ?? []) {
      map.set(Number(entry.team.id), groupKey)
    }
  }
  return map
}

// ─── Matches ──────────────────────────────────────────────────────────────────
export async function getESPNMatches(): Promise<Match[]> {
  // Fetch all WC 2026 matches in one call (group stage + knockout)
  const [data, groupMap] = await Promise.all([
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    espnFetch<any>(
      `/apis/site/v2/sports/soccer/${LEAGUE}/scoreboard?dates=20260611-20260719&limit=200`,
      60,
    ),
    buildGroupMap(),
  ])

  const matches: Match[] = []
  for (const event of data?.events ?? []) {
    const comp = event.competitions?.[0]
    if (!comp) continue

    const stageSlug: string = event.season?.slug ?? 'group-stage'
    const stage = STAGE_LABELS[stageSlug] ?? stageSlug.toUpperCase()
    const utcDate: string = event.date ?? comp.date ?? ''
    const matchday = deriveMatchday(utcDate, stageSlug)

    // Identify home / away competitors
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const home = comp.competitors?.find((c: any) => c.homeAway === 'home') ?? comp.competitors?.[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const away = comp.competitors?.find((c: any) => c.homeAway === 'away') ?? comp.competitors?.[1]
    if (!home || !away) continue

    const homeTeam = mapESPNTeam(home.team)
    const awayTeam = mapESPNTeam(away.team)

    // Determine group from standings map
    const group = groupMap.get(Number(homeTeam.id)) ?? null

    // Score
    const espnStatus = comp.status?.type?.name ?? 'STATUS_SCHEDULED'
    const isDone = espnStatus === 'STATUS_FINAL' || espnStatus === 'STATUS_FULL_TIME'
    const isLive = espnStatus === 'STATUS_IN_PROGRESS' || espnStatus === 'STATUS_HALFTIME'
    const homeScore = isDone || isLive ? parseScore(home.score) : null
    const awayScore = isDone || isLive ? parseScore(away.score) : null

    let winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null = null
    if (isDone && homeScore != null && awayScore != null) {
      winner = homeScore > awayScore ? 'HOME_TEAM' : homeScore < awayScore ? 'AWAY_TEAM' : 'DRAW'
    }

    matches.push({
      id: Number(event.id),
      utcDate,
      status: ESPN_STATUS[espnStatus] ?? 'SCHEDULED',
      matchday: matchday ?? 1,
      stage,
      group,
      homeTeam,
      awayTeam,
      score: {
        winner,
        duration: 'REGULAR',
        fullTime: { home: homeScore, away: awayScore },
        halfTime: { home: null, away: null },
      },
    })
  }

  // Sort by date
  matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  return matches
}
