import express from 'express';
import cors from 'cors';
import { createServices } from './modules/collections.js';
import { createApiRouter } from './routes/index.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

/**
 * Builds the Express app around a repository (memory or PostgreSQL).
 * Kept separate from server.js so tests can create isolated instances.
 */
export function createApp({ repo, config }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(cors({ origin: config.corsOrigins, methods: ['GET', 'POST', 'PATCH', 'DELETE'] }));
  app.use(express.json({ limit: '50kb' }));
  app.use((_req, res, next) => {
    res.set('X-Content-Type-Options', 'nosniff');
    res.set('Cache-Control', 'no-store');
    next();
  });

  const services = createServices(repo);
  app.use('/api', createApiRouter({ repo, services, config }));
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
