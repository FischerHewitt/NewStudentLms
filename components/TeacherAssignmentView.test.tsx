import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { TeacherAssignmentView } from './TeacherAssignmentView'
import type { AssignmentWithDetails, SubmissionData } from '@/app/actions/assignment'

const mockAssignment: AssignmentWithDetails = {
  id: 'a1',
  title: 'Midterm Essay: Modernism',
  instructions: 'Analyze the narrative techniques used by Virginia Woolf.',
  due_date: '2024-10-25',
  points_possible: 100,
  rubric: {
    criteria: [
      { description: 'Thesis Clarity', points: 25 },
      { description: 'Textual Evidence', points: 40 },
    ],
  },
  resources: [],
}

const mockSubmissions: SubmissionData[] = [
  {
    id: 's1',
    student_id: 'u1',
    studentName: 'Alice Smith',
    body: 'My essay...',
    status: 'submitted',
    submitted_at: '2024-10-20T12:00:00Z',
    attachment: null,
    finalScore: null,
    grade: null,
  },
]

describe('TeacherAssignmentView', () => {
  it('renders the assignment title', () => {
    const html = renderToStaticMarkup(
      <TeacherAssignmentView courseId="c1" assignment={mockAssignment} allSubmissions={[]} />
    )
    expect(html).toContain('Midterm Essay: Modernism')
  })

  it('renders Rubric Criteria sidebar with criterion names in monitoring view', () => {
    // Default view is the monitoring view — rubric shows in the right sidebar
    const html = renderToStaticMarkup(
      <TeacherAssignmentView courseId="c1" assignment={mockAssignment} allSubmissions={[]} />
    )
    expect(html).toContain('Rubric Criteria')
    expect(html).toContain('Thesis Clarity')
    expect(html).toContain('Textual Evidence')
  })

  it('renders AI Teaching Assistant in monitoring view', () => {
    const html = renderToStaticMarkup(
      <TeacherAssignmentView courseId="c1" assignment={mockAssignment} allSubmissions={[]} />
    )
    expect(html).toContain('AI Teaching Assistant')
  })

  it('does not show Core Settings or edit form in the default monitoring view', () => {
    // Core Settings is only visible after clicking Quick Edit (isEditing=true)
    const html = renderToStaticMarkup(
      <TeacherAssignmentView courseId="c1" assignment={mockAssignment} allSubmissions={[]} />
    )
    expect(html).not.toContain('Core Settings')
  })

  it('renders student submissions', () => {
    const html = renderToStaticMarkup(
      <TeacherAssignmentView courseId="c1" assignment={mockAssignment} allSubmissions={mockSubmissions} />
    )
    expect(html).toContain('Alice Smith')
  })

  it('shows empty state when no submissions', () => {
    const html = renderToStaticMarkup(
      <TeacherAssignmentView courseId="c1" assignment={mockAssignment} allSubmissions={[]} />
    )
    expect(html).toContain('No submissions yet')
  })
})
