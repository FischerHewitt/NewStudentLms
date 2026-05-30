import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TeacherDashboard } from './TeacherDashboard'
import type { TeacherDashboardData, TeacherCourseSummary } from '@/lib/teacher-dashboard'

vi.mock('next/link', () => ({
  default: ({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) =>
    <a href={href} className={className}>{children}</a>,
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
    recentSubmissions: [],
    ...overrides,
  }
}

function makeDashboard(course: TeacherCourseSummary): TeacherDashboardData {
  return {
    courses: [course],
    stats: { totalPending: 0, aiReady: 0, solutionGaps: 1, nextDue: null },
  }
}

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
    // health badge text ("steady") should be there; "Draft" badge should not
    expect(html).toContain('steady')
    expect(html).not.toMatch(/>\s*Draft\s*</)
  })

  it('shows a Publish button in the context panel for draft courses', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard
        data={makeDashboard(makeCourse({ status: 'draft' }))}
        onPublish={vi.fn()}
      />,
    )
    expect(html).toContain('Publish course')
  })

  it('shows an Unpublish button in the context panel for published courses', () => {
    const html = renderToStaticMarkup(
      <TeacherDashboard
        data={makeDashboard(makeCourse({ status: 'published' }))}
        onUnpublish={vi.fn()}
      />,
    )
    expect(html).toContain('Unpublish')
  })
})
