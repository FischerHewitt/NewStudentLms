'use server'

import { createServerClient } from '@/lib/supabase/server'
import { TEACHER_ID, STUDENT_ID } from '@/lib/constants'
import type { CoursePreview } from '@/lib/schemas/course'
import { publishCourseStructure } from '@/lib/course-structure-persistence'

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
 * Publishes the reviewed Course structure transactionally: Modules,
 * Assignments, Rubrics, Enrollment, then clears generation_preview.
 * See docs/adr/0002-enrollment-entity-in-mvp.md
 */
export async function saveCourseToDB(
  courseId: string,
  preview: CoursePreview,
): Promise<{ courseId: string }> {
  const db = createServerClient()

  return publishCourseStructure(db, {
    courseId,
    teacherId: TEACHER_ID,
    studentId: STUDENT_ID,
    preview,
  })
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
 * Returns all saved courses for the demo teacher, newest first.
 */
export async function getAllCourses(): Promise<
  { courseId: string; title: string; createdAt: string }[]
> {
  const db = createServerClient()

  const { data } = await db
    .from('courses')
    .select('id, title, created_at')
    .eq('teacher_id', TEACHER_ID)
    .is('generation_preview', null)
    .order('created_at', { ascending: false })

  if (!data) return []
  return data.map((r) => ({ courseId: r.id, title: r.title, createdAt: r.created_at }))
}

/**
 * Deletes a course and all its related data (cascades to modules, assignments, enrollments, etc.).
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const db = createServerClient()
  await db.from('courses').delete().eq('id', courseId).throwOnError()
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

/**
 * Returns all courses the demo student is enrolled in, newest first.
 */
export async function getAllStudentCourses(): Promise<
  { courseId: string; title: string }[]
> {
  const db = createServerClient()

  const { data } = await db
    .from('enrollments')
    .select('enrolled_at, courses(id, title)')
    .eq('student_id', STUDENT_ID)
    .order('enrolled_at', { ascending: false })

  if (!data) return []
  return data.flatMap((row) => {
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    if (!course) return []
    return [{ courseId: course.id, title: course.title }]
  })
}
