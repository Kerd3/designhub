import { test, expect } from '@playwright/test';
import { DEMO, signInViaStorage, fillContactForm } from './helpers.js';

test.describe('Workspace access', () => {
  test('redirects to login, validates, rejects wrong password and signs in with demo access', async ({ page }) => {
    await page.goto('/workspace/projects');
    await expect(page).toHaveURL(/\/workspace\/login\?next=%2Fworkspace%2Fprojects/);

    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Email address is required')).toBeVisible();

    await page.getByLabel('Email address').fill(DEMO.email);
    await page.getByLabel(/^Password/).fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByRole('alert')).toContainText('do not match the demo account');

    await page.getByRole('button', { name: 'Show password' }).click();
    await expect(page.getByLabel(/^Password/)).toHaveAttribute('type', 'text');

    await page.getByRole('button', { name: 'Use demo credentials' }).click();
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL('/workspace/projects');
    await expect(page.getByRole('heading', { level: 1, name: 'Projects' })).toBeVisible();

    const stored = await page.evaluate(() => localStorage.getItem('designhub.session'));
    expect(stored).not.toContain(DEMO.password);
  });

  test('logout ends the demo session', async ({ page }) => {
    await signInViaStorage(page);
    await page.goto('/workspace');
    await page.getByRole('button', { name: /Account menu/ }).click();
    await page.getByRole('menuitem', { name: 'Exit demo' }).click();
    await expect(page).toHaveURL('/workspace/login');
    await expect(page.getByRole('status').filter({ hasText: 'You have left the demo workspace' })).toBeVisible();
    // The session marker is gone (the init script would re-add it on a reload, so check storage directly).
    expect(await page.evaluate(() => localStorage.getItem('designhub.session'))).toBeNull();
    await page.getByRole('link', { name: 'Back to website' }).click();
    await page.evaluate(() => window.history.pushState({}, '', '/workspace'));
    await page.evaluate(() => window.dispatchEvent(new PopStateEvent('popstate')));
    await expect(page).toHaveURL(/\/workspace\/login/);
  });
});

test.describe('Workspace features', () => {
  test.beforeEach(async ({ page }) => signInViaStorage(page));

  test('dashboard shows statistics computed from the dataset, charts and lists', async ({ page }) => {
    await page.goto('/workspace');
    const stats = { 'Total Projects': '10', 'Active Projects': '4', 'Completed Projects': '3', 'Total Clients': '7', 'Pending Tasks': '14', 'New Inquiries': '3' };
    for (const [label, value] of Object.entries(stats)) await expect(page.getByTestId(`stat-${label}`)).toHaveText(value);
    await expect(page.getByRole('heading', { name: 'Projects by status' })).toBeVisible();
    await expect(page.locator('.recharts-bar-rectangle').first()).toBeVisible();
    await page.getByRole('button', { name: 'Table' }).first().click();
    await expect(page.getByRole('rowheader', { name: 'In Progress' })).toBeVisible();
    for (const heading of ['Upcoming tasks', 'Active projects', 'Recent inquiries', 'Recent activity']) {
      await expect(page.getByRole('heading', { name: heading })).toBeVisible();
    }
  });

  test('project search, status and priority filters', async ({ page }) => {
    await page.goto('/workspace/projects');
    const count = page.getByTestId('project-count');
    await expect(count).toHaveText('10 of 10 projects');
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('northwind');
    await expect(count).toHaveText('2 of 10 projects');
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('');
    await page.getByLabel('Status').selectOption('completed');
    await expect(count).toHaveText('3 of 10 projects');
    await page.getByLabel('Priority').selectOption('high');
    await expect(count).toHaveText('1 of 10 projects');
    await expect(page.getByRole('heading', { name: 'Harbor Accessibility Audit' })).toBeVisible();
    await page.getByRole('button', { name: 'Clear filters' }).click();
    await expect(count).toHaveText('10 of 10 projects');
  });

  test('create, edit, change status and delete a project (with confirmation)', async ({ page }) => {
    await page.goto('/workspace/projects');
    await page.getByRole('button', { name: 'New project' }).click();
    const dialog = page.getByRole('dialog', { name: 'New project' });
    await dialog.getByRole('button', { name: 'Create project' }).click();
    await expect(dialog.getByText('Project name is required')).toBeVisible();

    await dialog.getByLabel('Project name').fill('Atlas Driver App');
    await dialog.getByLabel('Client').selectOption({ label: 'Atlas Freight Co.' });
    await dialog.getByLabel('Category').selectOption('Web Applications');
    await dialog.getByLabel('Start date').fill('2026-12-01');
    await dialog.getByLabel('Due date').fill('2026-11-01');
    await dialog.getByRole('button', { name: 'Create project' }).click();
    await expect(dialog.getByText('Due date must be on or after the start date')).toBeVisible();
    await dialog.getByLabel('Due date').fill('2027-03-01');
    await dialog.getByLabel('Lucas Bergström').check();
    await dialog.getByRole('button', { name: 'Create project' }).click();
    await expect(dialog).toHaveCount(0);
    await expect(page.getByRole('status').filter({ hasText: 'Project created' })).toBeVisible();
    await expect(page.getByTestId('project-count')).toHaveText('11 of 11 projects');

    // Edit via the card's action menu.
    await page.getByRole('button', { name: 'Actions for Atlas Driver App' }).click();
    await page.getByRole('menuitem', { name: 'Edit project' }).click();
    const edit = page.getByRole('dialog', { name: 'Edit Atlas Driver App' });
    await edit.getByLabel('Project name').fill('Atlas Driver Mobile App');
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('heading', { name: 'Atlas Driver Mobile App' })).toBeVisible();

    // Inline status update in table view.
    await page.getByRole('radio', { name: 'Table' }).click();
    await page.getByRole('searchbox', { name: 'Search projects' }).fill('Atlas Driver');
    await page.getByLabel('Status of Atlas Driver Mobile App').selectOption('in-progress');
    await expect(page.getByRole('status').filter({ hasText: 'Status updated' })).toBeVisible();

    // Delete asks first; cancel keeps it, confirm removes it.
    await page.getByRole('button', { name: 'Actions for Atlas Driver Mobile App' }).click();
    await page.getByRole('menuitem', { name: 'Delete project' }).click();
    const confirm = page.getByRole('dialog', { name: /Delete Atlas Driver Mobile App/ });
    await expect(confirm.getByRole('button', { name: 'Cancel' })).toBeFocused();
    await confirm.getByRole('button', { name: 'Cancel' }).click();
    await expect(page.getByTestId('project-count')).toHaveText('1 of 11 projects');
    await page.getByRole('button', { name: 'Actions for Atlas Driver Mobile App' }).click();
    await page.getByRole('menuitem', { name: 'Delete project' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete project' }).click();
    await expect(page.getByTestId('project-count')).toHaveText('0 of 10 projects');
  });

  test('project details update completion percentage', async ({ page }) => {
    await page.goto('/workspace/projects/pr-101');
    await expect(page.getByRole('heading', { level: 1, name: 'Northwind Reporting Dashboard' })).toBeVisible();
    await page.getByLabel(/^Completion/).fill('80');
    await page.getByRole('button', { name: 'Save completion' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Completion set to 80%' })).toBeVisible();
    await page.reload();
    await expect(page.getByRole('progressbar', { name: 'Saved completion' })).toHaveAttribute('aria-valuenow', '80');
  });

  test('client management: add, search, view details and edit', async ({ page }) => {
    await page.goto('/workspace/clients');
    await page.getByRole('button', { name: 'Add client' }).click();
    const dialog = page.getByRole('dialog', { name: 'Add client' });
    await dialog.getByLabel('Company name').fill('Harbor Books');
    await dialog.getByLabel('Industry').fill('Retail');
    await dialog.getByLabel('Contact person').fill('Ida Moss');
    await dialog.getByLabel('Email').fill('ida@harborbooks.example');
    await dialog.getByLabel('Company website').fill('not a url');
    await dialog.getByRole('button', { name: 'Add client' }).click();
    await expect(dialog.getByText('Enter a full URL')).toBeVisible();
    await dialog.getByLabel('Company website').fill('https://harborbooks.example');
    await dialog.getByRole('button', { name: 'Add client' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Client added' })).toBeVisible();

    await page.getByRole('searchbox', { name: 'Search clients' }).fill('harbor');
    await expect(page.getByText('2 of 8 clients')).toBeVisible();
    await page.getByLabel('Status').selectOption('onboarding');
    await expect(page.getByText('1 of 8 clients')).toBeVisible();

    await page.getByRole('button', { name: /^Harbor Books/ }).click();
    const panel = page.getByRole('dialog', { name: 'Harbor Books' });
    await expect(panel.getByText('No projects yet.')).toBeVisible();
    await panel.getByRole('button', { name: 'Edit client' }).click();
    const edit = page.getByRole('dialog', { name: 'Edit Harbor Books' });
    await edit.getByLabel('Client status').selectOption('active');
    await edit.getByRole('button', { name: 'Save changes' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Client updated' })).toBeVisible();
  });

  test('client details list associated projects', async ({ page }) => {
    await page.goto('/workspace/clients?open=cl-01');
    const panel = page.getByRole('dialog', { name: 'Northwind Analytics' });
    await expect(panel.getByText('Projects (2)')).toBeVisible();
    await expect(panel.getByRole('link', { name: 'Northwind Design System' })).toBeVisible();
  });

  test('task management: create, move between columns, filter and delete', async ({ page }) => {
    await page.goto('/workspace/tasks');
    await expect(page.getByTestId('task-count')).toHaveText(/18 of 18 tasks/);
    await page.getByRole('button', { name: 'New task' }).click();
    const dialog = page.getByRole('dialog', { name: 'New task' });
    await dialog.getByLabel('Task title').fill('Write release notes');
    await dialog.getByLabel('Project').selectOption({ label: 'Harbor Patient Booking Portal' });
    await dialog.getByLabel('Assigned to').selectOption({ label: 'Hana Kimura' });
    await dialog.getByLabel('Priority').selectOption('high');
    await dialog.getByRole('button', { name: 'Create task' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Task created' })).toBeVisible();

    const todo = page.getByTestId('column-todo');
    await expect(todo.getByRole('button', { name: 'Write release notes' })).toBeVisible();
    // Keyboard-accessible alternative to drag and drop.
    await page.getByLabel('Move “Write release notes” to').selectOption('in-review');
    await expect(page.getByTestId('column-in-review').getByRole('button', { name: 'Write release notes' })).toBeVisible();

    // Drag and drop between columns: a stepped pointer drag from the card's padding.
    const card = page.getByTestId('column-in-review').getByTestId('task-card').filter({ hasText: 'Write release notes' });
    const from = await card.boundingBox();
    const to = await page.getByTestId('column-completed').boundingBox();
    await page.mouse.move(from.x + 6, from.y + 6);
    await page.mouse.down();
    await page.mouse.move(from.x + 30, from.y + 30, { steps: 5 });
    await page.mouse.move(to.x + to.width / 2, to.y + 60, { steps: 10 });
    await page.mouse.up();
    await expect(page.getByTestId('column-completed').getByRole('button', { name: 'Write release notes' })).toBeVisible();

    await page.getByLabel('Project').selectOption({ label: 'Harbor Patient Booking Portal' });
    await expect(page.getByTestId('task-count')).toHaveText(/4 of 19 tasks/);
    await page.getByLabel('Priority').selectOption('urgent');
    await expect(page.getByTestId('task-count')).toHaveText(/1 of 19 tasks/);
    await page.getByRole('button', { name: 'Clear filters' }).click();

    await page.getByRole('button', { name: 'Write release notes' }).click();
    await page.getByRole('dialog', { name: 'Edit task' }).getByRole('button', { name: 'Delete task' }).click();
    await page.getByRole('dialog', { name: 'Delete this task?' }).getByRole('button', { name: 'Delete task' }).click();
    await expect(page.getByTestId('task-count')).toHaveText(/18 of 18 tasks/);
  });

  test('task table view supports reassignment', async ({ page }) => {
    await page.goto('/workspace/tasks');
    await page.getByRole('radio', { name: 'Table' }).click();
    await page.getByLabel('Assignee for Fix appointment time-zone bug').selectOption({ label: 'Daniel Reyes' });
    await expect(page.getByRole('status').filter({ hasText: 'Task reassigned' })).toBeVisible();
  });

  test('inquiry status updates and archiving', async ({ page }) => {
    await page.goto('/workspace/inquiries');
    await expect(page.getByRole('tab', { name: /New/ })).toContainText('3');
    await page.getByRole('tab', { name: /New/ }).click();
    await page.getByRole('button', { name: /^Brightpath Tutors/ }).click();
    const panel = page.getByRole('dialog', { name: 'Inquiry from Brightpath Tutors' });
    await panel.getByLabel('Inquiry status').selectOption('contacted');
    await expect(page.getByRole('status').filter({ hasText: 'Marked as Contacted' })).toBeVisible();
    await panel.getByRole('button', { name: 'Archive inquiry' }).click();
    await expect(panel.getByRole('button', { name: 'Archive inquiry' })).toHaveCount(0);
    await page.keyboard.press('Escape');
    await expect(page.getByRole('tab', { name: /New/ })).toContainText('2');
    await page.getByRole('tab', { name: /Archived/ }).click();
    await expect(page.getByRole('button', { name: /^Brightpath Tutors/ })).toBeVisible();
  });

  test('a public contact submission appears in the workspace', async ({ page }) => {
    await page.goto('/contact');
    await fillContactForm(page, { company: 'Fernwood Florist' });
    await page.getByRole('button', { name: 'Send inquiry' }).click();
    await page.getByRole('link', { name: 'See it in the workspace' }).click();
    await expect(page.getByRole('button', { name: /^Fernwood Florist/ })).toBeVisible();
    await page.goto('/workspace');
    await expect(page.getByTestId('stat-New Inquiries')).toHaveText('4');
  });

  test('team directory search, department filter and details', async ({ page }) => {
    await page.goto('/workspace/team');
    await page.getByLabel('Department').selectOption('Engineering');
    await expect(page.getByText('2 of 6 people')).toBeVisible();
    await page.getByRole('button', { name: 'Daniel Reyes' }).click();
    await expect(page.getByRole('dialog', { name: 'Daniel Reyes' }).getByText(/Open tasks \(\d+\)/)).toBeVisible();
  });

  test('settings persist across reloads and reset demo data', async ({ page }) => {
    await page.goto('/workspace/settings');
    await page.getByLabel('Display name').fill('Sam Rivera');
    await page.getByRole('button', { name: 'Save profile' }).click();
    await page.getByRole('tab', { name: 'Appearance' }).click();
    await page.getByLabel('Dark').check();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await page.reload();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    await expect(page.getByRole('button', { name: 'Account menu for Sam Rivera' })).toBeVisible();

    await page.getByRole('tab', { name: 'Notifications' }).click();
    await page.getByRole('switch', { name: 'New inquiry alerts' }).click();
    await expect(page.getByRole('switch', { name: 'New inquiry alerts' })).toHaveAttribute('aria-checked', 'false');

    // Demo data reset restores a deleted project.
    await page.goto('/workspace/projects/pr-110');
    await page.getByRole('button', { name: 'Delete' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Delete project' }).click();
    await expect(page.getByTestId('project-count')).toHaveText('9 of 9 projects');
    await page.goto('/workspace/settings?tab=data');
    await page.getByRole('button', { name: 'Reset demo data' }).click();
    await page.getByRole('dialog').getByRole('button', { name: 'Reset data' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Demo data reset' })).toBeVisible();
    await page.goto('/workspace/projects');
    await expect(page.getByTestId('project-count')).toHaveText('10 of 10 projects');
  });

  test('global search finds records across the workspace', async ({ page }) => {
    await page.goto('/workspace');
    await expect(page.getByTestId('stat-Total Projects')).toHaveText('10');
    await page.keyboard.press('Control+k');
    const dialog = page.getByRole('dialog', { name: 'Search the workspace' });
    await dialog.getByRole('searchbox').fill('kettle');
    await expect(dialog.getByRole('link', { name: /Kettle & Co. Storefront Rebuild/ })).toBeVisible();
    await dialog.getByRole('link', { name: /Kettle & Co. Storefront Rebuild/ }).click();
    await expect(page).toHaveURL('/workspace/projects/pr-103');
  });

  test('notifications list new inquiries and respect preferences', async ({ page }) => {
    await page.goto('/workspace');
    await page.getByRole('button', { name: /Notifications, \d+ unread/ }).click();
    const panel = page.getByRole('region', { name: 'Notifications' });
    await expect(panel.getByText('New inquiry from Brightpath Tutors')).toBeVisible();
    await panel.getByRole('button', { name: 'Mark all as read' }).click();
    await expect(page.getByRole('button', { name: 'Notifications', exact: true })).toBeVisible();
  });
});
