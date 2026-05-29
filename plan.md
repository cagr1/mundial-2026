# Mundial 2026 Promo App Plan

## Goal For Today

Ship a fast mobile-ready promo app today. The app must show team info reliably, use current squad data for every team where possible, and degrade gracefully when a free data source fails.

## LLM Coordination Legend

- 🧠 Codex/Claude brain task: architecture, debugging, integration, risky changes.
- ⚡ DeepSeek/helper task: repetitive mapping, manual verification, small isolated checks.
- `[x]` done.
- `[ ]` pending.
- Update this file after every completed chunk.

## 1. Architecture Decisions

- [x] Country flags are local emoji generated in `src/lib/flags.ts`; they are not network images.
- [x] Team crests come from `football-data.org` URLs and can slow mobile loading.
- [x] Player photos load only on player detail pages, not in lists.
- [x] `football-data.org` remains the source for matches, teams, standings, and fallback squad data.
- [x] `football-data.org` is not trusted as the primary source for current national team squads.
- [x] Wikipedia `Current squad` sections are the preferred free source for current squads.
- [x] TheSportsDB v1 is used for player photo/bio/height/weight enrichment.
- [x] Wikipedia REST summary is used as photo/bio fallback.
- [x] Do not scrape 365Scores unless they provide a public documented API.
- [x] Mobile animations must be short, CSS-only, and must not delay taps.
- [ ] 🧠 All roster logic must be validated across every team returned by `/api/teams`.

## 2. Critical Bug: Country Drawer Loads Nothing

- [x] 🧠 Reproduce `/api/teams/[id]` failure with a real team ID.
- [x] 🧠 Confirm failure path: `football-data.org` can return 403, and `TeamDrawer` previously crashed when response had no `squad`.
- [x] 🧠 Make `/api/teams/[id]` always return a usable response shape, even when football-data.org or Wikipedia fails.
- [x] 🧠 Add `error`/`fallbackReason` fields only for debugging, without breaking UI.
- [x] 🧠 Update `TeamDrawer` to show a helpful empty/error state instead of a blank drawer.
- [x] 🧠 Verify local fallback route returns Ecuador players from Wikipedia when football-data.org fails.
- [x] 🧠 Fix Wikipedia club parsing so clubs are not blank.
- [ ] ⚡ Verify on real phone that the drawer opens and shows either players or a clear fallback message.
- [x] 🧠 Run `npm run lint`.
- [x] 🧠 Run `npm run build`.

## 3. All-Team Wikipedia Squad Validation

- [x] 🧠 Build generic Wikipedia page resolver using `<Team name>_national_football_team`.
- [x] 🧠 Add initial special mappings for USA, England, Scotland, Wales, South Korea/Korea Republic, Iran, and Turkey/Turkiye.
- [x] 🧠 Create a script/debug command that tests Wikipedia squad resolution for every team from `/api/teams`.
- [ ] ⚡ Run the all-team checker and record pass/fail for each team.
- [ ] ⚡ Identify teams where generic Wikipedia page resolution fails.
- [ ] ⚡ Identify teams where a Wikipedia page exists but has no `Current squad` table.
- [ ] 🧠 Add missing special mappings in `src/lib/wikipedia-squads.ts`.
- [ ] 🧠 Ensure each team returns `squadSource`, `squad`, and a fallback reason when needed.
- [x] 🧠 Add `npm run check:squads -- <base-url>` for all-team validation.
- [ ] ⚡ Run `npm run check:squads -- <production-or-local-url-with-token>` and paste results into this plan.
- [ ] ⚡ Spot-check at least 10 non-Ecuador teams manually.
- [ ] 🧠 Mark this section complete only when all teams either resolve or fail gracefully.

## 4. Current Squad API Contract

- [x] 🧠 Add Wikipedia `Current squad` parser in `src/lib/wikipedia-squads.ts`.
- [x] 🧠 Connect `/api/teams/[id]` to prefer Wikipedia squads and fall back to football-data.org.
- [x] 🧠 Extend player types with `club`, `caps`, `goals`, `profileUrl`, `source`, and `squadSource`.
- [x] 🧠 Normalize fallback football-data players with `source: "football-data.org"`.
- [x] 🧠 Add `fallbackReason` to `TeamDetail` for UI/debug visibility.
- [x] 🧠 Avoid throwing 500 if Wikipedia fails.
- [x] 🧠 Avoid throwing 500 if football-data.org returns no squad but base team info exists.
- [ ] 🧠 Cache Wikipedia requests server-side with `revalidate: 86400`.

## 5. Team Drawer UI

- [x] 🧠 Show roster source, club, caps, and goals in `TeamDrawer`.
- [ ] 🧠 Show loading state consistently.
- [x] 🧠 Show empty/error state when squad cannot load.
- [ ] 🧠 Keep drawer height and scrolling stable on mobile.
- [ ] ⚡ Check long club names do not overflow.
- [ ] ⚡ Check players with no date of birth do not create broken age UI.
- [ ] 🧠 Keep click behavior clear: card flips, detail button opens player page/source.

## 6. Player Detail Pages

- [x] 🧠 Football-data player pages fetch TheSportsDB enrichment by player name.
- [x] 🧠 Football-data player pages fall back to Wikipedia summary.
- [ ] 🧠 Create app-native detail pages for Wikipedia-sourced players.
- [ ] 🧠 Use Wikipedia player article title/link from `profileUrl` as the stable identifier.
- [ ] 🧠 Show current club from squad table on Wikipedia-sourced player pages.
- [ ] 🧠 Keep external Wikipedia as source attribution, not as the main click destination.
- [ ] 🧠 Avoid loading player photos inside roster lists.

## 7. Mobile Performance

- [x] 🧠 Make tab selection immediate.
- [x] 🧠 Add short CSS tab panel animation.
- [x] ⚡ User confirmed the app loads faster on phone.
- [ ] 🧠 Remove `unoptimized` from team crests where Next image optimization works reliably.
- [ ] 🧠 Consider a server-side crest proxy/cache if remote crest loading is still slow.
- [ ] ⚡ Test team drawer on a real phone after the loading bug is fixed.
- [ ] ⚡ Test tab switching and drawer close/open on a real phone.

## 8. Validation Before Shipping Today

- [x] 🧠 Critical country drawer bug fixed.
- [x] 🧠 `npm run lint` passes.
- [x] 🧠 `npm run build` passes.
- [ ] ⚡ At least Ecuador, Argentina, Brazil, Mexico, USA, Spain, France, England, Germany, and Japan are spot-checked.
- [ ] ⚡ Mobile home screen loads quickly.
- [ ] ⚡ Mobile team drawer shows players or a clear fallback message.
- [ ] ⚡ Player detail page shows photo or clean initials fallback.
- [ ] 🧠 Commit and push final changes.

## 9. PWA Install Readiness

- [x] 🧠 Verify `src/app/layout.tsx` references `/manifest.json`.
- [x] 🧠 Verify `public/manifest.json` exists.
- [ ] 🧠 Add missing `public/icon-192.png` referenced by manifest.
- [ ] 🧠 Add missing `public/icon-512.png` referenced by manifest.
- [ ] 🧠 Configure `next-pwa` in `next.config.ts` or remove dependency if not used.
- [ ] 🧠 Verify production HTTPS is active after deploy.
- [ ] 🧠 Add an in-app install helper for Android Chrome using `beforeinstallprompt`.
- [ ] 🧠 Add an in-app iOS Safari install guide: Share button -> Add to Home Screen.
- [ ] ⚡ Use `pwa_install_guide.svg` as visual reference only; do not copy it into the app unless the design is adapted to Neo Kinpaku.
- [ ] ⚡ Test install flow on Android Chrome.
- [ ] ⚡ Test install flow on iPhone Safari.

## 10. Notes For Parallel Help

- ⚡ DeepSeek task A: run the all-team Wikipedia checker once it exists, then report failed team names and suspected page titles.
- ⚡ DeepSeek task B: manually verify 10 teams in the UI on mobile/desktop and report visual issues.
- ⚡ DeepSeek task C: check long player/club names and list overflow cases.
- ⚡ DeepSeek task D: verify PWA install requirements on Android and iOS using the guide SVG as checklist.
- 🧠 Codex/Claude task A: fix API reliability and fallback contract.
- 🧠 Codex/Claude task B: integrate failed mappings safely.
- 🧠 Codex/Claude task C: run lint/build, commit, push.

## 11. Current Squad Flow

1. Fetch team detail from football-data.org as the base object.
2. Resolve the team Wikipedia page.
3. Use MediaWiki `action=parse` to list page sections.
4. Find the `Current squad` section.
5. Fetch only that section as parsed HTML.
6. Parse the player table into app fields: name, position, date of birth, club, caps, goals, Wikipedia player link.
7. Return the Wikipedia squad from `/api/teams/[id]` when at least one valid player is found.
8. Fall back to football-data.org squad when Wikipedia has no usable current squad.
9. Return a nonblank UI state even when both sources fail.

## 12. Latest Run Notes

- [x] 🧠 `npm run lint` passed after the drawer/API fixes.
- [x] 🧠 `npm run build` passed after the drawer/API fixes.
- [x] 🧠 Local direct test passed: `/api/teams/123?name=Ecuador&shortName=Ecuador&tla=ECU&crest=` returns 34 Wikipedia players and clubs.
- [ ] ⚡ `npm run check:squads -- http://127.0.0.1:3001` could not complete locally because `/api/teams` needs a valid `FOOTBALL_API_TOKEN`/subscription in this environment.
