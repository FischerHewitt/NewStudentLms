import { describe, it, expect } from 'vitest'
import { canApprove, isGradeVisibleToStudent } from '@/lib/speedgrader'

describe('canApprove', () => {
  it('returns true when grade has not yet been approved', () => {
    expect(canApprove(null)).toBe(true)
  })

  it('returns false when grade has already been approved (idempotency guard)', () => {
    expect(canApprove('2024-01-01T00:00:00.000Z')).toBe(false)
  })
})

describe('isGradeVisibleToStudent', () => {
  it('returns false for a pending (unapproved) grade', () => {
    expect(isGradeVisibleToStudent(null)).toBe(false)
  })

  it('returns true for an approved grade', () => {
    expect(isGradeVisibleToStudent('2024-01-01T00:00:00.000Z')).toBe(true)
  })
})
