import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { StudentDashboard } from './StudentDashboard'
import type {
  StudentDashboardAssignment,
  StudentDashboardCourse,
} from '@/app/actions/dashboard'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

const courses: StudentDashboardCourse[] = [
  { id: 'bio-111', title: 'BIO 111 - General Biology', teacherName: 'Dr. Sarah Chen' },
  { id: 'coms-101', title: 'COMS 101 - Public Speaking', teacherName: 'Dr. Sarah Chen' },
]

const assignments: StudentDashboardAssignment[] = [
  {
    id: 'a-overdue',
    courseId: 'bio-111',
    title: 'Assignment 6: Logarithm Exit Reflection',
    due: '2026-03-27',
    points: 20,
    status: 'not-started',
    submittedAt: null,
  },
  {
    id: 'a-upcoming',
    courseId: 'coms-101',
    title: 'Office Visit',
    due: '2026-06-02',
    points: 10,
    status: 'in-progress',
    submittedAt: null,
  },
  {
    id: 'a-graded',
    courseId: 'bio-111',
    title: 'Connect Homework 1',
    due: '2026-05-20',
    points: 10,
    status: 'graded',
    grade: 9,
    submittedAt: '2026-05-20T12:00:00Z',
  },
  {
    id: 'a-submitted',
    courseId: 'coms-101',
    title: 'Speech Round 1',
    due: '2026-05-24',
    points: 25,
    status: 'submitted',
    submittedAt: '2026-05-24T12:00:00Z',
  },
]

describe('StudentDashboard redesign', () => {
  it('renders the command-center shell with brand, profile, tabs, and teacher escape hatch', () => {
    const html = renderToStaticMarkup(
      <StudentDashboard courses={courses} assignments={assignments} />,
    )

    expect(html).toContain('Alumos')
    expect(html).toContain('Alex Rivers')
    expect(html).toContain('Overview')
    expect(html).toContain('Grades')
    expect(html).toContain('Messages')
    expect(html).toContain('Teacher View')
  })

  it('renders an AI Coach insight from dashboard data and a calm empty-data fallback', () => {
    const populatedHtml = renderToStaticMarkup(
      <StudentDashboard courses={courses} assignments={assignments} />,
    )
    const emptyHtml = renderToStaticMarkup(
      <StudentDashboard courses={[]} assignments={[]} />,
    )

    expect(populatedHtml).toContain('AI Coach Insights')
    expect(populatedHtml).toContain('Your next priority is')
    expect(populatedHtml).toContain('Accept Schedule')
    expect(populatedHtml).toContain('Dismiss')

    expect(emptyHtml).toContain('Once your teacher publishes a Course')
  })

  it('renders course cards with grade, no-grade, open counts, and selected-course filtering', () => {
    const allCoursesHtml = renderToStaticMarkup(
      <StudentDashboard courses={courses} assignments={assignments} />,
    )
    const filteredHtml = renderToStaticMarkup(
      <StudentDashboard
        courses={courses}
        assignments={assignments}
        initialCourseId="bio-111"
      />,
    )

    expect(allCoursesHtml).toContain('BIO 111 - General Biology')
    expect(allCoursesHtml).toContain('Dr. Sarah Chen')
    expect(allCoursesHtml).toContain('A-')
    expect(allCoursesHtml).toContain('No grades')
    expect(allCoursesHtml).toContain('1 open')

    expect(filteredHtml).toContain('All courses')
    expect(filteredHtml).toContain('To-Do 1')
    expect(filteredHtml).toContain('Assignment 6: Logarithm Exit Reflection')
    expect(filteredHtml).not.toContain('Office Visit')
  })

  it('renders the weekly to-do command center with grouped work, links, points, and check-off controls', () => {
    const html = renderToStaticMarkup(
      <StudentDashboard courses={courses} assignments={assignments} />,
    )

    expect(html).toContain('This Week')
    expect(html).toContain('aria-label="Weekly assignment status"')
    expect(html).toContain('Overdue')
    expect(html).toContain('Tuesday, Jun 2')
    expect(html).toContain('/course/bio-111/assignment/a-overdue')
    expect(html).toContain('/course/coms-101/assignment/a-upcoming')
    expect(html).toContain('20pts')
    expect(html).toContain('10pts')
    expect(html).toContain('Mark as turned in (paper / in-class)')
  })

  it('switches the Overview weekly work area to completed assignments', () => {
    const html = renderToStaticMarkup(
      <StudentDashboard
        courses={courses}
        assignments={assignments}
        initialWorkView="completed"
      />,
    )

    expect(html).toContain('aria-label="Weekly assignment status"')
    expect(html).toContain('Connect Homework 1')
    expect(html).toContain('9/10')
    expect(html).toContain('Speech Round 1')
    expect(html).toContain('Awaiting grade')
    expect(html).not.toContain('Office Visit')
  })

  it('renders the Grades tab with Published Grades and awaiting-grade states only', () => {
    const html = renderToStaticMarkup(
      <StudentDashboard
        courses={courses}
        assignments={assignments}
        initialTab="grades"
      />,
    )

    expect(html).toContain('Only Published Grades are shown here')
    expect(html).toContain('Connect Homework 1')
    expect(html).toContain('9/10')
    expect(html).toContain('Speech Round 1')
    expect(html).toContain('Awaiting grade')
  })

  it('renders the Messages tab as a polished non-functional empty state', () => {
    const html = renderToStaticMarkup(
      <StudentDashboard
        courses={courses}
        assignments={assignments}
        initialTab="messages"
      />,
    )

    expect(html).toContain('Messages are coming soon')
    expect(html).toContain('Course messages will live here once messaging is connected')
    expect(html).toContain('Back to current work')
  })

  it('renders responsive command-center layout hooks for desktop and mobile widths', () => {
    const html = renderToStaticMarkup(
      <StudentDashboard courses={courses} assignments={assignments} />,
    )

    expect(html).toContain('lg:grid')
    expect(html).toContain('lg:grid-cols-[280px_minmax(0,1fr)]')
    expect(html).toContain('lg:hidden')
    expect(html).toContain('hidden h-full flex-col')
    expect(html).toContain('md:grid-cols-2')
    expect(html).toContain('xl:grid-cols-[370px_minmax(0,1fr)]')
  })
})
