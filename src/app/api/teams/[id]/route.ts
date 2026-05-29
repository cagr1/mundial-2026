import { NextRequest, NextResponse } from "next/server";
import { getTeam } from "@/lib/football-api";
import { getWikipediaCurrentSquad } from "@/lib/wikipedia-squads";
import { TeamDetail } from "@/types/football";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const data = await getTeam(Number(id)) as TeamDetail;
    const wikipediaSquad = await getWikipediaCurrentSquad(data.name, data.tla);

    if (wikipediaSquad.length) {
      data.squad = wikipediaSquad;
      data.squadSource = "Wikipedia";
    } else {
      data.squadSource = "football-data.org";
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
