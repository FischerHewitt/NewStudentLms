/**
 * Pure business logic for the Teacher Home dashboard.
 * No Next.js or DB dependencies — all functions are independently testable.
 * See docs/adr/0003-grade-pending-published-lifecycle.md for pending/published grade rules.
 */

export type CourseHealth = 'urgent' | 'watch' | 'steady'
export type SolutionStatus = 'missing' | 'uploaded' | 'needs-update'

/**
 * Per-course data shape consumed by `computeCourseHealth` and `aggregateTeacherStats`.
 * Populated by the `getTeacherDashboardData` server action.
 */
export type TeacherCourseRow = {
  id: string
  title: string
  /** Number of enrolled students */
  students: number
  /** Grades awaiting teacher approval (approved_at IS NULL, per ADR-0003) */
  pendingGrades: number
  /** Submitted + graded submissions ÷ max possible submissions, expressed as 0–100 */
  submittedRate: number
  /** Published grades ÷ total submissions, expressed as 0–100 */
  gradedRate: number
  /** v1: always 'missing' until solution-upload feature ships */
  solutionStatus: SolutionStatus
  /** Human-readable label for the next upcoming assignment, e.g. "Problem Set 7, Monday" */
  nextDue: string | null
}

/** TeacherCourseRow with computed health and recent activity for the context panel */
export type TeacherCourseSummary = TeacherCourseRow & {
  health: CourseHealth
  /** Up to 2 most recent pending submissions for the grading queue widget */
  recentSubmissions: { submissionId: string; assignmentTitle: string }[]
}

export type TeacherStatSummary = {
  /** Sum of pendingGrades across all courses */
  totalPending: number
  /** Pending grades for courses that have an uploaded solution (AI-ready to grade) */
  aiReady: number
  /** Count of courses where solution is missing or needs update */
  solutionGaps: number
  /** Earliest next-due label across all courses, or null if none */
  nextDue: string | null
}

export type TeacherDashboardData = {
  courses: TeacherCourseSummary[]
  stats: TeacherStatSummary
}

/**
 * Classifies a course into an attention level:
 * - urgent: ≥10 pending grades
 * - watch:  1–9 pending grades
 * - steady: no pending grades
 *
 * NOTE: solution-based rules (missing solution + submissions → urgent, not-uploaded → watch)
 * are intentionally omitted in v1 because solutionStatus is a stub that always returns
 * 'missing'. Re-add those rules once the solution-upload feature ships.
 */
export function computeCourseHealth(course: TeacherCourseRow): CourseHealth {
  if (course.pendingGrades >= 10) return 'urgent'
  if (course.pendingGrades > 0) return 'watch'
  return 'steady'
}

/**
 * Rolls up per-course rows into the four top-level stat widgets.
 */
export function aggregateTeacherStats(courses: TeacherCourseRow[]): TeacherStatSummary {
  const totalPending = courses.reduce((sum, c) => sum + c.pendingGrades, 0)
  const aiReady = courses
    .filter((c) => c.solutionStatus === 'uploaded')
    .reduce((sum, c) => sum + c.pendingGrades, 0)
  const solutionGaps = courses.filter((c) => c.solutionStatus !== 'uploaded').length
  const nextDue = courses.map((c) => c.nextDue).find((d) => d !== null) ?? null
  return { totalPending, aiReady, solutionGaps, nextDue }
}

/**
 * Builds a heuristic Teacher Coach suggestion sentence based on the
 * most urgent course. No LLM call — derived entirely from course data.
 */
export function teacherCoachHint(courses: TeacherCourseSummary[]): string {
  if (courses.length === 0) return 'No courses yet. Create one to get started.'

  const urgent = courses.find((c) => c.health === 'urgent')
  const watch = courses.find((c) => c.health === 'watch')
  const target = urgent ?? watch ?? courses[0]

  if (target.health === 'urgent' && target.pendingGrades >= 10) {
    return `Start with ${target.title} — ${target.pendingGrades} submissions are waiting to be graded.`
  }
  if (target.solutionStatus === 'missing' && target.submittedRate > 0) {
    return `Upload a solution for ${target.title} to enable AI grading.`
  }
  if (target.pendingGrades > 0) {
    return `${target.title} has ${target.pendingGrades} pending grade${target.pendingGrades === 1 ? '' : 's'}.`
  }
  return `All courses are up to date. ${courses[0].nextDue ? `Next due: ${courses[0].nextDue}.` : ''}`
}
