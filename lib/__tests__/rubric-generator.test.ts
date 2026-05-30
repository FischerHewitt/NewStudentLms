import { describe, expect, it } from 'vitest'
import { validateRubricGenerateInput, parseRubricResponse } from '@/lib/rubric-generator'

describe('validateRubricGenerateInput', () => {
  it('passes when title and instructions are non-empty', () => {
    expect(validateRubricGenerateInput('Essay 1', 'Write 500 words')).toBe(true)
  })

  it('fails when title is empty', () => {
    expect(validateRubricGenerateInput('', 'Write 500 words')).toBe(false)
  })

  it('fails when instructions are empty', () => {
    expect(validateRubricGenerateInput('Essay 1', '')).toBe(false)
  })

  it('fails when both are whitespace', () => {
    expect(validateRubricGenerateInput('  ', '  ')).toBe(false)
  })
})

describe('parseRubricResponse', () => {
  it('returns criteria array from a valid response', () => {
    const raw = { criteria: [{ description: 'Clarity', points: 50 }, { description: 'Accuracy', points: 50 }] }
    const result = parseRubricResponse(raw)
    expect(result).toHaveLength(2)
    expect(result[0].description).toBe('Clarity')
    expect(result[0].points).toBe(50)
  })

  it('returns empty array for invalid shape', () => {
    expect(parseRubricResponse(null)).toEqual([])
    expect(parseRubricResponse({})).toEqual([])
    expect(parseRubricResponse({ criteria: 'not-array' })).toEqual([])
  })

  it('filters out criteria with missing description or non-positive points', () => {
    const raw = {
      criteria: [
        { description: '', points: 50 },
        { description: 'Quality', points: 0 },
        { description: 'Clarity', points: 25 },
      ],
    }
    const result = parseRubricResponse(raw)
    expect(result).toHaveLength(1)
    expect(result[0].description).toBe('Clarity')
  })
})
