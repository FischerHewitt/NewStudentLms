/**
 * E2E — Flow B: Teacher creates a course from a syllabus → student sees it.
 *
 * Tests the full generation pipeline: syllabus text → Groq streaming → course
 * preview → teacher confirms → publish_course_structure DB function → student
 * enrolled and can see the course on their home page.
 *
 * PREREQUISITE
 *   global-setup.ts deletes any course with title ILIKE 'E2E Auto Test%' before
 *   each run, so the test always starts against a clean slate.
 *   GROQ_API_KEY must be set in .env.local — generation makes a real Groq call.
 *
 * SYLLABUS CONVENTION
 *   The test syllabus starts with "E2E Auto Test:" so the AI generates a course
 *   title with that prefix. global-setup identifies and cleans up by that prefix.
 *
 * RUN
 *   npm run test:e2e
 */

import { test, expect } from '@playwright/test'
import { setRole } from '../helpers'

const TEST_SYLLABUS = `\
E2E Auto Test: Introduction to Software Testing
Instructor: QA Bot. 4 weeks. All written short-answer assignments.
Week 1: Testing foundations. Assignment: Describe what makes a good unit test (text, 10 pts).
Week 2: Integration testing. Assignment: Explain an integration test scenario (text, 10 pts).
Week 3: End-to-end testing. Assignment: Describe an e2e test you would write (text, 10 pts).
Final: Reflection on what makes a complete test suite (text, 20 pts).`

const TEST_AI_INSTRUCTIONS = 'Course length is 4 weeks'

test.describe.configure({ mode: 'serial' })

test.describe('Flow B — course generation from syllabus', () => {

  // ── 1. Teacher generates and saves course ────────────────────────────────────

  test('teacher pastes syllabus, generates course, and saves it', async ({ page }) => {
    // Allow extra time — real Groq streaming call
    test.setTimeout(180_000)

    await page.goto('/generate')
    await setRole(page, 'teacher')

    // Switch from upload mode (default) to paste mode
    await page.getByRole('button', { name: 'Paste text' }).click()

    await page
      .getByRole('textbox', { name: 'Paste your syllabus here…' })
      .fill(TEST_SYLLABUS)
    await page
      .getByPlaceholder('Tell AI what to do with the uploaded or pasted material…')
      .fill(TEST_AI_INSTRUCTIONS)

    await page.getByRole('button', { name: 'Generate Course →' }).click()

    // "Save Course →" appears when review state is reached
    const saveCourseButton = page.getByRole('button', { name: /Save Course/ }).first()
    await expect(saveCourseButton).toBeVisible({
      timeout: 120_000,
    })
    await expect(page.getByText(TEST_AI_INSTRUCTIONS)).toBeVisible()

    // Same tab can reopen /generate and revive the draft from sessionStorage.
    await page.goto('/generate')
    await expect(saveCourseButton).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText(TEST_AI_INSTRUCTIONS)).toBeVisible()

    await saveCourseButton.click()

    // Navigates to /course/[id] after save
    await page.waitForURL(/\/course\/[0-9a-f-]{36}$/, { timeout: 15_000 })
  })

  // ── 2. Course page shows structure ──────────────────────────────────────────

  test('course page shows title and at least one assignment link', async ({ page }) => {
    // Re-open the course page — URL preserved in serial mode via browser session
    // but re-navigating from home is more robust
    await page.goto('/')
    await setRole(page, 'teacher')

    // The generated course card appears in the teacher tab bar
    await expect(
      page.getByRole('button', { name: /E2E Auto Test/ }).first(),
    ).toBeVisible({ timeout: 10_000 })

    // Open the course
    await page.getByRole('button', { name: /E2E Auto Test/ }).first().click()

    // Course heading
    await expect(
      page.locator('h1').filter({ hasText: /E2E Auto Test/ }),
    ).toBeVisible()

    // At least one assignment link generated
    await expect(
      page.locator('a[href*="/assignment/"]').first(),
    ).toBeVisible({ timeout: 10_000 })
  })

  // ── 3. Student sees the generated course ────────────────────────────────────

  test('student sees generated course on home page', async ({ page }) => {
    await page.goto('/')
    await setRole(page, 'student')

    // publish_course_structure auto-enrolls the seeded student (STUDENT_ID = Alex Rivera)
    // so the course should appear on the student dashboard
    await expect(
      page.getByText(/E2E Auto Test/, { exact: false }).first(),
    ).toBeVisible({ timeout: 10_000 })
  })
})
