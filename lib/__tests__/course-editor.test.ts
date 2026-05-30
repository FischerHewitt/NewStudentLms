import { describe, expect, it } from 'vitest'
import {
  addModule,
  removeModule,
  addAssignment,
  removeAssignment,
  addCriterion,
  removeCriterion,
  updateCriterion,
} from '@/lib/course-editor'
import type { CoursePreview } from '@/lib/schemas/course'

function makePreview(): CoursePreview {
  return {
    title: 'Test Course',
    modules: [
      {
        title: 'Week 1',
        week_number: 1,
        description: 'Intro',
        assignments: [
          {
            title: 'Assignment 1',
            instructions: 'Do something',
            due_date: '2026-09-15',
            points_possible: 100,
            rubric: { criteria: [{ description: 'Quality', points: 100 }] },
          },
        ],
      },
    ],
  }
}

// ── Module CRUD ───────────────────────────────────────────────────────────────

describe('addModule', () => {
  it('appends a blank module with the next week_number', () => {
    const result = addModule(makePreview())
    expect(result.modules).toHaveLength(2)
    const added = result.modules[1]
    expect(added.title).toBe('')
    expect(added.week_number).toBe(2)
    expect(added.assignments).toEqual([])
  })

  it('does not mutate the original preview', () => {
    const original = makePreview()
    addModule(original)
    expect(original.modules).toHaveLength(1)
  })
})

describe('removeModule', () => {
  it('removes the module at the given index', () => {
    const result = removeModule(makePreview(), 0)
    expect(result.modules).toHaveLength(0)
  })

  it('does not mutate the original preview', () => {
    const original = makePreview()
    removeModule(original, 0)
    expect(original.modules).toHaveLength(1)
  })

  it('is a no-op for an out-of-range index', () => {
    const result = removeModule(makePreview(), 99)
    expect(result.modules).toHaveLength(1)
  })
})

// ── Assignment CRUD ───────────────────────────────────────────────────────────

describe('addAssignment', () => {
  it('appends a blank assignment to the target module', () => {
    const result = addAssignment(makePreview(), 0)
    expect(result.modules[0].assignments).toHaveLength(2)
    const added = result.modules[0].assignments[1]
    expect(added.title).toBe('')
    expect(added.rubric.criteria).toEqual([])
  })

  it('does not affect other modules', () => {
    const preview = addModule(makePreview())
    const result = addAssignment(preview, 0)
    expect(result.modules[1].assignments).toHaveLength(0)
  })
})

describe('removeAssignment', () => {
  it('removes the assignment at the given module+assignment index', () => {
    const result = removeAssignment(makePreview(), 0, 0)
    expect(result.modules[0].assignments).toHaveLength(0)
  })

  it('does not mutate the original preview', () => {
    const original = makePreview()
    removeAssignment(original, 0, 0)
    expect(original.modules[0].assignments).toHaveLength(1)
  })
})

// ── Rubric criteria CRUD ──────────────────────────────────────────────────────

describe('addCriterion', () => {
  it('appends a blank criterion to the assignment rubric', () => {
    const result = addCriterion(makePreview(), 0, 0)
    expect(result.modules[0].assignments[0].rubric.criteria).toHaveLength(2)
    const added = result.modules[0].assignments[0].rubric.criteria[1]
    expect(added.description).toBe('')
    expect(added.points).toBe(0)
  })
})

describe('removeCriterion', () => {
  it('removes the criterion at the given index', () => {
    const result = removeCriterion(makePreview(), 0, 0, 0)
    expect(result.modules[0].assignments[0].rubric.criteria).toHaveLength(0)
  })
})

describe('updateCriterion', () => {
  it('updates description', () => {
    const result = updateCriterion(makePreview(), 0, 0, 0, { description: 'Clarity' })
    expect(result.modules[0].assignments[0].rubric.criteria[0].description).toBe('Clarity')
  })

  it('updates points', () => {
    const result = updateCriterion(makePreview(), 0, 0, 0, { points: 50 })
    expect(result.modules[0].assignments[0].rubric.criteria[0].points).toBe(50)
  })

  it('does not mutate original', () => {
    const original = makePreview()
    updateCriterion(original, 0, 0, 0, { description: 'Changed' })
    expect(original.modules[0].assignments[0].rubric.criteria[0].description).toBe('Quality')
  })
})
