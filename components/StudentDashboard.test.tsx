import { renderToStaticMarkup } from 'react-dom/server'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { StudentDashboard } from './StudentDashboard'
import type {
  StudentDashboardAssignment,
  StudentDashboardCourse,
} from '@/app/actions/dashboard'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

afterEach(() => {
  vi.useRealTimers()
})

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
    id: 'a-later',
    courseId: 'coms-101',
    title: 'Midterm 1 - Chemistry and Cells',
    due: '2026-06-15',
    points: 100,
    status: 'not-started',
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
  {
    id: 'a-old-graded',
    courseId: 'bio-111',
    title: 'Lab Safety Contract',
    due: '2026-04-01',
    points: 5,
    status: 'graded',
    grade: 5,
    submittedAt: '2026-04-01T12:00:00Z',
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
    expect(allCoursesHtml).toContain('93%')
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
    expect(html).toContain('Office Visit')
    expect(html).toContain('/course/bio-111/assignment/a-overdue')
    expect(html).toContain('/course/coms-101/assignment/a-upcoming')
    expect(html).toContain('20pts')
    expect(html).toContain('10pts')
    expect(html).toContain('Mark as turned in (paper / in-class)')
    expect(html).toContain('later assignment')
    expect(html).not.toContain('Midterm 1 - Chemistry and Cells')
  })

  it('places today in the second calendar column after yesterday', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-06-01T03:50:00Z'))

    const html = renderToStaticMarkup(
      <StudentDashboard courses={courses} assignments={assignments} />,
    )
    const weekdayLabels = [
      ...html.matchAll(
        /<span class="block text-xs font-medium">(Sun|Mon|Tue|Wed|Thu|Fri|Sat)<\/span>/g,
      ),
    ].map((match) => match[1])

    expect(weekdayLabels.slice(0, 7)).toEqual(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'])
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
    expect(html).toContain('Grade pending')
    expect(html).toContain('older completed assignment')
    expect(html).not.toContain('Office Visit')
  })

  it('caps the smart window at 9 To-Do rows and 9 Completed rows', () => {
    const manyTodos: StudentDashboardAssignment[] = Array.from({ length: 10 }, (_, index) => ({
      id: `todo-${index + 1}`,
      courseId: 'bio-111',
      title: `Visible To-Do ${index + 1}`,
      due: `2026-06-${String(index + 1).padStart(2, '0')}`,
      points: 5,
      status: 'not-started',
      submittedAt: null,
    }))
    const manyCompleted: StudentDashboardAssignment[] = Array.from({ length: 10 }, (_, index) => ({
      id: `done-${index + 1}`,
      courseId: 'bio-111',
      title: `Completed Assignment ${index + 1}`,
      due: `2026-05-${String(30 - index).padStart(2, '0')}`,
      points: 5,
      status: 'graded',
      grade: 5,
      submittedAt: `2026-05-${String(30 - index).padStart(2, '0')}T12:00:00Z`,
    }))

    const todoHtml = renderToStaticMarkup(
      <StudentDashboard courses={courses} assignments={[...manyTodos, ...manyCompleted]} />,
    )
    const completedHtml = renderToStaticMarkup(
      <StudentDashboard
        courses={courses}
        assignments={[...manyTodos, ...manyCompleted]}
        initialWorkView="completed"
      />,
    )

    expect(todoHtml).toContain('To-Do 9')
    expect(todoHtml).toContain('Visible To-Do 9')
    expect(todoHtml).not.toContain('Visible To-Do 10')
    expect(todoHtml).toContain('1 later assignment summarized below the fold')

    expect(completedHtml).toContain('Completed 9')
    expect(completedHtml).toContain('Completed Assignment 9')
    expect(completedHtml).not.toContain('Completed Assignment 10')
    expect(completedHtml).toContain('1 older completed assignment tucked away')
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

  it('filters the Grades tab by the selected course', () => {
    const html = renderToStaticMarkup(
      <StudentDashboard
        courses={courses}
        assignments={assignments}
        initialTab="grades"
        initialCourseId="bio-111"
      />,
    )

    expect(html).toContain('BIO 111 - General Biology')
    expect(html).toContain('Connect Homework 1')
    expect(html).not.toContain('COMS 101 - Public Speaking')
    expect(html).not.toContain('Speech Round 1')
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
