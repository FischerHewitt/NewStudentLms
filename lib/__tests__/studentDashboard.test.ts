import { describe, it, expect } from 'vitest'
import { deriveAssignmentStatus } from '@/lib/studentDashboard'

describe('deriveAssignmentStatus', () => {
  it('returns not-started when there is no submission', () => {
    expect(deriveAssignmentStatus(null, null)).toEqual({ status: 'not-started' })
  })

  it('returns not-started when submission is a draft with no body', () => {
    expect(deriveAssignmentStatus({ body: '', status: 'draft' }, null)).toEqual({ status: 'not-started' })
  })

  it('returns in-progress when submission is a draft with a non-empty body', () => {
    expect(deriveAssignmentStatus({ body: 'some work', status: 'draft' }, null)).toEqual({ status: 'in-progress' })
  })

  it('returns submitted when submission has been submitted', () => {
    expect(deriveAssignmentStatus({ body: 'my answer', status: 'submitted' }, null)).toEqual({ status: 'submitted' })
  })

  it('returns graded with the final score when the grade has been published', () => {
    expect(
      deriveAssignmentStatus(
        { body: 'my answer', status: 'graded' },
        { final_score: 22, approved_at: '2026-05-25T10:00:00Z' },
      ),
    ).toEqual({ status: 'graded', grade: 22 })
  })

  it('falls back to submitted when submission is graded but no grade row exists', () => {
    expect(
      deriveAssignmentStatus({ body: 'my answer', status: 'graded' }, null),
    ).toEqual({ status: 'submitted' })
  })
})
