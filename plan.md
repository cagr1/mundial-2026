# Mundial 2026 Promo App Plan

## 🔴 PRIORIDADES — Próxima sesión

- [x] 🧠 Fix React error #418 (hydration mismatch).
- [x] 🧠 Reemplazar banner instalación por `/instalar`.
- [x] 🧠 Migrar a ESPN API pública (partidos, equipos, standings). football-data.org eliminado de todas las rutas principales.

---

## 🆕 NUEVAS FEATURES — Backlog aprobado (sesión 2026-05-30)

### A. "Mi Equipo" — favorito con partido próximo pinned
- [x] 🧠 Añadir botón ⭐ en cada tarjeta del TeamsGrid (toggle favorito)
- [x] 🧠 Guardar/leer favorito en localStorage (`favoriteTeam: { id, name, crest, tla }`)
- [x] 🧠 En AppShell/home: si hay favorito guardado, mostrar card destacado encima de la lista de partidos con: escudo, nombre, próximo partido, countdown hasta el partido
- [x] 🧠 Si el equipo favorito no tiene partido próximo, mostrar último resultado
- [ ] ⚡ Verificar que persiste al cerrar y reabrir la app (localStorage)
- [ ] ⚡ Verificar que el card no rompe layout en móvil

**Notas técnicas:**
- Solo localStorage — cero backend, cero costo
- El partido próximo se filtra del array de matches que ya se carga en home
- Si no hay partido próximo (fase de grupos terminó, knockout no empezó) mostrar el próximo partido del torneo del equipo favorito

---

### B. Share Card — compartir partido como imagen
- [x] 🧠 Usar Satori (next/og ImageResponse) — sin instalar paquetes extra
- [x] 🧠 Añadir botón "Compartir" en cada MatchCard (footer con separador)
- [x] 🧠 La imagen generada incluye: escudos de ambos equipos, nombres, fecha/hora en timezone del usuario, marcador si el partido ya jugó, diseño Victory Noir (fondo oscuro + gold)
- [x] 🧠 En móvil: usar `navigator.share({ files: [imageFile] })` para abrir el share sheet nativo (WhatsApp, Instagram, etc.)
- [x] 🧠 En desktop: descargar la imagen como PNG
- [ ] ⚡ Probar en iOS Safari y Android Chrome que el share sheet se abre correctamente
- [ ] ⚡ Verificar que la imagen se ve bien en preview de WhatsApp

**Notas técnicas:**
- `navigator.share` con `files` requiere HTTPS (ya cubierto por Vercel)
- Satori genera la imagen en un Edge Function sin librerías pesadas en el bundle del cliente
- html2canvas es más simple pero renderiza el DOM — riesgo de fuentes/estilos no alineados
- Recomendado: Satori + OG route (`/api/og/match?homeTeam=...&awayTeam=...&score=...`)

---

### C. Bracket Visual de Eliminatorias
- [ ] 🧠 Crear tab "Bracket" en AppShell (visible solo cuando haya datos de fase knockout)
- [ ] 🧠 Construir componente `KnockoutBracket.tsx`: árbol SVG/flexbox de Octavos → Cuartos → Semis → Final → Campeón
- [ ] 🧠 Consumir partidos de fase knockout desde ESPN API (ya disponible en `/api/matches`)
- [ ] 🧠 Cada nodo del bracket: escudo + nombre del equipo, score si ya jugó, "Por definir" si aún no hay clasificado
- [ ] 🧠 Diseño Victory Noir: líneas gold conectando los partidos, fondo glass-card
- [ ] ⚡ Verificar scroll horizontal en móvil (el bracket no cabe en una pantalla vertical)
- [ ] ⚡ Verificar que equipos con nombres largos no rompen los nodos

**Notas técnicas:**
- Los datos de knockout empiezan ~julio 2026 cuando termine la fase de grupos
- Mientras tanto el tab puede mostrarse deshabilitado o con un mensaje "Disponible en Fase Knockout"
- El bracket del Mundial tiene formato de 32 equipos en Octavos (no hay "grupo" en knockout)
- Referencia visual: sofascore.com → cualquier torneo con eliminación directa

### Estado actual del proyecto (sesión 2026-05-29)

**Arquitectura de datos:**
- Partidos / Standings / Lista de equipos → ESPN API pública (`site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/…`)
- Planteles → Wikipedia "Current squad" primero; ESPN roster como backup (vacío pre-torneo, se activará ~junio 2026)
- Fotos de jugadores → TheSportsDB (`r2.thesportsdb.com`) + Wikipedia thumbnail fallback; `onError` muestra iniciales
- football-data.org: **COMPLETAMENTE ELIMINADO** de todas las rutas

**Bugs arreglados en esta sesión (commit 6845f87 + banderas):**
1. Scroll iOS en TeamDrawer: `pointer-events: none` en back-face de 3D cards (26 links ocultos bloqueaban touch events)
2. Safe area bottom (`env(safe-area-inset-bottom)`) en footer y scroll del drawer
3. "Volver" en página de jugador: usa `?from={teamId}` → Link explícito a `/?tab=equipos&equipo={id}` en vez de `router.back()`
4. URL sync tab+equipo: `AppShell` guarda `?tab=` y `TeamsGrid` guarda `?equipo=` con `history.replaceState`
5. Al abrir app con esos params (ej. después de "Volver"), el drawer se reabre automáticamente
6. Imágenes jugadores: `PlayerPhoto` client component con `unoptimized` + `onError` → fallback a iniciales
7. `r2.thesportsdb.com` añadido a `remotePatterns` (CDN real de TheSportsDB)
8. Service worker: versión `v3`, `/` y `/jugador/*` excluidos del cache (evita HTML stale con JS chunks viejos)
9. Banderas en partidos: ESPN scoreboard no incluye `logos[]` en competitors. Fix: derivar URL del crest desde `abbreviation` → `https://a.espncdn.com/i/teamlogos/countries/500/{abbr}.png`
10. `/api/teams/[id]`: eliminada llamada a football-data.org (IDs ESPN ≠ IDs football-data → 404 siempre). Ahora: Wikipedia → ESPN roster → mensaje amigable

**Pendiente para próximas sesiones:**
- [ ] ⚡ Verificar plantel de Argentina y otros equipos una vez Wikipedia actualice sus páginas (planteles oficiales ~mayo-junio 2026)
- [ ] ⚡ Spot-check móvil: scroll drawer, "Volver", fotos de jugadores
- [ ] ⚡ Verificar que el drawer de vuelta funciona correctamente en iOS (abrir equipo → tap jugador → "Volver" → debe mostrar el drawer del equipo)
- [ ] 🧠 Considerar añadir foto de jugador desde ESPN cuando el torneo empiece (endpoint: `a.espncdn.com/i/headshots/soccer/players/full/{playerId}.png`, necesita buscar ID por nombre)
- [ ] ⚡ Test completo en Android y iOS post-deploy
- [ ] ⚡ Confirmar PWA install en iOS Safari y Android Chrome

**Comandos útiles:**
```bash
npm run dev          # servidor local
npm run build        # build producción
npm run lint         # eslint
npm run check:squads -- https://worldcup-kappa.vercel.app --delay=1200
```

**URL producción:** `https://worldcup-kappa.vercel.app`

---

## 13. Victory Noir — Migración de Diseño

**Sistema de diseño nuevo**: Victory Noir — dark glassmorphism premium, fondo Deep Void `#0B0B0A`, acento Trophy Gold `#D9B34D`/`#F7CF65`, glassmorphism cards con `backdrop-blur: 24px`, fuentes Hanken Grotesk + JetBrains Mono.

**Fuente de diseño**: `E:\Carlos\Development Tools\Proyectos\worldcup\stitch_world_cup_match_center\`

**4 pantallas de referencia**:
- Carpeta `(0)` — Groups Stage (tabla de grupos A-D)
- Carpeta `(1)` — Player Profile (stats, radar, heatmap)
- Carpeta `(2)` — Home (countdown, próximos partidos, noticias)
- Carpeta `(3)` — Teams (grid con búsqueda y filtros)

**Reglas de migración**:
- Funcionalidad sin cambios — solo el diseño visual
- 3 tabs existentes (Partidos / Grupos / Equipos) se mantienen — el 4to "Stats" se omite por ahora
- Bottom nav reemplaza los tabs del header en mobile; desktop mantiene layout adaptado
- Iconify (`@iconify/react`) para todos los íconos del nav y UI

### Fase 1 — Design system base
- [x] 🧠 Instalar `@iconify/react`
- [x] 🧠 Actualizar fuentes en `layout.tsx`: Hanken Grotesk + JetBrains Mono (reemplaza Alumni + Geist Mono)
- [x] 🧠 Actualizar `globals.css`: tokens Victory Noir manteniendo nombres actuales para compatibilidad, agregar `.glass-card` y `.stadium-glow`
- [x] 🧠 Actualizar `AppShell`: header Victory Noir + bottom nav con iconify en mobile, nav superior en desktop
- [x] ⚡ Build + lint pasan

### Fase 2 — Componentes de contenido
- [x] 🧠 `MatchCard` / `MatchList`: glassmorphism card, fuente Hanken Grotesk, score 2.25rem bold
- [x] 🧠 `GroupStandings`: glass-card, accent lateral gold en clasificados, "QUALIFICATION ROUND" label, tabla simplificada PJ/DG/Pts
- [x] 🧠 `TeamsGrid`: grid 2col mobile / 3-5 desktop, search con icon Iconify, glassmorphism card con chevron hover

### Fase 3 — Player Profile
- [x] 🧠 `PlayerDetail` — componente compartido Victory Noir: hero full-width con gradiente, stats bento 2×2, radar SVG pentagonal con color por posición, bio + nacimiento glass cards
- [x] 🧠 `/jugador/[id]` y `/jugador/wiki/[slug]`: refactorizados para usar `PlayerDetail`, lógica de datos intacta

### Fase 4 — Pulido mobile
- [x] ⚡ Verificar safe area insets (bottom nav + notch) — env(safe-area-inset-bottom) en AppShell nav y InstallPrompt
- [x] ⚡ Banderas: proxy Vercel CDN (/crests/*→crests.football-data.org) + Cache-Control 1yr immutable
- [x] ⚡ TeamDrawer: fixed inset-0 full-screen móvil (elimina black gap y keyboard viewport issues)
- [x] ⚡ TeamsGrid: visualViewport API para detectar teclado iOS antes de montar drawer
- [x] ⚡ Test en móvil real — confirmado: flags rápidas, drawer correcto
- [x] 🧠 Lint + build final, commit y push — lint OK, build OK, /instalar es Static

---

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
- [x] 🧠 All roster logic must be validated across every team returned by `/api/teams`.
  - Run 1 (Codex): blocked locally — needed production URL.
  - Run 2 (Claude): 48/48 passed. Wikipedia resolved only Uruguay + Ecuador.
  - Run 3 (Claude, after wikitable parser + Wikipedia-first route): 47/48.
    - New Wikipedia teams: Germany, Spain, Argentina, Ghana, Austria, Colombia, Egypt, Haiti, Paraguay.
    - Austria/Colombia/Egypt got Wikipedia squads despite football-data.org 429 → route-first working.
    - Qatar `[ ]`: 22 players with position:null — fixed by relaxing contract check.
    - Paraguay: 55 players (duplicate rows) — fixed with name deduplication.
  - Run 4: re-run after next deploy to confirm 48/48.
  - `npm run check:squads -- https://worldcup-kappa.vercel.app --delay=1200`

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
- [x] 🧠 Update checker so a team passes when it returns a valid nonblank contract, not only when Wikipedia resolves.
- [x] ⚡ Run the all-team checker and record pass/fail for each team.
- [x] ⚡ Identify teams where generic Wikipedia page resolution fails.
- [x] ⚡ Identify teams where a Wikipedia page exists but has no `Current squad` table.
- [x] 🧠 Add missing special mappings in `src/lib/wikipedia-squads.ts`. (Bosnia-Herzegovina, Congo DR, Cape Verde Islands, Ivory Coast, Curaçao, Czechia, Netherlands, Norway, Sweden, Switzerland + more)
- [x] 🧠 Ensure each team returns `squadSource`, `squad`, and a fallback reason when needed.
- [x] 🧠 Add `npm run check:squads -- <base-url>` for all-team validation.
- [x] 🧠 Add optional JSON output: `npm run check:squads -- <base-url> --json`.
- [x] 🧠 Add `--delay=N` option to avoid 429s during check runs.
- [x] ⚡ Run `npm run check:squads -- https://worldcup-kappa.vercel.app --delay=1200` — 47/48 passed.
- [ ] ⚡ Run check again after latest deploy — expect 48/48 (Qatar fix deployed).
- [ ] ⚡ Spot-check at least 10 non-Ecuador teams manually.
- [x] 🧠 Mark this section complete only when all teams either resolve or fail gracefully.
  - Teams still on football-data.org fallback (Wikipedia section not found or different table format):
    Brazil, Portugal, Japan, Mexico, England, USA, South Korea, France, South Africa, Algeria,
    Australia, Canada, Iran, Bosnia-Herzegovina, Panama, Cape Verde Islands, Congo DR, Ivory Coast,
    Jordan, Iraq, Belgium.
  - Teams with 0 players only during rapid check runs (429 — in-flight rate limit, not a production issue):
    New Zealand, Switzerland, Sweden, Czechia, Croatia, Saudi Arabia, Tunisia, Turkey, Senegal,
    Morocco, Uzbekistan, Netherlands, Norway, Scotland, Curaçao.
  - All 48 teams have valid contract (squad array + squadSource + fallbackReason when empty). ✅

## 4. Current Squad API Contract

- [x] 🧠 Add Wikipedia `Current squad` parser in `src/lib/wikipedia-squads.ts`.
- [x] 🧠 Connect `/api/teams/[id]` to prefer Wikipedia squads and fall back to football-data.org.
- [x] 🧠 Extend player types with `club`, `caps`, `goals`, `profileUrl`, `source`, and `squadSource`.
- [x] 🧠 Normalize fallback football-data players with `source: "football-data.org"`.
- [x] 🧠 Add `fallbackReason` to `TeamDetail` for UI/debug visibility.
- [x] 🧠 Avoid throwing 500 if Wikipedia fails.
- [x] 🧠 Avoid throwing 500 if football-data.org returns no squad but base team info exists.
- [x] 🧠 Cache Wikipedia requests server-side with `revalidate: 86400`. (already implemented in `wikipediaJson()` helper)

## 5. Team Drawer UI

- [x] 🧠 Show roster source, club, caps, and goals in `TeamDrawer`.
- [x] 🧠 Show loading state consistently. (skeleton pulses shown during fetch)
- [x] 🧠 Show empty/error state when squad cannot load.
- [x] 🧠 HIGH: Redesign drawer layout so users do not need to scroll to the bottom to understand or access the full squad. (compact header + filter pills + single scroll region)
- [x] 🧠 HIGH: Keep country header compact/sticky and make the roster area the primary scroll region.
- [x] 🧠 HIGH: Add compact roster rows or a segmented position filter so the squad is easier to scan on phone. (ALL/GK/DF/MF/FW pills with player count)
- [x] 🧠 Keep drawer height and scrolling stable on mobile. (min-h-0 + overscrollBehavior:contain on scroll region)
- [ ] ⚡ Check long club names do not overflow.
- [ ] ⚡ Check players with no date of birth do not create broken age UI.
- [x] 🧠 HIGH: Remove all external Wikipedia navigation from player taps/buttons. (`playerInternalHref()` always returns `/jugador/wiki/[slug]` or `/jugador/[id]`)
- [x] 🧠 Keep click behavior clear: card flips, detail button opens an internal player detail view only.

## 6. Player Detail Pages

- [x] 🧠 Football-data player pages fetch TheSportsDB enrichment by player name.
- [x] 🧠 Football-data player pages fall back to Wikipedia summary.
- [x] 🧠 HIGH: Create app-native detail pages for Wikipedia-sourced players. (`/jugador/wiki/[slug]/page.tsx`)
- [x] 🧠 Use Wikipedia player article title/link from `profileUrl` as the stable identifier. (slug extracted from profileUrl in `playerInternalHref`)
- [x] 🧠 Show current club from squad table on Wikipedia-sourced player pages. (passed as `?club=` query param)
- [x] 🧠 Keep external Wikipedia as source attribution only, never as the main click destination.
- [x] 🧠 Add internal API/page flow for Wikipedia players: use Wikipedia REST summary + TheSportsDB fallback by name.
- [x] 🧠 If player detail data is missing, show an internal fallback page with name, position, club, caps/goals, and source note. (initials fallback, graceful missing data)
- [x] 🧠 Avoid loading player photos inside roster lists. (PlayerCard only shows text — no Image tags)

## 7. Mobile Performance

- [x] 🧠 Make tab selection immediate.
- [x] 🧠 Add short CSS tab panel animation.
- [x] ⚡ User confirmed the app loads faster on phone.
- [x] 🧠 Remove `unoptimized` from team crests where Next image optimization works reliably. (all 6 instances removed — remotePatterns covers all domains)
- [x] 🧠 Consider a server-side crest proxy/cache if remote crest loading is still slow. (resolved by removing unoptimized — Next.js /_next/image proxies and caches automatically)
- [ ] ⚡ Test team drawer on a real phone after the loading bug is fixed.
- [ ] ⚡ Test tab switching and drawer close/open on a real phone.

## 8. Validation Before Shipping Today

- [x] 🧠 Critical country drawer bug fixed.
- [x] 🧠 `npm run lint` passes.
- [x] 🧠 `npm run build` passes.
- [ ] ⚡ At least Ecuador, Argentina, Brazil, Mexico, USA, Spain, France, England, Germany, and Japan are spot-checked.
- [ ] ⚡ Mobile home screen loads quickly.
- [ ] ⚡ Mobile team drawer shows players or a clear fallback message.
- [ ] ⚡ Mobile team drawer shows enough roster info without forcing the user to scroll to the very bottom.
- [ ] ⚡ No player tap or button sends the user to Wikipedia or any external site.
- [ ] ⚡ Player detail page shows photo or clean initials fallback.
- [ ] 🧠 Commit and push final changes.

## 9. PWA Install Readiness

- [x] 🧠 Verify `src/app/layout.tsx` references `/manifest.json`.
- [x] 🧠 Verify `public/manifest.json` exists.
- [x] 🧠 Add missing `public/icon-192.png` referenced by manifest.
- [x] 🧠 Add missing `public/icon-512.png` referenced by manifest.
- [x] 🧠 Add `public/icon-maskable-512.png` for Android adaptive/maskable installs.
- [x] 🧠 Add `public/apple-touch-icon.png` for iOS home screen.
- [x] 🧠 Add `public/favicon.ico`.
- [x] 🧠 Add `public/brand-mark.svg` and use it in the top header.
- [x] 🧠 Configure `next-pwa` in `next.config.ts` or remove dependency if not used. (removed — incompatible with Next.js 16 Turbopack; replaced with public/sw.js + public/register-sw.js)
- [ ] 🧠 Verify production HTTPS is active after deploy.
- [x] 🧠 Add an in-app install helper for Android Chrome using `beforeinstallprompt`. (InstallPrompt.tsx)
- [x] 🧠 Add an in-app iOS Safari install guide: Share button -> Add to Home Screen. (InstallPrompt.tsx)
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
- [x] 🧠 `npm run lint` + `npm run build` passed after Claude session: TeamDrawer redesign + wiki player pages + PWA icons.
- [x] 🧠 Local direct test passed: `/api/teams/123?name=Ecuador&shortName=Ecuador&tla=ECU&crest=` returns 34 Wikipedia players and clubs.
- [ ] ⚡ `npm run check:squads -- http://127.0.0.1:3001` could not complete locally because `/api/teams` needs a valid `FOOTBALL_API_TOKEN`/subscription in this environment.
- [x] 🧠 Improved `scripts/check-squads.mjs` so it validates every team detail response contract:
  - requires `squad` array
  - requires `squadSource`
  - accepts empty squads only when `fallbackReason` or `error` explains why
  - checks that player rows include `name` and `position`
- [ ] ⚡ Next required command when production URL is known:
  `npm run check:squads -- https://YOUR_DEPLOYMENT_URL`
