import { defineConfig, devices } from '@playwright/test';

const MOCK_URL = 'http://localhost:5180';
const API_UI_URL = 'http://localhost:5181';
const API_URL = 'http://localhost:5055';

/**
 * Three test targets:
 *  - desktop / mobile: the app on the in-browser mock API (fast, deterministic)
 *  - responsive: viewport sweep (1440 → 375) for overflow, axe and screenshots
 *  - api: the app built against the real Express backend (memory driver)
 */
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 45_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: MOCK_URL,
    reducedMotion: 'reduce',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'desktop', testMatch: /(public|workspace)\.spec\.js/, use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', testMatch: /mobile\.spec\.js/, use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 } } },
    { name: 'responsive', testMatch: /responsive\.spec\.js/, use: { ...devices['Desktop Chrome'] } },
    { name: 'api', testMatch: /api\.spec\.js/, use: { ...devices['Desktop Chrome'], baseURL: API_UI_URL } },
  ],
  webServer: [
    {
      command: 'npx vite --port 5180 --strictPort',
      url: MOCK_URL,
      env: { VITE_DATA_SOURCE: 'mock', VITE_MOCK_LATENCY_MS: '120' },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: 'node ../backend/src/server.js',
      url: `${API_URL}/api/health`,
      env: { PORT: '5055', DB_DRIVER: 'memory', CORS_ORIGIN: API_UI_URL },
      reuseExistingServer: !process.env.CI,
      timeout: 30_000,
    },
    {
      command: 'npx vite --port 5181 --strictPort',
      url: API_UI_URL,
      env: { VITE_DATA_SOURCE: 'api', VITE_API_BASE_URL: `${API_URL}/api` },
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
