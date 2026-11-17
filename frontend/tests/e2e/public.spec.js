import { test, expect } from '@playwright/test';
import { failMockRequest, fillContactForm } from './helpers.js';

test.describe('Public website', () => {
  test('homepage loads with hero, services, work and process', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/DesignHub Studio/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Thoughtful design.');
    await expect(page.getByRole('link', { name: 'Explore our work' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'What we do' })).toBeVisible();
    for (const service of ['Website Design', 'Frontend Development', 'UI/UX Design', 'Web Application Development', 'Design Systems', 'API Integration']) {
      await expect(page.getByRole('heading', { name: service, exact: true })).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: 'Selected work' })).toBeVisible();
    await expect(page.getByText('Fictional project').first()).toBeVisible();
    for (const step of ['Discover', 'Design', 'Develop', 'Deliver']) {
      await expect(page.getByRole('heading', { name: step, exact: true })).toBeVisible();
    }
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /fictional studio/i);
  });

  test('main navigation reaches every page and marks the current one', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    for (const [label, path, heading] of [['Services', '/services', /Design and code/], ['Our Work', '/work', /Our work/], ['About', '/about', /A small studio/], ['Contact', '/contact', /Start a project/]]) {
      await nav.getByRole('link', { name: label }).click();
      await expect(page).toHaveURL(path);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(heading);
      await expect(nav.getByRole('link', { name: label })).toHaveAttribute('aria-current', 'page');
    }
  });

  test('services page loads every service, FAQ and process', async ({ page }) => {
    await page.goto('/services');
    await expect(page.getByRole('heading', { level: 2, name: 'Design Systems' })).toBeVisible();
    await page.getByText('Who owns the code and design files?').click();
    await expect(page.getByText('You do. Source code, design files')).toBeVisible();
    await page.getByRole('link', { name: /Discuss a design systems project/ }).click();
    await expect(page).toHaveURL(/\/contact\?type=Design/);
    await expect(page.getByLabel('Project type')).toHaveValue('Design System');
  });

  test('portfolio filters and search narrow the results', async ({ page }) => {
    await page.goto('/work');
    const count = page.getByTestId('result-count');
    await expect(count).toHaveText('6 projects');

    await page.getByRole('button', { name: /Website Design/ }).click();
    await expect(count).toContainText('2 projects in Website Design');
    await expect(page).toHaveURL(/category=Website/);
    await expect(page.getByRole('heading', { level: 2, name: 'Wellnest' })).toBeVisible();
    await expect(page.getByRole('heading', { level: 2, name: 'Finora' })).toHaveCount(0);

    await page.getByRole('button', { name: /^All/ }).click();
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('postgresql');
    await expect(count).toContainText('1 project');
    await expect(page.getByRole('heading', { level: 2, name: 'Routewise' })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Search projects' }).fill('zzz');
    await expect(page.getByText('No projects match those filters')).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(count).toHaveText('6 projects');
  });

  test('case study pages open, cross-link and handle unknown slugs', async ({ page }) => {
    await page.goto('/work');
    await page.getByRole('link', { name: 'Finora' }).click();
    await expect(page).toHaveURL('/work/finora');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Finora');
    for (const section of ['The problem', 'Project goals', 'Design process', 'Desktop and mobile', 'Design decisions', 'Final solution', 'Related projects']) {
      await expect(page.getByRole('heading', { name: section })).toBeVisible();
    }
    await expect(page.getByText('Fictional demonstration project.')).toBeVisible();
    await expect(page.getByRole('img', { name: /Mobile interface preview of Finora/ })).toBeVisible();
    await page.getByRole('link', { name: /Next: Wellnest/ }).click();
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Wellnest');

    await page.goto('/work/does-not-exist');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('We could not find that case study');
  });

  test('contact form validates required fields, email and length', async ({ page }) => {
    await page.goto('/contact');
    await page.getByRole('button', { name: 'Send inquiry' }).click();
    await expect(page.getByText('Full name is required')).toBeVisible();
    await expect(page.getByText('Email address is required')).toBeVisible();
    await expect(page.getByLabel('Project type')).toHaveAccessibleDescription(/Choose a project type/);
    await expect(page.getByLabel('Budget range')).toHaveAccessibleDescription(/Choose a budget range/);
    await expect(page.getByLabel('Full name')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Full name')).toBeFocused();

    await page.getByLabel('Email address').fill('not-an-email');
    await page.getByLabel('Project description').fill('Too short');
    await page.getByLabel('Full name').click();
    await expect(page.getByText('Enter a valid email address')).toBeVisible();
    await expect(page.getByText('at least 30 characters')).toBeVisible();
    await expect(page.getByText('9/1500')).toBeVisible();
  });

  test('a valid inquiry is stored by the mock API and shown as success', async ({ page }) => {
    // Slow this request down so the in-flight state can be observed reliably.
    await page.addInitScript(() => localStorage.setItem('designhub.mock.latency', '800'));
    await page.goto('/contact');
    const data = await fillContactForm(page);
    const submit = page.getByRole('button', { name: 'Send inquiry' });
    await submit.click();
    // Duplicate-submission guard: the button is disabled while the request is in flight.
    await expect(page.getByRole('button', { name: 'Sending…' })).toBeDisabled();
    await expect(page.getByRole('heading', { name: `Thanks, ${data.name.split(' ')[0]}. Your inquiry is in.` })).toBeVisible();
    await expect(page.getByRole('status').filter({ hasText: 'Inquiry sent' })).toBeVisible();

    const stored = await page.evaluate(() => JSON.parse(localStorage.getItem('designhub.db.v1')).inquiries[0]);
    expect(stored).toMatchObject({ name: data.name, email: data.email, status: 'new', projectType: 'Website Design' });
  });

  test('a failed submission shows an error and keeps the answers', async ({ page }) => {
    await failMockRequest(page, 'POST /inquiries');
    await page.goto('/contact');
    await fillContactForm(page);
    await page.getByRole('button', { name: 'Send inquiry' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Your inquiry was not sent.' })).toBeVisible();
    await expect(page.getByText('Thanks,')).toHaveCount(0);
    await expect(page.getByLabel('Full name')).toHaveValue('Jordan Blake');
    await expect(page.getByRole('button', { name: 'Send inquiry' })).toBeEnabled();
  });

  test('unknown public URLs show a 404 page', async ({ page }) => {
    await page.goto('/no-such-page');
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('We could not find that page');
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });

  test('design system page demonstrates interactive components', async ({ page }) => {
    await page.goto('/design-system');
    await page.getByRole('button', { name: 'Open modal' }).click();
    const dialog = page.getByRole('dialog', { name: 'Example modal' });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByLabel('Project name')).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Open modal' })).toBeFocused();
  });
});
