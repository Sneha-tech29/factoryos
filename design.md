# Design — Colour, Theme, Typography, Motion

> **Status: direction [Open].** You asked for no white UI: either **dark metallic (shiny)** or **dark with a matching palette**, and you haven't decided between Figma and Stitch for animation / scroll-style views. This file therefore gives (a) rules that hold for every direction, (b) two ready palettes to choose between, and (c) a tool-agnostic way to adopt either.
> All hex values and font choices are **[Proposed]**. Verify contrast with a checker before shipping — the values below are chosen to be high-contrast but have not been measured.
> Tags: **[Spec]** = from mvp.md · **[Proposed]** = suggestion.

---

## 1. Non-negotiable design rules (any direction) [Spec]
- **Mobile-first.** Large touch targets, plain language, minimal fields, guided forms.
- **Action over decoration.** Avoid dashboard overload, dense ERP tables, excessive gradients, unnecessary charts.
- **Never colour alone.** Every status pairs colour with a text label **and** an icon.
- **Status colours keep their meaning:** green = on track · amber = attention · red = critical · blue = information.
- **High contrast, readable text, keyboard navigation, screen-reader semantics.**
- **Show freshness:** "Last updated …" on dashboard figures. Stale data is labelled; missing data is never styled as "all clear".
- **Empty states guide the user** — no fabricated sample metrics. Demo data is labelled "Sample data".
- **Owner understands the dashboard in under 30 seconds.**
- No pure white backgrounds or large white surfaces (owner requirement). Avoid pure `#000` too — it makes shiny effects look flat and causes smear on some OLED screens when scrolling.

---

## 2. Choose a direction

| | **Direction A — Dark Metallic** | **Direction B — Dark + Matching Palette** |
|---|---|---|
| Feel | Brushed steel / gunmetal, subtle sheen, "industrial machinery" | Deep ink-blue or charcoal with one warm accent, calm and modern |
| Fits | Factory/industry identity, strong brand presence | Long working sessions, data-heavy screens |
| Risk | Shine overused → clutter, lower legibility, conflicts with "no excessive gradients" [Spec] | Can feel generic without a distinctive accent |
| Recommendation **[Proposed]** | **Use A for the shell and hero/brand moments only** (header, launcher, primary buttons, focus rings, page transitions) and **B-style flat surfaces for data areas** (tables, forms, charts). This keeps the metallic identity without hurting readability. | |

Decide in Phase 0 and record in `Memory.md` → Decisions.

---

## 3. Colour tokens

Define as CSS variables in `styles/tokens.css`; components use tokens only (`Rules.md` §2).

### 3.1 Direction A — Dark Metallic **[Proposed]**
| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#0B0D10` | App background (near-black graphite) |
| `--bg-raised` | `#12161B` | Cards, panels |
| `--bg-overlay` | `#1A1F26` | Dialogs, menus, Agent panel |
| `--border-subtle` | `#242B33` | Dividers |
| `--border-metal` | `#3A444F` | Card edges, inputs |
| `--text-primary` | `#E8ECF1` | Main text |
| `--text-secondary` | `#A3ADBA` | Secondary text, labels |
| `--text-disabled` | `#6B7480` | Disabled only (not for needed info) |
| `--metal-light` | `#C9D1DA` | Sheen highlight |
| `--metal-mid` | `#8A96A3` | Steel mid-tone |
| `--metal-dark` | `#4A5460` | Sheen shadow |
| `--accent` | `#4FB3FF` | Primary action, links, focus |
| `--accent-warm` | `#E0A458` | Optional brass/copper highlight (brand moments) |

**Metallic effect recipe (use sparingly):**
```css
--metal-gradient: linear-gradient(135deg, var(--metal-dark) 0%, var(--metal-light) 45%, var(--metal-mid) 55%, var(--metal-dark) 100%);
```
Apply to: 1px gradient borders on primary cards, primary button edge, active nav indicator, Agent launcher ring, hero heading text clip. **Do not** apply to table rows, form fields, charts or long text.

### 3.2 Direction B — Dark + Matching Palette **[Proposed]**
| Token | Hex | Use |
|---|---|---|
| `--bg-base` | `#0E1117` | Background (ink) |
| `--bg-raised` | `#151A23` | Cards |
| `--bg-overlay` | `#1C2330` | Dialogs, Agent panel |
| `--border-subtle` | `#262E3B` | Dividers |
| `--text-primary` | `#EAEFF6` | Main text |
| `--text-secondary` | `#9FAABC` | Secondary |
| `--accent` | `#6EA8FF` | Primary action |
| `--accent-warm` | `#F2B35E` | Highlights |

### 3.3 Status colours (both directions) [Spec rule, hex Proposed]
| Meaning | Colour token | Hex | Required companion |
|---|---|---|---|
| On track | `--status-ok` | `#3DDC97` | ✓ icon + "On track" |
| Attention | `--status-warn` | `#F5B83D` | ⚠ icon + "At risk" |
| Critical | `--status-critical` | `#FF5C6C` | ● / ✕ icon + "Critical" / "Delayed" |
| Information | `--status-info` | `#5AB0FF` | ℹ icon + "Info" |
| Stale / unknown | `--status-stale` | `#8A96A3` | clock icon + "Last updated …" / "Data missing" |

Status badges use a tinted background (colour at low opacity) with the full-strength colour for text/icon, so they work on dark surfaces.

### 3.4 Light theme
Not planned. If ever added, it must be a soft off-white/grey, never pure white **[Open]**.

---

## 4. Typography **[Proposed]**

The product serves Indian MSME owners and workers, so **Devanagari support is required from day one** (Hindi; other Indian scripts per launch-language decision **[Open]**).

| Role | Font | Notes |
|---|---|---|
| UI text / body | **Inter** | Highly legible at small sizes; tabular numerals available |
| Hindi / Devanagari | **Noto Sans Devanagari** | Pair with Inter; set as the fallback so mixed text renders consistently |
| Headings / brand | **Sora** or **Space Grotesk** (pick one) | Slightly technical, suits the metallic theme; use for H1–H2 and hero only |
| Numbers, IDs, quantities | **JetBrains Mono** or Inter with `font-variant-numeric: tabular-nums` | Order IDs, quantities, stock figures stay aligned |

Other Indian scripts → matching **Noto Sans** script variant, added when that language is confirmed.

**Fallback stack:** `"Inter", "Noto Sans Devanagari", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif`.
Load fonts with `font-display: swap`, self-host if possible, subset by script to keep load fast (slow loads trigger skeletons — see §8).

### Type scale (mobile-first) [Proposed]
| Style | Size / line-height | Weight |
|---|---|---|
| Display (hero only) | 32 / 40 → 48 / 56 desktop | 600 |
| H1 | 24 / 32 | 600 |
| H2 | 20 / 28 | 600 |
| H3 | 18 / 26 | 600 |
| Body | **16 / 24 (minimum for body)** | 400 |
| Small / label | 14 / 20 | 500 |
| Caption (freshness, hints) | 12–13 / 18 | 400 |
Worker screen buttons: label ≥ 18–20 px, touch target ≥ 48 px (aim larger). Don't go below 14 px for anything the user must read to act.

---

## 5. Layout & components
- **Mobile:** single column, bottom or drawer navigation, floating **Agent launcher** (persistent) [Spec].
- **Desktop:** left navigation (all areas from `PRD.md` §4) + content + collapsible Agent side panel.
- **Dashboard order:** top-3 attention items → factory health → today's production → order groups → machine summary → dispatches.
- **Cards over dense tables** on mobile; tables only where comparison is essential, and they scroll horizontally inside their container.
- **Agent panel:** context indicator, input, suggested actions (Check factory health · Find risky orders · Prepare today's plan · Check inventory · Analyse machines · Generate report · Prepare tomorrow), task-state badge, action previews, Approve / Cancel / Modify, results, errors. [Spec]
- **Action preview card:** action name · current → proposed · affected records · impact · reason · assumptions · buttons.
- **Worker screen:** five full-width buttons — START JOB · PAUSE · REPORT PROBLEM · ADD WASTE · COMPLETE JOB.

---

## 6. Animation & scrolling **[Open — tool undecided]**

### 6.1 Motion principles (any tool)
- **Purposeful:** motion explains change (a card moves because an order moved), confirms action, or guides attention. No decorative looping animation on data screens.
- **Fast and calm:** 150–250 ms for UI feedback, 300–500 ms for page/panel transitions; ease-out for entering, ease-in for leaving.
- **Sheen:** metallic highlight sweeps only on hover/focus/first load of a brand element, once, not continuously.
- **Respect `prefers-reduced-motion`:** replace movement with a simple fade or no animation. Required.
- **Performance:** animate `transform` and `opacity` only; keep it smooth on low-end phones typical of factory floors.
- **Never delay the user:** animation must not block reading data or pressing buttons.

### 6.2 Scroll-style views
- **Allowed on:** landing/marketing and onboarding (scroll-driven reveals, progress), not on operational screens.
- **Operational screens** (dashboard, orders, production): normal, predictable scrolling; sticky headers only if they don't hide content on small phones; preserve scroll position when returning from a detail page.
- No scroll-jacking. No parallax on data views.

### 6.3 Figma vs Stitch — how to decide without committing yet
Both are design/prototyping tools; this file does **not** assume specific export capabilities of either — check what each currently offers before deciding.

| Question to ask | Why it matters |
|---|---|
| Can it export or let me copy **tokens/CSS/React** I can map onto `tokens.css`? | Code stays the source of truth |
| Can it prototype the **scroll and motion** behaviour I want, and is that behaviour reproducible in code (Motion/CSS/GSAP)? | Prototype ≠ production |
| Does it handle **Devanagari** text and RTL/long strings well? | Multilingual requirement |
| Can I design the **loading / empty / error / stale** states and skeletons, not just happy paths? | Required states (`Rules.md` §4) |
| Can others (developer, AI assistant) read the design reliably? | Handoff |

**Rule that makes the choice low-risk:** whichever tool you use, treat its output as *reference*; port decisions into `styles/tokens.css` and the component library. Record the chosen tool and any frame/file links in `Memory.md`.

---

## 7. Iconography & imagery
- One icon set (e.g. Lucide) **[Proposed]**; every status/action icon paired with a text label.
- Minimal decorative imagery. Factory photos/documents appear only where users upload them.
- No stock "AI" glow/sparkle clichés on data screens; keep the Agent identity simple and consistent (launcher + panel).

---

## 8. Skeleton loaders (loading states) [Proposed; ties to `Security.md` §8]

**Purpose:** when data is slow to arrive, show the page's real layout with placeholders instead of a blank screen or spinner-only, so the app feels stable and people don't tap repeatedly or assume it crashed.

**Rules**
- Build reusable components: `SkeletonCard`, `SkeletonTable`, `SkeletonChart`, `SkeletonText`, `SkeletonOrderRow`, `SkeletonAgentPanel`. Their shapes mirror the real components, so layout doesn't jump when data arrives.
- **Timing:** show a skeleton only if loading exceeds ~150 ms (avoids flicker); once shown, keep it at least ~400 ms (avoids flash). Values **[Proposed]** — tune.
- **Look:** use `--bg-raised` blocks with a slow, subtle shimmer (metal-tone sweep in Direction A). Under `prefers-reduced-motion`, static blocks without shimmer.
- **Accessibility:** container has `aria-busy="true"` and a visually hidden "Loading…" message; remove when content arrives.
- **Never a fake data skeleton:** placeholders must be obviously placeholders — no invented numbers or names.
- **Never infinite:** after the timeout threshold, switch to a "Taking longer than usual…" message with Retry; on failure, show the error state (`Rules.md` §4).
- **Last-known data:** if previously loaded data exists, it may stay visible under a **StaleBanner** ("Showing data from 10:42 — refreshing…"). Never present it as current.
- Heavy jobs (import, scheduler, report) show **progress states** (queued → running → done) instead of a bare skeleton.

---

## 9. Accessibility checklist [Spec]
- [ ] Text contrast meets WCAG AA at minimum (4.5:1 body, 3:1 large text/UI) — measure, don't assume
- [ ] Status never colour-only
- [ ] Keyboard reachable, visible focus ring (`--accent`, 2 px + offset)
- [ ] Screen-reader labels, landmarks, `aria-live` for task-state and toast changes
- [ ] Touch targets ≥ 44–48 px
- [ ] Reduced-motion supported
- [ ] Language switch updates navigation, forms, validation, empty states, notifications, reports
- [ ] Voice input has editable transcript and a confirm step
