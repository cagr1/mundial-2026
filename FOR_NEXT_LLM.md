# Mundial 2026 — Context for Next LLM

> **Read this first.** This file exists so any LLM can pick up this project cold and contribute without reverse-engineering everything from scratch. It covers architecture, design system, data sources, and the backlog of pending work.

---

## What this project is

A **Progressive Web App (PWA)** for the FIFA World Cup 2026. Built by Carlos (cagr_14@hotmail.com) as a self-promotion piece. It is a **read-only sports companion app** — no auth, no user accounts, no write operations. Data comes entirely from [football-data.org v4 API](https://api.football-data.org/v4), competition ID `2000`.

Live URL: deployed on Vercel (check Vercel dashboard for URL).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js (App Router, `src/app/`) — read `AGENTS.md`, this may not be the version you know |
| Styling | Tailwind v4 + PostCSS. CSS variables in `globals.css`. NO `className` strings like `bg-gray-900` — everything uses `style={{ ... }}` with CSS vars |
| Design tokens | Defined in `DESIGN.md` frontmatter and `globals.css` as `--var-name` |
| Fonts | Alumni Sans Pinstripe (display), Albert Sans (UI), Geist Mono (eyebrow labels) via `next/font/google` |
| Date handling | `date-fns` + `date-fns-tz` |
| PWA | `next-pwa` v5 |
| Language | TypeScript strict mode |
| Deployment | Vercel (with `export const dynamic = 'force-dynamic'` on the root page to avoid 429s during build) |

---

## Project structure

```
src/
  app/
    layout.tsx          # Root layout, fonts, PWA meta
    page.tsx            # Home — force-dynamic, renders <AppShell>
    globals.css         # All CSS custom properties (design tokens)
    jugador/[id]/
      page.tsx          # Player detail page (SSR, revalidate 3600s)
    api/
      matches/route.ts      # GET /api/matches?matchday=N&status=X
      standings/route.ts    # GET /api/standings
      teams/route.ts        # GET /api/teams
      scorers/route.ts      # GET /api/scorers
      calendar/route.ts     # GET /api/calendar → ICS file download
      persons/[id]/route.ts # GET /api/persons/:id
      teams/[id]/route.ts   # GET /api/teams/:id (roster + details)
  components/
    AppShell.tsx        # Main client component: tabs, matchday filter, timezone
    MatchCard.tsx       # Single match card (teams, score/time, live dot)
    MatchList.tsx       # Filtered grid of MatchCards
    GroupStandings.tsx  # Group tables with colored left borders
    TeamsGrid.tsx       # All 48 teams, clickable to open TeamDrawer
    TeamDrawer.tsx      # Modal drawer with roster, player links
    Countdown.tsx       # Pre-tournament countdown timer
    CalendarButton.tsx  # ICS export trigger
    TimezoneSelect.tsx  # Local timezone picker
  lib/
    flags.ts            # flagEmoji(nationality) + calcAge(dob)
```

---

## Design system — Neo Kinpaku

**Core rule**: black urushi surfaces, kinpaku gold for all active/interactive states, verdigris patina for live-only signals. Never glassmorphism, never pure black, never neutral grays.

**Key CSS variables** (defined in `globals.css`):

```css
--lacquer          /* main background: oklch(7% 0.006 95) */
--lacquer-deep     /* deepest bg: oklch(4% 0.004 95) */
--raised-lacquer   /* card surface: oklch(11% 0.006 95) */
--graphite         /* hover surface: oklch(15% 0.008 95) */
--kinpaku          /* gold accent, active states: oklch(84% 0.19 80.46) */
--patina           /* verdigris, LIVE only: oklch(70% 0.12 188) */
--vermilion        /* warnings/offence: oklch(58% 0.15 35) */
--champagne        /* primary text: oklch(91% 0 0) */
--text-warm        /* secondary text: oklch(88% 0 0) */
--text-muted       /* muted: oklch(72% 0 0) */
--hairline         /* card borders: oklch(78% 0 0 / 0.16) */
--hairline-gold    /* hover borders: oklch(74% 0.09 82 / 0.6) */
--font-albert      /* Albert Sans */
--font-mono        /* Geist Mono */
--r-xs/sm/md/lg    /* border radii: 2/4/6/8px */
```

**Position colors** (used in player cards):
- Goalkeeper → `--kinpaku` (gold)
- Defence → `--patina` (verdigris)
- Midfield → `oklch(74% 0.13 290)` (periwinkle)
- Offence → `--vermilion` (red)

**Typography classes**:
- `.eyebrow` — Geist Mono, 0.68rem, 500 weight, 0.18em tracking, UPPERCASE
- `.tabnum` — tabular-nums font feature

Full design spec: see `DESIGN.md`.

---

## Data flow

```
football-data.org v4 API
  └─ Competition 2000 (FIFA World Cup 2026)
       ├─ /competitions/2000/matches   → api/matches
       ├─ /competitions/2000/standings → api/standings
       ├─ /competitions/2000/teams     → api/teams
       ├─ /competitions/2000/scorers   → api/scorers
       ├─ /teams/:id                   → api/teams/[id]
       └─ /persons/:id                 → api/persons/[id] + jugador/[id] page
```

**Auth**: `X-Auth-Token` header using `process.env.FOOTBALL_API_TOKEN`.

**Caching**: Next.js `fetch` with `next: { revalidate: N }`:
- Matches: 60s
- Teams/persons: 3600s
- Root page: `force-dynamic` (to avoid 429 rate limit during Vercel build)

---

## Features already built

- [x] Match list by group, matchday, stage (group phase → knockout)
- [x] Live match indicator (verdigris dot + "EN VIVO" label)
- [x] Timezone-aware match times (user selects timezone, stored in localStorage)
- [x] Group standings tables (color-coded A–L, qualifying rows highlighted)
- [x] Teams grid — all 48 teams with crests
- [x] Team drawer — roster with position badges, links to player pages
- [x] Player detail page (`/jugador/[id]`) — name, nationality, age, DOB, current club, shirt number
- [x] ICS calendar export (add all matches to calendar app)
- [x] PWA (installable, offline-capable via next-pwa)
- [x] Countdown timer pre-tournament
- [x] Mobile responsive (max-w-lg centered on desktop, full-width mobile)

---

## Pending / backlog

### HIGH PRIORITY — Player pages need more content

Currently `/jugador/[id]` only shows: name, nationality flag, age, DOB, position, shirt number, current club crest.

**What's missing:**
- Player photo
- Career stats (goals, appearances, clubs history)
- Tournament stats (goals/assists in this World Cup)
- Physical data (height, weight)

**Free data sources for player photos and stats — see section below.**

### OTHER pending work

- Clicking a player in the team drawer navigates to `/jugador/[id]` but the page feels sparse — needs the photo and stats sections
- No search or filter on the teams grid
- Top scorers tab exists in the API but may not have a UI component yet (check `AppShell.tsx`)
- No share button / social metadata per match or player

---

## Free data sources for player photos & stats

### 1. TheSportsDB (RECOMMENDED — fully free)
- URL: https://www.thesportsdb.com/api.php
- Free tier: unlimited read, no API key needed for v1
- Has: player photos (strThumb, strCutout), player bio, career stats, team info
- Example: `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=Messi`
- Returns: `strThumb` (player photo URL), `strBirthLocation`, `strDescriptionEN`, `strHeight`, `strWeight`
- **How to use in this project**: call TheSportsDB by player name from `football-data.org` response, display the photo

### 2. Wikipedia / Wikimedia API (free, open license)
- Can fetch player photos via Wikipedia article
- Example: `https://en.wikipedia.org/api/rest_v1/page/summary/Lionel_Messi`
- Returns: `thumbnail.source` (photo URL), `extract` (bio text)
- **Limitation**: need to map player name to Wikipedia article title (sometimes tricky)

### 3. API-Football via RapidAPI (free tier)
- URL: https://rapidapi.com/api-sports/api/api-football
- Free tier: 100 requests/day
- Has: player photos, statistics, transfer history
- Requires RapidAPI key (free account)
- **Limitation**: rate limit is low for 32+ squads

### 4. Open Football datasets on GitHub (static, no API)
- https://github.com/jokecamp/FootballData — CSV/JSON player data
- https://github.com/openfootball/world-cup — historical results
- No photos, but good for stats
- Can be bundled as static JSON in the project (no API calls needed)

### Implementation recommendation

Use **TheSportsDB** as the primary photo/bio source, with Wikipedia as fallback:

```typescript
// In jugador/[id]/page.tsx, after fetching person from football-data.org:
async function getPlayerEnrichment(name: string) {
  const encoded = encodeURIComponent(name)
  const res = await fetch(
    `https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${encoded}`,
    { next: { revalidate: 86400 } }
  )
  const data = await res.json()
  return data.player?.[0] ?? null
}
// Returns: strThumb (photo), strHeight, strWeight, strBirthLocation, strDescriptionEN
```

Then display `strThumb` as the player photo (it's a CDN URL, safe for `next/image` with `unoptimized`).

---

## Environment variables

```
FOOTBALL_API_TOKEN=    # football-data.org API key (required)
```

Vercel: set in project dashboard → Settings → Environment Variables.
Local: `.env.local` at project root.

---

## How to run locally

```bash
npm install
# create .env.local with FOOTBALL_API_TOKEN=yourtoken
npm run dev
```

Open http://localhost:3000.

---

## Key decisions & constraints

1. **No client-side API calls to football-data.org** — all fetches go through Next.js API routes or server components to keep the token secret.
2. **force-dynamic on root page** — prevents Vercel build from hammering the football API and hitting 429 rate limits.
3. **CSS vars everywhere** — Tailwind v4 utility classes are used for layout only (flex, grid, gap, padding). Colors and typography always use `style={{ ... }}` with CSS custom properties so the design tokens are the single source of truth.
4. **No shadcn/ui or component libraries** — all components are hand-built to match the Neo Kinpaku design system exactly.
5. **SSR for player pages** — player data is server-rendered with 1h revalidation; no `useEffect` data fetching on the client.
