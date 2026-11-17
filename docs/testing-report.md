# Testing report

Run date: 17 November 2026 · Node 24.17.0 · Playwright 1.65.1 (Chromium 159) · Windows 11.

## Summary

| Suite | Command | Result |
| --- | --- | --- |
| Backend API (node:test + supertest, memory driver) | `npm run test:api` | **20 / 20 passed** |
| E2E — desktop (1280px, mock API) | `npx playwright test --project=desktop` | **26 / 26 passed** |
| E2E — mobile (390px, Pixel 7 emulation) | `--project=mobile` | **5 / 5 passed** |
| E2E — real API (UI built with `VITE_DATA_SOURCE=api` → Express) | `--project=api` | **4 / 4 passed** |
| Responsive sweep, axe and screenshots | `--project=responsive` | **49 / 49 passed** |
| Production build | `npm run build` | Passes |

Total: **84 Playwright tests and 20 API tests**, all from runs in this session after the final code changes.

## What is covered

**Public website:** homepage content and metadata; navigation to every page with `aria-current`; services FAQ and the "Discuss a … project" link pre-filling the contact form; portfolio category filter, search, empty state and URL sync; case study sections, next/previous navigation and an unknown slug; contact validation (required fields, email, minimum length, character counter, focus on first error, `aria-invalid` and described-by); successful submission stored by the mock API with the button disabled in flight; failed submission (fault injection) showing an error and keeping the answers; 404 page with `noindex`; design-system modal focus and Escape behaviour.

**Workspace:** login redirect with `next`, validation, wrong password, show/hide password, demo credentials, password never stored; logout; dashboard statistics equal to the dataset (10/4/3/7/14/3), chart and table view; project search, status and priority filters; project create (with client-side date validation), edit, inline status change, delete with Cancel and Confirm; completion % persisted after reload; client add (URL validation), search, filter, detail panel and edit from the panel; client → associated projects; task create, move by select (keyboard alternative), drag and drop, filters and delete; task reassignment in table view; inquiry status change, archive and tab counts; a public submission appearing in the workspace and in the dashboard count; team filter and details; settings persistence (profile, dark theme across reload, notification toggle) and demo-data reset; global search (Ctrl+K); notifications and mark-as-read.

**Responsive:** at 1440, 1280, 1024, 768, 390 and 375px, every public page (7) and workspace page (7) renders its h1 with no horizontal overflow, and its navigation control is visible. Phone-specific tests cover the mobile menu, workspace drawer, collapsed filters and modals fitting the viewport.

**Accessibility:** axe-core with WCAG 2.0/2.1/2.2 A and AA rules on 7 public pages, the login page and 8 workspace views in **both light and dark themes**, with **zero violations**.

**API (Express):** health, 404 and 400 envelopes; summary equals the seed; inquiry create ignores a client-sent status; field errors on 422; status update preserves other fields; no deletion of inquiries/team; activity logging; sequential IDs; unknown foreign keys rejected; completion forces 100%; due-before-start rejected; cascade delete; optional client fields kept; task move/reassign; demo reset and its kill switch.

## Defects found by testing and fixed

| Defect | Found by | Fix |
| --- | --- | --- |
| Rapid filter changes (clear search, then pick a status) restored the old search: React Router's functional `setSearchParams` receives last-render params | Projects filter test (0 results instead of 3) | `useQueryParams` keeps the latest pending params in a ref; all six filtered pages migrated |
| Pages scrolled sideways at 1024, 768 and 390px on Clients, Inquiries and Tasks | Responsive sweep | Visually hidden (absolute) text inside `overflow-x-auto` escaped its scroller; scroll containers are now `position: relative` |
| Dashboard 449px wide on phones | Mobile test | Recharts inside an `auto`-width grid item; grids now use `grid-cols-1` (minmax(0,1fr)) |
| Service code specimens forced 640px width on phones | Responsive sweep | `min-w-0` on the figure; the `<pre>` scrolls internally |
| Success text 4.4:1 on its soft tint (WCAG AA needs 4.5) | axe | `--color-success` darkened to `#2a6e47` (5.2:1) |
| Account button, notification badge and workspace wordmark: visible text not part of the accessible name (WCAG 2.5.3) | axe | Decorative initials and counts drawn with CSS; wordmark name starts with its visible text |
| Tabs referenced panels that were not rendered (`aria-controls`) | axe (critical) | Only the selected tab with a panel sets `aria-controls` |
| Scrollable code blocks not keyboard-reachable | axe | `tabIndex=0` and a label on each `<pre>` |
| Low-contrast text inside interface previews | axe | Preview label colour darkened; no translucent text |
| Dialogs focused the close button instead of the first field | Design-system test | Focus trap prefers `[data-autofocus]`, then the first form field |
| Stacked overlays (edit dialog over a detail panel) would both trap Tab/Escape | Code review during build | Focus traps are stack-aware; only the top-most handles keys |
| "Exit demo" redirected to `login?next=/workspace` | Logout test | Guard skips `next` after an explicit logout |
| Each new inquiry appeared twice in notifications | Notifications test | Activity items about already-listed records are de-duplicated |
| A status-only `PATCH` would erase optional fields (zod `.partial()` re-applied `.default('')`) | Schema check before wiring | Removed defaults from optional fields; verified with a script |
| A new client's phone, website and notes were overwritten with `''` by the API | Code review, then API test | `onCreate` keeps submitted values |
| Workspace axe scans could run before the lazy route rendered (vacuous pass) | Blank documentation screenshot | All workspace waits require the page h1 before scanning |

## Not tested / limitations

- **PostgreSQL driver and Docker Compose were not executed.** The Docker daemon was not running on the build machine. The SQL schema, repository and Dockerfiles are written but unverified; the memory driver (same interface) is what the API tests exercise.
- Browsers: Chromium only (Firefox and WebKit projects can be added to `playwright.config.js`).
- No manual screen-reader pass (NVDA/VoiceOver) was performed; accessibility evidence is axe plus keyboard-focused E2E tests.
- No visual-regression baselines; screenshots are documentation, not assertions.

## How to run

```bash
npm install
npm run test:api
cd frontend && npx playwright test
```

The Playwright config starts three servers automatically: Vite in mock mode (5180), the Express API with the memory driver (5055) and Vite in API mode (5181).
