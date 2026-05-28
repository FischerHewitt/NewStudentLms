'use server'

import { createServerClient } from '@/lib/supabase/server'
import { explodeCoursePreview } from '@/lib/course-generator'
import { TEACHER_ID, STUDENT_ID } from '@/lib/constants'
import type { CoursePreview } from '@/lib/schemas/course'

/**
 * Called after streaming completes (B-lite step).
 * Creates a Course row with generation_preview for tab-close recovery.
 * If an unsaved draft already exists for this teacher, updates it instead.
 */
export async function saveCoursePreview(
  syllabus: string,
  preview: CoursePreview,
): Promise<{ courseId: string }> {
  const db = createServerClient()

  // Check for existing unsaved draft (has generation_preview, no modules yet)
  const { data: existing } = await db
    .from('courses')
    .select('id')
    .eq('teacher_id', TEACHER_ID)
    .not('generation_preview', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (existing) {
    await db
      .from('courses')
      .update({ raw_syllabus: syllabus, generation_preview: preview })
      .eq('id', existing.id)
    return { courseId: existing.id }
  }

  const { data, error } = await db
    .from('courses')
    .insert({
      title: preview.title,
      teacher_id: TEACHER_ID,
      raw_syllabus: syllabus,
      generation_preview: preview,
    })
    .select('id')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to save preview')
  return { courseId: data.id }
}

/**
 * Called when teacher clicks Save after reviewing/editing.
 * Explodes generation_preview into normalized rows, enrolls the demo student,
 * then clears generation_preview so the draft is no longer recoverable.
 * See docs/adr/0002-enrollment-entity-in-mvp.md
 */
export async function saveCourseToDB(
  courseId: string,
  preview: CoursePreview,
): Promise<{ courseId: string }> {
  const db = createServerClient()

  // Update the course title (may have been edited by teacher)
  await db
    .from('courses')
    .update({ title: preview.title, generation_preview: null })
    .eq('id', courseId)

  const { modules, assignments, rubrics } = explodeCoursePreview(preview)

  // Insert modules and capture their DB-assigned IDs
  const { data: moduleRows, error: modErr } = await db
    .from('modules')
    .insert(modules.map((m) => ({ ...m, course_id: courseId })))
    .select('id, order')

  if (modErr || !moduleRows) throw new Error(modErr?.message ?? 'Failed to insert modules')

  // Sort returned rows by order to align with the original index
  const moduleIdByIndex = moduleRows
    .slice()
    .sort((a, b) => a.order - b.order)
    .map((r) => r.id)

  // Insert assignments, resolving moduleIndex → real module_id
  const { data: assignmentRows, error: assErr } = await db
    .from('assignments')
    .insert(
      assignments.map(({ moduleIndex, ...a }) => ({
        ...a,
        module_id: moduleIdByIndex[moduleIndex],
        course_id: courseId,
      })),
    )
    .select('id')

  if (assErr || !assignmentRows)
    throw new Error(assErr?.message ?? 'Failed to insert assignments')

  // Insert rubrics, resolving assignmentIndex → real assignment_id
  if (rubrics.length > 0) {
    const { error: rubErr } = await db.from('rubrics').insert(
      rubrics.map(({ assignmentIndex, ...r }) => ({
        ...r,
        assignment_id: assignmentRows[assignmentIndex].id,
      })),
    )
    if (rubErr) throw new Error(rubErr.message)
  }

  // Auto-enroll the seeded student (ADR-0002)
  await db
    .from('enrollments')
    .insert({ course_id: courseId, student_id: STUDENT_ID })
    .throwOnError()

  return { courseId }
}

/**
 * Fetches the latest unsaved draft course for the demo teacher.
 * Returns null if no draft exists (no course with generation_preview).
 * Used for tab-close recovery on the generate page.
 */
export async function getCourseDraft(): Promise<{
  courseId: string
  preview: CoursePreview
  syllabus: string
} | null> {
  const db = createServerClient()

  const { data } = await db
    .from('courses')
    .select('id, raw_syllabus, generation_preview')
    .eq('teacher_id', TEACHER_ID)
    .not('generation_preview', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data?.generation_preview) return null

  return {
    courseId: data.id,
    preview: data.generation_preview as CoursePreview,
    syllabus: data.raw_syllabus,
  }
}

/**
 * Returns the most recent saved course for the demo teacher.
 * "Saved" means generation_preview has been cleared (null).
 */
export async function getLatestCourse(): Promise<{
  courseId: string
  title: string
} | null> {
  const db = createServerClient()

  const { data } = await db
    .from('courses')
    .select('id, title')
    .eq('teacher_id', TEACHER_ID)
    .is('generation_preview', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null
  return { courseId: data.id, title: data.title }
}

/**
 * Returns the course the demo student is enrolled in, if any.
 */
export async function getStudentCourse(): Promise<{
  courseId: string
  title: string
} | null> {
  const db = createServerClient()

  const { data } = await db
    .from('enrollments')
    .select('course_id, courses(id, title)')
    .eq('student_id', STUDENT_ID)
    .order('enrolled_at', { ascending: false })
    .limit(1)
    .single()

  if (!data) return null
  const course = Array.isArray(data.courses) ? data.courses[0] : data.courses
  if (!course) return null
  return { courseId: course.id, title: course.title }
}
