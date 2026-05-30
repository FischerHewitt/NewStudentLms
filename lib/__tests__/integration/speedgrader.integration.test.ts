/**
 * Integration tests for the SpeedGrader AI flow.
 *
 * Uses a mock Supabase in-memory store and a mocked `generateObject` (no real
 * API calls). Verifies that runSpeedGrader() / approveGrade() write the correct
 * Grade rows and honour the short-circuit path for empty submissions.
 *
 * Run with: npm test  (included in the default fast suite)
 * For real-call snapshot tests see: lib/__tests__/snapshots/ (not yet created)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockDb } from '@/lib/__tests__/mocks/supabase'
import { submissions, mockAiResponse, assignment, rubric } from '@/lib/__tests__/fixtures/week1-reflection'
import {
  submissions as finalSubmissions,
  mockAiResponse as finalMockAiResponse,
  assignment as finalAssignment,
  rubric as finalRubric,
} from '@/lib/__tests__/fixtures/final-analysis-report'

// ---------------------------------------------------------------------------
// Module mocks — vi.mock is hoisted to the top of the file by Vitest, so
// these run before any imports below.
// ---------------------------------------------------------------------------

// Mock the Groq provider used by the AI model adapter. createGroq() returns
// `groq`, which is then called as groq('model-name') — so the mock must return
// a callable function.
vi.mock('@ai-sdk/groq', () => ({
  createGroq: () => () => ({ modelId: 'mock-model' }),
}))

// Mock the AI SDK's generateObject so we can control its return value per test.
vi.mock('ai', () => ({
  generateObject: vi.fn(),
}))

// Mutable reference updated in beforeEach — the vi.mock factory captures it
// via closure so each test gets a fresh in-memory DB.
const dbRef: { db: ReturnType<typeof createMockDb> | null } = { db: null }

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => dbRef.db,
}))

// ---------------------------------------------------------------------------
// Import server actions AFTER vi.mock declarations (Vitest hoists the mocks).
// ---------------------------------------------------------------------------

// eslint-disable-next-line import/order
import { runSpeedGrader, approveGrade } from '@/app/actions/speedgrader'
import { generateObject } from 'ai'

const mockedGenerateObject = vi.mocked(generateObject)

function mockGenerateObjectResponse(object: unknown) {
  mockedGenerateObject.mockResolvedValueOnce({
    object,
  } as Awaited<ReturnType<typeof generateObject>>)
}

// ---------------------------------------------------------------------------
// Shared test helpers
// ---------------------------------------------------------------------------

const BASE_SUB_ID = 'test-sub-001'
const BASE_ASSIGNMENT_ID = assignment.id

const testAssignment = {
  id: BASE_ASSIGNMENT_ID,
  title: assignment.title,
  instructions: assignment.instructions,
  points_possible: assignment.points_possible,
}

const testRubric = {
  id: 'test-rubric-001',
  assignment_id: BASE_ASSIGNMENT_ID,
  criteria: rubric.criteria,
}

/** Build a fresh in-memory DB with one submission and optional pre-seeded grades. */
function makeDb(
  subOverrides: Record<string, unknown> = {},
  grades: Record<string, unknown>[] = [],
) {
  return createMockDb({
    submissions: [
      {
        id: BASE_SUB_ID,
        body: '',
        assignment_id: BASE_ASSIGNMENT_ID,
        file_url: null,
        status: 'submitted',
        student_id: 'test-student-001',
        ...subOverrides,
      },
    ],
    assignments: [testAssignment],
    rubrics: [testRubric],
    grades,
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  dbRef.db = null // each test sets this explicitly
})

// ---------------------------------------------------------------------------
// Short-circuit: empty submissions skip Groq entirely
// ---------------------------------------------------------------------------

describe('runSpeedGrader — short-circuit for empty submissions', () => {
  it('Scenario D: skips Groq call and writes Grade with score=0 when body is empty and no file', async () => {
    dbRef.db = makeDb({ body: '', file_url: null })

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.error).toBeUndefined()
    expect(result.grade?.ai_suggested_score).toBe(0)
    expect(mockedGenerateObject).not.toHaveBeenCalled()
  })

  it('Scenario E: skips Groq call and writes Grade with score=0 when body is empty with file attached', async () => {
    dbRef.db = makeDb({ body: '', file_url: 'https://example.com/essay.pdf' })

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.error).toBeUndefined()
    expect(result.grade?.ai_suggested_score).toBe(0)
    expect(mockedGenerateObject).not.toHaveBeenCalled()
  })

  it('Scenario E: ai_suggested_feedback identifies file-only vs fully-empty path', async () => {
    // File-only (Scenario E) — feedback mentions file
    dbRef.db = makeDb({ body: '', file_url: 'https://example.com/essay.pdf' })
    const eResult = await runSpeedGrader(BASE_SUB_ID)
    expect(eResult.grade?.ai_suggested_feedback).toContain('file')

    // Fully empty (Scenario D) — feedback does NOT mention file
    dbRef.db = makeDb({ body: '', file_url: null })
    const dResult = await runSpeedGrader(BASE_SUB_ID)
    expect(dResult.grade?.ai_suggested_feedback).not.toContain('file')
  })
})

// ---------------------------------------------------------------------------
// AI grading with mock responses — verifies score calculation and DB write
// ---------------------------------------------------------------------------

describe('runSpeedGrader — AI grading with mock responses', () => {
  it('Scenario A: writes Grade with ai_suggested_score=100 matching mock payload', async () => {
    dbRef.db = makeDb({ body: submissions.A.body })
    mockGenerateObjectResponse(mockAiResponse.A)

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.error).toBeUndefined()
    expect(result.grade?.ai_suggested_score).toBe(submissions.A.expectedScore) // 100
    expect(mockedGenerateObject).toHaveBeenCalledOnce()
  })

  it('Scenario B1: writes Grade with ai_suggested_score=60, career criterion awarded 0', async () => {
    dbRef.db = makeDb({ body: submissions.B1.body })
    mockGenerateObjectResponse(mockAiResponse.B1)

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(submissions.B1.expectedScore) // 60
    // Verify the career criterion is 0 in the feedback rationale
    expect(result.grade?.ai_suggested_feedback).toContain('0/30')
  })

  it('Scenario B2: writes Grade with ai_suggested_score=90', async () => {
    dbRef.db = makeDb({ body: submissions.B2.body })
    mockGenerateObjectResponse(mockAiResponse.B2)

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(submissions.B2.expectedScore) // 90
  })

  it('Scenario B3: writes Grade with ai_suggested_score=68', async () => {
    dbRef.db = makeDb({ body: submissions.B3.body })
    mockGenerateObjectResponse(mockAiResponse.B3)

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(submissions.B3.expectedScore) // 68
  })

  it('Scenario B4: writes Grade with ai_suggested_score=82', async () => {
    dbRef.db = makeDb({ body: submissions.B4.body })
    mockGenerateObjectResponse(mockAiResponse.B4)

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(submissions.B4.expectedScore) // 82
  })

  it('ai_suggested_score is clamped to points_possible even if criterion sum exceeds it', async () => {
    dbRef.db = makeDb({ body: submissions.A.body })

    // Deliberately inflate one criterion so the sum exceeds points_possible (100)
    const inflatedResponse = {
      criterion_scores: mockAiResponse.A.criterion_scores.map((c, i) =>
        i === 0 ? { ...c, points_awarded: c.points_possible + 20 } : c,
      ),
      feedback_draft: 'Inflated score test',
    }
    mockGenerateObjectResponse(inflatedResponse)

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBeLessThanOrEqual(
      testAssignment.points_possible,
    )
  })

  it('approved_at is null after runSpeedGrader — grade is pending, not published', async () => {
    dbRef.db = makeDb({ body: submissions.A.body })
    mockGenerateObjectResponse(mockAiResponse.A)

    const result = await runSpeedGrader(BASE_SUB_ID)

    expect(result.grade?.approved_at).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// approveGrade: state transition and idempotency
// ---------------------------------------------------------------------------

describe('approveGrade', () => {
  const GRADE_ID = 'test-grade-001'

  it('sets approved_at, final_score, final_feedback and transitions submission to graded', async () => {
    dbRef.db = makeDb(
      { body: submissions.A.body, status: 'submitted' },
      [
        {
          id: GRADE_ID,
          submission_id: BASE_SUB_ID,
          ai_suggested_score: 100,
          ai_suggested_feedback: 'AI graded this',
          final_score: null,
          final_feedback: null,
          approved_at: null,
          approved_by: null,
        },
      ],
    )

    const { error } = await approveGrade(GRADE_ID, 95, 'Excellent work, minor deductions.')

    expect(error).toBeUndefined()

    // Grade row should now have approved_at set
    const grade = dbRef.db._store.grades?.find((g) => g.id === GRADE_ID)
    expect(grade?.final_score).toBe(95)
    expect(grade?.final_feedback).toBe('Excellent work, minor deductions.')
    expect(grade?.approved_at).not.toBeNull()

    // Submission should have transitioned to 'graded'
    const sub = dbRef.db._store.submissions?.find((s) => s.id === BASE_SUB_ID)
    expect(sub?.status).toBe('graded')
  })

  it('is idempotent — calling twice does not overwrite the original approved_at', async () => {
    const originalApprovedAt = '2026-05-29T10:00:00.000Z'

    dbRef.db = makeDb(
      { body: submissions.A.body, status: 'graded' },
      [
        {
          id: GRADE_ID,
          submission_id: BASE_SUB_ID,
          ai_suggested_score: 100,
          ai_suggested_feedback: 'AI graded this',
          final_score: 100,
          final_feedback: 'Great work',
          approved_at: originalApprovedAt,
          approved_by: 'test-teacher-001',
        },
      ],
    )

    // Second call with different score/feedback — should not overwrite
    const { error } = await approveGrade(GRADE_ID, 50, 'Trying to overwrite')

    expect(error).toBeUndefined()

    const grade = dbRef.db._store.grades?.find((g) => g.id === GRADE_ID)
    // approved_at must be unchanged — first timestamp wins
    expect(grade?.approved_at).toBe(originalApprovedAt)
  })
})

// ---------------------------------------------------------------------------
// hasAttachmentWithoutBody UI flag — server-side observable via grade messages
// ---------------------------------------------------------------------------

describe('hasAttachmentWithoutBody UI flag', () => {
  it('Scenario E: SpeedGrader writes a file-specific warning into the grade when body is empty but file is attached', async () => {
    dbRef.db = makeDb({ body: '', file_url: 'https://example.com/photo.jpg' })

    const result = await runSpeedGrader(BASE_SUB_ID)

    // final_feedback is the student-facing message — should mention the file
    expect(result.grade?.final_feedback).toMatch(/file/i)
  })

  it('Scenario D: SpeedGrader does not write a file warning when submission is fully empty', async () => {
    dbRef.db = makeDb({ body: '', file_url: null })

    const result = await runSpeedGrader(BASE_SUB_ID)

    // final_feedback should describe an empty submission, not mention a file
    expect(result.grade?.final_feedback).not.toMatch(/file/i)
  })
})

// ---------------------------------------------------------------------------
// Assignment 2: Final Analysis Report — low-completion-weight rubric
//
// Rubric: analysis 40 / evidence 30 / synthesis 25 / completion 5
// Key calibration insight: "shows up and tries" earns ~23–27 pts fewer here
// than on the warm-up because effort alone doesn't carry a 5-pt completion criterion.
// ---------------------------------------------------------------------------

const A2_SUB_ID = 'test-sub-002'
const A2_ASSIGNMENT_ID = finalAssignment.id // 'test-assignment-002'

const a2Assignment = {
  id: A2_ASSIGNMENT_ID,
  title: finalAssignment.title,
  instructions: finalAssignment.instructions,
  points_possible: finalAssignment.points_possible,
}

const a2Rubric = {
  id: finalRubric.id,
  assignment_id: A2_ASSIGNMENT_ID,
  criteria: finalRubric.criteria,
}

function makeDb2(subOverrides: Record<string, unknown> = {}) {
  return createMockDb({
    submissions: [
      {
        id: A2_SUB_ID,
        body: '',
        assignment_id: A2_ASSIGNMENT_ID,
        file_url: null,
        status: 'submitted',
        student_id: 'test-student-001',
        ...subOverrides,
      },
    ],
    assignments: [a2Assignment],
    rubrics: [a2Rubric],
    grades: [],
  })
}

describe('[Assignment 2] runSpeedGrader — short-circuit for empty submissions', () => {
  it('Scenario D: skips Groq call and writes Grade with score=0 when body is empty and no file', async () => {
    dbRef.db = makeDb2({ body: '', file_url: null })

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.error).toBeUndefined()
    expect(result.grade?.ai_suggested_score).toBe(0)
    expect(mockedGenerateObject).not.toHaveBeenCalled()
  })

  it('Scenario E: skips Groq call and writes Grade with score=0 when body is empty with file attached', async () => {
    dbRef.db = makeDb2({ body: '', file_url: finalSubmissions.E.file!.url })

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.error).toBeUndefined()
    expect(result.grade?.ai_suggested_score).toBe(0)
    expect(mockedGenerateObject).not.toHaveBeenCalled()
  })

  it('Scenario E: ai_suggested_feedback identifies file-only path', async () => {
    dbRef.db = makeDb2({ body: '', file_url: finalSubmissions.E.file!.url })

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.grade?.ai_suggested_feedback).toContain('file')
  })
})

describe('[Assignment 2] runSpeedGrader — AI grading with mock responses', () => {
  it('Scenario A: score=99 (five concepts, timestamped evidence, strategic synthesis)', async () => {
    dbRef.db = makeDb2({ body: finalSubmissions.A.body })
    mockGenerateObjectResponse(finalMockAiResponse.A)

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.error).toBeUndefined()
    expect(result.grade?.ai_suggested_score).toBe(finalSubmissions.A.expectedScore) // 99
    expect(mockedGenerateObject).toHaveBeenCalledOnce()
  })

  it('Scenario B1: score=37 — effort without timestamps earns near-zero on the evidence criterion', async () => {
    dbRef.db = makeDb2({ body: finalSubmissions.B1.body })
    mockGenerateObjectResponse(finalMockAiResponse.B1)

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(finalSubmissions.B1.expectedScore) // 37
    // Evidence criterion: no timestamps anywhere → 6/30
    expect(result.grade?.ai_suggested_feedback).toContain('6/30')
  })

  it('Scenario B2: score=72 — strong analysis and evidence, synthesis missing communication strategy', async () => {
    dbRef.db = makeDb2({ body: finalSubmissions.B2.body })
    mockGenerateObjectResponse(finalMockAiResponse.B2)

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(finalSubmissions.B2.expectedScore) // 72
    // Synthesis criterion: "deploys tools with skill" is not strategic analysis → 7/25
    expect(result.grade?.ai_suggested_feedback).toContain('7/25')
  })

  it('Scenario B3: score=41 — correct structure but every evidence claim is a vague generality', async () => {
    dbRef.db = makeDb2({ body: finalSubmissions.B3.body })
    mockGenerateObjectResponse(finalMockAiResponse.B3)

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(finalSubmissions.B3.expectedScore) // 41
    // Evidence criterion: zero timestamps, all generalizations → 4/30
    expect(result.grade?.ai_suggested_feedback).toContain('4/30')
  })

  it('Scenario B4: score=55 — one strong section, one misapplied concept, weak synthesis', async () => {
    dbRef.db = makeDb2({ body: finalSubmissions.B4.body })
    mockGenerateObjectResponse(finalMockAiResponse.B4)

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBe(finalSubmissions.B4.expectedScore) // 55
  })

  it('ai_suggested_score is clamped to points_possible even if criterion sum exceeds it', async () => {
    dbRef.db = makeDb2({ body: finalSubmissions.A.body })

    const inflatedResponse = {
      criterion_scores: finalMockAiResponse.A.criterion_scores.map((c, i) =>
        i === 0 ? { ...c, points_awarded: c.points_possible + 20 } : c,
      ),
      feedback_draft: 'Inflated score test',
    }
    mockGenerateObjectResponse(inflatedResponse)

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.grade?.ai_suggested_score).toBeLessThanOrEqual(a2Assignment.points_possible)
  })

  it('approved_at is null after runSpeedGrader — grade is pending, not published', async () => {
    dbRef.db = makeDb2({ body: finalSubmissions.A.body })
    mockGenerateObjectResponse(finalMockAiResponse.A)

    const result = await runSpeedGrader(A2_SUB_ID)

    expect(result.grade?.approved_at).toBeNull()
  })
})
