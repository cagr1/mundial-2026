export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
}

export type PlayerPosition = 'Goalkeeper' | 'Defence' | 'Midfield' | 'Offence'

export interface Player {
  id: number
  name: string
  position: PlayerPosition | null
  dateOfBirth: string
  nationality: string
  club?: string | null
  caps?: number | null
  goals?: number | null
  profileUrl?: string | null
  source?: 'football-data.org' | 'Wikipedia'
}

export interface Coach {
  id: number
  name: string
  nationality: string
  dateOfBirth?: string
}

export interface TeamDetail extends Team {
  address?: string
  website?: string
  founded?: number
  clubColors?: string
  venue?: string
  coach?: Coach
  squad: Player[]
  squadSource?: 'football-data.org' | 'Wikipedia'
  fallbackReason?: string
  error?: string
}

export interface Score {
  winner: 'HOME_TEAM' | 'AWAY_TEAM' | 'DRAW' | null
  duration: 'REGULAR' | 'EXTRA_TIME' | 'PENALTY_SHOOTOUT'
  fullTime: { home: number | null; away: number | null }
  halfTime: { home: number | null; away: number | null }
}

export type MatchStatus =
  | 'TIMED'
  | 'SCHEDULED'
  | 'LIVE'
  | 'IN_PLAY'
  | 'PAUSED'
  | 'FINISHED'
  | 'SUSPENDED'
  | 'POSTPONED'
  | 'CANCELLED'
  | 'AWARDED'

export interface Venue {
  name: string
  city: string
}

export interface Match {
  id: number
  utcDate: string
  status: MatchStatus
  matchday: number
  stage: string
  group: string | null
  homeTeam: Team
  awayTeam: Team
  score: Score
  venue?: Venue
  /** Display clock for live matches, e.g. "45'+2'" — null when not live */
  clock?: string | null
}

export interface Prediction {
  home: number
  away: number
}

export type PredictionsMap = Record<number, Prediction>

/** matchId → teamId elegido como ganador */
export type BracketPicks = Record<number, number>

export interface MatchesResponse {
  resultSet: { count: number; first: string; last: string; played: number }
  matches: Match[]
}

export interface StandingEntry {
  position: number
  team: Team
  playedGames: number
  won: number
  draw: number
  lost: number
  points: number
  goalsFor: number
  goalsAgainst: number
  goalDifference: number
  form: string | null
}

export interface Standing {
  stage: string
  type: string
  group: string
  table: StandingEntry[]
}

export interface StandingsResponse {
  standings: Standing[]
}

export interface TeamsResponse {
  count: number
  teams: Team[]
}

// ─── Match detail (summary) ─────────────────────────────────────────────────
export type MatchEventType =
  | 'goal'
  | 'own-goal'
  | 'penalty-goal'
  | 'penalty-miss'
  | 'yellow-card'
  | 'red-card'
  | 'substitution'
  | 'other'

export interface MatchEvent {
  id: string
  type: MatchEventType
  /** Reloj de juego, p.ej. "45'+2'" */
  minute: string
  period: number
  teamId: string | null
  isHome: boolean | null
  text: string
  shortText: string
  /** Nombres de los jugadores implicados (anotador/asistente, amonestado, entra/sale) */
  players: string[]
  scoringPlay: boolean
}

export interface LineupPlayer {
  id: string
  name: string
  shortName: string
  jersey: string
  /** Abreviatura de posición, p.ej. "G", "CD-L" */
  position: string
  positionName: string
  starter: boolean
  subbedIn: boolean
  subbedOut: boolean
  formationPlace: string
  goals: number
  yellowCards: number
  redCards: number
}

export interface TeamLineup {
  teamId: string
  isHome: boolean
  formation: string | null
  starters: LineupPlayer[]
  substitutes: LineupPlayer[]
}

export interface TeamStat {
  name: string
  label: string
  value: string
}

export interface MatchStatistics {
  homeTeamId: string
  awayTeamId: string
  home: TeamStat[]
  away: TeamStat[]
}

export interface MatchSummary {
  matchId: number
  lineups: TeamLineup[]
  events: MatchEvent[]
  statistics: MatchStatistics | null
  /** false si ESPN aún no publica alineación/eventos/stats (partido por jugar) */
  hasData: boolean
}
