import type { Page } from '@playwright/test'

/**
 * Switches the app role via the header toggle.
 * If already in the target role, does nothing.
 * Waits for the localStorage-backed hydration skeleton to resolve first.
 */
export async function setRole(page: Page, target: 'teacher' | 'student') {
  await page.waitForSelector('button[aria-label^="Switch to"]', { timeout: 8000 })

  const label = await page
    .locator('button[aria-label^="Switch to"]')
    .getAttribute('aria-label')

  // "Switch to student view" → currently teacher; "Switch to teacher view" → currently student
  const currentRole = label?.includes('student') ? 'teacher' : 'student'
  if (currentRole === target) return

  await page.locator('button[aria-label^="Switch to"]').click()

  const expectedLabel =
    target === 'teacher' ? 'Switch to student view' : 'Switch to teacher view'
  await page.waitForSelector(`button[aria-label="${expectedLabel}"]`, { timeout: 5000 })
}
