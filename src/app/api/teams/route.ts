import { NextResponse } from "next/server";
import { getTeams } from "@/lib/football-api";

export async function GET() {
  try {
    const data = await getTeams();
    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
