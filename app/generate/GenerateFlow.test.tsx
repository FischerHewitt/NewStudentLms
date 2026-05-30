import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { GenerateFlow } from './GenerateFlow'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: vi.fn() }),
}))

vi.mock('ai/react', () => ({
  experimental_useObject: () => ({ object: null, submit: vi.fn() }),
}))

vi.mock('@/app/actions/course', () => ({
  saveCoursePreview: vi.fn(),
  saveCourseToDB: vi.fn(),
}))

describe('GenerateFlow Teacher Coach context', () => {
  it('announces the active Syllabus to the global Teacher Coach', () => {
    const html = renderToStaticMarkup(
      <GenerateFlow
        draft={{
          courseId: 'course-draft-1',
          syllabus: 'BIO 111 syllabus',
          metadata: { title: 'Biology 111', term: 'Fall 2026' },
          preview: {
            title: 'Biology 111',
            modules: [
              {
                week_number: 1,
                title: 'Cells',
                description: 'Cell structure',
                assignments: [],
              },
            ],
          },
        }}
      />,
    )

    expect(html).toContain('data-teacher-coach-context="syllabus"')
  })
})
