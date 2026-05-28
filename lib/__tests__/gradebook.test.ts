import { describe, it, expect } from 'vitest'
import { gradebookCellState } from '@/lib/gradebook'

describe('gradebookCellState', () => {
  it('returns blank when there is no submission', () => {
    expect(
      gradebookCellState({ hasSubmission: false, hasGrade: false, approvedAt: null }),
    ).toBe('blank')
  })

  it('returns pending when a submission exists but no grade has been created', () => {
    expect(
      gradebookCellState({ hasSubmission: true, hasGrade: false, approvedAt: null }),
    ).toBe('pending')
  })

  it('returns ai_suggested when a grade exists but is not yet approved', () => {
    expect(
      gradebookCellState({ hasSubmission: true, hasGrade: true, approvedAt: null }),
    ).toBe('ai_suggested')
  })

  it('returns final when a grade has been approved by the teacher', () => {
    expect(
      gradebookCellState({
        hasSubmission: true,
        hasGrade: true,
        approvedAt: '2024-01-01T00:00:00.000Z',
      }),
    ).toBe('final')
  })
})
