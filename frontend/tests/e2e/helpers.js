import { expect } from '@playwright/test';

export const DEMO = { email: 'demo@designhub.example', password: 'studio-demo-2026' };

/** Starts the page with a demo session already stored (skips the login form). */
export async function signInViaStorage(page) {
  await page.addInitScript(() => {
    window.localStorage.setItem('designhub.session', JSON.stringify({ email: 'demo@designhub.example', name: 'Alex Morgan', startedAt: new Date().toISOString() }));
  });
}

/** Makes one mock API request fail with 503 (see services/mock/mockServer.js). */
export async function failMockRequest(page, rule) {
  await page.addInitScript((r) => window.localStorage.setItem('designhub.mock.fail', r), rule);
}

export async function expectNoHorizontalOverflow(page) {
  const overflow = await page.evaluate(() => ({
    scrollWidth: document.documentElement.scrollWidth,
    clientWidth: document.documentElement.clientWidth,
    offenders: [...document.querySelectorAll('body *')]
      .filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > document.documentElement.clientWidth + 1 && getComputedStyle(el).position !== 'fixed' ;
      })
      .slice(0, 5)
      .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 60)}`),
  }));
  expect(overflow.scrollWidth, `Horizontal overflow; offenders: ${overflow.offenders.join(' | ')}`).toBeLessThanOrEqual(overflow.clientWidth);
}

export const fillContactForm = async (page, overrides = {}) => {
  const data = {
    name: 'Jordan Blake',
    email: 'jordan@blake.example',
    company: 'Blake Bakery',
    projectType: 'Website Design',
    budget: '$5k–$10k',
    description: 'A new website for our bakery with an online pre-order form for weekend collections.',
    ...overrides,
  };
  await page.getByLabel('Full name').fill(data.name);
  await page.getByLabel('Email address').fill(data.email);
  await page.getByLabel('Company name').fill(data.company);
  await page.getByLabel('Project type').selectOption(data.projectType);
  await page.getByLabel('Budget range').selectOption(data.budget);
  await page.getByLabel('Project description').fill(data.description);
  return data;
};
