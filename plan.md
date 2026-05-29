# Mundial 2026 Promo App Plan

## Objective

Make the app feel fast and premium on mobile while showing current, credible World Cup squad information for every team, not only Ecuador.

## Working Rule For Any LLM

- Treat this file as the task board.
- Split work into small tasks.
- Mark completed work with `[x]`.
- Leave unfinished work as `[ ]`.
- Do not optimize only one country. Any roster logic must work for all teams equally.
- If a team needs a special Wikipedia page mapping, add it to a shared mapping and document it here.
- Keep `football-data.org` for matches, teams, standings, and fallback squad data only.

## Architecture Decisions

- [x] Country flags are local emoji generated in `src/lib/flags.ts`; they are not network images.
- [x] Team crests come from `football-data.org` URLs and are the likely source of slow visible image loading.
- [x] Player photos should load only on player detail pages, not in match lists, team grid, or roster lists.
- [x] TheSportsDB v1 is useful for player photo/bio/height/weight enrichment.
- [x] Wikipedia REST summary is the fallback for player photo/bio.
- [x] Wikipedia `Current squad` sections are the preferred free source for current national team rosters.
- [x] Do not scrape 365Scores unless they provide a public documented API.
- [x] Mobile animations must stay short, CSS-only, and avoid blocking tap feedback.
- [ ] All roster logic must be validated across every team returned by `/api/teams`.

## Completed

- [x] Replaced React tab transitions with immediate `setTab` updates.
- [x] Replaced tab `ViewTransition` usage with a lightweight CSS entrance animation.
- [x] Added TheSportsDB and Wikipedia player enrichment to `src/app/jugador/[id]/page.tsx`.
- [x] Added TheSportsDB image host to `next.config.ts`.
- [x] Added Wikipedia `Current squad` parser in `src/lib/wikipedia-squads.ts`.
- [x] Connected `/api/teams/[id]` to prefer Wikipedia squads and fall back to football-data.org.
- [x] Extended player types with `club`, `caps`, `goals`, `profileUrl`, `source`, and `squadSource`.
- [x] Updated `TeamDrawer` to show roster source, club, caps, and goals.
- [x] Verified `npm run lint`.
- [x] Verified `npm run build`.
- [x] Confirmed Ecuador Wikipedia page has a `Current squad` section and returns 34 player rows.

## Squad Source Tasks

- [x] Build generic Wikipedia page resolver using `<Team name>_national_football_team`.
- [x] Add initial special mappings for USA, England, Scotland, Wales, South Korea/Korea Republic, Iran, and Turkey/Turkiye.
- [ ] Create a script or debug endpoint that tests Wikipedia squad resolution for every team returned by football-data.org.
- [ ] Record teams that fail generic resolution.
- [ ] Add missing special mappings in `src/lib/wikipedia-squads.ts`.
- [ ] Verify every resolved team returns at least one player row or a clear fallback reason.
- [ ] Store a `lastChecked` or `sourceUpdated` field if Wikipedia section text exposes a date.
- [ ] Add a user-facing hint when the app falls back to football-data.org because Wikipedia did not resolve.

## Player Detail Tasks

- [x] Football-data player pages fetch TheSportsDB enrichment by player name.
- [x] Football-data player pages fall back to Wikipedia summary.
- [ ] Create app-native detail pages for Wikipedia-sourced players.
- [ ] Use the Wikipedia player article title/link from `profileUrl` as the stable identifier.
- [ ] Show current club from squad table on Wikipedia-sourced player pages.
- [ ] Keep external Wikipedia as source attribution, not as the main click destination.
- [ ] Avoid loading player photos inside roster lists.

## Mobile Performance Tasks

- [x] Make tab selection immediate.
- [x] Add short CSS tab panel animation.
- [ ] Remove `unoptimized` from team crests where Next image optimization works reliably.
- [ ] Consider a server-side crest proxy/cache if remote crest loading is still slow on phones.
- [ ] Test on a real mobile device after squad parser is validated for all teams.
- [ ] Check drawer scrolling and player card height with long club names.

## Validation Checklist

- [ ] `/api/teams/[id]` returns `squadSource: "Wikipedia"` for teams whose Wikipedia current squad resolves.
- [ ] `/api/teams/[id]` returns `squadSource: "football-data.org"` only when Wikipedia fails.
- [ ] Ecuador shows current players and clubs from Wikipedia, not stale football-data.org squad data.
- [ ] At least 10 non-Ecuador teams are spot-checked manually.
- [ ] All teams are checked by automated script/debug command.
- [ ] `npm run lint` passes after each implementation chunk.
- [ ] `npm run build` passes after each implementation chunk.

## Current Squad Flow

1. Fetch team detail from football-data.org as the base object.
2. Resolve the team Wikipedia page.
3. Use MediaWiki `action=parse` to list page sections.
4. Find the `Current squad` section.
5. Fetch only that section as parsed HTML.
6. Parse the player table into app fields:
   - name
   - position
   - date of birth
   - club
   - caps
   - goals
   - Wikipedia player link
7. Return the Wikipedia squad from `/api/teams/[id]` when at least one valid player is found.
8. Fall back to football-data.org squad when Wikipedia has no usable current squad.
9. Keep this server-side/cacheable so mobile devices do not pay many Wikipedia requests.

## Notes For Parallel LLM Help

- One LLM can focus only on the all-team Wikipedia mapping validation.
- One LLM can focus only on app-native Wikipedia player pages.
- One LLM can focus only on mobile performance and crest loading.
- The coordinating LLM should merge small changes, run lint/build, and update this checklist.
