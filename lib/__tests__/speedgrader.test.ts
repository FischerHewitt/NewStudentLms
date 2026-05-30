import { describe, it, expect } from 'vitest'
import { canApprove, isGradeVisibleToStudent, isEmptySubmission, hasAttachmentWithoutBody } from '@/lib/speedgrader'

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

describe('isEmptySubmission', () => {
  it('returns true for blank body (Scenario D — no body, no file)', () => {
    expect(isEmptySubmission('')).toBe(true)
  })

  it('returns true for whitespace-only body', () => {
    expect(isEmptySubmission('   ')).toBe(true)
  })

  it('returns true for file-only submission (Scenario E — body empty, file present)', () => {
    expect(isEmptySubmission('')).toBe(true)
  })

  it('returns false for a submission with text content', () => {
    expect(isEmptySubmission('I want to develop data analysis skills...')).toBe(false)
  })
})

describe('hasAttachmentWithoutBody', () => {
  it('returns true when file is present but body is empty (Scenario E — show UI flag)', () => {
    expect(hasAttachmentWithoutBody('', 'https://example.com/essay.pdf')).toBe(true)
  })

  it('returns false when body is empty and no file attached (Scenario D — no flag needed)', () => {
    expect(hasAttachmentWithoutBody('', null)).toBe(false)
  })

  it('returns false when body has content even with a file attached', () => {
    expect(hasAttachmentWithoutBody('My reflection...', 'https://example.com/essay.pdf')).toBe(false)
  })

  it('returns false when body has content and no file', () => {
    expect(hasAttachmentWithoutBody('My reflection...', null)).toBe(false)
  })
})
