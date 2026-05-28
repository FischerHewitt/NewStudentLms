'use server'

import { createServerClient } from '@/lib/supabase/server'
import { STUDENT_ID } from '@/lib/constants'

export type CourseWithModules = {
  id: string
  title: string
  teacherName: string
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
    .select('id, title, teacher_id')
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
    teacherName: teacherResult.data?.name ?? 'Unknown',
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
