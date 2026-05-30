import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SpeedGrader } from './SpeedGrader'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/actions/speedgrader', () => ({
  runSpeedGrader: vi.fn(),
  publishManualGrade: vi.fn(),
}))

describe('SpeedGrader Teacher Coach context', () => {
  it('announces the current Submission to the global Teacher Coach', () => {
    const html = renderToStaticMarkup(
      <SpeedGrader
        courseId="course-1"
        autorun={false}
        data={{
          submission: {
            id: 'submission-1',
            body: 'My essay',
            status: 'submitted',
            studentName: 'Jordan Student',
            attachment: null,
          },
          assignment: {
            id: 'assignment-1',
            title: 'Reflection',
            instructions: 'Write a reflection.',
            points_possible: 20,
            rubric: null,
          },
          grade: null,
        }}
      />,
    )

    expect(html).toContain('data-teacher-coach-context="submission"')
  })
})
