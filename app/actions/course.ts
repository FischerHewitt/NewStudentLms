'use server'

import { createServerClient } from '@/lib/supabase/server'
import { TEACHER_ID, STUDENT_ID } from '@/lib/constants'
import type { CoursePreview } from '@/lib/schemas/course'
import { publishCourseStructure } from '@/lib/course-structure-persistence'
import type { CourseMetadataInput } from '@/lib/course-metadata'

export type { CourseMetadataInput }

/**
 * Called after streaming completes (B-lite step).
 * Creates a Course row with generation_preview for tab-close recovery.
 * If an unsaved draft already exists for this teacher, updates it instead.
 */
export async function saveCoursePreview(
  syllabus: string | null,
  preview: CoursePreview,
  metadata?: CourseMetadataInput,
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

  const metaFields = metadata
    ? {
        title: metadata.title || preview.title,
        term: metadata.term ?? null,
        section: metadata.section ?? null,
        start_date: metadata.start_date ?? null,
        end_date: metadata.end_date ?? null,
      }
    : {}

  if (existing) {
    await db
      .from('courses')
      .update({ raw_syllabus: syllabus, generation_preview: preview, ...metaFields })
      .eq('id', existing.id)
    return { courseId: existing.id }
  }

  const { data, error } = await db
    .from('courses')
    .insert({
      title: metadata?.title || preview.title,
      teacher_id: TEACHER_ID,
      raw_syllabus: syllabus,
      generation_preview: preview,
      ...metaFields,
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
  metadata?: CourseMetadataInput,
): Promise<{ courseId: string }> {
  const db = createServerClient()

  if (metadata) {
    await db.from('courses').update({
      title: metadata.title || preview.title,
      term: metadata.term ?? null,
      section: metadata.section ?? null,
      start_date: metadata.start_date ?? null,
      end_date: metadata.end_date ?? null,
    }).eq('id', courseId)
  }

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
  metadata: CourseMetadataInput
} | null> {
  const db = createServerClient()

  const { data } = await db
    .from('courses')
    .select('id, title, raw_syllabus, generation_preview, term, section, start_date, end_date')
    .eq('teacher_id', TEACHER_ID)
    .not('generation_preview', 'is', null)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!data?.generation_preview) return null

  return {
    courseId: data.id,
    preview: data.generation_preview as CoursePreview,
    syllabus: data.raw_syllabus ?? '',
    metadata: {
      title: data.title,
      term: data.term ?? undefined,
      section: data.section ?? undefined,
      start_date: data.start_date ?? undefined,
      end_date: data.end_date ?? undefined,
    },
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
  { courseId: string; title: string; term: string | null; section: string | null; status: string; createdAt: string }[]
> {
  const db = createServerClient()

  const { data } = await db
    .from('courses')
    .select('id, title, term, section, status, created_at')
    .eq('teacher_id', TEACHER_ID)
    .is('generation_preview', null)
    .order('created_at', { ascending: false })

  if (!data) return []
  return data.map((r) => ({
    courseId: r.id,
    title: r.title,
    term: r.term ?? null,
    section: r.section ?? null,
    status: r.status ?? 'draft',
    createdAt: r.created_at,
  }))
}

/**
 * Deletes a course and all its related data (cascades to modules, assignments, enrollments, etc.).
 */
export async function deleteCourse(courseId: string): Promise<void> {
  const db = createServerClient()
  await db.from('courses').delete().eq('id', courseId).throwOnError()
}

/**
 * Publishes a course, making it visible to enrolled students.
 */
export async function publishCourse(courseId: string): Promise<void> {
  const db = createServerClient()
  // Scoped to the calling teacher — prevents publishing another teacher's course
  await db.from('courses').update({ status: 'published' })
    .eq('id', courseId).eq('teacher_id', TEACHER_ID).throwOnError()
}

/**
 * Unpublishes a course, hiding it from students while preserving all content.
 */
export async function unpublishCourse(courseId: string): Promise<void> {
  const db = createServerClient()
  await db.from('courses').update({ status: 'draft' })
    .eq('id', courseId).eq('teacher_id', TEACHER_ID).throwOnError()
}

/**
 * Returns the course the demo student is enrolled in, if any.
 * Only returns published courses — draft courses are invisible to students.
 */
export async function getStudentCourse(): Promise<{
  courseId: string
  title: string
} | null> {
  const db = createServerClient()

  const { data } = await db
    .from('enrollments')
    .select('course_id, courses!inner(id, title, status)')
    .eq('student_id', STUDENT_ID)
    .eq('courses.status', 'published')
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
 * Only returns published courses — draft courses are invisible to students.
 */
export async function getAllStudentCourses(): Promise<
  { courseId: string; title: string }[]
> {
  const db = createServerClient()

  const { data } = await db
    .from('enrollments')
    .select('enrolled_at, courses!inner(id, title, status)')
    .eq('student_id', STUDENT_ID)
    .eq('courses.status', 'published')
    .order('enrolled_at', { ascending: false })

  if (!data) return []
  return data.flatMap((row) => {
    const course = Array.isArray(row.courses) ? row.courses[0] : row.courses
    if (!course) return []
    return [{ courseId: course.id, title: course.title }]
  })
}
