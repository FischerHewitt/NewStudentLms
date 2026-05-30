import { describe, it, expect } from 'vitest'
import { assignmentHref, speedgraderHref, courseHref } from '@/lib/routes'

describe('assignmentHref', () => {
  it('builds the correct path for a teacher opening an assignment', () => {
    expect(assignmentHref('course-1', 'assignment-2')).toBe(
      '/course/course-1/assignment/assignment-2',
    )
  })

  it('handles uuid-style ids without encoding them', () => {
    const courseId = '20b20e71-19ca-433c-8d48-8bf8755b183d'
    const assignmentId = 'aaaabbbb-cccc-dddd-eeee-ffffffffffff'
    expect(assignmentHref(courseId, assignmentId)).toBe(
      `/course/${courseId}/assignment/${assignmentId}`,
    )
  })
})

describe('courseHref', () => {
  it('builds the correct path for a course', () => {
    expect(courseHref('course-1')).toBe('/course/course-1')
  })
})

describe('speedgraderHref', () => {
  it('builds the correct path for a submission in SpeedGrader', () => {
    expect(speedgraderHref('course-1', 'submission-99')).toBe(
      '/course/course-1/speedgrader/submission-99',
    )
  })
})
