import { createPostgresRepository } from './postgresRepository.js';
import { loadSeed } from './seedData.js';

/** Replaces all PostgreSQL data with shared/demo-data.json (inside one transaction). */
const url = process.env.DATABASE_URL;
if (!url) {
  console.error('DATABASE_URL is required to seed the database.');
  process.exit(1);
}

const repo = createPostgresRepository(url);
try {
  await repo.reset();
  const seed = loadSeed();
  console.log(`[seed] loaded ${seed.projects.length} projects, ${seed.clients.length} clients, ${seed.tasks.length} tasks, ${seed.team.length} team members, ${seed.inquiries.length} inquiries`);
} finally {
  await repo.close();
}
