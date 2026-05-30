import { defineConfig, devices } from '@playwright/test'

const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? 'http://localhost:8001'
const skipWebServer = process.env.PLAYWRIGHT_SKIP_WEBSERVER === '1'

/**
 * Playwright configuration for E2E tests.
 *
 * Tests run against the dev server on port 8001.
 * The server must already be running (lsof -ti:8001) or the webServer block
 * below starts it automatically.
 *
 * Requires: GROQ_API_KEY in .env.local (AI grading tests make real API calls).
 *
 * Run:
 *   npm run test:e2e          — headless, terminal output
 *   npm run test:e2e:ui       — Playwright's interactive UI mode
 *   npx playwright show-report — view HTML report after a run
 *
 * Re-run against a fresh DB:
 *   Run supabase/seed-test-data.sql in the Supabase SQL editor, then re-run tests.
 */
export default defineConfig({
  globalSetup: './tests/global-setup.ts',
  testDir: './tests/e2e',
  fullyParallel: false,       // E2E tests share DB state — run serially
  retries: 0,                 // No retries — DB mutations are not idempotent
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    // Give the page plenty of time to load Next.js server-rendered content
    navigationTimeout: 15_000,
    actionTimeout: 10_000,
  },

  // Default timeout per test — generous for the AI Suggest step (real Groq call)
  timeout: 90_000,

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],

  // Re-use the existing dev server if it's already on 8001; start it otherwise.
  // CLAUDE.md: do NOT start on port 3000 or 8000.
  webServer: skipWebServer
    ? undefined
    : {
        command: 'npm run dev',
        url: 'http://localhost:8001',
        reuseExistingServer: true,
        timeout: 30_000,
      },
})
