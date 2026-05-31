import { describe, expect, it } from 'vitest'
import {
  computeCourseHealth,
  computeClassAverage,
  aggregateTeacherStats,
  teacherCoachHint,
  type TeacherCourseRow,
  type TeacherCourseSummary,
} from '@/lib/teacher-dashboard'

function makeRow(overrides: Partial<TeacherCourseRow> = {}): TeacherCourseRow {
  return {
    id: 'course-1',
    title: 'Biology and Society',
    status: 'published',
    students: 28,
    pendingGrades: 0,
    submittedRate: 0,
    gradedRate: 0,
    solutionStatus: 'uploaded',
    nextDue: null,
    classAverage: null,
    ...overrides,
  }
}

function makeSummary(
  overrides: Partial<TeacherCourseRow> & { health?: TeacherCourseSummary['health'] } = {},
): TeacherCourseSummary {
  const { health = 'steady', ...rowOverrides } = overrides
  return { ...makeRow(rowOverrides), health, recentSubmissions: [] }
}

// ─── computeCourseHealth ─────────────────────────────────────────────────────

describe('computeCourseHealth', () => {
  // NOTE: solution-based rules are disabled in v1 (solutionStatus is a stub).
  // Tests for those rules should be added when solution-upload ships.

  describe('urgent cases', () => {
    it('returns urgent when pendingGrades is exactly 10 (boundary)', () => {
      expect(computeCourseHealth(makeRow({ pendingGrades: 10 }))).toBe('urgent')
    })

    it('returns urgent when pendingGrades exceeds 10', () => {
      expect(computeCourseHealth(makeRow({ pendingGrades: 11 }))).toBe('urgent')
    })
  })

  describe('watch cases', () => {
    it('returns watch when pendingGrades is between 1 and 9', () => {
      expect(computeCourseHealth(makeRow({ pendingGrades: 1 }))).toBe('watch')
      expect(computeCourseHealth(makeRow({ pendingGrades: 9 }))).toBe('watch')
    })
  })

  describe('steady cases', () => {
    it('returns steady when no pending grades', () => {
      expect(computeCourseHealth(makeRow({ pendingGrades: 0 }))).toBe('steady')
    })

    it('returns steady regardless of solutionStatus or submittedRate in v1', () => {
      expect(
        computeCourseHealth(
          makeRow({ pendingGrades: 0, solutionStatus: 'missing', submittedRate: 100 }),
        ),
      ).toBe('steady')
    })
  })
})

// ─── aggregateTeacherStats ────────────────────────────────────────────────────

describe('aggregateTeacherStats', () => {
  it('returns all zeros and null nextDue for an empty list', () => {
    expect(aggregateTeacherStats([])).toEqual({
      totalPending: 0,
      aiReady: 0,
      solutionGaps: 0,
      nextDue: null,
    })
  })

  it('sums totalPending across all courses', () => {
    const courses = [
      makeRow({ pendingGrades: 11 }),
      makeRow({ id: 'c2', pendingGrades: 4 }),
      makeRow({ id: 'c3', pendingGrades: 2 }),
    ]
    expect(aggregateTeacherStats(courses).totalPending).toBe(17)
  })

  it('counts aiReady only for courses with uploaded solutions', () => {
    const courses = [
      makeRow({ pendingGrades: 11, solutionStatus: 'uploaded' }),
      makeRow({ id: 'c2', pendingGrades: 4, solutionStatus: 'missing' }),
      makeRow({ id: 'c3', pendingGrades: 2, solutionStatus: 'needs-update' }),
    ]
    expect(aggregateTeacherStats(courses).aiReady).toBe(11)
  })

  it('counts solutionGaps for missing and needs-update courses', () => {
    const courses = [
      makeRow({ solutionStatus: 'uploaded' }),
      makeRow({ id: 'c2', solutionStatus: 'missing' }),
      makeRow({ id: 'c3', solutionStatus: 'needs-update' }),
    ]
    expect(aggregateTeacherStats(courses).solutionGaps).toBe(2)
  })

  it('returns nextDue from the first course that has one', () => {
    const courses = [
      makeRow({ nextDue: null }),
      makeRow({ id: 'c2', nextDue: 'Lab Notebook 2, tomorrow' }),
      makeRow({ id: 'c3', nextDue: 'Problem Set 7, Monday' }),
    ]
    expect(aggregateTeacherStats(courses).nextDue).toBe('Lab Notebook 2, tomorrow')
  })

  it('returns null nextDue when all courses have null', () => {
    const courses = [makeRow({ nextDue: null }), makeRow({ id: 'c2', nextDue: null })]
    expect(aggregateTeacherStats(courses).nextDue).toBeNull()
  })

  it('handles a single course correctly', () => {
    const course = makeRow({
      pendingGrades: 5,
      solutionStatus: 'uploaded',
      nextDue: 'Essay 1, Friday',
    })
    expect(aggregateTeacherStats([course])).toEqual({
      totalPending: 5,
      aiReady: 5,
      solutionGaps: 0,
      nextDue: 'Essay 1, Friday',
    })
  })
})

// ─── teacherCoachHint ─────────────────────────────────────────────────────────

describe('teacherCoachHint', () => {
  it('returns a no-courses message when list is empty', () => {
    expect(teacherCoachHint([])).toMatch(/no courses/i)
  })

  it('highlights the urgent course with high pending count', () => {
    const hint = teacherCoachHint([
      makeSummary({ title: 'Biology and Society', pendingGrades: 11, health: 'urgent' }),
      makeSummary({ id: 'c2', title: 'Public Speaking', pendingGrades: 0, health: 'steady' }),
    ])
    expect(hint).toContain('Biology and Society')
    expect(hint).toContain('11')
  })

  it('falls back to a watch course when no urgent courses exist', () => {
    const hint = teacherCoachHint([
      makeSummary({ title: 'Steady Course', pendingGrades: 0, health: 'steady' }),
      makeSummary({ id: 'c2', title: 'Watch Course', pendingGrades: 3, health: 'watch' }),
    ])
    expect(hint).toContain('Watch Course')
  })

  it('returns an all-good message when everything is steady', () => {
    const hint = teacherCoachHint([
      makeSummary({ title: 'Algebra', pendingGrades: 0, health: 'steady' }),
    ])
    expect(hint).toMatch(/up to date/i)
  })
})

// ─── computeClassAverage ──────────────────────────────────────────────────────

describe('computeClassAverage', () => {
  it('returns null when there are no approved submissions', () => {
    expect(computeClassAverage([])).toBeNull()
  })

  it('returns the percentage for a single submission', () => {
    expect(computeClassAverage([{ score: 80, pointsPossible: 100 }])).toBe(80)
  })

  it('returns the mean percentage across multiple submissions', () => {
    expect(
      computeClassAverage([
        { score: 70, pointsPossible: 100 },
        { score: 90, pointsPossible: 100 },
      ]),
    ).toBe(80)
  })

  it('handles non-100 pointsPossible correctly', () => {
    // 75/150 = 50%
    expect(computeClassAverage([{ score: 75, pointsPossible: 150 }])).toBe(50)
  })

  it('rounds to the nearest integer', () => {
    // 1/3 = 33.33...%
    expect(computeClassAverage([{ score: 1, pointsPossible: 3 }])).toBe(33)
  })
})
