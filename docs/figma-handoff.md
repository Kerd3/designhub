# Figma handoff

> **No Figma file has been created.** The Figma integration in this environment was not authorised, so this document is the handoff instead. It is written so a designer can rebuild the file frame by frame, and it references the live implementation (`/design-system`, `docs/screenshots/`) as the source of truth.

## Suggested file structure

Pages: **Cover · Foundations · Components · Public website · Workspace · Prototype flows**.

### Frames to create

| # | Frame | Size | Reference screenshot |
| --- | --- | --- | --- |
| 1 | Home — Desktop | 1440 × auto | `screenshots/home-desktop-1440.png` |
| 2 | Home — Mobile | 390 × auto | `screenshots/home-mobile-390.png` |
| 3 | Services — Desktop | 1440 × 900 | `screenshots/services-desktop-1440.png` |
| 4 | Portfolio — Desktop | 1440 × 900 | `screenshots/portfolio-desktop-1440.png` |
| 5 | Workspace Dashboard — Desktop | 1440 × 1000 | `screenshots/dashboard-desktop-1440.png` (+ `dashboard-dark-1440.png`) |
| 6 | Workspace Dashboard — Mobile | 390 × 844 | `screenshots/dashboard-mobile-390.png` |
| 7 | Project Management — Desktop | 1440 × 900 | `screenshots/projects-desktop-1440.png` |
| 8 | Task Management — Desktop | 1440 × 900 | `screenshots/tasks-desktop-1440.png` |
| 9 | Design System Components | 1440 × auto | `screenshots/design-system-desktop-1440.png` |
| + | Case study, Contact (mobile), Inquiries | — | `case-study-desktop-1440.png`, `contact-mobile-390.png`, `inquiries-desktop-1440.png` |

Regenerate every screenshot with `npx playwright test --project=responsive -g "screenshots"` (from `frontend/`).

### Foundations to set up as Figma variables

- **Colour collection** with *Light* and *Dark* modes, names identical to the CSS tokens (`color/primary`, `color/surface-2`…). Values: `docs/design-system.md`.
- **Type styles:** Display, H1, H2, H3, Lead, Body, Small, Caption. Use the 1440px value; note the 375px value in the description.
- **Number variables:** spacing 4/8/12/16/24/32/48/64; radius 4/8/12/20/999.
- **Effect styles:** shadow/sm, shadow/md, shadow/lg.
- **Layout grids:** Desktop is 12 columns, 32px margin, 24px gutter, plus a 42% guide for the editorial axis. Tablet is 8 columns with 24px margins. Mobile is 4 columns with 16px margins.

---

## Handoff spec: Public website

### Overview
Marketing site for a fictional studio. The one job is to move a visitor from "who are these people" to "Start a project". Every portfolio item is labelled as fictional.

### Layout
Editorial axis: headings and running text start at 42% of the content width (≥1024px). Sections alternate between text pages on the ground colour and full-bleed colour fields (surface-2, primary, inverse). Section rhythm is `section-space` (80 / 136px).

### Design tokens used
| Token | Value | Usage |
|---|---|---|
| `color-bg` | #f6f4ef | Page ground |
| `color-primary` | #36539a | CTAs, active nav underline, CTA field |
| `color-accent` | #c8b48e | Masthead sand tile |
| `color-inverse` | #16171a | Footer field |
| `text-display` | 38–96px Manrope 800 | Hero, page titles, CTA headline |
| `text-lead` | 18–22px Inter | Standfirsts |
| `spacing-16` | 64px | Gap between work blocks (mobile 96px total) |

### Components
| Component | Variant | Notes |
|---|---|---|
| Header | desktop bar / mobile "Menu" dialog | Active link: 2px primary bar under the label (scaleX animation) |
| Masthead mosaic | 6×2 / 3×2 | Grayscale photos (contrast 1.05), flat tiles, a code-drawn interface crop |
| Service list | icon chip + H3 + text + "Learn more" | Two columns on the right of the axis; tint per service |
| Work block | oversized preview (bleeds left) + cluster | Heights vary 78 / 60 / 86 svh per block for rhythm |
| TokenPlayground | radius · accent · theme · density | Specimen updates instantly; generated CSS shown |
| ProjectCard | tint field + preview, meta, title, tech list | Whole card is one link (stretched title link) |
| ClosingCta | primary field | White button on blue; headline ≤ 14ch |
| Footer | name-first | Wordmark at 13.6vw, contact as large links, three link columns, photo credits |

### States and interactions
| Element | State | Behaviour |
|---|---|---|
| Primary button | Hover / Active / Focus | `primary-hover` · 1px press · 2px primary outline, 2px offset |
| Nav link | Hover / Current | Underline bar grows from the left / persists with `aria-current` |
| Portfolio filter chip | Pressed | Charcoal fill, `aria-pressed="true"`, count shown |
| Project card | Hover / focus-within | Preview rises 4% · 2px primary ring around the card |
| Contact submit | Loading | Spinner, "Sending…", disabled (no duplicate submissions) |
| Contact form | Error | Field ring `danger`, icon + message below, focus moves to first invalid field |
| Contact form | Server failure | Inline `role=alert` banner + error toast; answers kept |
| Contact form | Success | Form replaced by success panel with reference ID (focus moves to its heading) |

### Responsive behaviour
| Breakpoint | Changes |
|---|---|
| ≥1024 | Axis layout, full nav, 6×2 masthead, side-by-side work clusters |
| 768–1023 | Single-column sections, "Menu" dialog, two-column grids |
| <768 | 3×2 masthead, headline may wrap to 3 lines, filter chips scroll sideways, stacked forms |

### Animation / motion
| Element | Trigger | Animation | Duration | Easing |
|---|---|---|---|---|
| Hero headline lines | Load | Rise from behind baseline (masked) | 900ms, line 2 +110ms | ease-out-strong |
| Section parts | Enter viewport | Fade + rise 24px, staggered 80ms | 700ms | ease-out-strong |
| Masthead photo | Continuous | Slow scale drift 1.04 → 1.14 | 18s alternate | ease-in-out |
| All | `prefers-reduced-motion` | Durations collapse to 1ms; content always visible | — | — |

### Accessibility notes
Skip link first in focus order; one h1 per page; landmarks (header/nav/main/footer); descriptive alt text on photographs; interface previews are `role="img"` with a descriptive label; the mobile menu traps focus and restores it to "Menu" on Escape.

---

## Handoff spec: Workspace

### Overview
A demo project-management dashboard for studio staff: projects, clients, tasks, inquiries, team and settings. Same tokens as the public site, with a denser layout, cards with a 1px ring and `shadow-sm`, and an optional dark mode.

### Layout
256px sidebar (≥1024px), a 64px sticky top bar, content max-width 1400px with 32/24/16px padding. Page header: H1 (`text-h2`) + description + actions on the right.

### Components
| Component | Variant | Notes |
|---|---|---|
| Sidebar / Drawer | desktop fixed / mobile dialog | Active item: primary-soft background + primary text; Inquiries shows the new-count badge |
| Top bar | title, search (⌘/Ctrl K), notifications, account menu | Search opens a dialog with grouped results |
| StatCard | 6 metrics | Value from `/dashboard/summary`; whole card links to a filtered list |
| BarChartCard | single series | Value labels, tooltip, Table/Chart toggle |
| FilterPanel | inline / collapsed on mobile | "Clear filters" appears only when a filter is active |
| DataTable | sortable headers | Inline selects for status/assignee; row action menu |
| Kanban column/card | 4 statuses | Drag and drop plus a "Move to" select on every card |
| Detail panel | right drawer | Clients, inquiries, team |
| Form modal | create / edit | Shared zod validation with the API; server 422s map onto fields |

### States and interactions
| Element | State | Behaviour |
|---|---|---|
| Any list | Loading / Empty / Error | Skeleton matching the final layout / EmptyState with an action / ErrorState with "Try again" |
| Delete | Confirm | ConfirmDialog, focus on Cancel, shows progress, inline error on failure |
| Status change | Success / Failure | Success toast names the record / error toast, value unchanged |
| Kanban column | Drag over | primary-soft fill + 2px primary ring |
| Theme | Light / Dark / System | Applies instantly; stored per browser |

### Edge cases
- **Long names:** card titles wrap; table cells keep a min width; avatars truncate names in Kanban.
- **Overdue tasks:** due text turns `danger` and bold, with the word "Overdue".
- **Unknown record URL:** "Project not found" empty state with a way back.
- **Slow network:** 120–350ms simulated latency in mock mode keeps every loading state visible during demos.

### Accessibility notes
Every icon-only control has a name; every status pairs an icon and text; tables expose `aria-sort`; tabs, menus, dialogs and the switch follow WAI-ARIA patterns; automated axe checks pass in light and dark themes.
