import { NextResponse } from 'next/server'
import { getTournamentStats } from '@/lib/espn-api'

export async function GET() {
  try {
    const stats = await getTournamentStats()
    return NextResponse.json(stats)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message, matchesPlayed: 0, totalGoals: 0, yellowCards: 0, redCards: 0 }, { status: 500 })
  }
}
