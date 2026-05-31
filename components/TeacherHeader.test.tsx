import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { TeacherHeader } from './TeacherHeader'

vi.mock('@/context/RoleContext', () => ({
  useRole: () => ({ mounted: true }),
}))

vi.mock('@/context/BreadcrumbContext', () => ({
  useBreadcrumb: () => ({ items: [], setItems: () => {} }),
}))

describe('TeacherHeader', () => {
  it('renders the teacher top bar controls from issue 61', () => {
    const html = renderToStaticMarkup(<TeacherHeader />)

    expect(html).toContain('h-16')
    expect(html).toContain('bg-surface-container-lowest/80')
    expect(html).toContain('backdrop-blur-md')
    expect(html).toContain('border-outline-variant')

    expect(html).toContain('aria-label="Open teacher navigation"')
    expect(html).toContain('sm:hidden')

    expect(html).toContain('Search students, courses...')
    expect(html).toContain('hidden')
    expect(html).toContain('sm:block')
    expect(html).toContain('focus:ring-alumos-purple')

    expect(html).toContain('aria-label="Quick Announcement"')
    expect(html).toContain('hidden')
    expect(html).toContain('sm:inline-flex')

    expect(html).toContain('aria-label="Notifications"')
    expect(html).toContain('bg-orange-500')

    expect(html).toContain('alt="Teacher profile"')
    expect(html).toContain('h-8')
    expect(html).toContain('w-8')
    expect(html).toContain('rounded-full')
  })
})
