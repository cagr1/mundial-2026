import { NextResponse } from "next/server";
import { getESPNStandings } from "@/lib/espn-api";

export async function GET() {
  try {
    const standings = await getESPNStandings();
    return NextResponse.json({ standings });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, standings: [] }, { status: 500 });
  }
}
