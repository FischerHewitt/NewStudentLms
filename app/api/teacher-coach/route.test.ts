import { describe, expect, it } from 'vitest'
import { POST } from './route'

describe('POST /api/teacher-coach', () => {
  it('returns a streaming Teacher Coach fallback response', async () => {
    const response = await POST(
      new Request('http://localhost/api/teacher-coach', {
        method: 'POST',
        body: JSON.stringify({
          messages: [{ role: 'user', content: 'help me with this' }],
        }),
      }),
    )

    expect(response.ok).toBe(true)
    expect(response.headers.get('content-type')).toContain('text/plain')

    const text = await response.text()
    expect(text).toContain('Teacher Coach')
    expect(text).toContain('Course')
    expect(text).toContain('Submission')
    expect(text).not.toContain("won't write your answer")
  })
})
