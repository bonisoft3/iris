---
colors:
  primary: "#0F1D1A"
  secondary: "#435A54"
  accent: "#06745E"
  danger: "#B91C1C"
  neutral: "#F4FAF8"
  surface: "#FFFFFF"
  border: "#CBE2DC"
  surface-muted: "#E8F6F2"
  link: "#06745E"
  header: "#06745E"
  strip-ink: "#FFFFFF"
dark:
  primary: "#ECF7F4"
  secondary: "#9CC4BA"
  accent: "#2DD4BF"
  danger: "#F87171"
  neutral: "#0B1512"
  surface: "#11211D"
  border: "#223E37"
  surface-muted: "#182D28"
  link: "#4FD1C5"
  header: "#0A6B57"
  strip-ink: "#ECF7F4"
rounded:
  sm: "6px"
  md: "12px"
  full: "999px"
spacing:
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "40px"
motion: {}
measures:
  page: "1120px"
  column: "720px"
  portrait: "320px"
shell:
  bg: "neutral"
  fg: "primary"
  rule: "border"
  nav: "custom"
---

# Iris Circular Field Guide

Identity for Iris (`iris.cleaning`) — an intelligent waste classification and circular-recovery field guide. Built from the live `iris.cleaning` (`guis/iris`) interface and the Stitch design system (`docs/mockups/stitch/DESIGN_SYSTEM.md`): a solid Iris Teal navigation rail and sticky brand bar (`header` `#087A64` in light, `#0F5246` in dark) with crisp white ink (`strip-ink`), paired with living recycling teal (`accent` `#067A63` in light, `#2DD4BF` in dark) over a clean slate-alabaster ground (`neutral` `#F8FAFC` in light, `#090D16` theater slate in dark) with white cards (`surface` `#FFFFFF`) and soft mint callout bands (`surface-muted` `#ECFDF5`).

## Overview

Iris turns a phone or desktop browser into an optical waste-sorting lens, multilingual disposal guide, and neighbourhood recovery hub directory. The desktop left rail and sticky screen headers wear Iris Teal (`header`) with high-contrast light ink (`strip-ink`) and an inline segmented language switcher (`.lang-switch`) across all six locales (`EN`, `ES`, `PT`, `RU`, `HE`, `KK`). Bento specimen cards and camera viewfinders frame waste imagery over a dark studio stage with frosted telemetry badges, while disposal instructions, stream breakdowns, and verified drop-off hubs sit on crisp `surface` cards with `surface-muted` mint accents. Commitment actions — scanning an item, requesting or switching translations, registering a neighbourhood drop-off bin, or offering an item for reuse — wear `accent` teal. Destructive or refusal states wear `danger`.

## Comparison

Three visual directions were evaluated against the `iris.cleaning` and Stitch oracle:

1. **Iris Circular Field Guide** (Iris Teal left rail & sticky brand header, dark-framed Bento specimen imagery, mint-tinted verification badges, high-contrast teal commitments, and dark-theater camera viewfinder) — **chosen.** It reproduces the visual signature of `iris.cleaning` while meeting WCAG AA contrast (>= 4.5:1) across every surface in both light and dark appearances.
2. **Dark-Only Camera HUD** (pure black ground, neon green overlays on every screen) — **rejected.** Works for a viewfinder but fatigues readers browsing a 12-card recycling gallery, reading multi-step disposal instructions, or looking up neighbourhood collection centers in daylight.
3. **Generic Neutral SaaS** (slate grays, indigo buttons, untinted white header) — **rejected.** Strips away the Iris Teal environmental identity that makes `iris.cleaning` recognizable at a glance.

**Contract:** the token *names* in the frontmatter above are the schema contract (`colors`, `dark`, `rounded`, `spacing`, `motion`, `measures`, `shell`). Both appearances carry the exact same token names — appearance is a token resolution, never application state (`accept-dual-appearance`). No screen or shared stylesheet may write a raw hex literal or raw pixel dimension where a scale rung or token exists.

## Colors

- **Primary / Secondary:** `primary` (`#0F172A` light / `#E8F5F2` dark) is for headings, captions, and disposal instructions; `secondary` (`#475569` light / `#A3C2CC` dark) is for metadata, addresses, coordinates, and material sub-labels.
- **Link:** navigational links to item detail pages, disposal directories, campaign stories, or external sources.
- **Header / Strip-ink:** the solid Iris Teal navigation rail, sticky screen top bars, disposal status hero banners, and sign-in gate panel; `strip-ink` stays crisp white/mint-white in both appearances against `header`.
- **Accent:** commitment controls — scan & classify, translate guide, register drop-off place, donate item, save profile — and numbered disposal step badges.
- **Danger:** destructive actions (two-tap delete, retract donation) and form validation or store refusal messages.
- **Surface-muted:** mint verification bands, category filter chips, status badges, and loading skeletons.
- **Border:** card outlines, panel dividers, and input borders.

## Type

System sans (`system-ui, sans-serif`) for clean multilingual legibility across Latin (`en`, `es`, `pt`), Cyrillic (`ru`, `kk`), and Hebrew (`he` RTL). Five semantic type roles in `shell/shared/iris.css`:
- `.role-title`: `--type-title`, weight 700, `--type-leading-title`
- `.role-band`: `--type-subtitle`, weight 700, `--type-leading-title`
- `.role-body`: `--type-body`, `--type-leading-body`
- `.role-meta`: `--type-caption`, `--type-leading-body`
- `.role-label`: `--type-label`, `--type-leading-body`

## Geometry

- `rounded.sm` (`6px`) on buttons, inputs, and inner badges.
- `rounded.md` (`12px`) on Bento specimen cards, detail panels, drop-off hub cards, and camera viewfinders.
- `rounded.full` (`999px`) on waste stream pills, language switcher chips, and status badges.
- Responsive layouts use `@container` queries (`container-type: inline-size` on `.screen`) so storybook frames and phone/tablet/desktop viewports reflow identically.

## Components

- **Brand Topbar (`.brand-topbar`):** `header` Iris Teal background with `strip-ink` typography, housing the screen title, live pipeline badge, and `.lang-switch` segmented locale pills (`EN`, `ES`, `PT`, `RU`, `HE`, `KK`).
- **Panel (`.panel`):** `surface` background, `border` outline, `rounded.md`, with a `.band` header in `surface-muted` and `.panel-body` padded by `spacing.md`.
- **Bento Specimen Card (`.item-card`):** dark studio media stage (`.specimen-frame`) with floating category and recovery-value pills above the specimen's caption, material summary, quick-preview trigger, and link to `/images/:id`.
- **Category & Stream Chip (`.chip`):** `rounded.full`, `surface-muted` background, `primary` ink, pairing a waste stream badge with its localized label (`Recyclable`, `Organic`, `Electronic`, `Non-Recyclable`, `Trash`).
- **Two-Tap Destructive Control (`details.confirm-delete`):** `<summary>` arms the action without mutating state; the nested `button.danger` commits the delete.
