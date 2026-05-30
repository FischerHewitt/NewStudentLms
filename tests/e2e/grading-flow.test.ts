/**
 * E2E — Flow A: Student submits → teacher grades → student sees published grade.
 *
 * This is the core demo loop. If this flow breaks, nothing else matters.
 *
 * PREREQUISITE
 *   Run against a freshly seeded DB (supabase/seed-test-data.sql).
 *   Alex Rivera (STUDENT_ID 000000000002) must have NO existing submission for
 *   BIO 111 Connect HW 1 (assignment 000000000015).
 *   Re-run seed-test-data.sql in the Supabase SQL editor to reset.
 *
 *   GROQ_API_KEY must be set in .env.local — the AI Suggest step makes a real call.
 *
 * ASSIGNMENT USED
 *   BIO 111 – Connect Homework 1 (Scientific Method and Cell Basics)
 *   Course:     00000000-0000-0000-0001-000000000002
 *   Assignment: 00000000-0000-0000-0003-000000000015
 *   Points: 5  |  Rubric: 3 pts (scientific method) + 2 pts (cell types)
 *
 * RUN
 *   npm run test:e2e          — headless
 *   npm run test:e2e:ui       — interactive UI (shows browser live)
 *   npx playwright show-report — HTML report after a run
 */

import { test, expect } from '@playwright/test'
import { setRole } from '../helpers'

// ── Stable seed-data IDs ─────────────────────────────────────────────────────

const COURSE_ID = '00000000-0000-0000-0001-000000000002'
const ASSIGNMENT_ID = '00000000-0000-0000-0003-000000000015'
const ASSIGNMENT_URL = `/course/${COURSE_ID}/assignment/${ASSIGNMENT_ID}`
const GRADEBOOK_URL = `/course/${COURSE_ID}/gradebook`

const ASSIGNMENT_TITLE = 'Connect Homework 1'
const ASSIGNMENT_POINTS = '5'

// ── Submission body — strong response, should earn near-full credit ───────────

const SUBMISSION_BODY = `\
The scientific method is a systematic process for investigating questions. \
The steps are: (1) observation — noticing something and forming a question; \
(2) hypothesis — a testable prediction; (3) experiment — a controlled test; \
(4) data collection and analysis; (5) conclusion — interpreting whether the data \
supports the hypothesis. For example, a scientist might observe that plants near \
a window grow taller, hypothesize that more light causes faster growth, set up an \
experiment with identical plants under different light levels, measure height \
weekly, and conclude that higher light exposure increases growth rate.

Prokaryotic cells lack a true nucleus — their DNA floats freely in the cytoplasm. \
They are smaller and structurally simpler, with no membrane-bound organelles. \
Examples: bacteria (E. coli) and archaea. Eukaryotic cells have a membrane-bound \
nucleus enclosing their DNA and contain organelles such as mitochondria and the \
endoplasmic reticulum. Examples: humans, yeast, and oak trees.`

// ── Flow A — main grading loop (serial — each test builds on the previous) ───

test.describe.configure({ mode: 'serial' })

test.describe('Flow A — full grading loop', () => {

  // ── 1. Student views assignment ─────────────────────────────────────────────

  test('student opens assignment and sees instructions + rubric', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'student')

    // Assignment heading
    await expect(
      page.getByRole('heading', { name: new RegExp(ASSIGNMENT_TITLE) }),
    ).toBeVisible()

    // Points badge (exact to avoid matching "/ 5 pts" in grade box on re-runs)
    await expect(page.getByText(`${ASSIGNMENT_POINTS} pts`, { exact: true })).toBeVisible()

    // Instructions section exists and has assignment-specific content
    await expect(page.getByText('Instructions')).toBeVisible()
    await expect(page.getByText('scientific method', { exact: false }).first()).toBeVisible()

    // Rubric section with both criteria point values
    await expect(page.getByText('Grading Rubric')).toBeVisible()
    await expect(page.getByText('3 pts', { exact: true })).toBeVisible()
    await expect(page.getByText('2 pts', { exact: true })).toBeVisible()

    // Submission area visible — either the textarea (not yet submitted) or the
    // read-only submitted body (if this is a re-run against the same DB state)
    const textarea = page.getByPlaceholder('Write your response here')
    const submittedBadge = page.locator('span').filter({ hasText: /^(Submitted|Graded)$/ }).first()
    await expect(textarea.or(submittedBadge)).toBeVisible()
  })

  // ── 2. Student submits ─────────────────────────────────────────────────────

  test('student submits assignment — status transitions to Submitted', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'student')

    const textarea = page.getByPlaceholder('Write your response here')

    // If already submitted from a previous test run, just verify the badge and exit
    if (!(await textarea.isVisible({ timeout: 2000 }).catch(() => false))) {
      await expect(
        page.locator('span').filter({ hasText: /^(Submitted|Graded)$/ }).first(),
      ).toBeVisible()
      return
    }

    await textarea.fill(SUBMISSION_BODY)

    // Submit button enabled once body has text
    const submitBtn = page.getByRole('button', { name: 'Submit →' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    // Wait for server action + router.refresh() to settle
    await expect(
      page.locator('span').filter({ hasText: 'Submitted' }).first(),
    ).toBeVisible({ timeout: 15000 })
  })

  // ── 3. Student can't edit after submitting ─────────────────────────────────

  test('student cannot edit submission after submitting — textarea is gone', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'student')

    // Textarea must not be present
    await expect(page.getByPlaceholder('Write your response here')).not.toBeVisible()

    // Submitted body should be visible as read-only prose
    await expect(page.getByText('scientific method', { exact: false }).first()).toBeVisible()
  })

  // ── 4. Teacher views split-panel Submission layout ────────────────────────

  test('teacher opens assignment and sees Alex Rivera submission', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'teacher')

    // Submissions panel is visible in teacher view
    await expect(page.getByText(/Submissions \(\d+\)/)).toBeVisible()

    // Alex Rivera's name in the list and selected details panel
    await expect(page.getByText('Alex Rivera').first()).toBeVisible()
    await expect(page.getByText('Student Submission')).toBeVisible()

    // Standalone SpeedGrader link is no longer the primary grading path
    await expect(page.getByRole('link', { name: 'SpeedGrader →' })).not.toBeVisible()
  })

  // ── 5. Teacher sees inline grading panel ──────────────────────────────────

  test('teacher sees selected Submission body, rubric, and inline grading controls', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'teacher')

    // Right panel: student name + submission body
    await expect(page.getByText('Student Submission')).toBeVisible()
    await expect(page.getByText('Alex Rivera').first()).toBeVisible()
    await expect(page.getByText('scientific method', { exact: false }).first()).toBeVisible()

    // Right panel: rubric and inline grade panel
    await expect(page.getByText('Grading Rubric')).toBeVisible()

    // If already approved from a prior run, just confirm read-only state and move on
    if (await page.getByText('Published', { exact: true }).isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.getByText('Final Score', { exact: true })).toBeVisible()
      return
    }

    // If pending grade exists, AI Suggest is hidden — Publish Grade still present
    // If idle (fresh submission), both buttons are present
    await expect(page.getByRole('button', { name: 'Publish Grade' })).toBeVisible()
  })

  // ── 6. Teacher runs AI Suggest ────────────────────────────────────────────

  test('teacher clicks AI Suggest — pending grade appears with score and rationale', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'teacher')

    const aiSuggestBtn = page.getByRole('button', { name: 'AI Suggest' })

    // If grade already exists from a prior run, AI Suggest button is absent.
    // It could be in 'pending' state (indigo suggestion box visible) or 'approved'
    // state (read-only Final Score panel). Either way, skip to next test.
    if (!(await aiSuggestBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      const suggestionBox = page.getByTestId('ai-suggestion')
      const finalScoreHeading = page.getByText('Final Score', { exact: true })
      await expect(suggestionBox.or(finalScoreHeading)).toBeVisible()
      return
    }

    await aiSuggestBtn.click()

    // Spinner appears, button disappears
    await expect(page.getByRole('button', { name: 'AI Suggest' })).not.toBeVisible({
      timeout: 5000,
    })

    // Real Groq call — wait generously (up to 45 s)
    const suggestionBox = page.getByTestId('ai-suggestion')
    await expect(suggestionBox).toBeVisible({ timeout: 45000 })
    await expect(page.getByText('AI Suggestion')).toBeVisible()

    // Score should be a positive number within range
    const scoreText = await page
      .getByTestId('ai-suggestion')
      .locator('.text-indigo-700, .font-bold')
      .first()
      .textContent()
    const score = parseInt(scoreText ?? '0', 10)
    expect(score).toBeGreaterThan(0)
    expect(score).toBeLessThanOrEqual(5)

    // Score input should be populated with the suggested score
    const scoreInput = page.locator('input[type="number"]')
    const inputValue = await scoreInput.inputValue()
    expect(parseInt(inputValue, 10)).toBeGreaterThan(0)
  })

  // ── 7. Teacher publishes ───────────────────────────────────────────────────

  test('teacher clicks Publish Grade — panel goes read-only and row updates', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'teacher')

    // If already published from a prior run, panel is read-only
    if (await page.getByText('Published', { exact: true }).isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.getByText('Final Score', { exact: true })).toBeVisible()
      return
    }

    const publishBtn = page.getByRole('button', { name: 'Publish Grade' })
    await expect(publishBtn).toBeVisible()
    await publishBtn.click()

    // Panel transitions to read-only (exact: true avoids matching banner ancestor)
    await expect(page.getByText('Published', { exact: true })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Final Score', { exact: true })).toBeVisible()

    // No more publish button
    await expect(
      page.getByRole('button', { name: 'Publish Grade' }),
    ).not.toBeVisible()
  })

  // ── 8. Student sees published grade ───────────────────────────────────────

  test('student sees published grade in the emerald grade box', async ({ page }) => {
    await page.goto(ASSIGNMENT_URL)
    await setRole(page, 'student')

    // Emerald "Your Grade" box must appear
    await expect(page.getByText('Your Grade')).toBeVisible({ timeout: 10000 })

    // Score is a positive integer
    const scoreLocator = page.locator('.bg-emerald-50').getByText(/^\d+$/).first()
    await expect(scoreLocator).toBeVisible()
    const scoreText = await scoreLocator.textContent()
    expect(parseInt(scoreText ?? '0', 10)).toBeGreaterThan(0)

    // Points possible shown next to score
    await expect(page.getByText(`/ ${ASSIGNMENT_POINTS} pts`)).toBeVisible()

    // Feedback text present
    const feedback = page
      .locator('.bg-emerald-50')
      .locator('p.text-sm, p.leading-relaxed')
      .first()
    await expect(feedback).toBeVisible()
    expect((await feedback.textContent())?.trim().length).toBeGreaterThan(10)
  })

  // ── 9. Gradebook reflects final grade ─────────────────────────────────────

  test('gradebook shows emerald Final Grade cell after publish', async ({ page }) => {
    await page.goto(GRADEBOOK_URL)
    await setRole(page, 'teacher')

    // Connect HW 1 column header visible in gradebook
    await expect(
      page.getByText('Connect Homework 1', { exact: false }),
    ).toBeVisible()

    // Alex Rivera's row
    await expect(page.getByText('Alex Rivera')).toBeVisible()

    // At least one emerald (final) grade cell visible in the table
    // (Alex Rivera's grade for Connect HW 1, emerald-100 pill with a number)
    await expect(page.locator('span.bg-emerald-100').first()).toBeVisible()
  })
})

// ── Flow A — empty submission edge cases ─────────────────────────────────────
// Full Scenario D/E UI tests require inserting blank submissions — deferred to Flow C.
// The server-side short-circuit behavior is already covered by integration tests.

test.describe('Flow A — empty submission edge cases', () => {
  test('Scenario D: SpeedGrader shows 0 score when body is empty (no file)', async () => {
    test.skip(true, 'Requires Flow C seed data — see things-to-do.txt. Short-circuit logic covered by integration tests.')
  })

  test('Scenario E: SpeedGrader shows file-warning banner when body empty but file attached', async () => {
    test.skip(true, 'Requires Flow C seed data — see things-to-do.txt.')
  })

  test('Scenario E: warning is visible to student in AssignmentView', async () => {
    test.skip(true, 'Requires Flow C seed data — see things-to-do.txt.')
  })
})
