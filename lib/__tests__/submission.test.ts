import { describe, it, expect } from 'vitest'
import { canSubmit } from '@/lib/submission'

describe('canSubmit', () => {
  it('allows submission when no existing submission', () => {
    expect(canSubmit(null)).toBe(true)
  })

  it('allows submission when existing submission is in draft', () => {
    expect(canSubmit('draft')).toBe(true)
  })

  it('rejects submission when existing submission is already submitted', () => {
    expect(canSubmit('submitted')).toBe(false)
  })

  it('rejects submission when existing submission is graded', () => {
    expect(canSubmit('graded')).toBe(false)
  })
})
