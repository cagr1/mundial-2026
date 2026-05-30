# Estrategia de Marketing — Mundial 2026 App
> by Carlos Gallardo · carlosgallardo.dev

**Ventana crítica:** Mundial empieza 11 Jun 2026 — el hype pre-torneo está en su pico AHORA.

---

## 1. El activo más valioso: el Share Card

Cada vez que alguien comparte un partido, la imagen generada incluye `worldcup-kappa.vercel.app` al pie. Esto es **publicidad gratuita en WhatsApp, grupos de fútbol, Instagram y Twitter** sin que hagas nada extra. La app ya está diseñada para viralizarse sola.

**Acción:** Compartir los primeros partidos del 11 de junio tú mismo para sembrar el contenido.

---

## 2. El Reel — "Hice una app del Mundial en 1 día con IA"

### Estructura (60 segundos)

| Seg | Contenido | Propósito |
|---|---|---|
| 0–3 | App en el celular — la UI completa funcionando | Hook visual antes de que hagan scroll |
| 3–8 | "Construí esto en 1 día usando Claude AI" | Declaración + curiosidad |
| 8–25 | Timelapse: pantalla del chat con Claude generando código → la app apareciendo | Proceso de IA en acción |
| 25–45 | Demo de las 3 features más visuales: Share Card, Mi Equipo con countdown, Bracket | Prueba de que funciona |
| 45–55 | "Es gratuita, funciona en tu celular, sin descargar nada" | CTA de valor |
| 55–60 | "Link en bio · carlosgallardo.dev" + QR code a la app | Conversión |

### Lo que NO mostrar en el reel
- Código fuente (aburre al 90% de la audiencia)
- Errores o bugs durante el proceso
- Más de 3 features (sobrecargar = perder atención)

### Hook alternativo (versión corta — 15 seg para Stories)
> *"Antes del Mundial: instalé esta app que me hice con IA para seguir todos los partidos. Gratis, sin descargar nada, funciona como nativa."*

---

## 3. Plataformas y estrategia por canal

### TikTok — prioridad alta
- **Audiencia:** Mixta (devs + fans de fútbol + audiencia general)
- **Formato:** Reel de 60 seg + comentarios en video ("¿cómo lo hiciste?")
- **Ángulo:** IA + fútbol — dos temas en tendencia simultáneos
- **Hashtags:** `#IA #InteligenciaArtificial #Claude #WorldCup2026 #Mundial2026 #AppDev #NextJS #ProgramaciónEnEspañol #TechEnEspañol`
- **Mejor horario:** 7pm–10pm hora local (máximo engagement en LATAM)

### Instagram — prioridad alta
- **Reels:** Mismo video del reel
- **Stories:** Demo de 15 seg con sticker de link directo a la app
- **Carrusel:** "5 features de la app del Mundial que no sabías que necesitabas"
  - Slide 1: Share Card (imagen del partido)
  - Slide 2: Mi Equipo con countdown
  - Slide 3: Planteles completos
  - Slide 4: Bracket visual
  - Slide 5: "Gratuita · Sin instalar · carlosgallardo.dev"
- **Hashtags:** `#Mundial2026 #WorldCup2026 #AppMovil #ProgramacionWeb #Claude #IA`

### Twitter/X — prioridad media
- **Ángulo dev:** Thread técnico "Cómo construí una app del Mundial en 1 día"
- **Ángulo fan:** "La mejor app gratuita para seguir el Mundial"
- **Contenido periódico:** Tweet con la share card de cada partido importante (con tu cuenta)
- **Comunidades:** Responder a tweets sobre el Mundial con el link de la app

### Reddit — prioridad media
- **r/nextjs** → "Built a World Cup 2026 PWA in 1 day with Claude AI + Next.js 16"
- **r/webdev** → misma publicación
- **r/soccer** → "Free World Cup 2026 PWA — no install needed, works on iOS/Android"
- **r/worldcup** → Demo de la app cuando empiece el torneo
- **Tip:** En Reddit el valor tiene que ser genuino — mostrar el código, el proceso, los errores.

### LinkedIn — prioridad media
- **Ángulo:** Caso de estudio de productividad con IA
- "Diseñé, construí y deployé una PWA completa en 1 día usando Claude como pair programmer"
- Incluir métricas: líneas de código, componentes, features entregadas

### WhatsApp/Telegram — motor de distribución orgánico
- Compartir la app directamente en grupos de fútbol, comunidades de devs, grupos de amigos
- El share card se viraliza solo cuando la gente lo usa para compartir partidos

---

## 4. Calendario de publicación (Mayo–Julio 2026)

### Ahora (30 Mayo – 10 Junio) — Pre-torneo
- [ ] Publicar reel principal en TikTok e Instagram
- [ ] Post en LinkedIn con el proceso
- [ ] Posts en Reddit (r/nextjs, r/webdev)
- [ ] Compartir la app en grupos de WhatsApp relevantes
- [ ] Story diaria con "X días para el Mundial" usando el countdown de la app

### Arranque del torneo (11–17 Junio) — Máximo hype
- [ ] Share card del primer partido (México vs Sudáfrica) en todas las redes
- [ ] Story en tiempo real durante los primeros partidos
- [ ] Tweet con los resultados usando la share card generada
- [ ] Responder activamente a comentarios y DMs

### Fase de Grupos (11 Jun – 2 Jul) — Engagement continuo
- [ ] Share card de cada partido de tu selección favorita
- [ ] Carrusel de Instagram con "tabla del día"
- [ ] TikTok de "mi predicción para hoy" usando la app

### Knockout (Julio) — Bracket fever
- [ ] Contenido del Bracket visual cuando se active
- [ ] "¿Quién llega a la final?" usando el bracket de la app
- [ ] Share cards de partidos eliminatorios (mayor valor emocional)

---

## 5. La guía técnica — para quien quiera hacer la suya

### Título para publicar en Dev.to / Hashnode / Medium
> **"Cómo construí una PWA del Mundial 2026 con Next.js 16 y Claude AI en 1 día"**

### Estructura del artículo

1. **El problema** — quería una app para seguir el Mundial desde el celular, sin pagar, sin registrarme
2. **La solución** — PWA con Next.js, datos de ESPN API (gratuita, sin key), deployada en Vercel
3. **El proceso con IA** — cómo usé Claude para arquitectura, debugging y features
4. **Las 3 decisiones técnicas más importantes:**
   - ESPN API sobre football-data.org (sin rate limits, sin API key)
   - `createPortal` para el drawer en iOS (bug de backdrop-filter + z-index)
   - `useSyncExternalStore` para favoritos (evitar bucle infinito con JSON.parse)
5. **El resultado** — features, métricas, link a producción
6. **Cómo hacer la tuya** — repo de referencia, pasos de setup

### CTA del artículo
> "Si quieres la app sin construirla, está disponible gratis en worldcup-kappa.vercel.app"
> "Si quieres construir la tuya, el código está en github.com/cagr1/mundial-2026"

---

## 6. Métricas a seguir (Vercel Analytics ya instalado)

| Métrica | Qué indica |
|---|---|
| Page views únicos | Alcance total |
| Sessions por día | Retención durante el torneo |
| Páginas más visitadas | Features más usadas |
| Tráfico por referrer | Qué canal convierte mejor |
| Pico de tráfico | Correlacionar con partidos importantes |

**Objetivo realista para el torneo:** 5,000 usuarios únicos.  
**Objetivo ambicioso:** 25,000 si el reel tiene buen alcance.

---

## 7. El pitch en una frase

Según el canal:
- **Para fans:** *"La app más bonita y gratis para seguir el Mundial desde tu celular — sin instalar nada"*
- **Para devs:** *"PWA del Mundial construida con IA en 1 día — Next.js 16, ESPN API, Satori, createPortal"*
- **Para LinkedIn:** *"Cómo la IA me permitió construir en 1 día lo que antes me tomaba 2 semanas"*

---

## 8. QR Code para el reel

Generar QR de `https://worldcup-kappa.vercel.app` en:
- [qr.io](https://qr.io) (con colores Victory Noir: fondo #0B0B0A, código #D9B34D)
- O usar el endpoint de Vercel: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=https://worldcup-kappa.vercel.app`

Incluir en el último frame del reel y en Stories.
