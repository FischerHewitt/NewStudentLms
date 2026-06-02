import { describe, expect, it } from 'vitest'
import {
  percentageToLetterGrade,
  letterGradeToGpaPoints,
  computeCourseGrade,
  computeOverallGpa,
  getJustGradedAssignment,
  buildPathToTarget,
  gpaToArcFraction,
  type AssignmentInput,
  type GradeWithFeedback,
  type CourseGradeResult,
} from '@/lib/grade-summary'

// ---------------------------------------------------------------------------
// percentageToLetterGrade
// ---------------------------------------------------------------------------

describe('percentageToLetterGrade', () => {
  it.each([
    [100, 'A'],
    [93, 'A'],
    [92, 'A-'],
    [90, 'A-'],
    [89, 'B+'],
    [87, 'B+'],
    [86, 'B'],
    [83, 'B'],
    [82, 'B-'],
    [80, 'B-'],
    [79, 'C+'],
    [77, 'C+'],
    [76, 'C'],
    [73, 'C'],
    [72, 'C-'],
    [70, 'C-'],
    [69, 'D+'],
    [67, 'D+'],
    [66, 'D'],
    [63, 'D'],
    [62, 'D-'],
    [60, 'D-'],
    [59, 'F'],
    [0, 'F'],
  ])('%i%% → %s', (pct, expected) => {
    expect(percentageToLetterGrade(pct)).toBe(expected)
  })
})

// ---------------------------------------------------------------------------
// letterGradeToGpaPoints
// ---------------------------------------------------------------------------

describe('letterGradeToGpaPoints', () => {
  it.each([
    ['A', 4.0],
    ['A-', 3.7],
    ['B+', 3.3],
    ['B', 3.0],
    ['B-', 2.7],
    ['C+', 2.3],
    ['C', 2.0],
    ['C-', 1.7],
    ['D+', 1.3],
    ['D', 1.0],
    ['D-', 0.7],
    ['F', 0.0],
  ])('%s → %f', (letter, expected) => {
    expect(letterGradeToGpaPoints(letter)).toBe(expected)
  })

  it('returns 0 for unknown letter', () => {
    expect(letterGradeToGpaPoints('X')).toBe(0.0)
  })
})

// ---------------------------------------------------------------------------
// computeCourseGrade
// ---------------------------------------------------------------------------

function makeAssignment(
  overrides: Partial<AssignmentInput> & { id?: string } = {},
): AssignmentInput {
  return {
    id: overrides.id ?? 'a1',
    courseId: 'c1',
    title: 'Assignment',
    due: null,
    points: 100,
    status: 'graded',
    grade: 85,
    ...overrides,
  }
}

describe('computeCourseGrade', () => {
  it('returns F with 0% when no assignments exist', () => {
    expect(computeCourseGrade([])).toEqual({ percentage: 0, letter: 'F', gpaPoints: 0.0 })
  })

  it('returns F with 0% when all assignments are ungraded', () => {
    const result = computeCourseGrade([
      makeAssignment({ status: 'submitted', grade: undefined }),
      makeAssignment({ id: 'a2', status: 'not-started', grade: undefined }),
    ])
    expect(result).toEqual({ percentage: 0, letter: 'F', gpaPoints: 0.0 })
  })

  it('excludes ungraded assignments from both numerator and denominator', () => {
    const result = computeCourseGrade([
      makeAssignment({ id: 'a1', status: 'graded', grade: 90, points: 100 }),
      makeAssignment({ id: 'a2', status: 'submitted', grade: undefined, points: 100 }),
    ])
    // 90/100 = 90% → A-
    expect(result.percentage).toBeCloseTo(90)
    expect(result.letter).toBe('A-')
  })

  it('computes correct percentage across multiple graded assignments', () => {
    const result = computeCourseGrade([
      makeAssignment({ id: 'a1', grade: 80, points: 100 }),
      makeAssignment({ id: 'a2', grade: 18, points: 20 }),
      makeAssignment({ id: 'a3', grade: 40, points: 50 }),
    ])
    // 138 / 170 = 81.176...% → B-
    expect(result.percentage).toBeCloseTo(81.18, 1)
    expect(result.letter).toBe('B-')
    expect(result.gpaPoints).toBe(2.7)
  })

  it('handles 100% score → A', () => {
    const result = computeCourseGrade([makeAssignment({ grade: 100, points: 100 })])
    expect(result.letter).toBe('A')
    expect(result.gpaPoints).toBe(4.0)
  })
})

// ---------------------------------------------------------------------------
// computeOverallGpa
// ---------------------------------------------------------------------------

describe('computeOverallGpa', () => {
  it('returns 0 for empty input', () => {
    expect(computeOverallGpa([])).toBe(0)
  })

  it('returns the single course GPA when only one course', () => {
    const g: CourseGradeResult = { percentage: 91, letter: 'A-', gpaPoints: 3.7 }
    expect(computeOverallGpa([g])).toBeCloseTo(3.7)
  })

  it('averages GPA points unweighted across multiple courses', () => {
    const grades: CourseGradeResult[] = [
      { percentage: 91, letter: 'A-', gpaPoints: 3.7 },
      { percentage: 88, letter: 'B+', gpaPoints: 3.3 },
      { percentage: 74, letter: 'C', gpaPoints: 2.0 },
    ]
    // (3.7 + 3.3 + 2.0) / 3 = 3.0
    expect(computeOverallGpa(grades)).toBeCloseTo(3.0)
  })
})

// ---------------------------------------------------------------------------
// getJustGradedAssignment
// ---------------------------------------------------------------------------

function makeGrade(overrides: Partial<GradeWithFeedback> = {}): GradeWithFeedback {
  return {
    assignmentId: 'a1',
    courseId: 'c1',
    assignmentTitle: 'Essay',
    finalScore: 90,
    finalFeedback: 'Great work.',
    approvedAt: '2026-06-01T10:00:00Z',
    pointsPossible: 100,
    ...overrides,
  }
}

describe('getJustGradedAssignment', () => {
  it('returns null for empty list', () => {
    expect(getJustGradedAssignment([])).toBeNull()
  })

  it('returns the only item when list has one entry', () => {
    const g = makeGrade()
    expect(getJustGradedAssignment([g])).toBe(g)
  })

  it('returns the entry with the latest approvedAt', () => {
    const older = makeGrade({ assignmentId: 'a1', approvedAt: '2026-05-30T08:00:00Z' })
    const newer = makeGrade({ assignmentId: 'a2', approvedAt: '2026-06-01T14:00:00Z' })
    const middle = makeGrade({ assignmentId: 'a3', approvedAt: '2026-05-31T12:00:00Z' })
    expect(getJustGradedAssignment([older, newer, middle])).toBe(newer)
  })
})

// ---------------------------------------------------------------------------
// buildPathToTarget
// ---------------------------------------------------------------------------

describe('buildPathToTarget', () => {
  it('returns empty array when no courses provided', () => {
    expect(buildPathToTarget([], 3.5)).toEqual([])
  })

  it('marks a pending milestone when course is below target', () => {
    const milestones = buildPathToTarget(
      [
        {
          courseId: 'c1',
          result: { percentage: 74, letter: 'C', gpaPoints: 2.0 },
          assignments: [
            makeAssignment({ id: 'a1', title: 'Midterm', status: 'not-started', points: 150, grade: undefined }),
          ],
        },
      ],
      3.0,
    )
    expect(milestones).toHaveLength(1)
    expect(milestones[0].done).toBe(false)
    expect(milestones[0].label).toMatch(/Midterm/)
  })

  it('marks a milestone as done when course already meets target', () => {
    const milestones = buildPathToTarget(
      [
        {
          courseId: 'c1',
          result: { percentage: 91, letter: 'A-', gpaPoints: 3.7 },
          assignments: [
            makeAssignment({ id: 'a1', title: 'Lab Report', status: 'graded', points: 100, grade: 95 }),
          ],
        },
      ],
      3.5,
    )
    expect(milestones).toHaveLength(1)
    expect(milestones[0].done).toBe(true)
    expect(milestones[0].label).toMatch(/Done/)
  })

  it('sorts milestones by pointsPossible descending', () => {
    const milestones = buildPathToTarget(
      [
        {
          courseId: 'c1',
          result: { percentage: 74, letter: 'C', gpaPoints: 2.0 },
          assignments: [
            makeAssignment({ id: 'a1', title: 'Quiz', status: 'not-started', points: 20, grade: undefined }),
            makeAssignment({ id: 'a2', title: 'Final Exam', status: 'not-started', points: 200, grade: undefined }),
          ],
        },
        {
          courseId: 'c2',
          result: { percentage: 74, letter: 'C', gpaPoints: 2.0 },
          assignments: [
            makeAssignment({ id: 'a3', title: 'Midterm', status: 'not-started', points: 100, grade: undefined }),
          ],
        },
      ],
      3.0,
    )
    const points = milestones.map((m) => m.pointsPossible)
    expect(points).toEqual([...points].sort((a, b) => b - a))
  })

  it('selects the highest-points upcoming assignment per course', () => {
    const milestones = buildPathToTarget(
      [
        {
          courseId: 'c1',
          result: { percentage: 74, letter: 'C', gpaPoints: 2.0 },
          assignments: [
            makeAssignment({ id: 'a1', title: 'Small Quiz', status: 'not-started', points: 10, grade: undefined }),
            makeAssignment({ id: 'a2', title: 'Big Exam', status: 'not-started', points: 200, grade: undefined }),
          ],
        },
      ],
      3.0,
    )
    expect(milestones).toHaveLength(1)
    expect(milestones[0].label).toMatch(/Big Exam/)
  })

// ---------------------------------------------------------------------------
// gpaToArcFraction
// ---------------------------------------------------------------------------

describe('gpaToArcFraction', () => {
  it('returns 0 for GPA of 0', () => {
    expect(gpaToArcFraction(0)).toBe(0)
  })

  it('returns 1 for GPA of 4.0', () => {
    expect(gpaToArcFraction(4.0)).toBe(1)
  })

  it('returns 0.9 for GPA of 3.6', () => {
    expect(gpaToArcFraction(3.6)).toBeCloseTo(0.9)
  })

  it('clamps GPA above 4.0 to 1', () => {
    expect(gpaToArcFraction(5.0)).toBe(1)
  })

  it('clamps negative GPA to 0', () => {
    expect(gpaToArcFraction(-1)).toBe(0)
  })
})

  it('emits no milestone for a below-target course with no upcoming assignments', () => {
    const milestones = buildPathToTarget(
      [
        {
          courseId: 'c1',
          result: { percentage: 74, letter: 'C', gpaPoints: 2.0 },
          assignments: [
            makeAssignment({ id: 'a1', title: 'Final', status: 'graded', points: 100, grade: 74 }),
          ],
        },
      ],
      3.5,
    )
    expect(milestones).toHaveLength(0)
  })
})
