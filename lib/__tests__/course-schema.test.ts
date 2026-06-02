import { describe, expect, it } from 'vitest'
import { assignmentSchema } from '@/lib/schemas/course'

describe('assignmentSchema content_blocks', () => {
  const base = {
    title: 'Quadratic Solver Lab',
    instructions: 'Solve the equation.',
    due_date: '2026-09-15',
    points_possible: 30,
    rubric: { criteria: [{ description: 'Correct roots', points: 30 }] },
  }

  it('accepts and preserves an ordered content_blocks array', () => {
    const parsed = assignmentSchema.parse({
      ...base,
      content_blocks: [
        { id: 'text-0', kind: 'text', label: 'Solve the equation.' },
        { id: 'math-1', kind: 'math', label: 'x^2 + 2x + 1 = 0' },
        { id: 'download-2', kind: 'download', label: 'data.csv' },
      ],
    })

    expect(parsed.content_blocks).toEqual([
      { id: 'text-0', kind: 'text', label: 'Solve the equation.' },
      { id: 'math-1', kind: 'math', label: 'x^2 + 2x + 1 = 0' },
      { id: 'download-2', kind: 'download', label: 'data.csv' },
    ])
  })

  it('accepts an assignment with no content_blocks (legacy / generated shape)', () => {
    const parsed = assignmentSchema.parse(base)

    expect(parsed.content_blocks).toBeUndefined()
  })

  it('rejects a block with an unknown kind', () => {
    const result = assignmentSchema.safeParse({
      ...base,
      content_blocks: [{ id: 'x-0', kind: 'video', label: 'clip.mp4' }],
    })

    expect(result.success).toBe(false)
  })
})
