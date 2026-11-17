import { test, expect } from '@playwright/test';
import { signInViaStorage, fillContactForm } from './helpers.js';

const API = 'http://localhost:5055/api';

/**
 * Runs the same React app built with VITE_DATA_SOURCE=api against the real
 * Express backend (memory driver), proving the service layer swaps transports
 * without page changes.
 */
test.describe.configure({ mode: 'serial' });

test.beforeAll(async ({ request }) => {
  await request.post(`${API}/demo/reset`);
});

test('contact form submissions reach the Express API', async ({ page, request }) => {
  await page.goto('/contact');
  await expect(page.getByText('Submissions go to the live api')).toBeVisible();
  const data = await fillContactForm(page, { company: 'Integration Test Co.' });
  const [response] = await Promise.all([
    page.waitForResponse((r) => r.url() === `${API}/inquiries` && r.request().method() === 'POST'),
    page.getByRole('button', { name: 'Send inquiry' }).click(),
  ]);
  expect(response.status()).toBe(201);
  await expect(page.getByRole('heading', { name: /Your inquiry is in/ })).toBeVisible();

  const res = await request.get(`${API}/inquiries`);
  const { data: inquiries } = await res.json();
  expect(inquiries.some((i) => i.company === 'Integration Test Co.' && i.email === data.email && i.status === 'new')).toBe(true);
});

test('server-side failures surface as an error, not a success', async ({ page }) => {
  await page.route(`${API}/inquiries`, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: JSON.stringify({ error: { message: 'The server had a problem. Please try again in a moment.' } }) }));
  await page.goto('/contact');
  await fillContactForm(page);
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Your inquiry was not sent.' })).toBeVisible();
  await expect(page.getByText('Your inquiry is in')).toHaveCount(0);
});

test('network failures are reported clearly', async ({ page }) => {
  await page.route(`${API}/inquiries`, (route) => route.abort('connectionrefused'));
  await page.goto('/contact');
  await fillContactForm(page);
  await page.getByRole('button', { name: 'Send inquiry' }).click();
  await expect(page.locator('form [role=alert]').filter({ hasText: 'could not reach the server' })).toBeVisible();
});

test('workspace dashboard and CRUD use the API', async ({ page, request }) => {
  await signInViaStorage(page);
  await page.goto('/workspace');
  await expect(page.getByTestId('stat-new-inquiries')).toHaveText('4');
  await expect(page.getByTestId('stat-total-projects')).toHaveText('10');

  await page.goto('/workspace/projects/pr-104');
  await page.getByLabel('Project status').selectOption('in-progress');
  await expect(page.getByRole('status').filter({ hasText: 'Status changed to In Progress' })).toBeVisible();
  const project = await (await request.get(`${API}/projects/pr-104`)).json();
  expect(project.data.status).toBe('in-progress');
});
