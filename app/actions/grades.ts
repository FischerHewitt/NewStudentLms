'use server'

import { createServerClient } from '@/lib/supabase/server'
import { STUDENT_ID } from '@/lib/constants'
import { deriveAssignmentStatus } from '@/lib/grade-lifecycle'
import type { StudentDashboardCourse, StudentDashboardAssignment } from '@/app/actions/dashboard'
import type { GradeWithFeedback } from '@/lib/grade-summary'

export type { GradeWithFeedback }

export type GradesCommandCenterData = {
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
  recentGrades: GradeWithFeedback[]
}

/**
 * Fetches everything the Grades Command Center needs in one call.
 * Extends the dashboard data with final_feedback and approved_at so the
 * "Just Graded" panel can surface the AI feedback summary without a second fetch.
 * Only published grades (approved_at IS NOT NULL) are returned.
 */
export async function getGradesCommandCenterData(): Promise<GradesCommandCenterData> {
  const db = createServerClient()

  // 1. Enrolled published courses
  const { data: enrollments } = await db
    .from('enrollments')
    .select('course_id, courses!inner(id, title, teacher_id, status)')
    .eq('student_id', STUDENT_ID)
    .eq('courses.status', 'published')

  if (!enrollments || enrollments.length === 0) {
    return { courses: [], assignments: [], recentGrades: [] }
  }

  const courseRows = enrollments.flatMap((e) => {
    const c = e.courses as unknown as { id: string; title: string; teacher_id: string } | null
    return c ? [c] : []
  })
  const courseIds = courseRows.map((c) => c.id)

  // 2. Teacher names
  const teacherIds = [...new Set(courseRows.map((c) => c.teacher_id))]
  const { data: teachers } = await db.from('users').select('id, name').in('id', teacherIds)
  const teacherById = Object.fromEntries((teachers ?? []).map((t) => [t.id, t.name as string]))

  const courses: StudentDashboardCourse[] = courseRows.map((c) => ({
    id: c.id,
    title: c.title,
    teacherName: teacherById[c.teacher_id] ?? 'Unknown',
  }))

  // 3. All assignments across enrolled courses
  const { data: assignmentRows } = await db
    .from('assignments')
    .select('id, course_id, title, due_date, points_possible')
    .in('course_id', courseIds)

  if (!assignmentRows || assignmentRows.length === 0) {
    return { courses, assignments: [], recentGrades: [] }
  }

  const assignmentIds = assignmentRows.map((a) => a.id)

  // 4. Student's submissions
  const { data: submissions } = await db
    .from('submissions')
    .select('id, assignment_id, body, status, submitted_at')
    .eq('student_id', STUDENT_ID)
    .in('assignment_id', assignmentIds)

  const submissionByAssignment = Object.fromEntries(
    (submissions ?? []).map((s) => [
      s.assignment_id,
      s as {
        id: string
        assignment_id: string
        body: string
        status: 'draft' | 'submitted' | 'graded'
        submitted_at: string | null
      },
    ]),
  )

  // 5. Published grades — include final_feedback for the Just Graded panel
  const submissionIds = (submissions ?? []).map((s) => s.id)
  const gradeBySubmission: Record<
    string,
    { final_score: number; final_feedback: string; approved_at: string }
  > = {}

  if (submissionIds.length > 0) {
    const { data: grades } = await db
      .from('grades')
      .select('submission_id, final_score, final_feedback, approved_at')
      .in('submission_id', submissionIds)
      .not('approved_at', 'is', null)

    for (const g of grades ?? []) {
      gradeBySubmission[g.submission_id] = {
        final_score: g.final_score as number,
        final_feedback: (g.final_feedback as string) ?? '',
        approved_at: g.approved_at as string,
      }
    }
  }

  // 6. Derive per-assignment status
  const assignments: StudentDashboardAssignment[] = assignmentRows.map((a) => {
    const sub = submissionByAssignment[a.id] ?? null
    const grade = sub ? (gradeBySubmission[sub.id] ?? null) : null
    const derived = deriveAssignmentStatus(sub, grade)

    return {
      id: a.id,
      courseId: a.course_id,
      title: a.title,
      due: a.due_date ?? null,
      points: a.points_possible,
      status: derived.status,
      grade: derived.grade,
      submittedAt: sub?.submitted_at ?? null,
    }
  })

  // 7. Build GradeWithFeedback list — one entry per published grade
  const assignmentById = Object.fromEntries(assignmentRows.map((a) => [a.id, a]))

  const recentGrades: GradeWithFeedback[] = (submissions ?? []).flatMap((s) => {
    const g = gradeBySubmission[s.id]
    if (!g) return []
    const a = assignmentById[s.assignment_id]
    if (!a) return []
    return [
      {
        assignmentId: a.id,
        courseId: a.course_id,
        assignmentTitle: a.title,
        finalScore: g.final_score,
        finalFeedback: g.final_feedback,
        approvedAt: g.approved_at,
        pointsPossible: a.points_possible,
      },
    ]
  })

  return { courses, assignments, recentGrades }
}

/**
 * Returns the current student's target GPA, or null if not set.
 */
export async function getStudentGoal(): Promise<number | null> {
  const db = createServerClient()
  const { data } = await db
    .from('student_goals')
    .select('target_gpa')
    .eq('student_id', STUDENT_ID)
    .maybeSingle()
  return data ? Number(data.target_gpa) : null
}

/**
 * Persists the student's target GPA. Validates the range [0.0, 4.0] before writing.
 */
export async function setStudentGoal(targetGpa: number): Promise<void> {
  if (targetGpa < 0 || targetGpa > 4.0) {
    throw new Error(`targetGpa must be between 0.0 and 4.0, got ${targetGpa}`)
  }

  const db = createServerClient()
  const { error } = await db.from('student_goals').upsert(
    { student_id: STUDENT_ID, target_gpa: targetGpa, updated_at: new Date().toISOString() },
    { onConflict: 'student_id' },
  )

  if (error) throw new Error(`Failed to save student goal: ${error.message}`)
}
