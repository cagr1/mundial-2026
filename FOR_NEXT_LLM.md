# Mundial 2026 — Context for Next LLM

> Lee esto primero. Cubre arquitectura, design system, fuentes de datos y estado actual del proyecto.

---

## Qué es esto

PWA para el FIFA World Cup 2026. Sin auth, sin cuentas, sin writes. Datos 100% públicos.

**Live:** `https://worldcup-kappa.vercel.app`  
**Repo:** `https://github.com/cagr1/mundial-2026`

---

## Stack actual

| Layer | Decisión |
|---|---|
| Framework | Next.js 16 (App Router) — leer `AGENTS.md` antes de tocar código |
| Styling | Tailwind v4 + CSS variables en `globals.css` — NO clases `bg-gray-*`, todo via `style={{ ... }}` con vars |
| Design | Victory Noir — ver `DESIGN.md` para tokens, colores, tipografía |
| Fuentes | Hanken Grotesk (UI/headings) + JetBrains Mono (monospace) vía `next/font/google` |
| Íconos | `@iconify/react` con colección `material-symbols` |
| Analytics | `@vercel/analytics` — `<Analytics />` en `layout.tsx` |
| Deploy | Vercel — auto-deploy en push a `main` |

---

## Fuentes de datos

| Dato | Fuente | Endpoint |
|---|---|---|
| Partidos / Standings / Equipos | ESPN API pública (sin API key) | `site.api.espn.com/apis/site/v2/sports/soccer/fifa.world/…` |
| Planteles | Wikipedia "Current squad" → ESPN roster fallback | `/api/teams/[id]` llama a `wikipedia-squads.ts` |
| Fotos jugadores | TheSportsDB + Wikipedia thumbnail | `/api/persons/[id]` |
| Imágenes OG (share cards) | `next/og` (Satori) — server-rendered | `/api/og/match?…` |

**football-data.org está COMPLETAMENTE ELIMINADO** de todas las rutas.

---

## Design system — Victory Noir

Variables principales en `globals.css`:
```
--lacquer-deep   #0B0B0A  (fondo principal)
--kinpaku        #D9B34D  (gold principal)
--kinpaku-rich   #F7CF65  (gold highlight)
--champagne      #EDE8D4  (texto principal)
--text-warm      #C9C2A8
--text-muted     #7A7252
--text-disabled  #4A4535
--patina         #5BA89A  (acento verde/live)
--vermilion      #C94B3A  (error/rojo)
--graphite       #1E1C15  (cards raised)
--glass-bg       oklch(14% 0.01 80 / 0.55)
--glass-border   oklch(84% 0.06 80 / 0.12)
```

Clases utilitarias:
- `.glass-card` — tarjeta glassmorphism
- `.match-card` — tarjeta de partido con estado is-live / is-today
- `.eyebrow` — texto uppercase pequeño con letterSpacing
- `.tabnum` — fuente mono para números

---

## Componentes clave

| Componente | Qué hace |
|---|---|
| `AppShell.tsx` | Shell con 4 tabs (Partidos/Grupos/Equipos/Bracket), favorito, timezone, nav mobile/desktop |
| `TeamDrawer.tsx` | Drawer fullscreen via `createPortal` — evita bug de z-index de iOS Safari con backdrop-filter |
| `FavoriteTeamCard.tsx` | Card del equipo favorito con próximo partido + countdown |
| `ShareButton.tsx` | `navigator.share({ files })` en móvil, download PNG en desktop |
| `KnockoutBracket.tsx` | Árbol CSS QF→SF→Final, estado vacío hasta julio 2026 |
| `useFavoriteTeam.ts` | `useSyncExternalStore` + localStorage — requiere snapshot cacheado para evitar bucle infinito |

---

## Trampas conocidas (leer antes de cambiar)

1. **`useSyncExternalStore` + objetos**: el snapshot debe retornar la misma referencia si el dato no cambió. `JSON.parse` crea objetos nuevos cada vez → bucle infinito. Ver `useFavoriteTeam.ts` para el patrón correcto de caché.

2. **iOS Safari + backdrop-filter**: elementos con `backdropFilter` crean stacking contexts en WebKit que ignoran z-index. `TeamDrawer` usa `createPortal(…, document.body)` para evitar esto.

3. **ESLint `react-hooks/set-state-in-effect`**: el proyecto tiene esta regla activa. No hacer `setState` directo en `useEffect`. Usar `useSyncExternalStore` o callbacks.

4. **`'use client'` no evita ejecución SSR de código a nivel módulo**: las funciones definidas a nivel módulo en archivos `'use client'` pueden ejecutarse en SSR si son importadas por server components. Cuidado con `window`/`localStorage` a nivel módulo.

5. **ESPN scoreboard no incluye `logos[]` en competitors**: el crest se deriva de `abbreviation` → `https://a.espncdn.com/i/teamlogos/countries/500/{abbr}.png`.

6. **`next/og` (Satori) no soporta `<>` fragments para layout**: envolver siempre en `<div style={{ display: 'flex', ... }}>`.

---

## Comandos

```bash
npm run dev                     # servidor local
npm run build                   # build producción
npm run lint                    # eslint
npm run check:squads -- https://worldcup-kappa.vercel.app --delay=1200
```

---

## Estado actual (sesión 2026-05-30)

Features completas y deployadas:
- Mi Equipo (favorito + countdown en vivo)
- Share Card (Satori OG + navigator.share nativo)
- Bracket Visual (árbol QF→Final, estado vacío hasta julio 2026)
- Vercel Analytics
- Créditos carlosgallardo.dev

Pendiente hasta el torneo (~junio/julio 2026):
- Planteles oficiales en Wikipedia (se actualizan ~junio)
- Bracket con datos reales (knockout empieza ~julio)
- Fotos de jugadores desde ESPN headshots
