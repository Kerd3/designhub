# Responsive guidelines

The mobile layouts are composed for the phone rather than shrunk from desktop. Every rule below is enforced by `frontend/tests/e2e/responsive.spec.js`, which loads 14 key pages at each target width and fails on any horizontal overflow.

## Breakpoints

| Name | Tailwind | Tested widths | Layout intent |
| --- | --- | --- | --- |
| Mobile | < 640 | **375, 390** | One column, 16px margins, thumb-reachable actions, filters behind a toggle |
| Large mobile / small tablet | `sm` ≥ 640 | — | Two-column form rows, 24px margins |
| Tablet | `md` ≥ 768 | **768** | Two-column grids, inline filters, more table columns |
| Laptop | `lg` ≥ 1024 | **1024** | Desktop navigation, workspace sidebar, the 42% editorial axis |
| Desktop | `xl` ≥ 1280 | **1280, 1440** | Three-column grids, every table column |

## Public website

- **Navigation:** a full bar from 1024px. Below that, a "Menu" button opens a full-screen dialog with large links, both CTAs, focus trap and Escape to close.
- **Home masthead:** a 6×2 mosaic on desktop; on phones a 3×2 mosaic of one photograph, one colour field and an interface crop. The headline wraps to three lines on phones (the brief's wording is kept intact).
- **Work blocks:** the oversized preview bleeds off the left edge on every width. The supporting cluster (phone preview, title, description) moves below it on phones.
- **Service sections:** specimen and text stack. Code specimens scroll inside their own focusable region instead of widening the page.
- **Portfolio filters:** chips scroll sideways on phones (no wrapping into tall blocks); the bar sticks under the header.
- **Forms:** two-column rows collapse to one; buttons go full width where they are the only action.

## Workspace

- **Shell:** a fixed 256px sidebar from 1024px. Below that, a hamburger opens a drawer (`role="dialog"`, focus trap, closes on navigation).
- **Top bar:** search becomes an icon button below 768px. The profile name shows from 1280px; the avatar is always visible.
- **Stat cards:** 2 per row on phones, 3 on tablet/laptop, 6 on wide desktop.
- **Tables:** columns marked `hideBelow` (client, priority, team…) drop at narrower widths; the rest scroll horizontally inside a keyboard-focusable region. Inline selects keep full 36px targets.
- **Kanban:** four columns side by side need 960px; on narrower screens the board scrolls sideways within itself, and each card's status select is the primary way to move tasks.
- **Dialogs:** centred on desktop; bottom sheets on phones, capped at `100dvh − 1rem` with internal scrolling. Detail views use a right-hand panel.
- **Charts:** `ResponsiveContainer` fills the card; height grows with the number of categories.

## Rules

1. Grid items that contain charts, tables or code get `min-w-0` (or `grid-cols-1`), so content cannot push the page wider.
2. Any `overflow-x-auto` container is also `position: relative`. Otherwise visually hidden (absolutely positioned) text inside it escapes and widens the page. This was a real bug caught by the overflow test.
3. Touch targets are at least 40×40px (most are 44px).
4. Never hide information on mobile; move it (into a disclosure, the next line or a detail panel).
5. Images declare `width`/`height` to prevent layout shift; below-the-fold images use `loading="lazy"`.
