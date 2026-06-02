import { describe, expect, it, vi } from 'vitest'
import { generateObject } from 'ai'
import { POST } from './route'

vi.mock('ai', () => ({
  generateObject: vi.fn(async (options: { mode?: string }) => ({
    object:
      options.mode === 'json'
        ? {
            title: 'Intro to Testing',
            modules: [
              {
                title: 'Testing Foundations',
                week_number: 1,
                description: 'What tests prove about software behavior.',
                assignments: [],
              },
            ],
          }
        : undefined,
  })),
}))

describe('POST /api/generate-course', () => {
  it('returns a Course preview in the Groq-compatible structured output mode', async () => {
    const response = await POST(
      new Request('http://localhost/api/generate-course', {
        method: 'POST',
        body: JSON.stringify({
          syllabus:
            'Intro to Testing. Week 1 covers testing foundations and one reflection assignment.',
        }),
      }),
    )

    expect(response.ok).toBe(true)
    const text = await response.text()
    expect(JSON.parse(text).title).toBe('Intro to Testing')
  })

  it('passes teacher AI instructions into the generation prompt', async () => {
    await POST(
      new Request('http://localhost/api/generate-course', {
        method: 'POST',
        body: JSON.stringify({
          syllabus: 'Intro to Testing',
          instructions: 'Course length is 11 weeks',
        }),
      }),
    )

    expect(vi.mocked(generateObject).mock.calls.at(-1)?.[0].prompt).toContain(
      'Course length is 11 weeks',
    )
  })
})
