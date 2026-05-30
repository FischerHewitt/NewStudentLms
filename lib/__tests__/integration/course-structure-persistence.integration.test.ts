/**
 * Integration test for publishCourseStructure against the real Supabase DB.
 *
 * Regression test for: "Save failed" when saving a generated course.
 * Root cause: the publish_course_structure DB function was missing from the
 * remote project (migration 20260529000000 was never applied).
 *
 * Requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY env vars.
 * Excluded from the default `npm run test` suite (no env vars in CI).
 * Run explicitly with env vars loaded from .env.local.
 */

import { describe, it, expect, afterEach } from 'vitest'
import { createServerClient } from '@/lib/supabase/server'
import { publishCourseStructure } from '@/lib/course-structure-persistence'
import { TEACHER_ID, STUDENT_ID } from '@/lib/constants'
import type { CoursePreview } from '@/lib/schemas/course'

const TEST_PREVIEW: CoursePreview = {
  title: 'Integration Test Course',
  modules: [
    {
      title: 'Week 1: Introduction',
      week_number: 1,
      description: 'Getting started.',
      assignments: [
        {
          title: 'Intro Reflection',
          instructions: 'Write one paragraph.',
          due_date: '2026-09-01',
          points_possible: 10,
          rubric: {
            criteria: [{ description: 'Genuine attempt', points: 10 }],
          },
        },
      ],
    },
  ],
}

let testCourseId: string | null = null

afterEach(async () => {
  if (!testCourseId) return
  const db = createServerClient()
  await db.from('courses').delete().eq('id', testCourseId)
  testCourseId = null
})

describe('publishCourseStructure — real DB', () => {
  it('saves modules, assignments, rubrics, and enrollment for a new course', async () => {
    const db = createServerClient()

    // Create a draft course (simulates what saveCoursePreview does)
    const { data: course, error: createError } = await db
      .from('courses')
      .insert({
        title: TEST_PREVIEW.title,
        teacher_id: TEACHER_ID,
        raw_syllabus: 'test syllabus',
        generation_preview: TEST_PREVIEW,
      })
      .select('id')
      .single()

    expect(createError).toBeNull()
    testCourseId = course!.id

    // Exercise the function under test
    const result = await publishCourseStructure(db, {
      courseId: course!.id,
      teacherId: TEACHER_ID,
      studentId: STUDENT_ID,
      preview: TEST_PREVIEW,
    })

    expect(result.courseId).toBe(course!.id)

    // Modules were inserted
    const { data: modules } = await db
      .from('modules')
      .select('id, title, week_number')
      .eq('course_id', course!.id)

    expect(modules).toHaveLength(1)
    expect(modules![0].title).toBe('Week 1: Introduction')
    expect(modules![0].week_number).toBe(1)

    // Assignments were inserted
    const { data: assignments } = await db
      .from('assignments')
      .select('id, title, points_possible')
      .eq('course_id', course!.id)

    expect(assignments).toHaveLength(1)
    expect(assignments![0].title).toBe('Intro Reflection')
    expect(assignments![0].points_possible).toBe(10)

    // Rubric was inserted
    const { data: rubrics } = await db
      .from('rubrics')
      .select('criteria')
      .eq('assignment_id', assignments![0].id)

    expect(rubrics).toHaveLength(1)
    expect((rubrics![0].criteria as Array<{points: number}>)[0].points).toBe(10)

    // Enrollment was created
    const { data: enrollment } = await db
      .from('enrollments')
      .select('student_id')
      .eq('course_id', course!.id)
      .eq('student_id', STUDENT_ID)
      .single()

    expect(enrollment).not.toBeNull()

    // generation_preview was cleared
    const { data: saved } = await db
      .from('courses')
      .select('generation_preview')
      .eq('id', course!.id)
      .single()

    expect(saved!.generation_preview).toBeNull()
  })

  it('is idempotent when called again on an already-published course (tab-close recovery path)', async () => {
    // Once a course is published (generation_preview cleared, modules + enrollment exist),
    // a second call returns the course ID instead of throwing. This is the tab-close
    // recovery path: if the teacher reloads the page after a successful save, the
    // publish_course_structure function recognises the already-published state and exits cleanly.
    const db = createServerClient()

    const { data: course } = await db
      .from('courses')
      .insert({
        title: TEST_PREVIEW.title,
        teacher_id: TEACHER_ID,
        raw_syllabus: 'test syllabus',
        generation_preview: TEST_PREVIEW,
      })
      .select('id')
      .single()

    testCourseId = course!.id

    // First save — publishes the structure and clears generation_preview
    await publishCourseStructure(db, {
      courseId: course!.id,
      teacherId: TEACHER_ID,
      studentId: STUDENT_ID,
      preview: TEST_PREVIEW,
    })

    // Second save — should return the same courseId without error (idempotent)
    const second = await publishCourseStructure(db, {
      courseId: course!.id,
      teacherId: TEACHER_ID,
      studentId: STUDENT_ID,
      preview: TEST_PREVIEW,
    })

    expect(second.courseId).toBe(course!.id)

    // No duplicate modules were inserted
    const { data: modules } = await db
      .from('modules')
      .select('id')
      .eq('course_id', course!.id)

    expect(modules).toHaveLength(1)
  })
})
