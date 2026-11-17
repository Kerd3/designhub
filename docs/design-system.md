# Design system

All tokens are defined once, in the `@theme` block of [`frontend/src/styles/index.css`](../frontend/src/styles/index.css). Tailwind's default colour, type, radius and shadow scales are **cleared** (`--color-*: initial`), so a component can only use a token. A live specimen of everything below is at **`/design-system`**.

## Brand

**DesignHub Studio**: a fictional digital design and development studio. The personality is modern, minimal, approachable and technology-focused. The public site is editorial: a 42% text axis, large type, and flat colour fields. The workspace is calm and productivity-focused. Both share the same tokens and components.

Logo: a rounded charcoal square containing a "D" counter and a blue bar (`LogoMark` in `Wordmark.jsx`).

## Colour

| Token | Light | Dark | Use |
| --- | --- | --- | --- |
| `--color-primary` | `#36539a` | `#93a9e2` | Actions, links, focus ring, active nav. 7.3:1 with white |
| `--color-primary-hover` | `#2b4482` | `#aebfeb` | Hover on primary |
| `--color-primary-soft` | `#e3e8f3` | `#232c44` | Active nav background, primary badge |
| `--color-secondary` | `#16171a` | `#ecebe6` | Secondary (charcoal) button, strong UI |
| `--color-accent` | `#c8b48e` | — | Flat sand field on marketing pages only |
| `--color-bg` | `#f6f4ef` | `#121316` | Page ground (warm off-white) |
| `--color-surface` | `#ffffff` | `#1a1b1f` | Cards, inputs, dialogs |
| `--color-surface-2 / -3` | `#efece5 / #e5e1d7` | `#212328 / #2a2c32` | Tone steps between surfaces |
| `--color-border` | `#dedad1` | `#30333a` | Data UI dividers and card rings |
| `--color-ink` | `#16171a` | `#ecebe6` | Text |
| `--color-muted` | `#5b5e66` | `#a4a7ae` | Secondary text (5.9:1 on bg) |
| `--color-success` | `#2a6e47` | `#74c495` | Completed, saved (5.2:1 on its soft tint) |
| `--color-warning` | `#8f5b0c` | `#e3b061` | Needs attention |
| `--color-danger` | `#b3261e` | `#f2918a` | Errors, destructive actions |
| `--color-info` | `#286688` | `#77b8dc` | Neutral notices |
| `--color-inverse*` | `#16171a` + `#f6f4ef` | — | Footer and inverted fields |

Every feedback colour has a `-soft` background variant. **Status never relies on colour alone**: `StatusBadge` and `PriorityBadge` always pair the colour with an icon and a word.

### Chart colours

`--color-chart-1…4` are categorical slots in fixed order. They were checked with the dataviz skill's validator (lightness band, chroma floor, colour-vision-deficiency and normal-vision separation). All checks pass in both themes. The light-mode contrast warning is met with direct value labels and a table view on every chart. The two dashboard charts are single-series, so they use only slot 1 and show no legend.

## Typography

| Token | Size (fluid 375→1440px) | Line height | Tracking | Family / weight |
| --- | --- | --- | --- | --- |
| `text-display` | 38 → 96px | 0.98 | −0.04em | Manrope 800 |
| `text-h1` | 32 → 56px | 1.04 | −0.03em | Manrope 700 |
| `text-h2` | 26 → 40px | 1.12 | −0.022em | Manrope 700 |
| `text-h3` | 19 → 24px | 1.28 | −0.012em | Manrope 700 |
| `text-lead` | 18 → 22px | 1.5 | 0 | Inter 400 |
| `text-body` | 16px | 1.6 | 0 | Inter 400 |
| `text-small` | 14px | 1.5 | 0 | Inter 400/500 |
| `text-caption` | 13px | 1.4 | 0 | Inter 500 |

Headings use `text-wrap: balance`; paragraphs use `pretty`. Nothing that people read is smaller than 13px. Data previews drawn as interface pictures are the only exception.

## Spacing, radius, shadow

- **Spacing:** Tailwind's 4px base. The documented steps are `1`=4, `2`=8, `3`=12, `4`=16, `6`=24, `8`=32, `12`=48, `16`=64px. Page margins are 16 / 24 / 32px (`page-container`). Section rhythm is 80px on mobile and 136px on desktop (`section-space`).
- **Radius:** `sm` 4px (tags, focus), `md` 8px (buttons, inputs), `lg` 12px (cards), `xl` 20px (panels, dialogs), `full` (badges, avatars).
- **Shadow:** `sm` (resting cards in the workspace), `md` (hover lift, menus), `lg` (dialogs, toasts). Marketing pages separate surfaces with tone steps instead of shadows.
- **Motion:** `--ease-out-strong` `cubic-bezier(0.16,1,0.3,1)`. Masked headline rise (900ms), section entrances (700ms, staggered 80ms), dialog (220ms), drawer/panel (260ms), toast (260ms). Everything collapses to ~1ms under `prefers-reduced-motion`, and content is visible without JavaScript.

## Grid

- **Public:** 12-column logic inside `page-container` (max 1440px). `axis-grid` splits the width 42 / 58 from 1024px up; headings and running text align to the 42% axis.
- **Workspace:** 256px sidebar from 1024px; content max 1400px; card grids of 1 / 2 / 3 / 6 columns at 0 / 640 / 768–1280 / 1536px.

## Components (`frontend/src/components/ui`)

| Component | Variants / key props | Behaviour and accessibility |
| --- | --- | --- |
| `Button` | `primary` `secondary` `outline` `ghost` `danger` `link`; `sm` `md` `lg`; `loading`, `leftIcon`, `rightIcon`, `to`/`href` | Renders `<button>`, `<Link>` or `<a>`. Loading disables it, shows a spinner and sets `aria-busy` |
| `IconButton` | `ghost` `outline` `solid` `danger`; `badge` | `label` is required (accessible name and tooltip). The badge is drawn with CSS so the name stays accurate |
| `Input` | default, focused, disabled, invalid (`error`), helper (`hint`), `leftIcon`, `rightSlot` | `Field` wires the label, `aria-describedby` and `aria-invalid`. The error has an icon |
| `Textarea` | `maxLength` + `valueLength` | Live character counter (announced via described-by) |
| `Select` | `placeholder`, `size` | Native select for full keyboard and screen-reader support |
| `Checkbox`, `RadioButton`/`RadioGroup`, `Toggle` | `description` | Toggle is `role="switch"` with `aria-checked` |
| `Badge` | `success` `warning` `danger` `info` `neutral` `primary` `outline` | Optional icon |
| `StatusBadge`, `PriorityBadge` | every domain status/priority | Colour + icon + label |
| `Card`, `CardHeader` | `default` `muted` `outline`; `interactive` | Hover lift for clickable cards |
| `Modal` | `dialog` (bottom sheet on phones) / `panel` (right drawer); `sm` `md` `lg` | Focus trap (stack-aware), Escape, restores focus, initial focus on first field |
| `ConfirmDialog` | `tone` | Focus starts on Cancel; stays open with progress until the action settles; shows errors inline |
| `Dropdown` | `items`, `header`, `align` | WAI-ARIA menu button: arrows, Home/End, Escape returns focus |
| `Tooltip` | `side` | Hover and focus, Escape dismisses, `aria-describedby` |
| `Tabs` | controlled/uncontrolled, `count` | WAI-ARIA tabs, automatic activation, arrow/Home/End |
| `SegmentedControl` | icon + label | `radiogroup` semantics (view switching) |
| `Breadcrumb`, `Pagination`, `NavigationItem` | — | `aria-current="page"` everywhere |
| `DataTable` | `columns` (sortable, hideBelow), `pageSize`, `emptyState` | `aria-sort`, focusable scroll region, low-priority columns hide on narrow screens |
| `SearchInput`, `FilterPanel` | — | Escape clears search. On phones the filters collapse behind "Filters (n)" |
| `Toast` (`useToast`) | `success` `error` `info` | Polite live region. Errors are `role="alert"`. Pause on hover/focus, dismissible |
| `EmptyState`, `LoadingState`, `ErrorState`, `Skeleton`, `SkeletonLoader` | `cards` `table` `stats` | Loading uses `role="status"`; error uses `role="alert"` with retry |
| `Avatar`, `AvatarGroup`, `ProgressBar` | `xs`–`xl` | Initials on neutral tones only (the team is fictional). Decorative initials are drawn with CSS |

## Polish rules (the seven-principles pass)

| Principle | Rule in this codebase |
| --- | --- |
| Focal point | One `primary` (blue) action per screen. The header "Start a project" is `secondary` (charcoal) so the page's own CTA is the focal point. Stat cards are whole-card links with no accent-coloured "View" text. The top bar shows a quiet location line, not a second title. The notification count includes only actionable items (new inquiries, due tasks). |
| Spacing | Only 4px-multiple spacing utilities. Half steps (`*-0.5`, `*-1.5`, `*-2.5`, `*-3.5`) are not used for padding, margin, gap or inset, except in code-drawn interface previews. |
| Typography | Eight type tokens, no one-off sizes. Workspace card titles are 16px semibold; page titles are `text-h3`. Hierarchy comes from weight and ink/muted colour first, size second. Labels use sentence case. |
| Colour | Neutrals (bg, surface, sand) for every field and decoration. Blue is reserved for actions, links, focus, selection and the active nav item. Success/warning/danger/info appear only as status. Single-series charts use `--color-chart-bar` (neutral). |
| Real content | No placeholder people or companies; every name and number is specific (and labelled fictional). |
| Details | Radius steps tighten inward (`xl` container → `lg` card → `md` control → `sm` tag). Borders are 1px rings; shadows are layered and tinted with the charcoal ink. Icons beside text use `icon-align-4/5/2`, which centres them on the first line box (`(1lh − icon) / 2`) instead of margin nudges. |
| Motion | Menus, popovers and tooltips grow from their trigger (`origin-*` + `animate-pop-in`, 160ms). Dialogs rise 220ms, panels slide from their edge, and section reveals are 500ms with 16px travel. All collapse under reduced motion. |

## Rules of use

1. Use tokens, never hex values, in components. Tailwind will not even generate a non-token colour class.
2. One primary action per view. Destructive actions always go through `ConfirmDialog`.
3. Every data view handles loading, empty, error and success.
4. Never communicate state by colour alone.
5. Icons come from `lucide-react` only, at 16px (inline) or 20px (controls), stroke 2.
