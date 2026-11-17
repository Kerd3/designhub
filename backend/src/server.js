import { config } from './config/env.js';
import { createApp } from './app.js';
import { createMemoryRepository } from './database/memoryRepository.js';
import { createPostgresRepository } from './database/postgresRepository.js';

const repo = config.dbDriver === 'postgres' ? createPostgresRepository(config.databaseUrl) : createMemoryRepository();
const app = createApp({ repo, config });

const server = app.listen(config.port, () => {
  console.log(`[api] DesignHub API on http://localhost:${config.port}/api (driver: ${repo.driver})`);
  if (repo.driver === 'memory') console.log('[api] Memory driver: data resets when the server restarts.');
});

async function shutdown(signal) {
  console.log(`[api] ${signal} received, shutting down`);
  server.close(async () => {
    await repo.close();
    process.exit(0);
  });
}
process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
