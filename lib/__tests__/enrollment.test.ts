import { describe, expect, it } from 'vitest'
import { validateEnrollmentEmail, parseEnrollmentEmails } from '@/lib/enrollment'

describe('validateEnrollmentEmail', () => {
  it('accepts a valid email', () => {
    expect(validateEnrollmentEmail('student@calpoly.edu')).toBe(true)
  })

  it('accepts email with plus alias', () => {
    expect(validateEnrollmentEmail('student+section2@calpoly.edu')).toBe(true)
  })

  it('rejects empty string', () => {
    expect(validateEnrollmentEmail('')).toBe(false)
  })

  it('rejects string without @', () => {
    expect(validateEnrollmentEmail('notanemail')).toBe(false)
  })

  it('rejects string without domain', () => {
    expect(validateEnrollmentEmail('student@')).toBe(false)
  })

  it('rejects whitespace only', () => {
    expect(validateEnrollmentEmail('   ')).toBe(false)
  })
})

describe('parseEnrollmentEmails', () => {
  it('parses a single email', () => {
    expect(parseEnrollmentEmails('a@b.com')).toEqual(['a@b.com'])
  })

  it('parses comma-separated emails', () => {
    expect(parseEnrollmentEmails('a@b.com, c@d.com')).toEqual(['a@b.com', 'c@d.com'])
  })

  it('parses newline-separated emails', () => {
    expect(parseEnrollmentEmails('a@b.com\nc@d.com')).toEqual(['a@b.com', 'c@d.com'])
  })

  it('strips whitespace from each email', () => {
    expect(parseEnrollmentEmails('  a@b.com  ,  c@d.com  ')).toEqual(['a@b.com', 'c@d.com'])
  })

  it('deduplicates emails case-insensitively', () => {
    expect(parseEnrollmentEmails('a@b.com, A@B.COM')).toEqual(['a@b.com'])
  })

  it('filters out invalid emails', () => {
    expect(parseEnrollmentEmails('a@b.com, notanemail, c@d.com')).toEqual(['a@b.com', 'c@d.com'])
  })

  it('returns empty array for empty input', () => {
    expect(parseEnrollmentEmails('')).toEqual([])
  })
})
