import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { StudentAssignmentView } from './StudentAssignmentView'
import type {
  AssignmentWithDetails,
  StudentSubmissionData,
} from '@/app/actions/assignment'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/actions/assignment', () => ({
  submitAssignment: vi.fn(),
}))

const assignment: AssignmentWithDetails = {
  id: 'a1',
  title: 'Cell Quiz',
  instructions: 'Answer the prompt.',
  due_date: '2026-06-02',
  points_possible: 10,
  rubric: null,
  resources: [],
}

const studentSubmission: StudentSubmissionData = {
  id: null,
  body: '',
  status: null,
  submitted_at: null,
  attachment: null,
}

describe('StudentAssignmentView', () => {
  it('takes students back to the dashboard instead of the course page', () => {
    const html = renderToStaticMarkup(
      <StudentAssignmentView
        courseId="c1"
        assignment={assignment}
        studentSubmission={studentSubmission}
      />,
    )

    expect(html).toContain('Back to dashboard')
    expect(html).not.toContain('href="/course/c1')
  })

  it('uses the rich response editor and attachment picker for open submissions', () => {
    const html = renderToStaticMarkup(
      <StudentAssignmentView
        courseId="c1"
        assignment={assignment}
        studentSubmission={studentSubmission}
      />,
    )

    expect(html).toContain('Paragraph')
    expect(html).toContain('Font')
    expect(html).toContain('Size')
    expect(html).toContain('title="Insert math"')
    expect(html).toContain('title="Insert table"')
    expect(html).toContain('type="file"')
    expect(html).toContain('Upload a file')
  })

  it('allows a file-only submission when an attachment is already selected', () => {
    const html = renderToStaticMarkup(
      <StudentAssignmentView
        courseId="c1"
        assignment={assignment}
        studentSubmission={{
          ...studentSubmission,
          attachment: {
            url: 'https://example.com/report.pdf',
            fileName: 'report.pdf',
            fileType: 'application/pdf',
            fileSize: 2048,
          },
        }}
      />,
    )

    expect(html).toContain('report.pdf')
    expect(html).toContain('2.0 KB')
    expect(html).not.toContain('disabled="" class="rounded-lg bg-indigo-600')
  })

  it('shows submitted attachments in the read-only response view', () => {
    const html = renderToStaticMarkup(
      <StudentAssignmentView
        courseId="c1"
        assignment={assignment}
        studentSubmission={{
          id: 's1',
          body: '<p>My work is attached.</p>',
          status: 'submitted',
          submitted_at: '2026-06-02T12:00:00Z',
          attachment: {
            url: 'https://example.com/work.docx',
            fileName: 'work.docx',
            fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
            fileSize: 4096,
          },
        }}
      />,
    )

    expect(html).toContain('work.docx')
    expect(html).toContain('4.0 KB')
    expect(html).toContain('href="https://example.com/work.docx"')
  })
})
