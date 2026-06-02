import { describe, expect, it } from 'vitest'
import {
  getAssignmentBlocks,
  addBlock,
  removeBlock,
  moveBlock,
  validateLatex,
  isDuplicateFile,
  syncInstructionsToBlocks,
  syncBlocksToInstructions,
} from '@/lib/content-blocks'

describe('getAssignmentBlocks', () => {
  it('synthesizes a single text block from instructions when no blocks are stored', () => {
    const blocks = getAssignmentBlocks({
      instructions: 'Write a haiku about recursion.',
    })

    expect(blocks).toHaveLength(1)
    expect(blocks[0].kind).toBe('text')
    expect(blocks[0].label).toBe('Write a haiku about recursion.')
  })

  it('returns stored blocks unchanged when they exist', () => {
    const stored = [
      { id: 'text-0', kind: 'text' as const, label: 'Solve the equation.' },
      { id: 'math-1', kind: 'math' as const, label: 'x^2 + 2x + 1 = 0' },
    ]

    const blocks = getAssignmentBlocks({
      instructions: 'Solve the equation.',
      content_blocks: stored,
    })

    expect(blocks).toEqual(stored)
  })
})

describe('addBlock', () => {
  it('appends a block of the given kind to the end', () => {
    const blocks = [{ id: 'text-0', kind: 'text' as const, label: 'Intro' }]

    const result = addBlock(blocks, 'math', 'x^2')

    expect(result).toHaveLength(2)
    expect(result[1].kind).toBe('math')
    expect(result[1].label).toBe('x^2')
  })
})

describe('removeBlock', () => {
  it('removes the block with the matching id', () => {
    const blocks = [
      { id: 'text-0', kind: 'text' as const, label: 'Intro' },
      { id: 'math-1', kind: 'math' as const, label: 'x^2' },
      { id: 'download-2', kind: 'download' as const, label: 'data.csv' },
    ]

    const result = removeBlock(blocks, 'math-1')

    expect(result).toHaveLength(2)
    expect(result.map((b) => b.id)).toEqual(['text-0', 'download-2'])
  })
})

describe('moveBlock', () => {
  const blocks = [
    { id: 'text-0', kind: 'text' as const, label: 'Intro' },
    { id: 'math-1', kind: 'math' as const, label: 'x^2' },
    { id: 'download-2', kind: 'download' as const, label: 'data.csv' },
  ]

  it('reorders a block from one position to another without losing any', () => {
    const result = moveBlock(blocks, 2, 0)

    expect(result.map((b) => b.id)).toEqual(['download-2', 'text-0', 'math-1'])
  })

  it('is a no-op when the index is out of range', () => {
    const result = moveBlock(blocks, 5, 0)

    expect(result.map((b) => b.id)).toEqual(['text-0', 'math-1', 'download-2'])
  })
})

describe('validateLatex', () => {
  it('rejects an empty string', () => {
    const result = validateLatex('')
    expect(result.ok).toBe(false)
  })

  it('rejects a whitespace-only string', () => {
    const result = validateLatex('   ')
    expect(result.ok).toBe(false)
  })

  it('accepts valid LaTeX and returns non-empty html', () => {
    const result = validateLatex('x^2 + 1 = 0')
    expect(result.ok).toBe(true)
    if (result.ok) expect(result.html.length).toBeGreaterThan(0)
  })

  it('rejects invalid LaTeX and returns an error string', () => {
    const result = validateLatex('\\invalidcommand{')
    expect(result.ok).toBe(false)
    if (!result.ok) expect(result.error.length).toBeGreaterThan(0)
  })
})

describe('isDuplicateFile', () => {
  it('returns false when the staged list is empty', () => {
    expect(isDuplicateFile([], 'data.csv')).toBe(false)
  })

  it('returns true when the same name is already staged', () => {
    expect(isDuplicateFile(['notes.pdf', 'data.csv'], 'data.csv')).toBe(true)
  })

  it('is case-insensitive', () => {
    expect(isDuplicateFile(['Data.csv'], 'data.csv')).toBe(true)
    expect(isDuplicateFile(['data.csv'], 'DATA.CSV')).toBe(true)
  })

  it('returns false when a different name is staged', () => {
    expect(isDuplicateFile(['notes.pdf'], 'data.csv')).toBe(false)
  })
})

describe('syncInstructionsToBlocks', () => {
  it('updates the label of the first text block to match new instructions', () => {
    const blocks = [
      { id: 'text-0', kind: 'text' as const, label: 'Old instructions.' },
      { id: 'math-1', kind: 'math' as const, label: 'x^2' },
    ]
    const result = syncInstructionsToBlocks(blocks, 'New instructions.')
    expect(result[0].label).toBe('New instructions.')
    expect(result[1].label).toBe('x^2')
  })

  it('does not mutate the input array', () => {
    const blocks = [{ id: 'text-0', kind: 'text' as const, label: 'Original.' }]
    syncInstructionsToBlocks(blocks, 'Changed.')
    expect(blocks[0].label).toBe('Original.')
  })

  it('is a no-op when there is no text block', () => {
    const blocks = [{ id: 'math-0', kind: 'math' as const, label: 'x^2' }]
    const result = syncInstructionsToBlocks(blocks, 'New text.')
    expect(result[0].label).toBe('x^2')
  })
})

describe('syncBlocksToInstructions', () => {
  it('returns the label of the first text block', () => {
    const blocks = [
      { id: 'text-0', kind: 'text' as const, label: 'These are the instructions.' },
      { id: 'math-1', kind: 'math' as const, label: 'x^2' },
    ]
    expect(syncBlocksToInstructions(blocks)).toBe('These are the instructions.')
  })

  it('returns empty string when there is no text block', () => {
    const blocks = [{ id: 'math-0', kind: 'math' as const, label: 'x^2' }]
    expect(syncBlocksToInstructions(blocks)).toBe('')
  })

  it('returns empty string for an empty block list', () => {
    expect(syncBlocksToInstructions([])).toBe('')
  })
})

describe('immutability', () => {
  it('addBlock, removeBlock, and moveBlock do not mutate the input array', () => {
    const original = [
      { id: 'text-0', kind: 'text' as const, label: 'Intro' },
      { id: 'math-1', kind: 'math' as const, label: 'x^2' },
    ]

    addBlock(original, 'download', 'data.csv')
    removeBlock(original, 'text-0')
    moveBlock(original, 1, 0)

    expect(original.map((b) => b.id)).toEqual(['text-0', 'math-1'])
  })
})
