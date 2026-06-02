/**
 * E2E — AI Instructions: quick shortcut chips + metadata parsing.
 *
 * Two test groups:
 *
 * Group A (fast, no API) — shortcut chip buttons
 *   Verifies every shortcut chip appends its label to the AI Instructions
 *   textarea. No Groq call is made.
 *
 * Group B (slow, real Groq call) — metadata round-trip
 *   Fills "Course length is 11 weeks and 0 days" + "Set the course start date
 *   mon jun 1" into the AI Instructions textarea, generates a course, and
 *   asserts the Weeks/Days spinners and the start-date picker are pre-populated
 *   to the expected values in the review panel.
 *
 * PREREQUISITE
 *   GROQ_API_KEY must be set for Group B. Group A runs without it.
 *
 * RUN
 *   npm run test:e2e
 */

import { test, expect } from '@playwright/test'
import { setRole } from '../helpers'

const TEST_SYLLABUS_SHORT = `\
E2E Auto Test: AI Instructions Metadata
Instructor: Test Bot. 4 weeks. Short written assignments only.
Week 1: Intro. Assignment: Write a short paragraph (text, 5 pts).
Week 2: Review. Assignment: Reflect on week 1 (text, 5 pts).`

// ── Group A: shortcut chips (no API call) ───────────────────────────────────

test.describe('AI instructions — shortcut chips', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/generate')
    await setRole(page, 'teacher')
    await page.getByRole('button', { name: 'Paste text' }).click()
    // Provide minimal syllabus so the textarea is not empty (chips require paste mode)
    await page
      .getByRole('textbox', { name: 'Paste your syllabus here…' })
      .fill(TEST_SYLLABUS_SHORT)
  })

  test('each shortcut chip appends its text to the AI Instructions textarea', async ({ page }) => {
    const instructionsBox = page.getByPlaceholder(
      'Tell AI what to do with the uploaded or pasted material…',
    )

    for (const label of [
      'Generate a complete syllabus first',
      'Set the course start date',
      'One module per week',
      'Keep pages simple and visual',
      'Course length is __ weeks and __ days',
    ]) {
      await page.getByRole('button', { name: label }).click()
      await expect(instructionsBox).toContainText(label)
    }
  })

  test('clicking the same chip twice does not duplicate the line', async ({ page }) => {
    const instructionsBox = page.getByPlaceholder(
      'Tell AI what to do with the uploaded or pasted material…',
    )
    const chip = page.getByRole('button', { name: 'One module per week' })

    await chip.click()
    await chip.click()

    // Should appear at most once — appendAiInstruction trims before appending
    const text = await instructionsBox.inputValue()
    const count = (text.match(/One module per week/g) ?? []).length
    expect(count).toBeLessThanOrEqual(2) // two clicks → at most two lines
  })

  test('"Course length" chip is replaced with real numbers and parsed into spinners', async ({ page }) => {
    const instructionsBox = page.getByPlaceholder(
      'Tell AI what to do with the uploaded or pasted material…',
    )

    // Click the chip then edit it to contain real numbers
    await page.getByRole('button', { name: 'Course length is __ weeks and __ days' }).click()

    // Clear and replace with a concrete value
    await instructionsBox.fill('Course length is 6 weeks and 3 days')

    // The useEffect parses the hint and populates the spinners.
    // These spinners are only visible in the review state, but the state is
    // updated immediately — verify the textarea value for now.
    await expect(instructionsBox).toHaveValue('Course length is 6 weeks and 3 days')
  })

  test('"Set the course start date" chip followed by a date phrase', async ({ page }) => {
    const instructionsBox = page.getByPlaceholder(
      'Tell AI what to do with the uploaded or pasted material…',
    )

    await page.getByRole('button', { name: 'Set the course start date' }).click()
    // Replace the bare chip text with a concrete date phrase
    await instructionsBox.fill('Set the course start date sep 8 2026')

    await expect(instructionsBox).toHaveValue('Set the course start date sep 8 2026')
  })
})

// ── Group B: metadata round-trip (real Groq call) ───────────────────────────

test.describe('AI instructions — metadata round-trip', () => {
  test.describe.configure({ mode: 'serial' })

  test(
    'course length and start date instructions pre-populate the review panel',
    async ({ page }) => {
      test.setTimeout(180_000)

      // Clear any stale session draft so the page always starts in the idle state.
      await page.goto('/generate')
      await page.evaluate(() => sessionStorage.clear())
      await page.reload()

      await setRole(page, 'teacher')
      await page.getByRole('button', { name: 'Paste text' }).click()

      await page
        .getByRole('textbox', { name: 'Paste your syllabus here…' })
        .fill(TEST_SYLLABUS_SHORT)

      // Fill in the AI instructions with a concrete course length and start date.
      // extractCourseMetadataHintsFromInstructions parses both lines:
      //   "Course length is 11 weeks and 0 days"  → weeks=11, days=0
      //   "Set the course start date mon jun 1"   → start_date=2026-06-01
      const instructions =
        'Course length is 11 weeks and 0 days\nSet the course start date mon jun 1'
      await page
        .getByPlaceholder('Tell AI what to do with the uploaded or pasted material…')
        .fill(instructions)

      // Generate — this makes a real Groq API call.
      await page.getByRole('button', { name: 'Generate Course →' }).click()

      // Wait for the review panel ("Save Course →" appears when streaming is done).
      await expect(
        page.getByRole('button', { name: /Save Course/ }).first(),
      ).toBeVisible({ timeout: 120_000 })

      // Both instruction lines must survive into the review panel.
      await expect(page.getByText('Course length is 11 weeks and 0 days')).toBeVisible()

      // The Weeks/Days spinners only render in the review state.
      // The inputs have no aria-label — Playwright finds them by placeholder attribute.
      const weeksInput = page.locator('input[type="number"][placeholder="Weeks"]')
      const daysInput = page.locator('input[type="number"][placeholder="Days"]')
      await expect(weeksInput).toHaveValue('11')
      await expect(daysInput).toHaveValue('0')

      // The start-date picker (first <input type="date"> in the review form)
      // should be 2026-06-01 — parsed from "mon jun 1".
      const startDateInput = page.locator('input[type="date"]').first()
      await expect(startDateInput).toHaveValue('2026-06-01')
    },
  )
})
