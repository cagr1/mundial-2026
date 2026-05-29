import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
import { MatchesResponse, StandingsResponse, TeamsResponse } from '@/types/football'
import { getMatches, getStandings, getTeams } from '@/lib/football-api'
import AppShell from '@/components/AppShell'

function AppSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-[89px] animate-pulse" style={{ background: 'var(--lacquer-deep)', borderBottom: '1px solid var(--hairline)' }} />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex gap-2 mb-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-12 animate-pulse" style={{ background: 'var(--graphite)', borderRadius: 'var(--r-sm)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-36 animate-pulse" style={{ background: 'var(--raised-lacquer)', borderRadius: 'var(--r-lg)' }} />
          ))}
        </div>
      </div>
    </div>
  )
}

/** Rewrite external crest URL to local Vercel-proxied path (CDN-cached, same domain) */
function lc(url: string | null | undefined): string {
  if (!url) return ''
  return url.replace('https://crests.football-data.org/', '/crests/')
}

async function AppData() {
  const [matchesResult, standingsResult, teamsResult] = await Promise.allSettled([
    getMatches() as Promise<MatchesResponse>,
    getStandings() as Promise<StandingsResponse>,
    getTeams() as Promise<TeamsResponse>,
  ])

  const teams = teamsResult.status === 'fulfilled'
    ? teamsResult.value.teams.map(t => ({ ...t, crest: lc(t.crest) }))
    : []

  const matches = matchesResult.status === 'fulfilled'
    ? matchesResult.value.matches.map(m => ({
        ...m,
        homeTeam: { ...m.homeTeam, crest: lc(m.homeTeam.crest) },
        awayTeam: { ...m.awayTeam, crest: lc(m.awayTeam.crest) },
      }))
    : []

  const standings = standingsResult.status === 'fulfilled'
    ? standingsResult.value.standings.map(s => ({
        ...s,
        table: s.table.map(e => ({ ...e, team: { ...e.team, crest: lc(e.team.crest) } })),
      }))
    : []

  const liveCount = matches.filter(
    (m) => m.status === 'LIVE' || m.status === 'IN_PLAY',
  ).length

  const firstMatchDate = matches.reduce((earliest, m) => {
    return m.utcDate < earliest ? m.utcDate : earliest
  }, matches[0]?.utcDate ?? '')

  return (
    <AppShell
      matches={matches}
      standings={standings}
      teams={teams}
      liveCount={liveCount}
      firstMatchDate={firstMatchDate}
    />
  )
}

export default function Page() {
  return (
    <Suspense fallback={<AppSkeleton />}>
      <AppData />
    </Suspense>
  )
}
