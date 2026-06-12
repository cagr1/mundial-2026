# Mundial 2026 — Historial de features completadas

## Sesión 2026-05-30

### A · Mi Equipo
- Botón ⭐ toggle en TeamsGrid, persistido en localStorage
- Card pinned en tab Partidos con countdown al próximo partido
- Fallback al último resultado si no hay próximo partido

### B · Share Card
- Ruta Satori OG para generar imagen de partido
- `navigator.share` nativo en móvil (Web Share API)
- Descarga PNG en desktop como fallback
- Diseño "Victory Noir"

### C · Bracket Visual
- Tab Bracket con árbol QF → SF → Final en CSS
- Estado vacío con placeholders dimmed hasta julio 2026

### D · Polish PWA (iOS Standalone)
- `viewport-fit=cover` + `env(safe-area-inset-*)` funcional en modo app
- Safe-area-inset-top aplicado en: AppShell header, TeamDrawer header, PlayerDetail header, /instalar header
- Bottom nav nativo: 65px altura, iconos 28px, pill gold activo, fondo 0.98 opaco
- TeamDrawer via `createPortal` → z-index correcto sobre bottom nav en iOS
- Service Worker bumpeado a v4 → fuerza re-instalación en PWAs existentes

### E · Marketing & Distribución
- Vercel Analytics instalado
- Créditos "by Carlos Gallardo → carlosgallardo.dev" en footer desktop y mobile
- README.md reescrito, FOR_NEXT_LLM.md actualizado, MARKETING.md completo

---

## Sesión 2026-06-08

### F1 · Estadios en partidos
- `venue?: { name, city }` añadido a tipos `Match`
- Parsing de `comp.venue` en `getESPNMatches()` desde ESPN API
- Línea de estadio y ciudad debajo del marcador en `MatchCard`

### F2 · Próximos partidos en TeamDrawer
- Sección "Próximos partidos" (hasta 5 matches) en `TeamDrawer` antes del plantel
- `AppShell` pasa `allMatches` a `TeamDrawer`, filtrado por `team.id`

### F3 · Group detail: tabla + fixtures
- `GroupStandings` tappable con chevron indicador
- `GroupDrawer` fullscreen via `createPortal` (mismo patrón que `TeamDrawer`)
- Tabla de posiciones + lista de partidos del grupo dentro del drawer
- Estado `selectedGroup` en `AppShell`

### Rediseño visual "Elite Pitch"
- Nuevo sistema de tokens (`globals.css`): superficies Navy, dorado Kinpaku, texto Champagne
- Íconos PWA regenerados: app-logo, apple-touch-icon, icon-192/512/maskable
- `manifest.json` actualizado con nuevos íconos
- Banderas circulares via `emojione-v1` + contenedor circular con `overflow: hidden`

### Fixes
- `--text-disabled` corregido de `#4f4633` (ilegible) a `#7a8fa8` — texto de estadio en MatchCard
- `.playwright-mcp/` añadido a `.gitignore`
- Archivos de prototipo eliminados: `PrototypeSwitcher.tsx`, `variants/`

### F4 · Pronósticos (Predictions)
- `usePredictions.ts` — hook con `useSyncExternalStore` + localStorage (patrón `useFavoriteTeam`), incluye `getPredictionResult` (exact/correct/wrong)
- `PredictionBadge.tsx` — badge en `MatchCard`: lápiz si no hay predicción y el partido es próximo, score guardado con candado si está en vivo, score + ícono de resultado coloreado si ya finalizó
- `PredictionModal.tsx` — bottom sheet con contadores +/- para home/away, banner de resultado post-partido
- **Lock post-partido:** `canEdit = !isDone && !isLive` (`isDone` = `FINISHED`/`AWARDED`) — una vez finalizado o en vivo, el modal solo muestra el resultado y botón "Cerrar", sin editar ni borrar
- Traducciones completas: en/es/hi/pt/zh (namespace `predictions`)
