'use server'

import { createServerClient } from '@/lib/supabase/server'
import { gradebookCellState } from '@/lib/gradebook'
import type { GradebookCellState } from '@/lib/gradebook'

export type GradebookCell = {
  assignmentId: string
  submissionId: string | null
  gradeId: string | null
  state: GradebookCellState
  /**
   * The score to display in the cell:
   * - `ai_suggested`: ai_suggested_score (teacher-only)
   * - `final`: final_score
   * - all others: null
   */
  score: number | null
}

export type StudentRow = {
  studentId: string
  studentName: string
  cells: GradebookCell[]
}

export type AssignmentCol = {
  id: string
  title: string
  points_possible: number
  moduleTitle: string
}

export type GradebookData = {
  courseTitle: string
  courseId: string
  students: StudentRow[]
  assignments: AssignmentCol[]
}

/**
 * Fetches all data needed to render the gradebook for a course.
 * Rows are driven by Enrollments — enrolled students appear even without submissions.
 */
export async function getGradebookData(
  courseId: string,
): Promise<GradebookData | null> {
  const db = createServerClient()

  const { data: course } = await db
    .from('courses')
    .select('id, title')
    .eq('id', courseId)
    .single()

  if (!course) return null

  // Enrolled students + all modules + all assignments (in parallel)
  const [enrollmentsResult, modulesResult, assignmentsResult] =
    await Promise.all([
      db
        .from('enrollments')
        .select('student_id')
        .eq('course_id', courseId),
      db
        .from('modules')
        .select('id, title, order')
        .eq('course_id', courseId)
        .order('order'),
      db
        .from('assignments')
        .select('id, title, points_possible, module_id, created_at')
        .eq('course_id', courseId),
    ])

  const enrollments = enrollmentsResult.data ?? []
  const modules = modulesResult.data ?? []
  const assignments = assignmentsResult.data ?? []

  if (enrollments.length === 0 || assignments.length === 0) {
    return {
      courseTitle: course.title,
      courseId: course.id,
      students: [],
      assignments: [],
    }
  }

  // Resolve student names
  const studentIds = enrollments.map((e) => e.student_id)
  const { data: users } = await db
    .from('users')
    .select('id, name')
    .in('id', studentIds)

  const nameMap = Object.fromEntries(
    (users ?? []).map((u) => [u.id, u.name]),
  )

  // Order assignments: module.order ASC, then assignment.created_at ASC
  const moduleOrderMap = Object.fromEntries(modules.map((m) => [m.id, m.order]))
  const moduleTitleMap = Object.fromEntries(modules.map((m) => [m.id, m.title]))

  const orderedAssignments = [...assignments].sort((a, b) => {
    const modDiff =
      (moduleOrderMap[a.module_id] ?? 0) - (moduleOrderMap[b.module_id] ?? 0)
    if (modDiff !== 0) return modDiff
    return (
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    )
  })

  const assignmentCols: AssignmentCol[] = orderedAssignments.map((a) => ({
    id: a.id,
    title: a.title,
    points_possible: a.points_possible,
    moduleTitle: moduleTitleMap[a.module_id] ?? '',
  }))

  // All submissions for this course from enrolled students
  const { data: submissions } = await db
    .from('submissions')
    .select('id, assignment_id, student_id')
    .in(
      'assignment_id',
      orderedAssignments.map((a) => a.id),
    )
    .in('student_id', studentIds)

  // All grades for those submissions
  const submissionIds = (submissions ?? []).map((s) => s.id)
  const { data: grades } =
    submissionIds.length > 0
      ? await db
          .from('grades')
          .select(
            'id, submission_id, ai_suggested_score, final_score, approved_at',
          )
          .in('submission_id', submissionIds)
      : { data: [] }

  // Build lookup maps
  type SubEntry = { id: string }
  const subMap = new Map<string, SubEntry>() // key: `${studentId}:${assignmentId}`
  for (const sub of submissions ?? []) {
    subMap.set(`${sub.student_id}:${sub.assignment_id}`, { id: sub.id })
  }

  type GradeEntry = {
    id: string
    aiScore: number
    finalScore: number | null
    approvedAt: string | null
  }
  const gradeMap = new Map<string, GradeEntry>() // key: submissionId
  for (const g of grades ?? []) {
    gradeMap.set(g.submission_id, {
      id: g.id,
      aiScore: g.ai_suggested_score,
      finalScore: g.final_score,
      approvedAt: g.approved_at,
    })
  }

  // Build rows
  const studentRows: StudentRow[] = enrollments.map((e) => {
    const cells: GradebookCell[] = orderedAssignments.map((a) => {
      const sub = subMap.get(`${e.student_id}:${a.id}`)
      const grade = sub ? gradeMap.get(sub.id) : undefined

      const state = gradebookCellState({
        hasSubmission: !!sub,
        hasGrade: !!grade,
        approvedAt: grade?.approvedAt ?? null,
      })

      const score =
        grade && state === 'final'
          ? grade.finalScore
          : grade && state === 'ai_suggested'
            ? grade.aiScore
            : null

      return {
        assignmentId: a.id,
        submissionId: sub?.id ?? null,
        gradeId: grade?.id ?? null,
        state,
        score,
      }
    })

    return {
      studentId: e.student_id,
      studentName: nameMap[e.student_id] ?? 'Unknown',
      cells,
    }
  })

  return {
    courseTitle: course.title,
    courseId: course.id,
    students: studentRows,
    assignments: assignmentCols,
  }
}
