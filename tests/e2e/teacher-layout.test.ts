/**
 * E2E — Teacher layout shell (#57)
 *
 * Verifies that the teacher route group renders the sidebar nav at /dashboard,
 * and that the student view at / is unaffected.
 *
 * RUN
 *   npm run test:e2e          — headless
 *   npm run test:e2e:ui       — interactive UI
 */

import { test, expect } from '@playwright/test'

test('navigating to /dashboard renders the teacher sidebar nav', async ({ page }) => {
  await page.goto('/dashboard')
  const nav = page.locator('nav').filter({ hasText: 'Dashboard' })
  await expect(nav).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Dashboard' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Assignments' })).toBeVisible()
  await expect(nav.getByRole('link', { name: 'Gradebook' })).toBeVisible()
})

test('student root / does not show the teacher sidebar', async ({ page }) => {
  await page.goto('/')
  const nav = page.locator('nav').filter({ hasText: 'Dashboard' })
  await expect(nav).not.toBeVisible()
})

test('role toggle on teacher dashboard hard-navigates to student view', async ({ page }) => {
  await page.goto('/dashboard')
  // Wait for the toggle button to appear in the teacher header
  const toggle = page.getByRole('button', { name: /switch to student/i })
  await expect(toggle).toBeVisible()
  await toggle.click()
  // Should land on the student root
  await page.waitForURL('/')
  await expect(page).toHaveURL('/')
})
