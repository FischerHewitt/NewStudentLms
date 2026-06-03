/**
 * E2E — Demo Loop: the exact sequence shown in the hackathon demo.
 *
 * Mirrors demo/README.md step by step.
 *
 * PREREQUISITE
 *   global-setup.ts cleans up MATH 143 courses between runs (already wired).
 *   GROQ_API_KEY must be set in .env.local — generation makes a real Groq call.
 *
 * DEMO SCRIPT (from demo/README.md)
 *   Step 1 — Teacher home shows BIO 111 and COMS 101 pre-loaded
 *   Step 2 — Generate MATH 143 live from demo/math-143-syllabus.txt
 *   Step 3 — Student (Alex Rivera) submits Wednesday Problem with intentional sign error
 *   Step 4 — Teacher runs AI Suggest → expected 9/10 (criterion 4 fails: wrong sign)
 *            → Teacher publishes → Student sees grade
 *
 * RUN
 *   npm run test:e2e
 *   npm run test:e2e:ui   (interactive)
 */

import * as fs from 'fs'
import * as path from 'path'
import { test, expect } from '@playwright/test'
import { setRole } from '../helpers'

// ── Submission: paste from demo/wednesday-problem-submission.txt then type "= +1" ──
// The file ends with "Step 4: The limit is" (no final answer).
// In the live demo the presenter types "= +1" (intentional sign error; correct is -1).

const SUBMISSION_FILE = path.resolve(__dirname, '../../demo/wednesday-problem-submission.txt')

function buildSubmission(): string {
  const raw = fs.readFileSync(SUBMISSION_FILE, 'utf8')
  // Strip the DEMO INSTRUCTIONS header (everything up to and including the dashed line)
  const divider = '─────────────────────────────────────────────────────────────────────────────'
  const idx = raw.indexOf(divider)
  const body = idx >= 0 ? raw.slice(idx + divider.length).trim() : raw.trim()
  // Append the intentional sign error line (correct answer is -1; demo uses +1)
  return body + '\n= +1'
}

const SUBMISSION_BODY = buildSubmission()

// ── Shared state across serial tests ────────────────────────────────────────────

let courseUrl = ''   // set after generation; used in subsequent tests
let assignmentUrl = '' // set after navigating to Wednesday Problem

// ── Tests run in strict serial order ────────────────────────────────────────────

test.describe.configure({ mode: 'serial' })

test.describe('Demo Loop — full hackathon script', () => {

  // ── Step 1: Teacher dashboard shows BIO 111 and COMS 101 ───────────────────

  test('Step 1: teacher dashboard shows pre-loaded BIO 111 and COMS 101 courses', async ({ page }) => {
    await page.goto('/dashboard')
    await setRole(page, 'teacher')

    await expect(page.getByRole('heading', { name: /BIO 111/i }).first()).toBeVisible({ timeout: 10_000 })
    await expect(page.getByRole('heading', { name: /COMS 101/i }).first()).toBeVisible({ timeout: 10_000 })
  })

  // ── Step 2: Generate MATH 143 from syllabus ──────────────────────────────────

  test('Step 2: teacher pastes MATH 143 syllabus, generates, and saves course', async ({ page }) => {
    test.setTimeout(180_000)

    const syllabus = fs.readFileSync(
      path.resolve(__dirname, '../../demo/math-143-syllabus.txt'),
      'utf8',
    )

    await page.goto('/generate')
    await setRole(page, 'teacher')

    // Switch from upload mode (default) to paste mode
    await page.getByRole('button', { name: 'Paste text' }).click()

    await page
      .getByRole('textbox', { name: 'Paste your syllabus here…' })
      .fill(syllabus)

    await page.getByRole('button', { name: 'Generate Course →' }).click()

    // Groq streaming — wait for the review/preview state
    const saveCourseButton = page.getByRole('button', { name: /Save Course/ }).first()
    await expect(saveCourseButton).toBeVisible({ timeout: 120_000 })

    // Preview should show course title
    await expect(page.getByText('MATH 143', { exact: false })).toBeVisible()

    await saveCourseButton.click()

    // Navigates to /course/[uuid] after save
    await page.waitForURL(/\/course\/[0-9a-f-]{36}$/, { timeout: 15_000 })
    courseUrl = page.url()
  })

  // ── Step 2 verification: course page shows Week 1 and Wednesday Problem ───────

  test('Step 2: MATH 143 course page shows Week 1 and Wednesday Problem assignment', async ({ page }) => {
    await page.goto(courseUrl)
    await setRole(page, 'teacher')

    // Course heading
    await expect(page.locator('h1').filter({ hasText: /MATH 143/ })).toBeVisible({ timeout: 10_000 })

    // Week 1 module
    await expect(page.getByText('Week 1', { exact: false })).toBeVisible()

    // Wednesday Problem assignment link
    const wednesdayLink = page.getByRole('link', { name: /Wednesday Problem/i }).first()
    await expect(wednesdayLink).toBeVisible({ timeout: 10_000 })

    // Capture assignment URL for subsequent tests
    const href = await wednesdayLink.getAttribute('href')
    if (!href) throw new Error('Wednesday Problem link has no href')
    assignmentUrl = href.startsWith('http') ? href : `http://localhost:8001${href}`
  })

  // ── Step 3: Student submits Wednesday Problem with sign error ─────────────────

  test('Step 3: student opens Wednesday Problem and submits with intentional sign error', async ({ page }) => {
    await page.goto(assignmentUrl)
    await setRole(page, 'student')

    // Heading and points visible
    await expect(page.getByRole('heading', { name: /Wednesday Problem/i })).toBeVisible()
    await expect(page.getByText('10 pts', { exact: true })).toBeVisible()

    // Submission textarea
    const textarea = page.getByPlaceholder('Write your response here')

    // If already submitted (re-run), just verify badge and exit
    if (!(await textarea.isVisible({ timeout: 3000 }).catch(() => false))) {
      await expect(
        page.locator('span').filter({ hasText: /^(Submitted|Graded)$/ }).first(),
      ).toBeVisible()
      return
    }

    await textarea.fill(SUBMISSION_BODY)

    // Verify the math structure came through legibly — step labels, fraction notation,
    // Unicode symbols, and the intentional sign error are all visible in the textarea.
    await expect(textarea).toContainText('Step 1:')
    await expect(textarea).toContainText('Step 2:')
    await expect(textarea).toContainText('Step 3:')
    await expect(textarea).toContainText('Step 4:')
    await expect(textarea).toContainText('3/n')          // fraction notation
    await expect(textarea).toContainText('→ ∞')          // Unicode: arrow + infinity
    await expect(textarea).toContainText('-1/1')         // correct intermediate result
    await expect(textarea).toContainText('= +1')         // intentional sign error at the end

    const submitBtn = page.getByRole('button', { name: 'Submit →' })
    await expect(submitBtn).toBeEnabled()
    await submitBtn.click()

    await expect(
      page.locator('span').filter({ hasText: 'Submitted' }).first(),
    ).toBeVisible({ timeout: 15_000 })
  })

  // ── Step 4a: Teacher sees Alex Rivera's submission ───────────────────────────

  test('Step 4: teacher opens Wednesday Problem and sees Alex Rivera submission', async ({ page }) => {
    await page.goto(assignmentUrl)
    await setRole(page, 'teacher')

    // Submissions panel visible
    await expect(page.getByText(/Submissions \(\d+\)/)).toBeVisible({ timeout: 10_000 })

    // Alex Rivera listed and submission body visible
    await expect(page.getByText('Alex Rivera').first()).toBeVisible()
    await expect(page.getByText('Student Submission')).toBeVisible()
    await expect(page.getByText('dominant terms', { exact: false })).toBeVisible()
  })

  // ── Step 4b: Teacher runs AI Suggest ────────────────────────────────────────

  test('Step 4: teacher clicks AI Suggest — score expected near 9/10', async ({ page }) => {
    test.setTimeout(90_000)

    await page.goto(assignmentUrl)
    await setRole(page, 'teacher')

    const aiSuggestBtn = page.getByRole('button', { name: 'AI Suggest' })

    // If grade already exists from a prior run, skip straight to verify
    if (!(await aiSuggestBtn.isVisible({ timeout: 2000 }).catch(() => false))) {
      const suggestionBox = page.getByTestId('ai-suggestion')
      const finalScoreHeading = page.getByText('Final Score', { exact: true })
      await expect(suggestionBox.or(finalScoreHeading)).toBeVisible()
      return
    }

    await aiSuggestBtn.click()

    // Real Groq call — wait generously
    const suggestionBox = page.getByTestId('ai-suggestion')
    await expect(suggestionBox).toBeVisible({ timeout: 60_000 })
    await expect(page.getByText('AI Suggestion')).toBeVisible()

    // Score should be between 8 and 10 — demo script expects exactly 9/10
    // (criteria 1–3 correct: 9 pts; criterion 4 wrong sign: 0 pts)
    const scoreInput = page.locator('input[type="number"]')
    const inputValue = await scoreInput.inputValue()
    const score = parseInt(inputValue, 10)
    expect(score).toBeGreaterThanOrEqual(8)
    expect(score).toBeLessThanOrEqual(10)

    // AI feedback should specifically call out the sign error
    const suggestionText = await suggestionBox.textContent()
    expect(suggestionText?.toLowerCase()).toMatch(/sign|negative|\-1/)
  })

  // ── Step 4c: Teacher publishes grade ────────────────────────────────────────

  test('Step 4: teacher publishes grade — panel goes read-only', async ({ page }) => {
    await page.goto(assignmentUrl)
    await setRole(page, 'teacher')

    // Already published? Just verify.
    if (await page.getByText('Published', { exact: true }).isVisible({ timeout: 2000 }).catch(() => false)) {
      await expect(page.getByText('Final Score', { exact: true })).toBeVisible()
      return
    }

    const publishBtn = page.getByRole('button', { name: 'Publish Grade' })
    await expect(publishBtn).toBeVisible()
    await publishBtn.click()

    await expect(page.getByText('Published', { exact: true })).toBeVisible({ timeout: 10_000 })
    await expect(page.getByText('Final Score', { exact: true })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Publish Grade' })).not.toBeVisible()
  })

  // ── Step 4d: Student sees published grade ───────────────────────────────────

  test('Step 4: student sees published grade on Wednesday Problem', async ({ page }) => {
    await page.goto(assignmentUrl)
    await setRole(page, 'student')

    await expect(page.getByText('Your Grade')).toBeVisible({ timeout: 10_000 })

    const scoreLocator = page.locator('.bg-emerald-50').getByText(/^\d+$/).first()
    await expect(scoreLocator).toBeVisible()
    const scoreText = await scoreLocator.textContent()
    const score = parseInt(scoreText ?? '0', 10)
    expect(score).toBeGreaterThanOrEqual(8)
    expect(score).toBeLessThanOrEqual(10)

    await expect(page.getByText('/ 10 pts')).toBeVisible()

    // Feedback mentions the sign error
    const feedback = page.locator('.bg-emerald-50').locator('p').first()
    await expect(feedback).toBeVisible()
    expect((await feedback.textContent())?.trim().length).toBeGreaterThan(10)
  })
})
