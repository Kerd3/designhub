import { nextId, describeChange, activityTypeFor } from '../../../shared/domain.js';
import { fieldErrors } from '../../../shared/schemas.js';
import { HttpError, notFound, unprocessable } from '../utils/httpError.js';

const SINGULAR = { projects: 'project', clients: 'client', tasks: 'task', inquiries: 'inquiry', team: 'team member' };

/**
 * Business rules for one collection, independent of HTTP and of the storage driver.
 * Validation uses the same zod schemas as the frontend forms.
 */
export function createCollectionService(repo, collection, { createSchema, patchSchema, onCreate, onUpdate, references = {} }) {
  const label = SINGULAR[collection];

  async function logActivity(action, record, before) {
    const existing = await repo.listIds('activities');
    await repo.insertActivity({
      id: nextId('activities', existing),
      type: activityTypeFor(collection),
      message: describeChange(collection, action, record, before),
      entityId: record.id,
      actor: collection === 'inquiries' && action === 'create' ? 'Website form' : 'Workspace user',
      at: new Date().toISOString(),
    });
  }

  /** Foreign keys checked up front so the client gets a field error, not a 500. */
  async function checkReferences(record) {
    const errors = {};
    for (const [field, target] of Object.entries(references)) {
      const value = record[field];
      if (value === undefined) continue;
      const ids = Array.isArray(value) ? value : [value];
      for (const id of ids) {
        if (!(await repo.get(target, id))) errors[field] = `Unknown ${SINGULAR[target]}: ${id}`;
      }
    }
    if (Object.keys(errors).length) throw unprocessable(errors);
  }

  return {
    list: () => repo.list(collection),

    async get(id) {
      const record = await repo.get(collection, id);
      if (!record) throw notFound(label);
      return record;
    },

    async create(input) {
      if (!createSchema) throw new HttpError(405, `New ${label} records cannot be created through the API.`);
      const parsed = createSchema.safeParse(input);
      if (!parsed.success) throw unprocessable(fieldErrors(parsed.error));
      await checkReferences(parsed.data);
      const ids = await repo.listIds(collection);
      const record = { id: nextId(collection, ids), ...parsed.data, ...(onCreate?.(parsed.data) ?? {}) };
      const created = await repo.insert(collection, record);
      await logActivity('create', created);
      return created;
    },

    async update(id, patch) {
      const before = await repo.get(collection, id);
      if (!before) throw notFound(label);
      const parsed = patchSchema.safeParse(patch ?? {});
      if (!parsed.success) throw unprocessable(fieldErrors(parsed.error));
      if (Object.keys(parsed.data).length === 0) throw unprocessable({ _: 'Send at least one field to update.' });
      await checkReferences(parsed.data);
      const merged = { ...before, ...parsed.data, ...(onUpdate?.(parsed.data, before) ?? {}) };
      if (merged.startDate && merged.dueDate && merged.dueDate < merged.startDate) {
        throw unprocessable({ dueDate: 'Due date must be on or after the start date' });
      }
      const updated = await repo.update(collection, id, merged);
      await logActivity('update', updated, before);
      return updated;
    },

    async remove(id) {
      if (collection === 'team' || collection === 'inquiries') throw new HttpError(405, `${label[0].toUpperCase()}${label.slice(1)} records cannot be deleted. Archive them instead.`);
      const removed = await repo.remove(collection, id);
      if (!removed) throw notFound(label);
      await logActivity('delete', removed);
    },
  };
}
