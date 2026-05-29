const BASE_URL = "https://api.football-data.org/v4";
const WC_ID = 2000; // FIFA World Cup competition ID

function headers() {
  return {
    "X-Auth-Token": process.env.FOOTBALL_API_TOKEN ?? "",
  };
}

async function apiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: headers(),
    next: { revalidate: 60 }, // cache 60s
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export function getMatches(params?: { matchday?: number; status?: string }) {
  const qs = new URLSearchParams();
  if (params?.matchday) qs.set("matchday", String(params.matchday));
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/competitions/${WC_ID}/matches${query}`);
}

export function getStandings() {
  return apiFetch(`/competitions/${WC_ID}/standings`);
}

export function getTeams() {
  return apiFetch(`/competitions/${WC_ID}/teams`);
}

export function getScorers(limit = 20) {
  return apiFetch(`/competitions/${WC_ID}/scorers?limit=${limit}`);
}

export function getCompetition() {
  return apiFetch(`/competitions/${WC_ID}`);
}
