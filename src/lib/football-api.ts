const BASE_URL = "https://api.football-data.org/v4";
const WC_ID = 2000;

function headers() {
  return { "X-Auth-Token": process.env.FOOTBALL_API_TOKEN ?? "" };
}

async function apiFetch<T>(path: string, revalidate = 60): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: headers(),
    next: { revalidate },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`football-data.org ${res.status}: ${text}`);
  }
  return res.json() as Promise<T>;
}

export const getMatches = (params?: { matchday?: number; status?: string }) => {
  const qs = new URLSearchParams();
  if (params?.matchday) qs.set("matchday", String(params.matchday));
  if (params?.status) qs.set("status", params.status);
  const query = qs.toString() ? `?${qs}` : "";
  return apiFetch(`/competitions/${WC_ID}/matches${query}`);
};

export const getStandings = () => apiFetch(`/competitions/${WC_ID}/standings`);
export const getTeams = () => apiFetch(`/competitions/${WC_ID}/teams`);
export const getScorers = (limit = 20) => apiFetch(`/competitions/${WC_ID}/scorers?limit=${limit}`);
export const getTeam = (teamId: number) => apiFetch(`/teams/${teamId}`, 3600);
