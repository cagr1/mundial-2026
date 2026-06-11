import { NextRequest, NextResponse } from 'next/server'
import { getESPNMatchSummary } from '@/lib/espn-api'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const summary = await getESPNMatchSummary(id)
    return NextResponse.json(summary)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
