'use server'

import { createServerClient } from '@/lib/supabase/server'
import { TEACHER_ID } from '@/lib/constants'
import {
  computeCourseHealth,
  computeClassAverage,
  aggregateTeacherStats,
  type TeacherCourseRow,
  type TeacherDashboardData,
  type AssignmentGradingRow,
} from '@/lib/teacher-dashboard'
import { filterAndSortDeadlines, type UpcomingDeadline } from '@/lib/deadlines'

export type { UpcomingDeadline }

/**
 * Formats a due date as a human-readable label relative to today.
 * e.g. "Problem Set 7, tomorrow" or "Lab Notebook 2, Monday"
 */
function formatNextDue(title: string, dueDate: Date, today: Date): string {
  const diffMs = dueDate.getTime() - today.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays === 0) return `${title}, today`
  if (diffDays === 1) return `${title}, tomorrow`
  if (diffDays > 1 && diffDays <= 6) {
    const day = dueDate.toLocaleDateString('en-US', { weekday: 'long' })
    return `${title}, ${day}`
  }
  const label = dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  return `${title}, ${label}`
}

/**
 * Computes submission rate (0–100) from submitted/graded count and enrolled count.
 * Returns 0 when no students are enrolled.
 */
function submissionRate(submittedCount: number, enrolledCount: number): number {
  if (enrolledCount === 0) return 0
  return Math.round((submittedCount / enrolledCount) * 100)
}

/**
 * Returns a human-readable label for an assignment due date relative to today.
 * e.g. "Due Yesterday", "Due Today", "Due 2 Days Ago"
 */
function formatDueDateLabel(dueDate: Date, today: Date): string {
  const diffDays = Math.round((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diffDays === 0) return 'Due Today'
  if (diffDays === -1) return 'Due Yesterday'
  if (diffDays < -1) return `Due ${Math.abs(diffDays)} Days Ago`
  if (diffDays === 1) return 'Due Tomorrow'
  return `Due in ${diffDays} Days`
}

/**
 * Fetches all data needed for the Teacher Home gallery + stat bar.
 * Runs 5 queries regardless of course count to avoid N+1.
 *
 * Solution status is always 'missing' in v1 — the solution-upload feature
 * has not shipped yet. The solutionGaps stat will reflect this accurately.
 */
export async function getTeacherDashboardData(): Promise<TeacherDashboardData> {
  const db = createServerClient()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // 1. All published courses for this teacher
  const { data: courseRows } = await db
    .from('courses')
    .select('id, title, status, created_at')
    .eq('teacher_id', TEACHER_ID)
    .is('generation_preview', null)
    .order('created_at', { ascending: false })

  if (!courseRows || courseRows.length === 0) {
    return { courses: [], stats: aggregateTeacherStats([]), gradingQueue: [] }
  }

  const courseIds = courseRows.map((c) => c.id)

  // 2–5. All supporting data in parallel
  const [enrollmentsRes, assignmentsRes] = await Promise.all([
    db
      .from('enrollments')
      .select('course_id, student_id')
      .in('course_id', courseIds),
    db
      .from('assignments')
      .select('id, course_id, title, due_date, points_possible')
      .in('course_id', courseIds),
  ])

  const enrollments = enrollmentsRes.data ?? []
  const assignments = assignmentsRes.data ?? []
  const assignmentIds = assignments.map((a) => a.id)

  const submissionsRes = assignmentIds.length > 0
    ? await db
        .from('submissions')
        .select('id, assignment_id, status, submitted_at')
        .in('assignment_id', assignmentIds)
        .in('status', ['submitted', 'graded'])
    : { data: [] }

  const submissions = submissionsRes.data ?? []
  const submissionIds = submissions.map((s) => s.id)

  // Re-fetch grades scoped to actual submission IDs (avoid false positives)
  let pendingGradeRows: { submission_id: string }[] = []
  let approvedGradeRows: { submission_id: string; final_score: number }[] = []
  if (submissionIds.length > 0) {
    const [pendingRes, approvedRes] = await Promise.all([
      db
        .from('grades')
        .select('submission_id')
        .in('submission_id', submissionIds)
        .is('approved_at', null),
      db
        .from('grades')
        .select('submission_id, final_score')
        .in('submission_id', submissionIds)
        .not('approved_at', 'is', null),
    ])
    pendingGradeRows = pendingRes.data ?? []
    approvedGradeRows = (approvedRes.data ?? []).filter(
      (g): g is { submission_id: string; final_score: number } => g.final_score !== null,
    )
  }

  // Map submission_id → final_score for approved grades
  const approvedScoreBySubmission = new Map(
    approvedGradeRows.map((g) => [g.submission_id, g.final_score]),
  )

  // Build lookup sets for O(1) access
  const enrolledByCourse = new Map<string, number>()
  for (const e of enrollments) {
    enrolledByCourse.set(e.course_id, (enrolledByCourse.get(e.course_id) ?? 0) + 1)
  }

  const assignmentsByCourse = new Map<string, typeof assignments>()
  for (const a of assignments) {
    const existing = assignmentsByCourse.get(a.course_id) ?? []
    existing.push(a)
    assignmentsByCourse.set(a.course_id, existing)
  }

  const assignmentById = new Map(assignments.map((a) => [a.id, a]))

  // submitted = status 'submitted' or 'graded' (both count toward the rate)
  const submittedByAssignment = new Map<string, typeof submissions>()
  for (const s of submissions) {
    const existing = submittedByAssignment.get(s.assignment_id) ?? []
    existing.push(s)
    submittedByAssignment.set(s.assignment_id, existing)
  }

  // Pending grade set: submission IDs that have a grade row with approved_at IS NULL
  const pendingSubmissionIds = new Set(pendingGradeRows.map((g) => g.submission_id))

  // Recent submissions (for context panel grading queue) — last 2 per course, newest first
  const recentByCourse = new Map<string, { submissionId: string; assignmentTitle: string }[]>()
  const pendingSubmissions = submissions
    .filter((s) => pendingSubmissionIds.has(s.id))
    .sort((a, b) => {
      const ta = a.submitted_at ? new Date(a.submitted_at).getTime() : 0
      const tb = b.submitted_at ? new Date(b.submitted_at).getTime() : 0
      return tb - ta
    })
  for (const s of pendingSubmissions) {
    const assignment = assignmentById.get(s.assignment_id)
    if (!assignment) continue
    const existing = recentByCourse.get(assignment.course_id) ?? []
    if (existing.length < 2) {
      existing.push({ submissionId: s.id, assignmentTitle: assignment.title })
      recentByCourse.set(assignment.course_id, existing)
    }
  }

  // Assemble per-course rows
  const rows: TeacherCourseRow[] = courseRows.map((course) => {
    const courseAssignments = assignmentsByCourse.get(course.id) ?? []
    const enrolledCount = enrolledByCourse.get(course.id) ?? 0

    // Submitted count: sum across all assignments in this course
    const courseSubmissions = courseAssignments.flatMap(
      (a) => submittedByAssignment.get(a.id) ?? [],
    )
    const submittedCount = courseSubmissions.length
    // Rate = submissions made ÷ (enrolled students × number of assignments).
    // A single student submitting all 4 assignments → 4 / (1 × 4) = 100%, not 400%.
    const maxPossibleSubmissions = enrolledCount * courseAssignments.length

    // Graded rate: submissions with status 'graded' (= published grade, per ADR-0003) ÷ total submissions
    const gradedCount = courseSubmissions.filter((s) => s.status === 'graded').length

    // Pending grades: submissions that have a grade row with approved_at IS NULL
    const pendingGrades = courseSubmissions.filter((s) => pendingSubmissionIds.has(s.id)).length

    // Next due: earliest upcoming assignment (due_date >= today)
    const upcoming = courseAssignments
      .filter((a) => a.due_date !== null)
      .map((a) => ({ title: a.title, date: new Date(a.due_date!) }))
      .filter((a) => a.date >= today)
      .sort((a, b) => a.date.getTime() - b.date.getTime())

    const nextDue =
      upcoming.length > 0 ? formatNextDue(upcoming[0].title, upcoming[0].date, today) : null

    // Class average: approved final scores only (Option A per ADR-0003)
    const approvedScores = courseSubmissions.flatMap((s) => {
      const score = approvedScoreBySubmission.get(s.id)
      const assignment = assignmentById.get(s.assignment_id)
      if (score === undefined || !assignment) return []
      return [{ score, pointsPossible: assignment.points_possible }]
    })

    return {
      id: course.id,
      title: course.title,
      status: (course.status ?? 'draft') as 'draft' | 'published',
      students: enrolledCount,
      pendingGrades,
      submittedRate: submissionRate(submittedCount, maxPossibleSubmissions),
      gradedRate: submissionRate(gradedCount, submittedCount),
      solutionStatus: 'missing', // v1 stub — solution-upload feature not yet shipped
      nextDue,
      classAverage: computeClassAverage(approvedScores),
    }
  })

  const courses = rows.map((row) => ({
    ...row,
    health: computeCourseHealth(row),
    recentSubmissions: recentByCourse.get(row.id) ?? [],
  }))

  const stats = aggregateTeacherStats(rows)

  // Build per-assignment grading rows for the Needs Grading widget
  const gradingQueue: AssignmentGradingRow[] = assignments
    .flatMap((a) => {
      const subs = submittedByAssignment.get(a.id) ?? []
      if (subs.length === 0) return []
      const gradedCount = subs.filter((s) => s.status === 'graded').length
      const totalSubmissions = subs.length
      const gradedPct = Math.round((gradedCount / totalSubmissions) * 100)
      if (gradedPct >= 100) return []
      const course = courseRows.find((c) => c.id === a.course_id)
      const dueAt = a.due_date ?? null
      const dueDateLabel = dueAt ? formatDueDateLabel(new Date(dueAt), today) : ''
      const firstPending = subs.find((s) => s.status === 'submitted') ?? null
      return [
        {
          id: a.id,
          title: a.title,
          courseName: course?.title ?? '',
          courseId: a.course_id,
          firstPendingSubmissionId: firstPending?.id ?? null,
          dueAt,
          dueDateLabel,
          gradedCount,
          totalSubmissions,
          gradedPct,
        } satisfies AssignmentGradingRow,
      ]
    })
    .sort((a, b) => {
      const aTime = a.dueAt ? new Date(a.dueAt).getTime() : Infinity
      const bTime = b.dueAt ? new Date(b.dueAt).getTime() : Infinity
      return aTime - bTime
    })
    .slice(0, 5)

  return { courses, stats, gradingQueue }
}

/**
 * Returns up to 5 upcoming assignment deadlines across all teacher courses,
 * sorted ascending by due date. Used by the Deadlines widget.
 */
export async function getUpcomingDeadlines(): Promise<UpcomingDeadline[]> {
  const db = createServerClient()

  const { data: courseRows } = await db
    .from('courses')
    .select('id, title')
    .eq('teacher_id', TEACHER_ID)
    .is('generation_preview', null)

  if (!courseRows || courseRows.length === 0) return []

  const courseIds = courseRows.map((c) => c.id)
  const courseNameById = new Map(courseRows.map((c) => [c.id, c.title]))

  const { data: assignmentRows } = await db
    .from('assignments')
    .select('title, course_id, due_date')
    .in('course_id', courseIds)
    .not('due_date', 'is', null)

  const assignments = (assignmentRows ?? []).map((a) => ({
    title: a.title,
    courseName: courseNameById.get(a.course_id) ?? '',
    dueAt: a.due_date ? new Date(a.due_date).toISOString() : null,
  }))

  return filterAndSortDeadlines(assignments, new Date())
}
