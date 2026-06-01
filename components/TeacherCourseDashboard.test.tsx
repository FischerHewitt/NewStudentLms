import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TeacherCourseDashboard } from './TeacherCourseDashboard'
import type { CourseWithModules, SubmissionSummary } from '@/app/actions/dashboard'
import type { EnrolledStudent } from '@/app/actions/enrollment'

vi.mock('next/navigation', () => ({
  useTransition: () => [false, (fn: () => void) => fn()],
}))

vi.mock('@/app/actions/course', () => ({
  publishCourse: vi.fn(),
  unpublishCourse: vi.fn(),
}))

const COURSE: CourseWithModules = {
  id: 'course-1',
  title: 'BIO 111',
  term: 'Spring 2026',
  section: '01',
  status: 'published',
  teacherName: 'Dr. Chen',
  rawSyllabus: null,
  modules: [
    {
      id: 'mod-1',
      title: 'Week 1',
      week_number: 1,
      description: '',
      order: 1,
      assignments: [
        { id: 'asgn-1', title: 'Homework 1', due_date: null, points_possible: 10 },
      ],
    },
  ],
}

const ENROLLED: EnrolledStudent[] = []

describe('TeacherCourseDashboard grade links', () => {
  it('"Grade N Now" hero button links to speedgrader when a pending submission exists', () => {
    const allSubmissions: SubmissionSummary[] = [
      { id: 'sub-999', assignment_id: 'asgn-1', status: 'submitted' },
    ]

    const html = renderToStaticMarkup(
      <TeacherCourseDashboard
        course={COURSE}
        allSubmissions={allSubmissions}
        enrolledStudents={ENROLLED}
      />,
    )

    // The "Grade N Now" link must point to speedgrader, not just the course page
    expect(html).toContain('/speedgrader/sub-999')
  })

  it('"Grade N Now" button is absent when no pending submissions exist', () => {
    const html = renderToStaticMarkup(
      <TeacherCourseDashboard
        course={COURSE}
        allSubmissions={[]}
        enrolledStudents={ENROLLED}
      />,
    )
    expect(html).not.toContain('Grade')
    expect(html).not.toContain('speedgrader')
  })

  it('hero button href contains the submission id, not just the course id', () => {
    // Verifies the URL is specific to the submission, not a generic course link
    const allSubmissions: SubmissionSummary[] = [
      { id: 'sub-888', assignment_id: 'asgn-1', status: 'submitted' },
    ]
    const html = renderToStaticMarkup(
      <TeacherCourseDashboard
        course={COURSE}
        allSubmissions={allSubmissions}
        enrolledStudents={ENROLLED}
      />,
    )
    expect(html).toContain('sub-888')
    expect(html).not.toContain('href="/course/course-1"')
  })
})
