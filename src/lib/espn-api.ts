import type {
  Match, MatchStatus, Team, Standing, StandingEntry, Venue,
  MatchSummary, MatchEvent, MatchEventType, TeamLineup, LineupPlayer, TeamStat, MatchStatistics,
} from '@/types/football'

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
  // Scoreboard competitor objects don't include logos[], derive from abbreviation
  const abbr: string = t.abbreviation ?? ''
  const crest: string =
    t.logos?.[0]?.href ??
    (abbr ? `https://a.espncdn.com/i/teamlogos/countries/500/${abbr.toLowerCase()}.png` : '')
  return {
    id: t.id,
    name: t.displayName,
    shortName: t.shortDisplayName ?? t.displayName,
    tla: abbr,
    crest,
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
      30,
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

    // Score — `type.state` ('pre' | 'in' | 'post') is the reliable live/done signal.
    // `type.name` has many "in-progress" variants (STATUS_FIRST_HALF, STATUS_SECOND_HALF, etc.)
    // that don't all match a fixed list, so derive isLive/isDone from `state` instead.
    const statusType = comp.status?.type ?? {}
    const espnStatus: string = statusType.name ?? 'STATUS_SCHEDULED'
    const state: string = statusType.state ?? 'pre'
    const isDone = state === 'post'
    const isLive = state === 'in'
    const homeScore = isDone || isLive ? parseScore(home.score) : null
    const awayScore = isDone || isLive ? parseScore(away.score) : null

    let winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null = null
    if (isDone && homeScore != null && awayScore != null) {
      winner = homeScore > awayScore ? 'HOME_TEAM' : homeScore < awayScore ? 'AWAY_TEAM' : 'DRAW'
    }

    const status: MatchStatus =
      ESPN_STATUS[espnStatus] ??
      (isDone ? 'FINISHED' : isLive ? (espnStatus === 'STATUS_HALFTIME' ? 'PAUSED' : 'IN_PLAY') : 'SCHEDULED')

    // Display clock, e.g. "45'+2'" — only meaningful while the match is live
    const clock: string | null = isLive ? (comp.status?.displayClock ?? null) : null

    const venueName: string = comp.venue?.fullName ?? ''
    const venueCity: string = comp.venue?.address?.city ?? ''
    const venue: Venue | undefined =
      venueName ? { name: venueName, city: venueCity } : undefined

    matches.push({
      id: Number(event.id),
      utcDate,
      status,
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
      venue,
      clock,
    })
  }

  // Sort by date
  matches.sort((a, b) => a.utcDate.localeCompare(b.utcDate))
  return matches
}

// ─── Match summary (lineups / events / statistics) ──────────────────────────
// ESPN usa variantes con sufijo `---` (p.ej. "goal---header", "goal---penalty",
// "penalty---scored"). Normalizamos de forma robusta para no descartar goles
// de cabeza/penal ni clasificarlos mal.
function normalizeEventType(raw: string): MatchEventType | null {
  const full = raw.toLowerCase()
  const base = full.split('---')[0]
  if (full.includes('own')) return 'own-goal'
  if (full.includes('penalty')) {
    if (full.includes('miss') || full.includes('saved')) return 'penalty-miss'
    if (full.includes('goal') || full.includes('scored') || full.includes('converted')) return 'penalty-goal'
    return null // penal concedido / otros estados sin desenlace
  }
  if (base === 'goal') return 'goal'
  if (base === 'yellow-card') return 'yellow-card'
  if (base === 'red-card' || base === 'yellow-red-card') return 'red-card'
  if (base === 'substitution') return 'substitution'
  return null
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function playerStat(stats: any[], name: string): number {
  const s = stats?.find((x: { name: string }) => x.name === name)
  const v = s?.value
  return typeof v === 'number' ? v : Number(s?.displayValue ?? 0) || 0
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function mapRoster(entry: any): LineupPlayer {
  const a = entry.athlete ?? {}
  const stats = entry.stats ?? []
  return {
    id: String(a.id ?? ''),
    name: a.displayName ?? a.fullName ?? '',
    shortName: a.shortName ?? a.displayName ?? '',
    jersey: entry.jersey ?? '',
    position: entry.position?.abbreviation ?? '',
    positionName: entry.position?.displayName ?? entry.position?.name ?? '',
    starter: entry.starter === true,
    subbedIn: entry.subbedIn === true,
    subbedOut: entry.subbedOut === true,
    formationPlace: entry.formationPlace ?? '',
    goals: playerStat(stats, 'totalGoals'),
    yellowCards: playerStat(stats, 'yellowCards'),
    redCards: playerStat(stats, 'redCards'),
  }
}

export async function getESPNMatchSummary(eventId: string | number, revalidate = 30): Promise<MatchSummary> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const data = await espnFetch<any>(
    `/apis/site/v2/sports/soccer/${LEAGUE}/summary?event=${eventId}`,
    revalidate,
  )

  // Lineups
  const lineups: TeamLineup[] = []
  for (const r of data?.rosters ?? []) {
    const isHome = r.homeAway === 'home'
    const players: LineupPlayer[] = (r.roster ?? []).map(mapRoster)
    lineups.push({
      teamId: String(r.team?.id ?? ''),
      isHome,
      formation: r.formation ?? null,
      starters: players.filter((p) => p.starter),
      substitutes: players.filter((p) => !p.starter),
    })
  }
  // home primero
  lineups.sort((a, b) => (a.isHome === b.isHome ? 0 : a.isHome ? -1 : 1))

  // Map team id → isHome (para los eventos)
  const homeTeamId = lineups.find((l) => l.isHome)?.teamId
    ?? String(data?.boxscore?.teams?.find((t: { homeAway?: string }) => t.homeAway === 'home')?.team?.id ?? '')

  // Events
  const events: MatchEvent[] = []
  for (const e of data?.keyEvents ?? []) {
    const rawType: string = e.type?.type ?? ''
    const type = normalizeEventType(rawType)
    // Sólo eventos relevantes (goles, tarjetas, cambios); descartamos kickoff/end, etc.
    if (!type) continue
    const teamId = e.team?.id != null ? String(e.team.id) : null
    events.push({
      id: String(e.id ?? `${events.length}`),
      type,
      minute: e.clock?.displayValue ?? '',
      period: e.period?.number ?? 0,
      teamId,
      isHome: teamId != null && homeTeamId ? teamId === homeTeamId : null,
      text: e.text ?? '',
      shortText: e.shortText ?? '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      players: (e.participants ?? []).map((p: any) => p.athlete?.displayName).filter(Boolean),
      scoringPlay: e.scoringPlay === true,
    })
  }

  // Statistics
  let statistics: MatchStatistics | null = null
  const boxTeams = data?.boxscore?.teams ?? []
  if (boxTeams.length >= 2) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const home = boxTeams.find((t: any) => t.homeAway === 'home') ?? boxTeams[0]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const away = boxTeams.find((t: any) => t.homeAway === 'away') ?? boxTeams[1]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const mapStats = (t: any): TeamStat[] =>
      (t?.statistics ?? []).map((s: { name: string; label: string; displayValue: string }) => ({
        name: s.name, label: s.label, value: s.displayValue,
      }))
    const homeStats = mapStats(home)
    const awayStats = mapStats(away)
    if (homeStats.length || awayStats.length) {
      statistics = {
        homeTeamId: String(home?.team?.id ?? ''),
        awayTeamId: String(away?.team?.id ?? ''),
        home: homeStats,
        away: awayStats,
      }
    }
  }

  return {
    matchId: Number(eventId),
    lineups,
    events,
    statistics,
    hasData: lineups.length > 0 || events.length > 0 || statistics != null,
  }
}

// ─── Totales del torneo (tarjetas agregadas) ────────────────────────────────
const FINISHED_STATUSES = new Set<MatchStatus>(['FINISHED', 'AWARDED'])

export interface TournamentStats {
  matchesPlayed: number
  totalGoals: number
  yellowCards: number
  redCards: number
}

function sumStat(stats: { name: string; value: string }[] | undefined, name: string): number {
  const v = stats?.find((s) => s.name === name)?.value
  return v ? Number(v) || 0 : 0
}

export async function getTournamentStats(): Promise<TournamentStats> {
  const matches = await getESPNMatches()
  const finished = matches.filter((m) => FINISHED_STATUSES.has(m.status))

  let totalGoals = 0
  for (const m of finished) {
    totalGoals += (m.score.fullTime.home ?? 0) + (m.score.fullTime.away ?? 0)
  }

  // Las tarjetas sólo están en el summary de cada partido; los finalizados ya no
  // cambian, así que se cachean con revalidate largo (10 min).
  const summaries = await Promise.all(
    finished.map((m) => getESPNMatchSummary(m.id, 600).catch(() => null)),
  )
  let yellowCards = 0
  let redCards = 0
  for (const s of summaries) {
    if (!s?.statistics) continue
    yellowCards += sumStat(s.statistics.home, 'yellowCards') + sumStat(s.statistics.away, 'yellowCards')
    redCards += sumStat(s.statistics.home, 'redCards') + sumStat(s.statistics.away, 'redCards')
  }

  return { matchesPlayed: finished.length, totalGoals, yellowCards, redCards }
}
