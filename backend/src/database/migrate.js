import { readdirSync, readFileSync } from 'node:fs';
import pg from 'pg';

/** Applies every SQL file in database/migrations in name order. Each file is idempotent. */
const dir = new URL('../../../database/migrations/', import.meta.url);
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required to run migrations.');
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.sql')).sort()) {
    await client.query(readFileSync(new URL(file, dir), 'utf8'));
    console.log(`[migrate] applied ${file}`);
  }
} finally {
  await client.end();
}
