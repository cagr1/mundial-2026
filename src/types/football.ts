export interface Team {
  id: number
  name: string
  shortName: string
  tla: string
  crest: string
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
}

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
