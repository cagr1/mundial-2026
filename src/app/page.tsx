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

async function AppData() {
  const [matchesData, standingsData, teamsData] = await Promise.all([
    getMatches() as Promise<MatchesResponse>,
    getStandings() as Promise<StandingsResponse>,
    getTeams() as Promise<TeamsResponse>,
  ])

  const liveCount = matchesData.matches.filter(
    (m) => m.status === 'LIVE' || m.status === 'IN_PLAY',
  ).length

  const firstMatchDate = matchesData.matches.reduce((earliest, m) => {
    return m.utcDate < earliest ? m.utcDate : earliest
  }, matchesData.matches[0]?.utcDate ?? '')

  return (
    <AppShell
      matches={matchesData.matches}
      standings={standingsData.standings}
      teams={teamsData.teams}
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
