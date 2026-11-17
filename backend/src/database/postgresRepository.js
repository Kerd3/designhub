import pg from 'pg';
import { loadSeed } from './seedData.js';

// Return DATE columns as "YYYY-MM-DD" strings, matching the API contract.
pg.types.setTypeParser(1082, (value) => value);

/** camelCase API fields ↔ snake_case columns, per collection. */
export const TABLES = {
  clients: { table: 'clients', columns: { id: 'id', companyName: 'company_name', contactPerson: 'contact_person', email: 'email', phone: 'phone', industry: 'industry', website: 'website', status: 'status', clientSince: 'client_since', notes: 'notes' } },
  team: { table: 'team_members', columns: { id: 'id', name: 'name', email: 'email', role: 'role', department: 'department', availability: 'availability', capacityHours: 'capacity_hours', location: 'location', bio: 'bio', skills: 'skills' } },
  projects: { table: 'projects', columns: { id: 'id', name: 'name', clientId: 'client_id', description: 'description', category: 'category', startDate: 'start_date', dueDate: 'due_date', status: 'status', priority: 'priority', memberIds: 'member_ids', progress: 'progress' } },
  tasks: { table: 'tasks', columns: { id: 'id', title: 'title', description: 'description', projectId: 'project_id', assigneeId: 'assignee_id', dueDate: 'due_date', priority: 'priority', status: 'status' } },
  inquiries: { table: 'inquiries', columns: { id: 'id', name: 'name', email: 'email', company: 'company', projectType: 'project_type', budget: 'budget', description: 'description', submittedAt: 'submitted_at', status: 'status' } },
  activities: { table: 'activities', columns: { id: 'id', type: 'type', message: 'message', entityId: 'entity_id', actor: 'actor', at: 'at' } },
};
/** Insert order respects foreign keys. */
export const SEED_ORDER = ['clients', 'team', 'projects', 'tasks', 'inquiries', 'activities'];

function toRecord(collection, row) {
  const out = {};
  for (const [key, column] of Object.entries(TABLES[collection].columns)) {
    const value = row[column];
    out[key] = value instanceof Date ? value.toISOString() : value;
  }
  return out;
}

function columnsAndValues(collection, record) {
  const entries = Object.entries(TABLES[collection].columns).filter(([key]) => record[key] !== undefined);
  return { columns: entries.map(([, c]) => c), values: entries.map(([k]) => record[k]) };
}

export async function insertRecord(client, collection, record) {
  const { table } = TABLES[collection];
  const { columns, values } = columnsAndValues(collection, record);
  const placeholders = values.map((_, i) => `$${i + 1}`).join(', ');
  const { rows } = await client.query(`INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders}) RETURNING *`, values);
  return toRecord(collection, rows[0]);
}

/** PostgreSQL repository. Table and column names come only from TABLES, never from input. */
export function createPostgresRepository(databaseUrl) {
  const pool = new pg.Pool({ connectionString: databaseUrl, max: 10 });

  return {
    driver: 'postgres',
    pool,
    async list(collection) {
      const { table } = TABLES[collection];
      const { rows } = await pool.query(`SELECT * FROM ${table} ORDER BY id DESC`);
      return rows.map((r) => toRecord(collection, r));
    },
    async get(collection, id) {
      const { rows } = await pool.query(`SELECT * FROM ${TABLES[collection].table} WHERE id = $1`, [id]);
      return rows[0] ? toRecord(collection, rows[0]) : null;
    },
    async listIds(collection) {
      const { rows } = await pool.query(`SELECT id FROM ${TABLES[collection].table}`);
      return rows;
    },
    async insert(collection, record) {
      return insertRecord(pool, collection, record);
    },
    async update(collection, id, record) {
      const { columns, values } = columnsAndValues(collection, { ...record, id: undefined });
      const sets = columns.map((c, i) => `${c} = $${i + 1}`).join(', ');
      const { rows } = await pool.query(`UPDATE ${TABLES[collection].table} SET ${sets} WHERE id = $${values.length + 1} RETURNING *`, [...values, id]);
      return rows[0] ? toRecord(collection, rows[0]) : null;
    },
    async remove(collection, id) {
      const { rows } = await pool.query(`DELETE FROM ${TABLES[collection].table} WHERE id = $1 RETURNING *`, [id]);
      return rows[0] ? toRecord(collection, rows[0]) : null;
    },
    async listActivities(limit = 50) {
      const { rows } = await pool.query('SELECT * FROM activities ORDER BY at DESC LIMIT $1', [limit]);
      return rows.map((r) => toRecord('activities', r));
    },
    async insertActivity(activity) {
      await insertRecord(pool, 'activities', activity);
    },
    async reset() {
      const seed = loadSeed();
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await client.query('TRUNCATE activities, tasks, projects, inquiries, team_members, clients');
        for (const collection of SEED_ORDER) {
          for (const record of seed[collection]) await insertRecord(client, collection, record);
        }
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    },
    async close() {
      await pool.end();
    },
  };
}
