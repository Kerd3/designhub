# API documentation

Base URL: `http://localhost:5000/api` (configurable with `PORT`). The in-browser mock API implements the same routes, status codes and envelopes.

## Conventions

- JSON in and out. Successful responses: `{ "data": … }`. `204 No Content` has an empty body.
- Errors: `{ "error": { "message": "…", "details": { "field": "message" } } }`. `details` appears on `422` validation errors.
- IDs are readable strings (`pr-101`, `cl-01`, `tk-201`, `iq-301`, `tm-01`), assigned by the server.
- Dates are `YYYY-MM-DD`; timestamps are ISO 8601 UTC.
- `PATCH` accepts any subset of fields; unspecified fields are untouched.

| Status | Meaning |
| --- | --- |
| 200 / 201 / 204 | OK / created / deleted |
| 400 | Malformed JSON |
| 403 | Demo reset disabled |
| 404 | Unknown record or route |
| 405 | Operation not allowed for this resource |
| 409 / 413 | Duplicate (unique constraint) / body over 50 kB |
| 422 | Validation failed, or a referenced record does not exist |
| 500 | Unexpected error (message is generic; details logged server-side) |

## Endpoints

| Method | Path | Description |
| --- | --- | --- |
| GET | `/health` | `{ status: "ok", source: "memory" \| "postgres" }` |
| GET | `/dashboard/summary` | Totals and breakdowns computed from the data (see below) |
| GET | `/activities?limit=50` | Recent activity, newest first (1–100) |
| POST | `/demo/reset` | Restore the seed data (`ALLOW_DEMO_RESET`) |
| GET, POST | `/projects` | List / create |
| GET, PATCH, DELETE | `/projects/:id` | Read / update / delete (cascades to tasks) |
| GET, POST | `/clients` | List / create |
| GET, PATCH, DELETE | `/clients/:id` | Read / update / delete (cascades to projects and their tasks) |
| GET, POST | `/tasks` | List / create |
| GET, PATCH, DELETE | `/tasks/:id` | Read / update / delete |
| GET, POST | `/inquiries` | List / submit (public contact form) |
| GET, PATCH | `/inquiries/:id` | Read / update status. `DELETE` → 405 (archive instead) |
| GET | `/team`, `/team/:id` | Read team members |
| PATCH | `/team/:id` | Update `availability`. Create/delete → 405 |

## Schemas

Validation lives in [`shared/schemas.js`](../shared/schemas.js) and is identical on the client.

**Inquiry (POST /inquiries)**

| Field | Rules |
| --- | --- |
| `name` | required, 2–80 chars |
| `email` | required, valid email |
| `company` | optional, ≤ 100 |
| `projectType` | one of Website Design, Frontend Development, UI/UX Design, Web Application, Design System, API Integration, Other |
| `budget` | one of Under $5k, $5k–$10k, $10k–$25k, $25k–$50k, $50k+, Not sure yet |
| `description` | required, 30–1500 chars |

The server always sets `status: "new"` and `submittedAt`; client-supplied values are ignored.

**Project**: `name` (≤120), `clientId` (must exist), `description?` (≤1000), `category` (Website Design · UI/UX Design · Web Applications · Dashboard Design · E-commerce), `startDate`, `dueDate` (≥ start), `status` (planning · in-progress · review · completed · on-hold), `priority` (low · medium · high · urgent), `memberIds[]` (must exist), `progress` (0–100 integer; forced to 100 when status becomes `completed`).

**Client**: `companyName`, `contactPerson`, `email`, `industry` required; `phone?` (digits, spaces, `+()-.`), `website?` (full URL), `status` (active · onboarding · inactive), `notes?` (≤500). `clientSince` is set by the server.

**Task**: `title` (≤120), `description?` (≤600), `projectId`, `assigneeId` (must exist), `dueDate`, `priority`, `status` (todo · in-progress · in-review · completed).

## Dashboard summary

```json
{
  "data": {
    "totals": { "totalProjects": 10, "activeProjects": 4, "completedProjects": 3,
                "totalClients": 7, "pendingTasks": 14, "newInquiries": 3 },
    "projectsByStatus": [{ "key": "planning", "count": 2 }, …],
    "tasksByStatus": [{ "key": "todo", "count": 8 }, …],
    "overdueTasks": 0,
    "teamWorkload": [{ "memberId": "tm-01", "name": "Maya Okafor", "openTasks": 2, "activeProjects": 1 }, …]
  }
}
```

"Active" means `in-progress` or `review`. "Pending tasks" are tasks not `completed`. Values shown are for the seed data.

## Examples

```bash
curl -s http://localhost:5000/api/dashboard/summary
```

```bash
curl -s -X POST http://localhost:5000/api/inquiries -H "Content-Type: application/json" -d "{\"name\":\"Ana Lee\",\"email\":\"ana@lee.example\",\"projectType\":\"Website Design\",\"budget\":\"\$10k–\$25k\",\"description\":\"A portfolio website for our architecture practice.\"}"
```

```bash
curl -s -X PATCH http://localhost:5000/api/projects/pr-101 -H "Content-Type: application/json" -d "{\"status\":\"completed\"}"
```

## Frontend service layer

| Service | Methods |
| --- | --- |
| `projectService` | `list` `get` `create` `update` `remove` `updateStatus` `updateProgress` |
| `clientService` | `list` `get` `create` `update` `remove` |
| `taskService` | `list` `get` `create` `update` `remove` `updateStatus` `assign` |
| `inquiryService` | `list` `get` `submit` `updateStatus` `archive` |
| `teamService` | `list` `get` `updateAvailability` |
| `dashboardService` / `demoService` | `getSummary` `getActivity` / `reset` |

All return the unwrapped `data`, or throw `ApiError` with `status`, `details`, `isNetworkError`, `isNotFound` and `isValidation`.

### Mock fault injection

Set `localStorage["designhub.mock.fail"] = "POST /inquiries"` (comma-separated, `*` for all) to make matching mock requests return `503`. The Playwright suite uses this to test error states. `designhub.mock.latency` overrides simulated latency in milliseconds.
