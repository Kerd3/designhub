/**
 * In-browser mock REST API. It mirrors the Express backend's routes,
 * validation and response envelope, so the frontend cannot tell them apart.
 * State lives in localStorage under STORAGE_KEY and can be reset to the seed.
 *
 * Fault injection (for tests and demos): set localStorage
 * "designhub.mock.fail" to a request such as "POST /inquiries" and that
 * request responds with 503 until the key is removed.
 */
import seed from '@shared/demo-data.json';
import { computeDashboardSummary, nextId, describeChange, activityTypeFor } from '@shared/domain.js';
import {
  inquirySchema, inquiryStatusSchema, projectSchema, projectPatchSchema, clientSchema, clientPatchSchema,
  taskSchema, taskPatchSchema, teamPatchSchema, fieldErrors,
} from '@shared/schemas.js';

const STORAGE_KEY = 'designhub.db.v1';
const FAIL_KEY = 'designhub.mock.fail';

const COLLECTIONS = {
  projects: { create: projectSchema, patch: projectPatchSchema },
  clients: { create: clientSchema, patch: clientPatchSchema },
  tasks: { create: taskSchema, patch: taskPatchSchema },
  inquiries: { create: inquirySchema, patch: inquiryStatusSchema.partial() },
  team: { create: null, patch: teamPatchSchema },
};

const freshDb = () => structuredClone({
  projects: seed.projects,
  clients: seed.clients,
  tasks: seed.tasks,
  inquiries: seed.inquiries,
  team: seed.team,
  activities: seed.activities,
});

let db = load();

function load() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    /* storage blocked or corrupted: fall back to the seed */
  }
  return freshDb();
}

function save() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full or blocked: keep working in memory */
  }
}

export function resetMockDatabase() {
  db = freshDb();
  save();
}

const ok = (data, status = 200) => ({ status, payload: { data } });
const fail = (status, message, details) => ({ status, payload: { error: { message, ...(details ? { details } : {}) } } });

function shouldFail(method, path) {
  try {
    const rule = window.localStorage.getItem(FAIL_KEY);
    if (!rule) return false;
    return rule.split(',').map((r) => r.trim()).some((r) => r === '*' || r === `${method} ${path}` || r === `${method} ${path.split('/').slice(0, 2).join('/')}`);
  } catch {
    return false;
  }
}

function logActivity(collection, action, record, before) {
  const entry = {
    id: nextId('activities', db.activities),
    type: activityTypeFor(collection),
    message: describeChange(collection, action, record, before),
    entityId: record.id,
    actor: collection === 'inquiries' && action === 'create' ? 'Website form' : 'You',
    at: new Date().toISOString(),
  };
  db.activities = [entry, ...db.activities].slice(0, 50);
}

export function handleMockRequest(method, rawPath, body) {
  const [path] = rawPath.split('?');
  if (shouldFail(method, path)) return fail(503, 'The service is temporarily unavailable. Please try again.');

  const segments = path.split('/').filter(Boolean);
  const [resource, id] = segments;

  if (resource === 'health' && method === 'GET') return ok({ status: 'ok', source: 'mock' });

  if (resource === 'dashboard' && id === 'summary' && method === 'GET') {
    return ok(computeDashboardSummary(db));
  }
  if (resource === 'activities' && method === 'GET') return ok(db.activities);

  if (resource === 'demo' && id === 'reset' && method === 'POST') {
    resetMockDatabase();
    return ok({ reset: true });
  }

  const config = COLLECTIONS[resource];
  if (!config) return fail(404, `No route for ${method} ${path}`);
  const items = db[resource];

  if (!id) {
    if (method === 'GET') return ok(items);
    if (method === 'POST') {
      if (!config.create) return fail(405, 'Method not allowed');
      const parsed = config.create.safeParse(body);
      if (!parsed.success) return fail(422, 'Some fields need attention.', fieldErrors(parsed.error));
      const now = new Date().toISOString();
      const record = {
        id: nextId(resource, items),
        ...parsed.data,
        ...(resource === 'inquiries' ? { status: 'new', submittedAt: now } : {}),
        ...(resource === 'clients' ? { clientSince: now.slice(0, 10) } : {}),
      };
      db[resource] = [record, ...items];
      logActivity(resource, 'create', record);
      save();
      return ok(record, 201);
    }
    return fail(405, 'Method not allowed');
  }

  const index = items.findIndex((item) => item.id === id);
  if (index === -1) return fail(404, 'We could not find that record. It may have been deleted.');

  if (method === 'GET') return ok(items[index]);

  if (method === 'PATCH') {
    const parsed = config.patch.safeParse(body);
    if (!parsed.success) return fail(422, 'Some fields need attention.', fieldErrors(parsed.error));
    const before = items[index];
    const updated = { ...before, ...parsed.data };
    if (resource === 'projects' && updated.dueDate < updated.startDate) {
      return fail(422, 'Some fields need attention.', { dueDate: 'Due date must be on or after the start date' });
    }
    if (resource === 'projects' && parsed.data.status === 'completed') updated.progress = 100;
    db[resource] = items.map((item, i) => (i === index ? updated : item));
    logActivity(resource, 'update', updated, before);
    save();
    return ok(updated);
  }

  if (method === 'DELETE') {
    if (resource === 'team') return fail(405, 'Team members cannot be deleted in the demo.');
    const [removed] = items.splice(index, 1);
    db[resource] = [...items];
    if (resource === 'projects') db.tasks = db.tasks.filter((t) => t.projectId !== id);
    if (resource === 'clients') {
      const projectIds = db.projects.filter((p) => p.clientId === id).map((p) => p.id);
      db.projects = db.projects.filter((p) => p.clientId !== id);
      db.tasks = db.tasks.filter((t) => !projectIds.includes(t.projectId));
    }
    logActivity(resource, 'delete', removed);
    save();
    return { status: 204, payload: null };
  }

  return fail(405, 'Method not allowed');
}
