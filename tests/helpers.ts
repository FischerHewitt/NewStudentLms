import type { Page } from '@playwright/test'

/**
 * Sets the active role via localStorage and reloads if needed.
 *
 * The role system navigates between separate routes (/dashboard for teacher,
 * /studentview for student) rather than toggling in-place, so the only reliable
 * way to switch roles from a test is to write localStorage directly and reload.
 *
 * The RoleContext default is 'teacher' (for SSR), so:
 *  - empty localStorage on a teacher-layout page works without a reload
 *  - empty localStorage on a course/assignment page also works (defaults to teacher)
 * We only reload when the stored role actually differs from the target.
 */
export async function setRole(page: Page, target: 'teacher' | 'student') {
  const stored = await page.evaluate(
    () => localStorage.getItem('lms_active_role'),
  ).catch(() => null)

  if (stored === target) return

  await page.evaluate(
    (role) => localStorage.setItem('lms_active_role', role),
    target,
  )
  await page.reload()
}
