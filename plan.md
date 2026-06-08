# Mundial 2026 — Plan de features

## ✅ FEATURES COMPLETAS — Sesión 2026-05-30

### A. "Mi Equipo" ✅
- [x] Botón ⭐ toggle en TeamsGrid, localStorage, card pinned con countdown, último resultado fallback

### B. Share Card ✅
- [x] Satori OG route, navigator.share nativo en móvil, descarga PNG en desktop, diseño Victory Noir

### C. Bracket Visual ✅
- [x] Tab Bracket, árbol QF→SF→Final CSS, estado vacío con placeholder dimmed hasta julio 2026

### D. Polish PWA (iOS Standalone) ✅
- [x] viewport-fit=cover → env(safe-area-inset-*) funciona en modo app
- [x] Safe-area-inset-top en: AppShell header, TeamDrawer header, PlayerDetail header, /instalar header
- [x] Bottom nav nativo: 65px altura, iconos 28px, pill gold activo, fondo 0.98 opaco
- [x] TeamDrawer via createPortal → z-index correcto sobre bottom nav en iOS
- [x] SW bumpeado a v4 → fuerza re-instalación en PWAs ya instaladas

### E. Marketing & Distribución ✅
- [x] Vercel Analytics instalado
- [x] Créditos "by Carlos Gallardo → carlosgallardo.dev" (footer desktop + mobile)
- [x] README.md reescrito, FOR_NEXT_LLM.md actualizado, MARKETING.md completo

---

## 🚧 FEATURES NUEVAS — Sesión 2026-06-08

### F1 · Estadios en partidos ⚡
**Qué:** Mostrar nombre del estadio y ciudad debajo de cada `MatchCard`.
**Fuente:** ESPN scoreboard → `event.competitions[0].venue.fullName` + `.address.city`.

**Archivos:**
1. `src/types/football.ts` — añadir `venue?: { name: string; city: string }` a `Match`
2. `src/lib/espn-api.ts` → `getESPNMatches()` — parsear `comp.venue`
3. `src/components/MatchCard.tsx` — línea venue debajo del marcador

- [x] Tipos + parsing ESPN
- [x] UI en MatchCard

---

### F2 · Team detail: próximos partidos en TeamDrawer ⚡
**Qué:** Sección "Próximos partidos" (3–5 matches) en `TeamDrawer` antes del plantel.
**Datos:** `matches` ya están en `AppShell`, solo filtrar por `team.id`.

**Archivos:**
1. `src/components/TeamDrawer.tsx` — nueva sección arriba del squad, recibe `allMatches: Match[]`
2. `src/components/AppShell.tsx` — pasar `matches` a `TeamDrawer`

- [x] UI en TeamDrawer

---

### F3 · Group detail: tabla + fixtures del grupo 🧠
**Qué:** Tap en `GroupStandings` card → `GroupDrawer` (fullscreen, mismo patrón que `TeamDrawer`) con:
  - Tabla de posiciones (reutilizar el componente existente)
  - Lista de partidos del grupo (filtrado de `matches` donde `m.group === groupKey`)

**Archivos:**
1. `src/components/GroupStandings.tsx` — añadir `onClick` prop + chevron indicador
2. `src/components/GroupDrawer.tsx` (nuevo) — drawer fullscreen portal
3. `src/components/AppShell.tsx` — estado `selectedGroup` + pasar `matches`

- [x] GroupDrawer component
- [x] GroupStandings tappable
- [x] Integración en AppShell

---

### F4 · Pronósticos (Predictions) 🧠
**Qué:** El usuario predice el marcador de cada partido. Visual feedback post-partido.

**Flujo UX:**
1. Badge de predicción en `MatchCard` (si ya hay predicción guardada) o ícono de lápiz (si no)
2. Tap en badge/ícono → `PredictionModal` — +/- buttons para home/away score
3. Al guardar: localStorage `{ [matchId]: { home, away } }`
4. Al finalizar el partido:
   - 🟢 Verde: acertó marcador exacto
   - 🟡 Amarillo: acertó resultado (G/E/P) pero no marcador exacto
   - 🔴 Rojo: falló resultado

**Módulos:**
1. `src/hooks/usePredictions.ts` — `useSyncExternalStore` + localStorage (patrón `useFavoriteTeam`)
2. `src/components/PredictionBadge.tsx` — badge compacto en MatchCard
3. `src/components/PredictionModal.tsx` — sheet de entrada
4. `src/types/football.ts` — añadir `Prediction` + `PredictionsMap`
5. `src/components/AppShell.tsx` — `predicting` state + `usePredictions`

- [ ] Hook usePredictions
- [ ] Tipos Prediction
- [ ] PredictionBadge
- [ ] PredictionModal
- [ ] Integración en AppShell + MatchCard

---

## Orden de implementación

```
F1  → solo datos, cero riesgo, empieza ya
F2  → UI incremental en TeamDrawer, datos ya existen
F3  → nuevo drawer, patrón conocido
F4  → feature más compleja, ir al final
```

## Limpieza pendiente
- [ ] Añadir `.playwright-mcp/` a `.gitignore`
- [ ] Decidir si `src/components/variants/` + `PrototypeSwitcher.tsx` se commitean o eliminan

---

### Estado del repo al inicio de sesión (2026-06-08)
- Último commit: `1f3fc31` feat: Elite Pitch redesign
- No hay commits adelante de origin/main — repo limpio
