import { NextRequest, NextResponse } from "next/server";
import { getTeam } from "@/lib/football-api";
import { getWikipediaCurrentSquad } from "@/lib/wikipedia-squads";
import { TeamDetail } from "@/types/football";

function normalizeFootballDataSquad(data: TeamDetail): TeamDetail {
  return {
    ...data,
    squad: Array.isArray(data.squad)
      ? data.squad.map((player) => ({ ...player, source: player.source ?? "football-data.org" }))
      : [],
  };
}

function fallbackTeamDetail(id: string, req: NextRequest, reason: string): TeamDetail {
  const { searchParams } = new URL(req.url);

  return {
    id: Number(id),
    name: searchParams.get("name") ?? `Equipo ${id}`,
    shortName: searchParams.get("shortName") ?? searchParams.get("name") ?? `Equipo ${id}`,
    tla: searchParams.get("tla") ?? "",
    crest: searchParams.get("crest") ?? "",
    squad: [],
    squadSource: "football-data.org",
    fallbackReason: reason,
  };
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let data: TeamDetail;

  try {
    data = normalizeFootballDataSquad(await getTeam(Number(id)) as TeamDetail);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown football-data.org error";
    data = fallbackTeamDetail(id, req, message);
  }

  try {
    const wikipediaSquad = await getWikipediaCurrentSquad(data.name, data.tla);

    if (wikipediaSquad.length) {
      data.squad = wikipediaSquad;
      data.squadSource = "Wikipedia";
    } else {
      data.squadSource = data.squad.length ? "football-data.org" : data.squadSource;
      data.fallbackReason = data.fallbackReason ?? "Wikipedia current squad did not resolve";
    }

    return NextResponse.json(data);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({
      ...data,
      squad: data.squad ?? [],
      fallbackReason: data.fallbackReason ?? message,
      error: message,
    });
  }
}
