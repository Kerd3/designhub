import { Router } from 'express';
import { computeDashboardSummary } from '../../../shared/domain.js';
import { HttpError } from '../utils/httpError.js';

/** Standard REST routes for one collection: GET list, GET one, POST, PATCH, DELETE. */
function collectionRouter(service) {
  const router = Router();
  router.get('/', async (_req, res) => res.json({ data: await service.list() }));
  router.get('/:id', async (req, res) => res.json({ data: await service.get(req.params.id) }));
  router.post('/', async (req, res) => res.status(201).json({ data: await service.create(req.body) }));
  router.patch('/:id', async (req, res) => res.json({ data: await service.update(req.params.id, req.body) }));
  router.delete('/:id', async (req, res) => {
    await service.remove(req.params.id);
    res.status(204).end();
  });
  return router;
}

export function createApiRouter({ repo, services, config }) {
  const api = Router();

  api.get('/health', (_req, res) => res.json({ data: { status: 'ok', source: repo.driver } }));

  api.use('/projects', collectionRouter(services.projects));
  api.use('/clients', collectionRouter(services.clients));
  api.use('/tasks', collectionRouter(services.tasks));
  api.use('/inquiries', collectionRouter(services.inquiries));
  api.use('/team', collectionRouter(services.team));

  api.get('/dashboard/summary', async (_req, res) => {
    const [projects, clients, tasks, inquiries, team] = await Promise.all(
      ['projects', 'clients', 'tasks', 'inquiries', 'team'].map((c) => repo.list(c)),
    );
    res.json({ data: computeDashboardSummary({ projects, clients, tasks, inquiries, team }) });
  });

  api.get('/activities', async (req, res) => {
    const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
    res.json({ data: await repo.listActivities(limit) });
  });

  api.post('/demo/reset', async (_req, res) => {
    if (!config.allowDemoReset) throw new HttpError(403, 'Demo reset is disabled on this server.');
    await repo.reset();
    res.json({ data: { reset: true } });
  });

  return api;
}
