import { NextRequest, NextResponse } from "next/server";
import { getWikipediaCurrentSquad } from "@/lib/wikipedia-squads";
import { Player, PlayerPosition, TeamDetail } from "@/types/football";

const ESPN_POS: Record<string, PlayerPosition> = {
  G: "Goalkeeper",
  GK: "Goalkeeper",
  D: "Defence",
  DB: "Defence",
  M: "Midfield",
  MF: "Midfield",
  F: "Offence",
  FW: "Offence",
};

/** Build a minimal TeamDetail from URL query params (ESPN data already there) */
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

/** Try to fetch squad from ESPN's hidden roster endpoint (returns 0 items pre-tournament) */
async function getESPNSquad(teamId: string): Promise<Player[]> {
  try {
    const res = await fetch(
      `https://site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/teams/${teamId}/roster`,
      { next: { revalidate: 3600 } }
    );
    if (!res.ok) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data = await res.json() as { athletes?: { position: any; items: any[] }[] };
    const players: Player[] = [];
    for (const group of data.athletes ?? []) {
      const posAbbr: string = group.position?.abbreviation ?? "";
      const pos = ESPN_POS[posAbbr] ?? null;
      for (const a of group.items ?? []) {
        const name: string = a.displayName ?? a.fullName ?? "";
        if (!name) continue;
        players.push({
          id: Number(a.id) || 0,
          name,
          position: pos,
          dateOfBirth: a.dateOfBirth?.split("T")[0] ?? "",
          nationality: "",
          club: a.team?.displayName ?? null,
          source: "football-data.org",
        });
      }
    }
    return players;
  } catch {
    return [];
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const base = teamFromParams(id, req);

  // ── 1. Wikipedia (primary — free, no key, best current-squad data) ────────
  let wikiSquad: Player[] = [];
  let wikiFailed = false;
  try {
    wikiSquad = await getWikipediaCurrentSquad(base.name, base.tla);
  } catch {
    wikiFailed = true;
  }

  if (wikiSquad.length > 0) {
    return NextResponse.json({
      ...base,
      squad: wikiSquad,
      squadSource: "Wikipedia",
    } satisfies TeamDetail);
  }

  // ── 2. ESPN roster (secondary — no key, available during tournament) ──────
  const espnSquad = await getESPNSquad(id);
  if (espnSquad.length > 0) {
    return NextResponse.json({
      ...base,
      squad: espnSquad,
      squadSource: "football-data.org", // reuse existing label for "external source"
      fallbackReason: "Plantel de Wikipedia no disponible",
    } satisfies TeamDetail);
  }

  // ── 3. Both sources empty ─────────────────────────────────────────────────
  const reason = wikiFailed
    ? "No se pudo conectar a Wikipedia"
    : "El plantel oficial aún no ha sido publicado";

  return NextResponse.json({
    ...base,
    squad: [],
    squadSource: "football-data.org",
    fallbackReason: reason,
  } satisfies TeamDetail);
}
