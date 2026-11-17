import { describe, it, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { createApp } from '../src/app.js';
import { createMemoryRepository } from '../src/database/memoryRepository.js';

const config = { corsOrigins: ['http://localhost:5173'], allowDemoReset: true };
let app;
beforeEach(() => {
  // A fresh in-memory database per test keeps tests independent.
  app = createApp({ repo: createMemoryRepository(), config });
});

const validInquiry = {
  name: 'Ana Lee',
  email: 'ana@lee.example',
  company: 'Lee Studio',
  projectType: 'Website Design',
  budget: '$10k–$25k',
  description: 'We need a new portfolio website for our architecture practice.',
};

describe('health and errors', () => {
  it('reports health and the active driver', async () => {
    const res = await request(app).get('/api/health').expect(200);
    assert.deepEqual(res.body.data, { status: 'ok', source: 'memory' });
  });

  it('returns 404 in the error envelope for unknown routes', async () => {
    const res = await request(app).get('/api/nope').expect(404);
    assert.match(res.body.error.message, /No route/);
  });

  it('returns 400 for malformed JSON', async () => {
    const res = await request(app).post('/api/inquiries').set('Content-Type', 'application/json').send('{"name":').expect(400);
    assert.match(res.body.error.message, /not valid JSON/);
  });
});

describe('dashboard summary', () => {
  it('matches the seed dataset', async () => {
    const res = await request(app).get('/api/dashboard/summary').expect(200);
    assert.deepEqual(res.body.data.totals, {
      totalProjects: 10, activeProjects: 4, completedProjects: 3, totalClients: 7, pendingTasks: 14, newInquiries: 3,
    });
    const byStatus = Object.fromEntries(res.body.data.projectsByStatus.map((s) => [s.key, s.count]));
    assert.deepEqual(byStatus, { planning: 2, 'in-progress': 3, review: 1, completed: 3, 'on-hold': 1 });
  });
});

describe('inquiries', () => {
  it('stores a valid submission as New, ignoring client-supplied status', async () => {
    const res = await request(app).post('/api/inquiries').send({ ...validInquiry, status: 'converted' }).expect(201);
    assert.equal(res.body.data.status, 'new');
    assert.match(res.body.data.id, /^iq-\d+$/);
    assert.ok(Date.parse(res.body.data.submittedAt));
    const summary = await request(app).get('/api/dashboard/summary');
    assert.equal(summary.body.data.totals.newInquiries, 4);
  });

  it('rejects invalid submissions with field errors', async () => {
    const res = await request(app).post('/api/inquiries').send({ name: '', email: 'bad', description: 'short' }).expect(422);
    assert.ok(res.body.error.details.name);
    assert.ok(res.body.error.details.email);
    assert.ok(res.body.error.details.description);
    assert.ok(res.body.error.details.projectType);
  });

  it('updates status and refuses deletion', async () => {
    const res = await request(app).patch('/api/inquiries/iq-301').send({ status: 'contacted' }).expect(200);
    assert.equal(res.body.data.status, 'contacted');
    assert.equal(res.body.data.description.length > 0, true, 'other fields are preserved');
    await request(app).delete('/api/inquiries/iq-301').expect(405);
  });

  it('records an activity entry for a new inquiry', async () => {
    await request(app).post('/api/inquiries').send(validInquiry).expect(201);
    const res = await request(app).get('/api/activities?limit=1').expect(200);
    assert.equal(res.body.data[0].message, 'New inquiry from Lee Studio');
  });
});

describe('projects', () => {
  it('lists all seed projects', async () => {
    const res = await request(app).get('/api/projects').expect(200);
    assert.equal(res.body.data.length, 10);
  });

  it('creates a project with a sequential id', async () => {
    const res = await request(app).post('/api/projects').send({
      name: 'Atlas Driver App', clientId: 'cl-05', category: 'Web Applications', startDate: '2026-12-01', dueDate: '2027-03-01',
      status: 'planning', priority: 'medium', memberIds: ['tm-04'], progress: 0,
    }).expect(201);
    assert.equal(res.body.data.id, 'pr-111');
  });

  it('rejects unknown client references', async () => {
    const res = await request(app).post('/api/projects').send({
      name: 'Ghost project', clientId: 'cl-99', category: 'Web Applications', startDate: '2026-12-01', dueDate: '2027-03-01',
      status: 'planning', priority: 'medium', memberIds: [], progress: 0,
    }).expect(422);
    assert.match(res.body.error.details.clientId, /Unknown client/);
  });

  it('sets progress to 100 when a project is completed', async () => {
    const res = await request(app).patch('/api/projects/pr-101').send({ status: 'completed' }).expect(200);
    assert.equal(res.body.data.progress, 100);
    assert.equal(res.body.data.name, 'Northwind Reporting Dashboard');
  });

  it('rejects a due date before the start date', async () => {
    const res = await request(app).patch('/api/projects/pr-101').send({ dueDate: '2026-01-01' }).expect(422);
    assert.ok(res.body.error.details.dueDate);
  });

  it('returns 404 for a missing project', async () => {
    await request(app).get('/api/projects/pr-999').expect(404);
    await request(app).patch('/api/projects/pr-999').send({ status: 'review' }).expect(404);
  });

  it('deletes a project and cascades to its tasks', async () => {
    await request(app).delete('/api/projects/pr-101').expect(204);
    const tasks = await request(app).get('/api/tasks');
    assert.equal(tasks.body.data.some((t) => t.projectId === 'pr-101'), false);
  });
});

describe('clients, tasks and team', () => {
  it('keeps optional client fields on create', async () => {
    const res = await request(app).post('/api/clients').send({
      companyName: 'Harbor Books', contactPerson: 'Ida Moss', email: 'ida@harborbooks.example', phone: '+1 (555) 010-1111',
      industry: 'Retail', website: 'https://harborbooks.example', status: 'onboarding', notes: 'Referred by Kettle & Co.',
    }).expect(201);
    assert.equal(res.body.data.phone, '+1 (555) 010-1111');
    assert.equal(res.body.data.notes, 'Referred by Kettle & Co.');
  });

  it('moves a task between statuses and reassigns it', async () => {
    const moved = await request(app).patch('/api/tasks/tk-202').send({ status: 'in-progress', assigneeId: 'tm-02' }).expect(200);
    assert.equal(moved.body.data.status, 'in-progress');
    assert.equal(moved.body.data.assigneeId, 'tm-02');
    await request(app).patch('/api/tasks/tk-202').send({ assigneeId: 'tm-99' }).expect(422);
  });

  it('updates team availability but never deletes members', async () => {
    const res = await request(app).patch('/api/team/tm-06').send({ availability: 'available' }).expect(200);
    assert.equal(res.body.data.availability, 'available');
    await request(app).delete('/api/team/tm-06').expect(405);
    await request(app).post('/api/team').send({ name: 'New Person' }).expect(405);
  });
});

describe('demo reset', () => {
  it('restores the seed data', async () => {
    await request(app).delete('/api/projects/pr-102').expect(204);
    await request(app).post('/api/demo/reset').expect(200);
    const res = await request(app).get('/api/projects');
    assert.equal(res.body.data.length, 10);
  });

  it('can be disabled by configuration', async () => {
    const locked = createApp({ repo: createMemoryRepository(), config: { ...config, allowDemoReset: false } });
    await request(locked).post('/api/demo/reset').expect(403);
  });
});
