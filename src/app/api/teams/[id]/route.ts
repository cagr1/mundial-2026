import { NextRequest, NextResponse } from "next/server";
import { getTeam } from "@/lib/football-api";
import { getWikipediaCurrentSquad } from "@/lib/wikipedia-squads";
import { Player, TeamDetail } from "@/types/football";

function lc(url: string | null | undefined): string {
  if (!url) return ''
  return url.replace('https://crests.football-data.org/', '/crests/')
}

function normalizeFootballDataSquad(data: TeamDetail): TeamDetail {
  return {
    ...data,
    crest: lc(data.crest),
    squad: Array.isArray(data.squad)
      ? data.squad.map((player) => ({
          ...player,
          source: player.source ?? "football-data.org",
        }))
      : [],
  };
}

/** Build a minimal TeamDetail from URL query params — always safe, no API call */
function teamFromParams(id: string, req: NextRequest): TeamDetail {
  const { searchParams } = new URL(req.url);
  return {
    id: Number(id),
    name: searchParams.get("name") ?? `Team ${id}`,
    shortName:
      searchParams.get("shortName") ??
      searchParams.get("name") ??
      `Team ${id}`,
    tla: searchParams.get("tla") ?? "",
    crest: searchParams.get("crest") ?? "",
    squad: [],
    squadSource: "football-data.org",
  };
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const base = teamFromParams(id, req);

  // ── Step 1: Try Wikipedia FIRST ──────────────────────────────────────────
  // Wikipedia has no rate limit and needs no API key. If it resolves we skip
  // football-data.org entirely for the squad, keeping that quota for teams
  // that have no Wikipedia squad.
  let wikipediaSquad: Player[] = [];
  try {
    wikipediaSquad = await getWikipediaCurrentSquad(base.name, base.tla);
  } catch {
    // Wikipedia unreachable — fall through to football-data.org
  }

  if (wikipediaSquad.length > 0) {
    // Wikipedia resolved. Try football-data.org for richer base info
    // (coach, venue, founded, etc.) but don't block if it 429s.
    try {
      const fdData = normalizeFootballDataSquad(
        (await getTeam(Number(id))) as TeamDetail
      );
      return NextResponse.json({
        ...fdData,
        squad: wikipediaSquad,
        squadSource: "Wikipedia",
      });
    } catch {
      // football-data.org failed (429 or auth) — serve params + Wikipedia squad
      return NextResponse.json({
        ...base,
        squad: wikipediaSquad,
        squadSource: "Wikipedia",
      });
    }
  }

  // ── Step 2: Wikipedia failed → fall back to football-data.org ────────────
  try {
    const fdData = normalizeFootballDataSquad(
      (await getTeam(Number(id))) as TeamDetail
    );
    return NextResponse.json({
      ...fdData,
      fallbackReason: "Wikipedia current squad did not resolve",
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Unknown football-data.org error";
    return NextResponse.json({
      ...base,
      fallbackReason: message,
    });
  }
}
