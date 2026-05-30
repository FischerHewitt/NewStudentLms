import { describe, it, expect } from 'vitest'
import { deriveAssignmentStatus, filterOpenAssignments } from '@/lib/studentDashboard'
import type { StudentDashboardAssignment } from '@/app/actions/dashboard'

function makeAssignment(overrides: Partial<StudentDashboardAssignment> = {}): StudentDashboardAssignment {
  return {
    id: 'a1',
    courseId: 'c1',
    title: 'Test Assignment',
    due: '2026-06-01',
    points: 10,
    status: 'not-started',
    submittedAt: null,
    ...overrides,
  }
}

describe('deriveAssignmentStatus', () => {
  it('returns not-started when there is no submission', () => {
    expect(deriveAssignmentStatus(null, null)).toEqual({ status: 'not-started' })
  })

  it('returns not-started when submission is a draft with no body', () => {
    expect(deriveAssignmentStatus({ body: '', status: 'draft' }, null)).toEqual({ status: 'not-started' })
  })

  it('returns in-progress when submission is a draft with a non-empty body', () => {
    expect(deriveAssignmentStatus({ body: 'some work', status: 'draft' }, null)).toEqual({ status: 'in-progress' })
  })

  it('returns submitted when submission has been submitted', () => {
    expect(deriveAssignmentStatus({ body: 'my answer', status: 'submitted' }, null)).toEqual({ status: 'submitted' })
  })

  it('returns graded with the final score when the grade has been published', () => {
    expect(
      deriveAssignmentStatus(
        { body: 'my answer', status: 'graded' },
        { final_score: 22, approved_at: '2026-05-25T10:00:00Z' },
      ),
    ).toEqual({ status: 'graded', grade: 22 })
  })

  it('falls back to submitted when submission is graded but no grade row exists', () => {
    expect(
      deriveAssignmentStatus({ body: 'my answer', status: 'graded' }, null),
    ).toEqual({ status: 'submitted' })
  })
})

describe('filterOpenAssignments', () => {
  it('includes not-started assignments', () => {
    const a = makeAssignment({ status: 'not-started' })
    expect(filterOpenAssignments([a], null, null)).toEqual([a])
  })

  it('includes in-progress assignments', () => {
    const a = makeAssignment({ status: 'in-progress' })
    expect(filterOpenAssignments([a], null, null)).toEqual([a])
  })

  it('excludes submitted assignments', () => {
    const a = makeAssignment({ status: 'submitted' })
    expect(filterOpenAssignments([a], null, null)).toEqual([])
  })

  it('excludes graded assignments', () => {
    const a = makeAssignment({ status: 'graded', grade: 10 })
    expect(filterOpenAssignments([a], null, null)).toEqual([])
  })

  it('excludes assignments with null due date', () => {
    const a = makeAssignment({ due: null })
    expect(filterOpenAssignments([a], null, null)).toEqual([])
  })

  it('returns empty when all assignments are checked off (triggers "All caught up!")', () => {
    const assignments = [
      makeAssignment({ id: 'a1', status: 'submitted' }),
      makeAssignment({ id: 'a2', status: 'submitted' }),
      makeAssignment({ id: 'a3', status: 'submitted' }),
    ]
    expect(filterOpenAssignments(assignments, null, null)).toEqual([])
  })

  it('filters by courseFilter', () => {
    const inCourse = makeAssignment({ id: 'a1', courseId: 'c1' })
    const otherCourse = makeAssignment({ id: 'a2', courseId: 'c2' })
    expect(filterOpenAssignments([inCourse, otherCourse], 'c1', null)).toEqual([inCourse])
  })

  it('filters by dayFilter', () => {
    const today = makeAssignment({ id: 'a1', due: '2026-06-01' })
    const tomorrow = makeAssignment({ id: 'a2', due: '2026-06-02' })
    expect(filterOpenAssignments([today, tomorrow], null, '2026-06-01')).toEqual([today])
  })

  it('returns empty when course filter has no open work even if other courses do', () => {
    const submitted = makeAssignment({ id: 'a1', courseId: 'c1', status: 'submitted' })
    const open = makeAssignment({ id: 'a2', courseId: 'c2', status: 'not-started' })
    expect(filterOpenAssignments([submitted, open], 'c1', null)).toEqual([])
  })
})
