# Architecture

DesignHub is a single React application with two experiences that share one design system: the public studio website and the `/workspace` dashboard. Data flows through one service layer, which talks either to an in-browser mock API or to an Express + PostgreSQL backend.

```
┌──────────────────────────── frontend (React 19 + Vite) ────────────────────────────┐
│  pages/public/*        pages/workspace/*                                            │
│        │                      │                                                     │
│  layouts/PublicLayout   layouts/WorkspaceLayout (demo-session guard, theme, shell)  │
│        │                      │                                                     │
│  components/ui (design system)  components/{layout,dashboard,forms,portfolio}       │
│        │                      │                                                     │
│  hooks (useResource, useCollection, useLookups, useQueryParams, useFocusTrap…)      │
│        │                                                                            │
│  services/*Service.js ──► services/apiClient.js ──┬─► mock/mockServer.js (default)  │
│                                                   └─► fetch → VITE_API_BASE_URL     │
└────────────────────────────────────────────────────┬───────────────────────────────┘
                                                     │ REST, JSON { data } / { error }
┌──────────────────────── backend (Express 5) ───────▼───────────────────────────────┐
│  routes/index.js → services/collectionService.js → repository                      │
│                                         ├─ memoryRepository (dev, tests)            │
│                                         └─ postgresRepository (pg, Docker)          │
└────────────────────────────────────────────────────────────────────────────────────┘
                 shared/  demo-data.json · domain.js · schemas.js (used by both sides)
```

## Key decisions

| Decision | Why |
| --- | --- |
| **One `shared/` package for data, rules and validation** | The mock API, the Express API and the React forms all import the same zod schemas and the same `computeDashboardSummary()`. Dashboard numbers cannot drift between data sources, and client and server validation always agree. |
| **Swap the transport, not the services** | `apiClient` exposes `get/post/patch/del`. With `VITE_DATA_SOURCE=mock` it routes to `mockServer.handleMockRequest()`, which returns the same `{ data }` / `{ error: { message, details } }` envelope, status codes (201, 204, 404, 422, 503) and simulated latency as the backend. Pages and services are identical in both modes; the Playwright `api` project proves it by running the same UI against Express. |
| **Mock API persists to `localStorage`** | Visitors can create, edit and delete records and see them survive a reload, with no server. *Settings → Demo data → Reset* restores the seed. |
| **No global state library** | Server data lives in `useResource` / `useCollection` hooks per page. Cross-cutting state is limited to three small contexts: auth (demo session), settings (preferences) and toasts. |
| **Lists update only after the server confirms** | `useCollection.create/update/remove` change local state after the request resolves, so the UI never shows a success that did not happen. |
| **Filters live in the URL** | `/workspace/projects?status=active&priority=high` is shareable and survives reloads. `useQueryParams` composes rapid consecutive updates (React Router's functional updater sees last-render params, which dropped changes; found by Playwright). |
| **Route-level code splitting** | Every page except Home is lazy-loaded; Recharts (≈110 kB gzip) only downloads on the dashboard. |
| **Demo access, not authentication** | `authService` compares input with a published demo account in the browser and stores only `{ name, email, startedAt }`. It is labelled as such on the login page. Real auth would move to the backend (sessions or OAuth) and is out of scope. |

## Frontend structure

```
frontend/src/
  components/
    ui/          29 design-system components (Button … NavigationItem), barrel in index.js
    layout/      PublicHeader, PublicFooter, Wordmark, WorkspaceSidebar/Drawer, WorkspaceTopbar,
                 GlobalSearch, NotificationsMenu
    dashboard/   PageHeader, StatCard, BarChartCard, ActivityFeed
    forms/       ProjectFormModal, ClientFormModal, TaskFormModal, formHelpers
    portfolio/   ProjectPreview (code-drawn interfaces), ProjectCard, TokenPlayground
  pages/public/      Home, Services, Work, CaseStudy, About, Contact, DesignSystem, NotFound
  pages/workspace/   Login, Overview, Projects, ProjectDetail, Clients, Tasks, Inquiries, Team, Settings
  layouts/       PublicLayout, WorkspaceLayout
  hooks/         useResource/useCollection, useLookups, useNotifications, useQueryParams,
                 useFocusTrap, useReveal, usePageMeta, useMisc
  services/      apiClient, mock/mockServer, resourceService, project/client/task/inquiry/team/
                 dashboard/auth services
  context/       AuthContext, SettingsContext
  data/          portfolio.js (case studies), studio.js (services, process, FAQ, team, contact)
  styles/        index.css (design tokens + base + layout utilities)
```

## Backend structure

```
backend/src/
  config/env.js              typed env config (driver, CORS, demo reset flag)
  database/                  memoryRepository, postgresRepository, migrate.js, seed.js, seedData.js
  services/collectionService business rules: validation, FK checks, activity log, cascades
  modules/collections.js     per-module rules (projects/clients/tasks/inquiries/team)
  routes/index.js            REST routes, dashboard summary, activities, demo reset
  middleware/errorHandler.js error envelope, JSON/PG error mapping, no stack traces
  app.js / server.js         app factory (testable) and process entry
database/migrations/001_initial_schema.sql   tables, FKs with ON DELETE CASCADE, CHECK constraints
```

## Request lifecycle (example: change a task's status on the board)

1. `TaskCard` select or drag-and-drop calls `move(task, 'in-review')` in `TasksPage`.
2. `useCollection.update` → `taskService.updateStatus` → `apiClient.patch('/tasks/tk-202', { status })`.
3. Mock or Express validates with `taskPatchSchema`, checks references, writes, appends an activity entry.
4. On `200`, the hook replaces the task in local state and the page shows a success toast. On error, an error toast appears and the board does not move.
5. On the next navigation, the workspace shell refreshes sidebar counts and notifications.

## Security notes

- No secrets in the frontend; `VITE_*` variables are documented as public.
- The API validates every body with zod, rejects unknown references, caps JSON at 50 kB, maps PostgreSQL constraint errors to 4xx and never returns stack traces.
- SQL uses parameterised queries; table and column names come only from a fixed map.
- `POST /api/demo/reset` exists for the portfolio demo and can be disabled with `ALLOW_DEMO_RESET=false`.
- Not included (deliberately, for a frontend portfolio): authentication, rate limiting and CSRF protection on the API. These would be required before real deployment with real data.
