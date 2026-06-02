import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it, vi } from 'vitest'
import { GradesCommandCenter } from './GradesCommandCenter'
import type { StudentDashboardAssignment, StudentDashboardCourse } from '@/app/actions/dashboard'
import type { GradeWithFeedback } from '@/lib/grade-summary'

vi.mock('next/navigation', () => ({
  useRouter: () => ({ refresh: vi.fn() }),
}))

vi.mock('@/app/actions/grades', () => ({
  setStudentGoal: vi.fn(),
}))

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const courses: StudentDashboardCourse[] = [
  { id: 'bio-111', title: 'BIO 111 - General Biology', teacherName: 'Dr. Fischer Hewitt' },
  { id: 'coms-101', title: 'COMS 101 - Public Speaking', teacherName: 'Prof. Elena Rostova' },
]

const assignments: StudentDashboardAssignment[] = [
  {
    id: 'a1',
    courseId: 'bio-111',
    title: 'Lab Safety Contract',
    due: '2026-04-01',
    points: 5,
    status: 'graded',
    grade: 5,
    submittedAt: '2026-04-01T12:00:00Z',
  },
  {
    id: 'a2',
    courseId: 'bio-111',
    title: 'Cell Biology Quiz',
    due: '2026-05-01',
    points: 100,
    status: 'graded',
    grade: 91,
    submittedAt: '2026-05-01T12:00:00Z',
  },
  {
    id: 'a3',
    courseId: 'coms-101',
    title: 'Midterm Research Essay',
    due: '2026-05-10',
    points: 100,
    status: 'graded',
    grade: 88,
    submittedAt: '2026-05-10T12:00:00Z',
  },
  {
    id: 'a4',
    courseId: 'coms-101',
    title: 'Final Presentation',
    due: '2026-07-01',
    points: 100,
    status: 'not-started',
    submittedAt: null,
  },
]

const colorTokensByCourse = {
  'bio-111': {
    accent: 'text-violet-700',
    border: 'border-l-violet-500',
    bar: 'bg-violet-500',
    pill: 'bg-violet-100 text-violet-700',
    dot: 'bg-violet-500',
    soft: 'bg-violet-50',
    iconBg: 'bg-violet-100',
    hex: '#7c3aed',
  },
  'coms-101': {
    accent: 'text-blue-700',
    border: 'border-l-blue-500',
    bar: 'bg-blue-500',
    pill: 'bg-blue-100 text-blue-700',
    dot: 'bg-blue-500',
    soft: 'bg-blue-50',
    iconBg: 'bg-blue-100',
    hex: '#2563eb',
  },
}

const codeByCourse = { 'bio-111': 'BIO 111', 'coms-101': 'COMS 101' }

const recentGrades: GradeWithFeedback[] = [
  {
    assignmentId: 'a3',
    courseId: 'coms-101',
    assignmentTitle: 'Midterm Research Essay',
    finalScore: 88,
    finalFeedback: 'Your thesis was exceptionally strong and well-supported.',
    approvedAt: '2026-05-11T08:00:00Z',
    pointsPossible: 100,
  },
]

function render(props: Partial<Parameters<typeof GradesCommandCenter>[0]> = {}) {
  return renderToStaticMarkup(
    <GradesCommandCenter
      courses={courses}
      assignments={assignments}
      recentGrades={recentGrades}
      colorTokensByCourse={colorTokensByCourse}
      codeByCourse={codeByCourse}
      initialTargetGpa={null}
      {...props}
    />,
  )
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('GradesCommandCenter', () => {
  it('renders the heading and course filter tabs', () => {
    const html = render()
    expect(html).toContain('Grades Command Center')
    expect(html).toContain('All Courses')
    expect(html).toContain('BIO 111')
    expect(html).toContain('COMS 101')
  })

  it('shows all course cards by default', () => {
    const html = render()
    expect(html).toContain('BIO 111 - General Biology')
    expect(html).toContain('COMS 101 - Public Speaking')
    expect(html).toContain('Dr. Fischer Hewitt')
    expect(html).toContain('Prof. Elena Rostova')
  })

  it('computes and shows the correct letter grade and percentage for each course', () => {
    const html = render()
    // BIO 111: (5+91)/(5+100) ≈ 91.4% → A-
    expect(html).toContain('A-')
    expect(html).toContain('91.4%')
    // COMS 101: 88/100 = 88% → B+
    expect(html).toContain('B+')
    expect(html).toContain('88.0%')
  })

  it('filters to a single course when initialFilterCourseId is set', () => {
    const html = render({ initialFilterCourseId: 'bio-111' })
    expect(html).toContain('BIO 111 - General Biology')
    expect(html).not.toContain('COMS 101 - Public Speaking')
  })

  it('renders the Just Graded panel when recentGrades has entries', () => {
    const html = render()
    expect(html).toContain('JUST GRADED')
    expect(html).toContain('Midterm Research Essay')
    expect(html).toContain('Your thesis was exceptionally strong')
    expect(html).toContain('Review Full Rubric')
  })

  it('omits the Just Graded panel when recentGrades is empty', () => {
    const html = render({ recentGrades: [] })
    expect(html).not.toContain('JUST GRADED')
  })

  it('shows "No grades yet" for a course with no graded assignments', () => {
    const noGradesAssignments: StudentDashboardAssignment[] = [
      {
        id: 'x1',
        courseId: 'bio-111',
        title: 'Quiz',
        due: null,
        points: 10,
        status: 'not-started',
        submittedAt: null,
      },
    ]
    const html = render({ assignments: noGradesAssignments, recentGrades: [] })
    expect(html).toContain('No grades yet')
  })

  it('renders the Semester Goal widget', () => {
    const html = render({ initialTargetGpa: 3.8 })
    expect(html).toContain('Semester Goal')
    expect(html).toContain('3.8 GPA')
    expect(html).toContain('Edit Goals')
  })

  it('renders the Coach Insight widget', () => {
    const html = render()
    expect(html).toContain('Coach Insight')
    expect(html).toContain('Generate Study Plan')
  })

  it('shows an empty-state message when no courses are enrolled', () => {
    const html = render({ courses: [], assignments: [], recentGrades: [] })
    expect(html).toContain('No courses enrolled yet')
  })

  describe('per-course detail view', () => {
    it('renders the course full title and teacher as heading', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).toContain('BIO 111 - General Biology')
      expect(html).toContain('Dr. Fischer Hewitt')
    })

    it('does not render the other course', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).not.toContain('COMS 101 - Public Speaking')
    })

    it('renders Course Standing with correct grade', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).toContain('COURSE STANDING')
      expect(html).toContain('A-')
      expect(html).toContain('91.4%')
    })

    it('renders the Missing/Late Work card', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).toContain('MISSING / LATE WORK')
    })

    it('shows All caught up when no past-due unsubmitted assignments', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).toContain('All caught up on work!')
    })

    it('renders the mock Category Breakdown card', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).toContain('CATEGORY BREAKDOWN')
      expect(html).toContain('Quizzes')
      expect(html).toContain('Exams')
      expect(html).toContain('Labs')
    })

    it('renders the Assignment Breakdown table with correct assignments', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).toContain('ASSIGNMENT BREAKDOWN')
      expect(html).toContain('Lab Safety Contract')
      expect(html).toContain('Cell Biology Quiz')
    })

    it('shows View Feedback for graded assignments', () => {
      const html = render({ initialFilterCourseId: 'bio-111' })
      expect(html).toContain('View Feedback')
    })

    it('shows grade placeholder when no graded assignments exist', () => {
      const noGrades = assignments.map((a) =>
        a.courseId === 'coms-101' ? { ...a, status: 'not-started' as const, grade: undefined } : a,
      )
      const html = render({ initialFilterCourseId: 'coms-101', assignments: noGrades })
      expect(html).toContain('Grades will appear here')
    })
  })
})
