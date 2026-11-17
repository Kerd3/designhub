import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { fileURLToPath } from 'node:url';
import { signInViaStorage, expectNoHorizontalOverflow } from './helpers.js';

const VIEWPORTS = [
  { name: 'desktop-1440', width: 1440, height: 900 },
  { name: 'desktop-1280', width: 1280, height: 800 },
  { name: 'laptop-1024', width: 1024, height: 768 },
  { name: 'tablet-768', width: 768, height: 1024 },
  { name: 'mobile-390', width: 390, height: 844 },
  { name: 'mobile-375', width: 375, height: 812 },
];
const PUBLIC_PAGES = ['/', '/services', '/work', '/work/finora', '/about', '/contact', '/design-system'];
const WORKSPACE_PAGES = ['/workspace', '/workspace/projects', '/workspace/clients', '/workspace/tasks', '/workspace/inquiries', '/workspace/team', '/workspace/settings'];
const SHOTS = fileURLToPath(new URL('../../../docs/screenshots/', import.meta.url));

for (const vp of VIEWPORTS) {
  test.describe(`${vp.name}`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test('public pages: no horizontal overflow, navigation usable', async ({ page }) => {
      for (const path of PUBLIC_PAGES) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expectNoHorizontalOverflow(page);
        const navToggle = vp.width < 1024 ? page.getByRole('button', { name: 'Menu', exact: true }) : page.getByRole('navigation', { name: 'Main' });
        await expect(navToggle).toBeVisible();
      }
    });

    test('workspace pages: no horizontal overflow, navigation usable', async ({ page }) => {
      await signInViaStorage(page);
      for (const path of WORKSPACE_PAGES) {
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByText(/^Loading/)).toHaveCount(0);
        await expect(page.locator('[role=status][aria-label^="Loading"]')).toHaveCount(0);
        await expectNoHorizontalOverflow(page);
        const nav = vp.width < 1024 ? page.getByRole('button', { name: 'Open navigation' }) : page.getByRole('navigation', { name: 'Workspace' });
        await expect(nav).toBeVisible();
      }
    });
  });
}

test.describe('Accessibility (axe, WCAG 2.2 A/AA rules)', () => {
  const scan = (page) => new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
  const summarize = (violations) => violations.map((v) => `${v.id} (${v.impact}): ${v.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);

  for (const path of PUBLIC_PAGES) {
    test(`public ${path}`, async ({ page }) => {
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      const { violations } = await scan(page);
      expect(summarize(violations)).toEqual([]);
    });
  }

  for (const path of [...WORKSPACE_PAGES, '/workspace/projects/pr-101']) {
    for (const theme of ['light', 'dark']) {
      test(`workspace ${path} (${theme})`, async ({ page }) => {
        await signInViaStorage(page);
        await page.addInitScript((t) => localStorage.setItem('designhub.settings', JSON.stringify({ appearance: { theme: t, projectView: 'grid', taskView: 'board' } })), theme);
        await page.goto(path);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByText(/^Loading/)).toHaveCount(0);
        await expect(page.locator('[role=status][aria-label^="Loading"]')).toHaveCount(0);
        const { violations } = await scan(page);
        expect(summarize(violations)).toEqual([]);
      });
    }
  }

  test('login page', async ({ page }) => {
    await page.goto('/workspace/login');
    const { violations } = await scan(page);
    expect(summarize(violations)).toEqual([]);
  });
});

test.describe('Documentation screenshots', () => {
  const frames = [
    ['home-desktop-1440', '/', 1440, 900, true],
    ['home-mobile-390', '/', 390, 844, true],
    ['services-desktop-1440', '/services', 1440, 900, false],
    ['portfolio-desktop-1440', '/work', 1440, 900, false],
    ['case-study-desktop-1440', '/work/wellnest', 1440, 900, false],
    ['contact-mobile-390', '/contact', 390, 844, false],
    ['design-system-desktop-1440', '/design-system', 1440, 900, false],
  ];
  for (const [name, path, width, height, full] of frames) {
    test(name, async ({ page }) => {
      await page.setViewportSize({ width, height });
      await page.goto(path);
      // Scroll through once so lazy-loaded images are fetched before a full-page capture.
      await page.evaluate(async () => {
        for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
        window.scrollTo(0, 0);
      });
      await page.waitForLoadState('networkidle');
      await page.screenshot({ path: `${SHOTS}${name}.png`, fullPage: full });
    });
  }

  const workspaceFrames = [
    ['dashboard-desktop-1440', '/workspace', 1440, 1000],
    ['dashboard-mobile-390', '/workspace', 390, 844],
    ['projects-desktop-1440', '/workspace/projects', 1440, 900],
    ['tasks-desktop-1440', '/workspace/tasks', 1440, 900],
    ['inquiries-desktop-1440', '/workspace/inquiries', 1440, 900],
  ];
  for (const [name, path, width, height] of workspaceFrames) {
    test(name, async ({ page }) => {
      await signInViaStorage(page);
      await page.setViewportSize({ width, height });
      await page.goto(path);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.getByText(/^Loading/)).toHaveCount(0);
      await expect(page.locator('[role=status][aria-label^="Loading"]')).toHaveCount(0);
      await page.waitForTimeout(300);
      await page.screenshot({ path: `${SHOTS}${name}.png` });
    });
  }

  test('dashboard-dark-1440', async ({ page }) => {
    await signInViaStorage(page);
    await page.addInitScript(() => localStorage.setItem('designhub.settings', JSON.stringify({ appearance: { theme: 'dark', projectView: 'grid', taskView: 'board' } })));
    await page.setViewportSize({ width: 1440, height: 1000 });
    await page.goto('/workspace');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(page.getByText(/^Loading/)).toHaveCount(0);
    await expect(page.locator('[role=status][aria-label^="Loading"]')).toHaveCount(0);
    await page.waitForTimeout(300);
    await page.screenshot({ path: `${SHOTS}dashboard-dark-1440.png` });
  });
});
