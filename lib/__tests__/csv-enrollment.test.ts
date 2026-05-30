import { describe, expect, it } from 'vitest'
import { parseCsvEnrollment } from '@/lib/csv-enrollment'

describe('parseCsvEnrollment', () => {
  it('parses a single valid email row', () => {
    const result = parseCsvEnrollment('student@school.edu')
    expect(result.valid).toEqual(['student@school.edu'])
    expect(result.invalid).toEqual([])
    expect(result.skipped).toBe(0)
  })

  it('parses multiple rows', () => {
    const csv = 'a@b.com\nc@d.com\ne@f.com'
    const result = parseCsvEnrollment(csv)
    expect(result.valid).toHaveLength(3)
    expect(result.invalid).toHaveLength(0)
  })

  it('ignores a header row containing "email"', () => {
    const csv = 'email\na@b.com'
    const result = parseCsvEnrollment(csv)
    expect(result.valid).toEqual(['a@b.com'])
  })

  it('also handles first column of comma-separated rows', () => {
    const csv = 'a@b.com,John Smith\nc@d.com,Jane Doe'
    const result = parseCsvEnrollment(csv)
    expect(result.valid).toEqual(['a@b.com', 'c@d.com'])
  })

  it('tracks invalid rows', () => {
    const csv = 'a@b.com\nnotanemail\nc@d.com'
    const result = parseCsvEnrollment(csv)
    expect(result.valid).toEqual(['a@b.com', 'c@d.com'])
    expect(result.invalid).toContain('notanemail')
  })

  it('deduplicates within the file', () => {
    const csv = 'a@b.com\na@b.com\nA@B.COM'
    const result = parseCsvEnrollment(csv)
    expect(result.valid).toEqual(['a@b.com'])
  })

  it('strips whitespace from each value', () => {
    const csv = '  a@b.com  \n  c@d.com  '
    const result = parseCsvEnrollment(csv)
    expect(result.valid).toEqual(['a@b.com', 'c@d.com'])
  })

  it('returns empty for empty input', () => {
    const result = parseCsvEnrollment('')
    expect(result.valid).toEqual([])
    expect(result.invalid).toEqual([])
  })

  it('reports blank lines as skipped, not invalid', () => {
    const csv = 'a@b.com\n\n\nc@d.com'
    const result = parseCsvEnrollment(csv)
    expect(result.valid).toEqual(['a@b.com', 'c@d.com'])
    expect(result.skipped).toBe(2)
    expect(result.invalid).toHaveLength(0)
  })
})
