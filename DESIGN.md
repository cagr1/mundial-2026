---
name: Mundial 2026
description: Dark lacquer sports interface. Kinpaku gold on lacquer black, verdigris patina for live states. Restrained, precise, technical.
colors:
  lacquer:        "oklch(7% 0.006 95)"
  lacquer-deep:   "oklch(4% 0.004 95)"
  raised-lacquer: "oklch(11% 0.006 95)"
  graphite:       "oklch(15% 0.008 95)"
  kinpaku:        "oklch(84% 0.19 80.46)"
  kinpaku-rich:   "oklch(77% 0.13 82)"
  kinpaku-deep:   "oklch(61% 0.085 78)"
  hairline:       "oklch(78% 0 0 / 0.16)"
  hairline-gold:  "oklch(74% 0.09 82 / 0.6)"
  patina:         "oklch(70% 0.12 188)"
  vermilion:      "oklch(58% 0.15 35)"
  champagne:      "oklch(91% 0 0)"
  text-warm:      "oklch(88% 0 0)"
  text-muted:     "oklch(72% 0 0)"
  text-faint:     "oklch(62% 0 0)"
typography:
  display:
    fontFamily: Alumni Sans Pinstripe, Albert Sans, Arial, sans-serif
    fontSize: clamp(2.6rem, 4vw, 3.4rem)
    fontWeight: 400
    lineHeight: 1.04
  heading:
    fontFamily: Albert Sans, Arial, sans-serif
    fontSize: 1.18rem
    fontWeight: 600
    lineHeight: 1.35
  body:
    fontFamily: Albert Sans, Arial, sans-serif
    fontSize: 1rem
    fontWeight: 400
    lineHeight: 1.7
  eyebrow:
    fontFamily: Geist Mono, monospace
    fontSize: 0.68rem
    fontWeight: 500
    letterSpacing: 0.18em
  score:
    fontFamily: Albert Sans, Arial, sans-serif
    fontSize: 2.25rem
    fontWeight: 700
    letterSpacing: -0.02em
rounded:
  xs: 2px
  sm: 4px
  md: 6px
  lg: 8px
spacing:
  xs: 8px
  sm: 16px
  md: 24px
  lg: 32px
  xl: 48px
components:
  match-card:
    backgroundColor: "{colors.raised-lacquer}"
    borderColor: "{colors.hairline}"
    borderRadius: "{rounded.lg}"
  match-card-hover:
    backgroundColor: "{colors.graphite}"
    borderColor: "{colors.hairline-gold}"
  match-card-live:
    borderColor: "oklch(70% 0.12 188 / 0.5)"
  tab-active:
    color: "{colors.kinpaku}"
    borderBottomColor: "{colors.kinpaku}"
  tab-idle:
    color: "{colors.text-faint}"
    borderBottomColor: "transparent"
  filter-active:
    backgroundColor: "{colors.kinpaku}"
    color: "{colors.lacquer-deep}"
  filter-idle:
    backgroundColor: "transparent"
    borderColor: "{colors.hairline}"
    color: "{colors.text-muted}"
---

# Mundial 2026 — Design System

## Overview

Dark lacquer sports interface built on the Neo Kinpaku vocabulary. Black urushi surfaces, kinpaku gold as the primary accent, verdigris patina for live and state signals. The interface reads like a precision instrument: flat, bounded, technically exact.

Designed for scanning fast — match times land in one glance, group colors orient without legends, and live indicators never compete with the score.

## Colors

Kinpaku gold is the single brand anchor. It marks active states, current times, selected filters, and the active tab underline. Patina (verdigris) is reserved for live match indicators. Vermilion appears only for warnings.

All surfaces use warm mineral blacks, never neutral grays or pure black.

## Typography

Two faces. Alumni Sans Pinstripe at display size for section headings; Albert Sans for all UI copy, scores, and team names. Geist Mono for eyebrow labels — group names, match metadata, column headers — always uppercase, always tracked.

Scores use Albert Sans at 36–48px, weight 700, tabular numerals.

## Elevation

Depth comes from surface contrast (raised-lacquer on lacquer), not shadows. Cards rest on hairlines. Hover lifts the border from `--hairline` to `--hairline-gold`. Live cards add a faint patina glow via `box-shadow`.

## Components

**Match card**: raised-lacquer surface, 1px hairline border, 8px radius. Group label as mono eyebrow in group-accent color. Time in kinpaku gold. Score in champagne.

**Group tables**: color-coded left border for groups, qualifying positions highlighted with a 2px accent stripe. All stats in tabular numerals.

**Filter pills**: sharp 4px radius. Active state fills with kinpaku, lacquer-deep text. Idle state is outline only.

**Tabs**: no background shift. Gold underline marks the active tab; color shifts from `text-faint` to `kinpaku`.

## Do's and Don'ts

- Do use kinpaku gold for all interactive and active states.
- Do use verdigris patina for live match indicators only.
- Do use mono eyebrows for all metadata labels (group, matchday, column headers).
- Do keep cards flat — no inner shadows, no nested cards.
- Do use tabular numerals for all scores, times, and statistics.
- Don't use glassmorphism or backdrop-blur.
- Don't use pure black or neutral gray surfaces.
- Don't add decorative gradients inside cards.
- Don't use more than two accent colors simultaneously.
