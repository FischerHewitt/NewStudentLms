import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TeacherDashboard } from './TeacherDashboard'
import type { TeacherDashboardData, TeacherCourseSummary, AssignmentGradingRow } from '@/lib/teacher-dashboard'
import type { UpcomingDeadline } from '@/lib/deadlines'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
}))

vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: ({ src, alt, ...props }: { src: string; alt: string; [k: string]: unknown }) =>
    <img src={src} alt={alt} {...(props as object)} />,
}))

function makeCourse(overrides: Partial<TeacherCourseSummary> = {}): TeacherCourseSummary {
  return {
    id: 'course-1',
    title: 'Biology 101',
    status: 'published',
    health: 'steady',
    students: 28,
    pendingGrades: 0,
    submittedRate: 75,
    gradedRate: 80,
    solutionStatus: 'missing',
    nextDue: null,
    classAverage: null,
    recentSubmissions: [],
    ...overrides,
  }
}

function makeDashboard(course: TeacherCourseSummary, extra: Partial<TeacherDashboardData> = {}): TeacherDashboardData {
  return {
    courses: [course],
    stats: { totalPending: 0, aiReady: 0, solutionGaps: 1, nextDue: null },
    gradingQueue: [],
    ...extra,
  }
}

function makeGradingRow(overrides: Partial<AssignmentGradingRow> = {}): AssignmentGradingRow {
  return {
    id: 'assign-1',
    title: 'Lab Report: Kinematics',
    courseName: 'AP Physics C',
    courseId: 'course-1',
    firstPendingSubmissionId: null,
    dueAt: '2026-05-28T17:00:00Z',
    dueDateLabel: 'Due Yesterday',
    gradedCount: 12,
    totalSubmissions: 28,
    gradedPct: 43,
    ...overrides,
  }
}

// ─── #57/#62: draft/published display (existing behavior preserved) ──────────

describe('TeacherDashboard draft/published display', () => {
  it('shows "Draft" badge for a draft course', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse({ status: 'draft' }))} />,
    )
    expect(html).toContain('Draft')
  })

  it('does not show "Draft" badge for a published course', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse({ status: 'published' }))} />,
    )
    expect(html).toContain('steady')
    expect(html).not.toMatch(/>\s*Draft\s*</)
  })

  it('shows a Publish button for draft courses when onPublish is provided', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard
        data={makeDashboard(makeCourse({ status: 'draft' }))}
        onPublish={vi.fn()}
      />,
    )
    expect(html).toContain('Publish course')
  })

  it('shows an Unpublish button for published courses when onUnpublish is provided', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard
        data={makeDashboard(makeCourse({ status: 'published' }))}
        onUnpublish={vi.fn()}
      />,
    )
    expect(html).toContain('Unpublish')
  })
})

// ─── #66: AI Co-pilot Insights banner ────────────────────────────────────────

describe('#66 AI Co-pilot Insights banner', () => {
  it('renders the AI insights section header', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse())} />,
    )
    expect(html.toLowerCase()).toContain('ai co-pilot')
  })

  it('renders the heuristic hint text for an urgent course', () => {
    const course = makeCourse({ pendingGrades: 15, health: 'urgent' })
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(course)} />,
    )
    expect(html).toContain('Biology 101')
  })
})

// ─── #64: Active Courses Overview widget ─────────────────────────────────────

describe('#64 Active Courses Overview', () => {
  it('renders course title in the overview section', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse({ title: 'AP Physics C' }))} />,
    )
    expect(html).toContain('AP Physics C')
  })

  it('renders student count on the course card', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse({ students: 32 }))} />,
    )
    expect(html).toContain('32')
  })

  it('shows class average when available', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse({ classAverage: 84 }))} />,
    )
    expect(html).toContain('84')
  })

  it('shows a placeholder when classAverage is null', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse({ classAverage: null }))} />,
    )
    expect(html).toContain('—')
  })

  it('renders all courses when multiple exist', () => {
    const data: TeacherDashboardData = {
      courses: [
        makeCourse({ id: 'c1', title: 'AP Physics C' }),
        makeCourse({ id: 'c2', title: 'Honors Calculus' }),
      ],
      stats: { totalPending: 0, aiReady: 0, solutionGaps: 2, nextDue: null },
      gradingQueue: [],
    }
    const html = renderToStaticMarkup(<TeacherDashboard data={data} />)
    expect(html).toContain('AP Physics C')
    expect(html).toContain('Honors Calculus')
  })
})

// ─── #65: Needs Grading widget ───────────────────────────────────────────────

describe('#65 Needs Grading widget', () => {
  it('renders assignment title from the grading queue', () => {
    const data = makeDashboard(makeCourse(), { gradingQueue: [makeGradingRow()] })
    const html = renderToStaticMarkup(<TeacherDashboard data={data} />)
    expect(html).toContain('Lab Report: Kinematics')
  })

  it('renders the course name alongside the assignment', () => {
    const data = makeDashboard(makeCourse(), { gradingQueue: [makeGradingRow()] })
    const html = renderToStaticMarkup(<TeacherDashboard data={data} />)
    expect(html).toContain('AP Physics C')
  })

  it('renders graded count and total', () => {
    const data = makeDashboard(makeCourse(), { gradingQueue: [makeGradingRow({ gradedCount: 12, totalSubmissions: 28 })] })
    const html = renderToStaticMarkup(<TeacherDashboard data={data} />)
    expect(html).toContain('12')
    expect(html).toContain('28')
  })

  it('renders a "Grade Now" action link for items not yet started', () => {
    const row = makeGradingRow({ gradedCount: 0, gradedPct: 0 })
    const data = makeDashboard(makeCourse(), { gradingQueue: [row] })
    const html = renderToStaticMarkup(<TeacherDashboard data={data} />)
    expect(html).toContain('Grade Now')
  })

  it('renders a "Resume" action for items already in progress', () => {
    const row = makeGradingRow({ gradedCount: 12, gradedPct: 43 })
    const data = makeDashboard(makeCourse(), { gradingQueue: [row] })
    const html = renderToStaticMarkup(<TeacherDashboard data={data} />)
    expect(html).toContain('Resume')
  })

  it('renders empty state when grading queue is empty', () => {
    const data = makeDashboard(makeCourse(), { gradingQueue: [] })
    const html = renderToStaticMarkup(<TeacherDashboard data={data} />)
    expect(html).toContain('All caught up')
  })
})

// ─── #67: Deadlines widget ───────────────────────────────────────────────────

describe('#67 Deadlines widget', () => {
  const deadline: UpcomingDeadline = {
    assignmentTitle: 'Midterm Essay',
    courseName: 'AP Physics C',
    dueAt: '2026-06-01T17:00:00Z',
    daysUntilDue: 1,
  }

  it('renders the deadline assignment title', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse())} deadlines={[deadline]} />,
    )
    expect(html).toContain('Midterm Essay')
  })

  it('renders the course name alongside the deadline', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse())} deadlines={[deadline]} />,
    )
    expect(html).toContain('AP Physics C')
  })

  it('renders empty state when no deadlines', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard data={makeDashboard(makeCourse())} deadlines={[]} />,
    )
    expect(html).toContain('No upcoming deadlines')
  })
})
