import { describe, expect, it } from 'vitest'
import {
  canApprove,
  deriveAssignmentStatus,
  gradebookCellProjection,
  gradebookCellState,
  isGradeVisibleToStudent,
  isPublishedGrade,
} from '@/lib/grade-lifecycle'

describe('Grade lifecycle predicates', () => {
  it('treats null approved_at as Pending Grade', () => {
    expect(canApprove(null)).toBe(true)
    expect(isPublishedGrade(null)).toBe(false)
    expect(isGradeVisibleToStudent(null)).toBe(false)
  })

  it('treats non-null approved_at as Published Grade', () => {
    const approvedAt = '2026-05-29T10:00:00.000Z'

    expect(canApprove(approvedAt)).toBe(false)
    expect(isPublishedGrade(approvedAt)).toBe(true)
    expect(isGradeVisibleToStudent(approvedAt)).toBe(true)
  })
})

describe('gradebookCellProjection', () => {
  it('returns pending state with no score for a Submission without a Grade', () => {
    expect(gradebookCellProjection({ hasSubmission: true, grade: null })).toEqual({
      state: 'pending',
      score: null,
    })
  })

  it('returns the AI Suggested Grade score for a Pending Grade', () => {
    expect(
      gradebookCellProjection({
        hasSubmission: true,
        grade: { aiScore: 18, finalScore: null, approvedAt: null },
      }),
    ).toEqual({ state: 'ai_suggested', score: 18 })
  })

  it('returns the Final Grade score for a Published Grade', () => {
    expect(
      gradebookCellProjection({
        hasSubmission: true,
        grade: {
          aiScore: 18,
          finalScore: 20,
          approvedAt: '2026-05-29T10:00:00.000Z',
        },
      }),
    ).toEqual({ state: 'final', score: 20 })
  })
})

describe('deriveAssignmentStatus — checkoff scenarios', () => {
  it('returns submitted when checkoff creates an empty-body submission', () => {
    // checkOffAssignment always writes { body: '', status: 'submitted' }
    expect(deriveAssignmentStatus({ body: '', status: 'submitted' }, null)).toEqual({ status: 'submitted' })
  })

  it('returns submitted when an in-progress draft is checked off (body cleared)', () => {
    // Student had typed text, then clicked the checkmark — body is wiped to ''
    expect(deriveAssignmentStatus({ body: '', status: 'submitted' }, null)).toEqual({ status: 'submitted' })
  })
})

describe('compatibility read models', () => {
  it('keeps the existing Gradebook cell states', () => {
    expect(gradebookCellState({ hasSubmission: false, hasGrade: false, approvedAt: null })).toBe('blank')
    expect(gradebookCellState({ hasSubmission: true, hasGrade: false, approvedAt: null })).toBe('pending')
    expect(gradebookCellState({ hasSubmission: true, hasGrade: true, approvedAt: null })).toBe('ai_suggested')
    expect(
      gradebookCellState({
        hasSubmission: true,
        hasGrade: true,
        approvedAt: '2026-05-29T10:00:00.000Z',
      }),
    ).toBe('final')
  })

  it('keeps the existing Student dashboard status projection', () => {
    expect(deriveAssignmentStatus(null, null)).toEqual({ status: 'not-started' })
    expect(deriveAssignmentStatus({ body: 'draft', status: 'draft' }, null)).toEqual({ status: 'in-progress' })
    expect(deriveAssignmentStatus({ body: 'answer', status: 'submitted' }, null)).toEqual({ status: 'submitted' })
    expect(
      deriveAssignmentStatus(
        { body: 'answer', status: 'graded' },
        { final_score: 95, approved_at: '2026-05-29T10:00:00.000Z' },
      ),
    ).toEqual({ status: 'graded', grade: 95 })
  })
})
