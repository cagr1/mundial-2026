import { NextResponse } from "next/server";
import { getESPNTeams } from "@/lib/espn-api";

export async function GET() {
  try {
    const teams = await getESPNTeams();
    return NextResponse.json({ count: teams.length, teams });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, count: 0, teams: [] }, { status: 500 });
  }
}
