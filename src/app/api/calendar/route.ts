import { NextResponse } from 'next/server'
import { getMatches } from '@/lib/football-api'
import { buildICS } from '@/lib/ics'
import type { MatchesResponse } from '@/types/football'

export async function GET() {
  const data = (await getMatches()) as MatchesResponse
  const ics = buildICS(data.matches)

  return new NextResponse(ics, {
    headers: {
      'Content-Type': 'text/calendar; charset=utf-8',
      'Content-Disposition': 'attachment; filename="mundial-2026.ics"',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  })
}
