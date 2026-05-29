import { NextResponse } from "next/server";
import { getESPNMatches } from "@/lib/espn-api";

export async function GET() {
  try {
    const matches = await getESPNMatches();
    return NextResponse.json({ matches });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message, matches: [] }, { status: 500 });
  }
}
