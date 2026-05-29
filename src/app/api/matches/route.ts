import { NextRequest, NextResponse } from "next/server";
import { getMatches } from "@/lib/football-api";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const matchday = searchParams.get("matchday");
    const status = searchParams.get("status");

    const data = await getMatches({
      matchday: matchday ? Number(matchday) : undefined,
      status: status ?? undefined,
    });

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
