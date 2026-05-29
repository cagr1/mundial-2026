import { Suspense } from 'react'
import { MatchesResponse, StandingsResponse, TeamsResponse } from '@/types/football'
import AppShell from '@/components/AppShell'

const BASE = process.env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000'

async function fetchMatches(): Promise<MatchesResponse> {
  const res = await fetch(`${BASE}/api/matches`, { next: { revalidate: 60 } })
  if (!res.ok) throw new Error('Failed to fetch matches')
  return res.json()
}

async function fetchStandings(): Promise<StandingsResponse> {
  const res = await fetch(`${BASE}/api/standings`, { next: { revalidate: 300 } })
  if (!res.ok) throw new Error('Failed to fetch standings')
  return res.json()
}

async function fetchTeams(): Promise<TeamsResponse> {
  const res = await fetch(`${BASE}/api/teams`, { next: { revalidate: 3600 } })
  if (!res.ok) throw new Error('Failed to fetch teams')
  return res.json()
}

function AppSkeleton() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-[89px] bg-zinc-900/60 border-b border-zinc-800/60 animate-pulse" />
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6">
        <div className="flex gap-2 mb-5">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-7 w-10 rounded-full bg-zinc-800/60 animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="h-36 rounded-2xl bg-zinc-800/40 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}

async function AppData() {
  const [matchesData, standingsData, teamsData] = await Promise.all([
    fetchMatches(),
    fetchStandings(),
    fetchTeams(),
  ])

  const liveCount = matchesData.matches.filter(
    (m) => m.status === 'LIVE' || m.status === 'IN_PLAY',
  ).length

  return (
    <AppShell
      matches={matchesData.matches}
      standings={standingsData.standings}
      teams={teamsData.teams}
      liveCount={liveCount}
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
