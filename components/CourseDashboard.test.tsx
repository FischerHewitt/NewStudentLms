import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CourseDashboard } from './CourseDashboard'
import type { CourseWithModules, SubmissionSummary } from '@/app/actions/dashboard'
import type { EnrolledStudent } from '@/app/actions/enrollment'

vi.mock('@/context/RoleContext', () => ({
  useRole: vi.fn(() => ({ role: 'teacher', mounted: true })),
}))

vi.mock('@/components/TeacherCourseDashboard', () => ({
  TeacherCourseDashboard: ({ course }: { course: { title: string } }) => (
    <div data-testid="teacher-view">Teacher: {course.title}</div>
  ),
}))

vi.mock('@/components/MarkdownContent', () => ({
  MarkdownContent: ({ children }: { children: string }) => <div>{children}</div>,
}))

import { useRole } from '@/context/RoleContext'

const mockCourse: CourseWithModules = {
  id: 'c1',
  title: 'Biology 101',
  term: 'Fall 2024',
  section: 'A',
  status: 'published',
  teacherName: 'Dr. Smith',
  rawSyllabus: '## Week 1\nIntroduction to cells.',
  modules: [
    {
      id: 'm1',
      title: 'Week 1: Cells',
      week_number: 1,
      description: 'Cell biology basics',
      order: 1,
      assignments: [
        { id: 'a1', title: 'Cell Quiz', due_date: '2024-10-01', points_possible: 10 },
        { id: 'a2', title: 'Lab Report', due_date: '2024-10-08', points_possible: 25 },
      ],
    },
  ],
}

const mockSubmissions: SubmissionSummary[] = [
  { id: 's1', assignment_id: 'a1', status: 'graded' },
]

const mockStudents: EnrolledStudent[] = [
  { id: 'u1', name: 'Alice', email: 'alice@test.com', status: 'active' },
]

// Required props only — no onDelete, no embedded
const baseProps = {
  course: mockCourse,
  studentSubmissions: mockSubmissions,
  allSubmissions: mockSubmissions,
  enrolledStudents: mockStudents,
}

describe('CourseDashboard', () => {
  describe('teacher role', () => {
    it('delegates to TeacherCourseDashboard', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'teacher', mounted: true })
      const html = renderToStaticMarkup(<CourseDashboard {...baseProps} />)
      expect(html).toContain('Teacher: Biology 101')
    })

    it('renders with only required props (no onDelete, no embedded)', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'teacher', mounted: true })
      // This test would fail to compile if onDelete/embedded were required props
      expect(() => renderToStaticMarkup(<CourseDashboard {...baseProps} />)).not.toThrow()
    })
  })

  describe('student role', () => {
    it('renders course title', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'student', mounted: true })
      const html = renderToStaticMarkup(<CourseDashboard {...baseProps} />)
      expect(html).toContain('Biology 101')
    })

    it('renders module and assignment titles', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'student', mounted: true })
      const html = renderToStaticMarkup(<CourseDashboard {...baseProps} />)
      expect(html).toContain('Week 1: Cells')
      expect(html).toContain('Cell Quiz')
      expect(html).toContain('Lab Report')
    })

    it('renders assignment links with correct href', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'student', mounted: true })
      const html = renderToStaticMarkup(<CourseDashboard {...baseProps} />)
      expect(html).toContain('/course/c1/assignment/a1')
      expect(html).toContain('/course/c1/assignment/a2')
    })

    it('shows graded status badge for a graded submission', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'student', mounted: true })
      const html = renderToStaticMarkup(<CourseDashboard {...baseProps} />)
      expect(html).toContain('Graded')
    })

    it('shows not-submitted badge when no submission exists', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'student', mounted: true })
      const html = renderToStaticMarkup(
        <CourseDashboard {...baseProps} studentSubmissions={[]} />
      )
      expect(html).toContain('Not submitted')
    })

    it('renders empty state when course has no modules', () => {
      vi.mocked(useRole).mockReturnValue({ role: 'student', mounted: true })
      const html = renderToStaticMarkup(
        <CourseDashboard {...baseProps} course={{ ...mockCourse, modules: [] }} />
      )
      expect(html).toContain('No modules yet')
    })
  })
})
