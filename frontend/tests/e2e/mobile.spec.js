import { test, expect } from '@playwright/test';
import { signInViaStorage, expectNoHorizontalOverflow } from './helpers.js';

test.describe('Mobile (390px)', () => {
  test('mobile menu opens, traps focus, navigates and closes with Escape', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('navigation', { name: 'Main' }).first()).toBeHidden();
    const toggle = page.getByRole('button', { name: 'Menu', exact: true });
    await expect(toggle).toHaveAttribute('aria-expanded', 'false');
    await toggle.click();

    const menu = page.getByRole('dialog', { name: 'Site menu' });
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toHaveCount(0);
    await expect(toggle).toBeFocused();

    await toggle.click();
    await menu.getByRole('link', { name: 'Our Work' }).click();
    await expect(page).toHaveURL('/work');
    await expect(page.getByRole('dialog', { name: 'Site menu' })).toHaveCount(0);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Our work');
  });

  test('public pages fit the phone width', async ({ page }) => {
    for (const path of ['/', '/services', '/work', '/work/marketly', '/about', '/contact']) {
      await page.goto(path);
      await expectNoHorizontalOverflow(page);
    }
  });

  test('workspace drawer navigation works on a phone', async ({ page }) => {
    await signInViaStorage(page);
    await page.goto('/workspace');
    await page.getByRole('button', { name: 'Open navigation' }).click();
    const drawer = page.getByRole('dialog', { name: 'Workspace navigation' });
    await expect(drawer).toBeVisible();
    await drawer.getByRole('link', { name: 'Tasks' }).click();
    await expect(page).toHaveURL('/workspace/tasks');
    await expect(drawer).toHaveCount(0);
    await expectNoHorizontalOverflow(page);
  });

  test('filters collapse behind a toggle on phones', async ({ page }) => {
    await signInViaStorage(page);
    await page.goto('/workspace/projects');
    await expect(page.getByLabel('Priority')).toBeHidden();
    await page.getByRole('button', { name: 'Filters' }).click();
    await page.getByLabel('Priority').selectOption('urgent');
    await expect(page.getByTestId('project-count')).toHaveText('1 of 10 projects');
  });

  test('modals fit the mobile viewport', async ({ page }) => {
    await signInViaStorage(page);
    await page.goto('/workspace/projects');
    await page.getByRole('button', { name: 'New project' }).click();
    const box = await page.getByRole('dialog', { name: 'New project' }).boundingBox();
    expect(box.width).toBeLessThanOrEqual(390);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  });
});
