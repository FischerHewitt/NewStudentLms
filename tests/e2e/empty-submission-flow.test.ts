/**
 * E2E — Flow C: Empty submission short-circuit (Scenario D).
 *
 * Verifies the teacher-side UI for a submission with no body content:
 *   - AI Suggest resolves immediately (no Groq call) with score 0
 *   - Feedback identifies it as a short-circuit / empty submission
 *   - Teacher can publish the 0 grade
 *
 * PREREQUISITE
 *   global-setup.ts inserts a fresh empty submission for Sam Nguyen on BIO
 *   Connect HW 1 before each run, so this flow always starts in a clean state.
 *   No GROQ_API_KEY required — the short-circuit bypasses the AI entirely.
 *
 * ASSIGNMENT USED
 *   BIO 111 – Connect Homework 1 (same course/assignment as Flow A)
 *   Course:     00000000-0000-0000-0001-000000000002
 *   Assignment: 00000000-0000-0000-0003-000000000015
 *   Student:    Sam Nguyen (00000000-0000-0000-0000-000000000006)
 *
 * NOTE ON SCENARIO E (file attached, body empty)
 *   The teacher-side short-circuit for Scenario E (hasAttachmentWithoutBody) is
 *   covered by lib/__tests__/ai-speedgrader.test.ts. The student-facing warning
 *   UI does not exist yet — those tests remain skipped below.
 */

import { test, expect } from '@playwright/test'
import { setRole } from '../helpers'

const COURSE_ID     = '00000000-0000-0000-0001-000000000002'
const ASSIGNMENT_ID = '00000000-0000-0000-0003-000000000015'
const ASSIGNMENT_URL = `/course/${COURSE_ID}/assignment/${ASSIGNMENT_ID}`

test.describe.configure({ mode: 'serial' })

test.describe('Flow C — empty submission short-circuit', () => {

  // ── 1. Teacher sees Sam Nguyen's empty submission ───────────────────────────

  test('teacher sees Sam Nguyen in the submission list with no content', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'teacher')

    // Sam Nguyen appears in the left submissions panel
    await expect(
      page.locator('button').filter({ hasText: 'Sam Nguyen' }),
    ).toBeVisible()

    // Select Sam's submission
    await page.locator('button').filter({ hasText: 'Sam Nguyen' }).click()

    // Right panel: empty body placeholder text
    await expect(page.getByText('No content submitted.')).toBeVisible()
  })

  // ── 2. AI Suggest short-circuits with score 0 ────────────────────────────────

  test('Scenario D: AI Suggest returns score 0 with short-circuit feedback (no Groq call)', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'teacher')

    await page.locator('button').filter({ hasText: 'Sam Nguyen' }).click()

    const aiSuggestBtn = page.getByRole('button', { name: 'AI Suggest' })

    // If grade already exists from a prior run within this session, verify and exit
    if (!(await aiSuggestBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      await expect(page.getByTestId('ai-suggestion')).toBeVisible()
      return
    }

    await aiSuggestBtn.click()

    // Short-circuit path: no Groq call — should resolve in well under 10 s
    const suggestionBox = page.getByTestId('ai-suggestion')
    await expect(suggestionBox).toBeVisible({ timeout: 10_000 })

    // Score is 0
    const scoreText = await suggestionBox
      .locator('.text-indigo-700')
      .first()
      .textContent()
    expect(parseInt(scoreText ?? '1', 10)).toBe(0)

    // Feedback identifies the short-circuit
    await expect(suggestionBox.locator('.text-indigo-600')).toContainText('Short-circuit')

    // Score input pre-populated with 0
    const inputValue = await page.locator('input[type="number"]').inputValue()
    expect(parseInt(inputValue, 10)).toBe(0)
  })

  // ── 3. Teacher publishes 0 grade ────────────────────────────────────────────

  test('Scenario D: teacher publishes the 0 grade — panel goes read-only', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'teacher')

    await page.locator('button').filter({ hasText: 'Sam Nguyen' }).click()

    // If already published from a prior run, verify read-only state
    if (await page.getByText('Published', { exact: true }).isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.getByText('Final Score', { exact: true })).toBeVisible()
      return
    }

    await page.getByRole('button', { name: 'Publish Grade' }).click()

    await expect(page.getByText('Published', { exact: true })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Final Score', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Publish Grade' })).not.toBeVisible()
  })

  // ── Skipped: Scenario E (teacher side) ──────────────────────────────────────

  test.skip('Scenario E: AI Suggest shows file-warning when body empty but file attached', () => {
    // Requires seeding a file-only submission (attachment, no body text).
    // The short-circuit logic (hasAttachmentWithoutBody) is covered by
    // lib/__tests__/ai-speedgrader.test.ts. UI path deferred to a later sprint.
  })

  // ── Skipped: Scenario E (student side) ──────────────────────────────────────

  test.skip('Scenario E: student-facing warning visible when body empty but file attached', () => {
    // No student-facing warning UI exists for attachment-without-body submissions.
    // The student currently sees only their file and a "Submitted" badge.
    // Build the warning UI first, then un-skip this test.
  })
})
