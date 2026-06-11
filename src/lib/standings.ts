import type { Match, Standing, StandingEntry } from '@/types/football'

const DONE_STATUSES = new Set(['FINISHED', 'AWARDED'])

// ESPN's standings endpoint lags behind the live scoreboard — sometimes by hours.
// We keep the team list/groups from ESPN's standings (static) but recompute every
// stat (W/D/L/Pts/GF/GA/GD) from finished group-stage matches, so the table updates
// the instant a match goes FINISHED. Tie-break order: Pts → GD → GF → name.
export function computeStandings(standings: Standing[], matches: Match[]): Standing[] {
  return standings.map((group) => {
    const entries = new Map<number, StandingEntry>()
    for (const entry of group.table) {
      entries.set(entry.team.id, {
        ...entry,
        playedGames: 0,
        won: 0,
        draw: 0,
        lost: 0,
        points: 0,
        goalsFor: 0,
        goalsAgainst: 0,
        goalDifference: 0,
      })
    }

    const groupMatches = matches.filter(
      (m) => m.group === group.group && m.stage === 'GROUP_STAGE' && DONE_STATUSES.has(m.status),
    )

    for (const m of groupMatches) {
      const homeGoals = m.score.fullTime.home
      const awayGoals = m.score.fullTime.away
      if (homeGoals == null || awayGoals == null) continue

      const home = entries.get(m.homeTeam.id)
      const away = entries.get(m.awayTeam.id)
      if (!home || !away) continue

      home.playedGames += 1
      away.playedGames += 1
      home.goalsFor += homeGoals
      home.goalsAgainst += awayGoals
      away.goalsFor += awayGoals
      away.goalsAgainst += homeGoals

      if (homeGoals > awayGoals) {
        home.won += 1
        home.points += 3
        away.lost += 1
      } else if (homeGoals < awayGoals) {
        away.won += 1
        away.points += 3
        home.lost += 1
      } else {
        home.draw += 1
        home.points += 1
        away.draw += 1
        away.points += 1
      }
    }

    const table = [...entries.values()]
    for (const entry of table) entry.goalDifference = entry.goalsFor - entry.goalsAgainst

    table.sort(
      (a, b) =>
        b.points - a.points ||
        b.goalDifference - a.goalDifference ||
        b.goalsFor - a.goalsFor ||
        a.team.name.localeCompare(b.team.name),
    )
    table.forEach((entry, i) => { entry.position = i + 1 })

    return { ...group, table }
  })
}
