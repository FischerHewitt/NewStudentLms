import { describe, expect, it } from 'vitest'
import { filterAndSortDeadlines } from '@/lib/deadlines'

const NOW = new Date('2026-06-01T12:00:00Z')

function makeAssignment(overrides: {
  title?: string
  courseName?: string
  dueAt?: string | null
}) {
  return {
    title: overrides.title ?? 'Problem Set 1',
    courseName: overrides.courseName ?? 'Biology 101',
    dueAt: overrides.dueAt !== undefined ? overrides.dueAt : '2026-06-05T23:59:00Z',
  }
}

describe('filterAndSortDeadlines', () => {
  it('returns empty array when given no assignments', () => {
    expect(filterAndSortDeadlines([], NOW)).toEqual([])
  })

  it('filters out past deadlines', () => {
    const past = makeAssignment({ dueAt: '2026-05-31T23:59:00Z' })
    expect(filterAndSortDeadlines([past], NOW)).toEqual([])
  })

  it('filters out assignments with null dueAt', () => {
    const nullDue = makeAssignment({ dueAt: null })
    expect(filterAndSortDeadlines([nullDue], NOW)).toEqual([])
  })

  it('sorts ascending by due date', () => {
    const later = makeAssignment({ title: 'Later', dueAt: '2026-06-10T00:00:00Z' })
    const sooner = makeAssignment({ title: 'Sooner', dueAt: '2026-06-03T00:00:00Z' })
    const result = filterAndSortDeadlines([later, sooner], NOW)
    expect(result.map((d) => d.assignmentTitle)).toEqual(['Sooner', 'Later'])
  })

  it('limits to 5 results by default', () => {
    const assignments = Array.from({ length: 8 }, (_, i) =>
      makeAssignment({ title: `Assignment ${i + 1}`, dueAt: `2026-06-0${i + 2}T00:00:00Z` }),
    )
    expect(filterAndSortDeadlines(assignments, NOW)).toHaveLength(5)
  })

  it('respects a custom limit', () => {
    const assignments = Array.from({ length: 4 }, (_, i) =>
      makeAssignment({ title: `Assignment ${i + 1}`, dueAt: `2026-06-0${i + 2}T00:00:00Z` }),
    )
    expect(filterAndSortDeadlines(assignments, NOW, 2)).toHaveLength(2)
  })

  it('computes daysUntilDue as calendar-day difference between today and due date', () => {
    // NOW = 2026-06-01T12:00:00Z; dueAt = 2026-06-02T00:00:00Z → due day is June 2, today is June 1 → 1
    const result = filterAndSortDeadlines(
      [makeAssignment({ dueAt: '2026-06-02T00:00:00Z' })],
      NOW,
    )
    expect(result[0].daysUntilDue).toBe(1)
  })

  it('returns daysUntilDue = 0 for a deadline later the same day', () => {
    // NOW = 2026-06-01T12:00:00Z; dueAt = 2026-06-01T23:59:00Z → same UTC day → 0
    const result = filterAndSortDeadlines(
      [makeAssignment({ dueAt: '2026-06-01T23:59:00Z' })],
      NOW,
    )
    expect(result[0].daysUntilDue).toBe(0)
  })

  it('includes deadlines due later today (daysUntilDue = 0)', () => {
    const todayLate = makeAssignment({ dueAt: '2026-06-01T23:59:00Z' })
    const result = filterAndSortDeadlines([todayLate], NOW)
    expect(result).toHaveLength(1)
    expect(result[0].daysUntilDue).toBe(0)
  })
})
