import { describe, expect, it } from 'vitest'
import { LMS_AI_MODEL, LMS_STRUCTURED_OBJECT_MODE } from '@/lib/ai-model'

describe('AI model adapter constants', () => {
  it('keeps the accepted LMS model and structured object mode in one place', () => {
    expect(LMS_AI_MODEL).toBe('llama-3.3-70b-versatile')
    expect(LMS_STRUCTURED_OBJECT_MODE).toBe('json')
  })
})
