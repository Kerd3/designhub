import { loadSeed } from './seedData.js';

/**
 * In-memory repository with the same interface as the PostgreSQL repository.
 * Used for local development without a database and for the API tests.
 * Cascades mirror the SQL foreign keys (ON DELETE CASCADE).
 */
export function createMemoryRepository(seed = loadSeed()) {
  let db = structuredClone(seed);

  return {
    driver: 'memory',
    async list(collection) {
      return structuredClone(db[collection]);
    },
    async get(collection, id) {
      const found = db[collection].find((r) => r.id === id);
      return found ? structuredClone(found) : null;
    },
    async listIds(collection) {
      return db[collection].map((r) => ({ id: r.id }));
    },
    async insert(collection, record) {
      db[collection] = [structuredClone(record), ...db[collection]];
      return structuredClone(record);
    },
    async update(collection, id, record) {
      db[collection] = db[collection].map((r) => (r.id === id ? structuredClone(record) : r));
      return structuredClone(record);
    },
    async remove(collection, id) {
      const found = db[collection].find((r) => r.id === id);
      if (!found) return null;
      db[collection] = db[collection].filter((r) => r.id !== id);
      if (collection === 'clients') {
        const projectIds = db.projects.filter((p) => p.clientId === id).map((p) => p.id);
        db.projects = db.projects.filter((p) => p.clientId !== id);
        db.tasks = db.tasks.filter((t) => !projectIds.includes(t.projectId));
      }
      if (collection === 'projects') db.tasks = db.tasks.filter((t) => t.projectId !== id);
      return found;
    },
    async listActivities(limit = 50) {
      return structuredClone([...db.activities].sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit));
    },
    async insertActivity(activity) {
      db.activities = [activity, ...db.activities].slice(0, 200);
    },
    async reset() {
      db = structuredClone(seed);
    },
    async close() {},
  };
}
