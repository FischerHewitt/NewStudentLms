import { renderToStaticMarkup } from 'react-dom/server'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { CourseRouteChrome } from './CourseRouteChrome'
import { useRole } from '@/context/RoleContext'

let searchParams = new URLSearchParams()

vi.mock('@/context/RoleContext', () => ({
  useRole: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  useSearchParams: () => searchParams,
}))

vi.mock('@/components/TeacherShell', () => ({
  TeacherShell: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="teacher-shell">{children}</div>
  ),
}))

vi.mock('@/components/TeacherHeader', () => ({
  TeacherHeader: () => <header>Teacher Header</header>,
}))

describe('CourseRouteChrome', () => {
  beforeEach(() => {
    searchParams = new URLSearchParams()
  })

  it('does not wrap course assignment pages in teacher chrome for students', () => {
    vi.mocked(useRole).mockReturnValue({
      role: 'student',
      userId: 'student-user',
      mounted: true,
      toggleRole: vi.fn(),
    })

    const html = renderToStaticMarkup(
      <CourseRouteChrome>
        <div>Student assignment content</div>
      </CourseRouteChrome>,
    )

    expect(html).toContain('Student assignment content')
    expect(html).not.toContain('data-testid="teacher-shell"')
    expect(html).not.toContain('Teacher Header')
  })

  it('honors a student view route hint before stored role hydration', () => {
    searchParams = new URLSearchParams('view=student')
    vi.mocked(useRole).mockReturnValue({
      role: 'teacher',
      userId: 'teacher-user',
      mounted: false,
      toggleRole: vi.fn(),
    })

    const html = renderToStaticMarkup(
      <CourseRouteChrome>
        <div>Student assignment content</div>
      </CourseRouteChrome>,
    )

    expect(html).toContain('Student assignment content')
    expect(html).not.toContain('data-testid="teacher-shell"')
    expect(html).not.toContain('Teacher Header')
  })

  it('keeps teacher chrome for teachers', () => {
    vi.mocked(useRole).mockReturnValue({
      role: 'teacher',
      userId: 'teacher-user',
      mounted: true,
      toggleRole: vi.fn(),
    })

    const html = renderToStaticMarkup(
      <CourseRouteChrome>
        <div>Teacher assignment content</div>
      </CourseRouteChrome>,
    )

    expect(html).toContain('data-testid="teacher-shell"')
    expect(html).toContain('Teacher Header')
    expect(html).toContain('Teacher assignment content')
  })

  it('waits for the stored role before rendering route content', () => {
    vi.mocked(useRole).mockReturnValue({
      role: 'teacher',
      userId: 'teacher-user',
      mounted: false,
      toggleRole: vi.fn(),
    })

    const html = renderToStaticMarkup(
      <CourseRouteChrome>
        <div>Assignment content</div>
      </CourseRouteChrome>,
    )

    expect(html).toContain('Loading course')
    expect(html).not.toContain('Assignment content')
    expect(html).not.toContain('data-testid="teacher-shell"')
  })
})
