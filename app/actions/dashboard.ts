'use server'

import { createServerClient } from '@/lib/supabase/server'
import { STUDENT_ID } from '@/lib/constants'
import { deriveAssignmentStatus, type AssignmentDashboardStatus } from '@/lib/grade-lifecycle'

export type { AssignmentDashboardStatus }

export type StudentDashboardCourse = {
  id: string
  title: string
  teacherName: string
}

export type StudentDashboardAssignment = {
  id: string
  courseId: string
  title: string
  due: string | null
  points: number
  status: AssignmentDashboardStatus
  grade?: number
  submittedAt: string | null
}

export type CourseWithModules = {
  id: string
  title: string
  term: string | null
  section: string | null
  startDate: string | null
  endDate: string | null
  status: 'draft' | 'published'
  teacherName: string
  rawSyllabus: string | null
  modules: ModuleWithAssignments[]
}

export type ModuleWithAssignments = {
  id: string
  title: string
  week_number: number
  description: string
  order: number
  assignments: AssignmentSummary[]
}

export type AssignmentSummary = {
  id: string
  title: string
  due_date: string | null
  points_possible: number
}

export type SubmissionSummary = {
  id: string
  assignment_id: string
  status: 'draft' | 'submitted' | 'graded'
}

/**
 * Fetches course info, teacher name, and all modules with nested assignments.
 * Returns null if the course doesn't exist or has no saved structure.
 */
export async function getCourseWithModules(
  courseId: string,
): Promise<CourseWithModules | null> {
  const db = createServerClient()

  const { data: course } = await db
    .from('courses')
    .select('id, title, term, section, start_date, end_date, status, teacher_id, raw_syllabus')
    .eq('id', courseId)
    .single()

  if (!course) return null

  const [teacherResult, modulesResult] = await Promise.all([
    db.from('users').select('name').eq('id', course.teacher_id).single(),
    db
      .from('modules')
      .select(
        'id, title, week_number, description, order, assignments(id, title, due_date, points_possible)',
      )
      .eq('course_id', courseId)
      .order('order'),
  ])

  return {
    id: course.id,
    title: course.title,
    term: course.term ?? null,
    section: course.section ?? null,
    startDate: course.start_date ?? null,
    endDate: course.end_date ?? null,
    status: (course.status ?? 'draft') as 'draft' | 'published',
    teacherName: teacherResult.data?.name ?? 'Unknown',
    rawSyllabus: course.raw_syllabus ?? null,
    modules: (modulesResult.data ?? []).map((m) => ({
      id: m.id,
      title: m.title,
      week_number: m.week_number,
      description: m.description,
      order: m.order,
      assignments: (m.assignments ?? []) as AssignmentSummary[],
    })),
  }
}

/**
 * Fetches the demo student's submissions for all assignments in a course.
 * Used to render per-assignment status badges in the student view.
 */
export async function getStudentSubmissionsForCourse(
  courseId: string,
): Promise<SubmissionSummary[]> {
  const db = createServerClient()

  const { data: assignments } = await db
    .from('assignments')
    .select('id')
    .eq('course_id', courseId)

  if (!assignments || assignments.length === 0) return []

  const { data: submissions } = await db
    .from('submissions')
    .select('id, assignment_id, status')
    .eq('student_id', STUDENT_ID)
    .in(
      'assignment_id',
      assignments.map((a) => a.id),
    )

  return (submissions ?? []) as SubmissionSummary[]
}

/**
 * Fetches ALL submissions for a course across all students.
 * Used to build submission count badges in the teacher view.
 */
export async function getAllSubmissionsForCourse(
  courseId: string,
): Promise<SubmissionSummary[]> {
  const db = createServerClient()

  const { data: assignments } = await db
    .from('assignments')
    .select('id')
    .eq('course_id', courseId)

  if (!assignments || assignments.length === 0) return []

  const { data: submissions } = await db
    .from('submissions')
    .select('id, assignment_id, status')
    .in(
      'assignment_id',
      assignments.map((a) => a.id),
    )

  return (submissions ?? []) as SubmissionSummary[]
}

/**
 * Fetches a single module with its assignments.
 * Returns null if the module doesn't exist.
 */
export async function getModuleWithAssignments(
  moduleId: string,
): Promise<ModuleWithAssignments | null> {
  const db = createServerClient()

  const { data: mod } = await db
    .from('modules')
    .select(
      'id, title, week_number, description, order, assignments(id, title, due_date, points_possible)',
    )
    .eq('id', moduleId)
    .single()

  if (!mod) return null

  return {
    id: mod.id,
    title: mod.title,
    week_number: mod.week_number,
    description: mod.description,
    order: mod.order,
    assignments: (mod.assignments ?? []) as AssignmentSummary[],
  }
}

/**
 * Fetches everything the student dashboard needs in one round-trip:
 * enrolled courses, all their assignments, the student's submissions,
 * and Published Grades (approved_at IS NOT NULL) per submission.
 */
export async function getStudentDashboardData(): Promise<{
  courses: StudentDashboardCourse[]
  assignments: StudentDashboardAssignment[]
}> {
  const db = createServerClient()

  // 1. Enrolled courses for this student — only published courses are visible
  const { data: enrollments } = await db
    .from('enrollments')
    .select('course_id, courses!inner(id, title, teacher_id, status)')
    .eq('student_id', STUDENT_ID)
    .eq('courses.status', 'published')

  if (!enrollments || enrollments.length === 0) return { courses: [], assignments: [] }

  const courseRows = enrollments.flatMap((e) => {
    const c = e.courses as unknown as { id: string; title: string; teacher_id: string } | null
    return c ? [c] : []
  })
  const courseIds = courseRows.map((c) => c.id)

  // 2. Teacher names
  const teacherIds = [...new Set(courseRows.map((c) => c.teacher_id))]
  const { data: teachers } = await db
    .from('users')
    .select('id, name')
    .in('id', teacherIds)
  const teacherById = Object.fromEntries((teachers ?? []).map((t) => [t.id, t.name as string]))

  const courses: StudentDashboardCourse[] = courseRows.map((c) => ({
    id: c.id,
    title: c.title,
    teacherName: teacherById[c.teacher_id] ?? 'Unknown',
  }))

  // 3. All assignments across enrolled courses
  const { data: assignments } = await db
    .from('assignments')
    .select('id, course_id, title, due_date, points_possible')
    .in('course_id', courseIds)

  if (!assignments || assignments.length === 0) return { courses, assignments: [] }

  const assignmentIds = assignments.map((a) => a.id)

  // 4. Student's submissions for those assignments
  const { data: submissions } = await db
    .from('submissions')
    .select('id, assignment_id, body, status, submitted_at')
    .eq('student_id', STUDENT_ID)
    .in('assignment_id', assignmentIds)

  const submissionByAssignment = Object.fromEntries(
    (submissions ?? []).map((s) => [
      s.assignment_id,
      s as { id: string; assignment_id: string; body: string; status: 'draft' | 'submitted' | 'graded'; submitted_at: string | null },
    ]),
  )

  // 5. Published grades for graded submissions (approved_at IS NOT NULL)
  const submissionIds = (submissions ?? []).map((s) => s.id)
  const gradeBySubmission: Record<string, { final_score: number; approved_at: string }> = {}
  if (submissionIds.length > 0) {
    const { data: grades } = await db
      .from('grades')
      .select('submission_id, final_score, approved_at')
      .in('submission_id', submissionIds)
      .not('approved_at', 'is', null)

    for (const g of grades ?? []) {
      gradeBySubmission[g.submission_id] = {
        final_score: g.final_score as number,
        approved_at: g.approved_at as string,
      }
    }
  }

  // 6. Derive per-assignment status using the pure function
  const result: StudentDashboardAssignment[] = assignments.map((a) => {
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

  return { courses, assignments: result }
}
