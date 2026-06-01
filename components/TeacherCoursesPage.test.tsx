import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TeacherCoursesPage } from './TeacherCoursesPage'
import type { TeacherCourseSummary } from '@/lib/teacher-dashboard'

vi.mock('next/navigation', () => ({
  useTransition: () => [false, (fn: () => void) => fn()],
}))

const BASE_COURSE: TeacherCourseSummary = {
  id: 'c-1',
  title: 'BIO 111',
  status: 'published',
  students: 24,
  pendingGrades: 2,
  submittedRate: 40,
  gradedRate: 0,
  classAverage: null,
  nextDue: null,
  solutionStatus: 'missing',
  health: 'watch',
  recentSubmissions: [{ submissionId: 'sub-42', assignmentTitle: 'Essay 1' }],
}

describe('TeacherCoursesPage grade links', () => {
  it('"Grade" button links to speedgrader when recentSubmissions has a pending submission', () => {
    const html = renderToStaticMarkup(<TeacherCoursesPage courses={[BASE_COURSE]} />)
    expect(html).toContain('/speedgrader/sub-42')
  })

  it('"Grade" button is absent when pendingGrades is 0', () => {
    const course = { ...BASE_COURSE, pendingGrades: 0, health: 'steady' as const, recentSubmissions: [] }
    const html = renderToStaticMarkup(<TeacherCoursesPage courses={[course]} />)
    expect(html).not.toContain('Grade')
  })
})
