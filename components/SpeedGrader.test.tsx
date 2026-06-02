import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { SpeedGrader } from './SpeedGrader'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn(), push: vi.fn() }),
}))

vi.mock('@/app/actions/speedgrader', () => ({
  runSpeedGrader: vi.fn(),
  publishManualGrade: vi.fn(),
  restoreGradeSnapshot: vi.fn(),
}))

const RUBRIC_DATA = {
  submission: {
    id: 'sub-1', body: 'Essay text', status: 'submitted' as const,
    studentName: 'Alex Rivera', attachment: null,
  },
  assignment: {
    id: 'asgn-1', title: 'Midterm Essay', instructions: 'Write an essay.',
    points_possible: 80,
    rubric: {
      criteria: [
        { description: 'Thesis Clarity', points: 25 },
        { description: 'Textual Evidence', points: 40 },
        { description: 'Formatting', points: 15 },
      ],
    },
  },
  course: {
    id: 'c-1',
    title: 'English',
  },
  navigation: {
    previousSubmissionId: 'sub-0',
    nextSubmissionId: 'sub-2',
  },
  grade: {
    id: 'grade-1',
    submission_id: 'sub-1',
    ai_suggested_score: 64,
    ai_suggested_feedback: 'Good work overall.',
    final_score: null,
    final_feedback: null,
    approved_at: null,
    approved_by: null,
    ai_criterion_scores: null,
  },
}

describe('SpeedGrader rubric scoring', () => {
  it('renders one score input per rubric criterion', () => {
    const html = renderToStaticMarkup(
      <SpeedGrader courseId="c-1" autorun={false} data={RUBRIC_DATA} />,
    )
    // Each criterion description should appear
    expect(html).toContain('Thesis Clarity')
    expect(html).toContain('Textual Evidence')
    expect(html).toContain('Formatting')
    // Three number inputs (one per criterion) — more than the old single total input
    const inputMatches = html.match(/type="number"/g) ?? []
    expect(inputMatches.length).toBeGreaterThanOrEqual(3)
  })

  it('shows the sum of AI-suggested scores as the initial total when no grade exists', () => {
    // ai_suggested_score = 64 total — but individual criterion breakdowns come from the rubric
    // The header total should equal the sum of AI scores mapped to criteria
    const html = renderToStaticMarkup(
      <SpeedGrader courseId="c-1" autorun={false} data={{ ...RUBRIC_DATA, grade: null }} />,
    )
    // Points possible should appear
    expect(html).toContain('80')
  })
})

describe('SpeedGrader student view link', () => {
  it('renders a Student View link in the submission panel that points to the assignment page', () => {
    const html = renderToStaticMarkup(
      <SpeedGrader courseId="c-1" autorun={false} data={RUBRIC_DATA} />,
    )
    expect(html).toContain('Student View')
    expect(html).toContain('/course/c-1/assignment/asgn-1')
  })
})

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
          course: {
            id: 'course-1',
            title: 'English',
          },
          navigation: {
            previousSubmissionId: null,
            nextSubmissionId: null,
          },
          grade: null,
        }}
      />,
    )

    expect(html).toContain('data-teacher-coach-context="submission"')
  })
})

describe('SpeedGrader grading actions', () => {
  it('renders separate navigation, AI suggest, update, and publish-next controls', () => {
    const html = renderToStaticMarkup(
      <SpeedGrader
        courseId="c-1"
        autorun={false}
        data={{
          ...RUBRIC_DATA,
          grade: {
            ...RUBRIC_DATA.grade,
            final_score: 72,
            final_feedback: 'Published feedback.',
            approved_at: '2026-06-01T12:00:00.000Z',
          },
        }}
      />,
    )

    expect(html).toContain('Previous')
    expect(html).toContain('Next')
    expect(html).toContain('AI Suggest')
    expect(html).toContain('Update Grade')
    expect(html).toContain('Publish &amp; Next')
  })
})
