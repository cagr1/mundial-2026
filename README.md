# Mundial 2026 — World Cup Companion App

PWA móvil para seguir el FIFA World Cup 2026. Diseño Victory Noir (dark glassmorphism + gold). Sin backend propio — 100% datos públicos.

**Live:** [worldcup-kappa.vercel.app](https://worldcup-kappa.vercel.app)  
**Autor:** [carlosgallardo.dev](https://carlosgallardo.dev)

---

## Features

| Feature | Descripción |
|---|---|
| 📅 Partidos | Calendario completo con filtro por jornada, hora en tu timezone |
| ⭐ Mi Equipo | Fija tu selección favorita con próximo partido y countdown en vivo |
| 🏆 Grupos | Tabla de posiciones de los 12 grupos |
| 🛡️ Equipos | Planteles completos (Wikipedia + ESPN), perfil de cada jugador |
| 🌿 Bracket | Árbol visual de Octavos → Final (disponible desde julio 2026) |
| 📤 Share Card | Comparte cualquier partido como imagen — share sheet nativo en móvil |
| 📲 PWA | Instalable en iOS y Android como app nativa |

---

## Stack

- **Framework:** Next.js 16 (App Router)
- **Styling:** Tailwind v4 + CSS Variables (Victory Noir design system)
- **Datos:** ESPN API pública — partidos, equipos, standings
- **Planteles:** Wikipedia "Current squad" → ESPN roster fallback
- **Imágenes compartidas:** `next/og` (Satori) — Edge-rendered PNG
- **Analytics:** Vercel Analytics
- **Deploy:** Vercel (auto-deploy en push a main)

---

## Desarrollo local

```bash
npm install
npm run dev        # localhost:3000
npm run build      # build producción
npm run lint       # eslint
```

No requiere API keys — todo usa endpoints públicos de ESPN.

---

## Arquitectura rápida

```
src/
  app/
    page.tsx              # Server component — fetches ESPN data
    api/
      matches/            # ESPN scoreboard → Match[]
      standings/          # ESPN standings → Standing[]
      teams/              # ESPN teams + Wikipedia squads
      og/match/           # Satori OG image para share cards
  components/
    AppShell.tsx          # Shell con tabs, favorito, timezone
    MatchList/Card.tsx    # Lista y tarjeta de partidos
    TeamsGrid.tsx         # Grid de selecciones con ⭐ favorito
    TeamDrawer.tsx        # Drawer fullscreen con plantel (createPortal)
    KnockoutBracket.tsx   # Bracket QF→Final con líneas CSS
    FavoriteTeamCard.tsx  # Card pinned del equipo favorito
    ShareButton.tsx       # Botón compartir → navigator.share / download
  hooks/
    useFavoriteTeam.ts    # useSyncExternalStore + localStorage
  lib/
    espn-api.ts           # Wrapper ESPN API
    wikipedia-squads.ts   # Parser de planteles Wikipedia
```
