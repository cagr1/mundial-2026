import { NextRequest, NextResponse } from 'next/server'

const BASE = 'https://api.football-data.org/v4'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const res = await fetch(`${BASE}/persons/${id}`, {
      headers: { 'X-Auth-Token': process.env.FOOTBALL_API_TOKEN ?? '' },
      next: { revalidate: 3600 },
    })
    if (!res.ok) return NextResponse.json({ error: `API ${res.status}` }, { status: res.status })
    return NextResponse.json(await res.json())
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 })
  }
}
