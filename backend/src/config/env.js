/** Typed configuration from environment variables, with safe local defaults. */
const driver = (process.env.DB_DRIVER ?? (process.env.DATABASE_URL ? 'postgres' : 'memory')).toLowerCase();

if (!['postgres', 'memory'].includes(driver)) {
  throw new Error(`DB_DRIVER must be "postgres" or "memory" (got "${driver}")`);
}
if (driver === 'postgres' && !process.env.DATABASE_URL) {
  throw new Error('DB_DRIVER=postgres requires DATABASE_URL');
}

export const config = {
  port: Number(process.env.PORT ?? 5000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  dbDriver: driver,
  databaseUrl: process.env.DATABASE_URL,
  corsOrigins: (process.env.CORS_ORIGIN ?? 'http://localhost:5173,http://localhost:4173').split(',').map((o) => o.trim()).filter(Boolean),
  allowDemoReset: (process.env.ALLOW_DEMO_RESET ?? 'true') === 'true',
};
