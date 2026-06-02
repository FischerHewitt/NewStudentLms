/**
 * Playwright global setup — resets DB state before every test run.
 *
 * Flow A: deletes Alex Rivera's submission + grade for BIO Connect HW 1 so the
 *         grading loop is repeatable without a manual DB reset.
 *
 * Flow B: deletes any course created by the generation test (title ILIKE
 *         'E2E Auto Test%') so the home-page course list starts clean.
 *         Cascade delete handles modules, assignments, rubrics, enrollments.
 *
 * Flow C: deletes Sam Nguyen's submission + grade for BIO Connect HW 1 (if any),
 *         then inserts a fresh empty submission so the empty-body short-circuit
 *         path is ready to test.
 *
 * Reads NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY from .env.local.
 * In CI, set those as environment secrets instead.
 */

import { config } from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import path from 'path'

config({ path: path.resolve(__dirname, '../.env.local') })

const TEACHER_ID           = '00000000-0000-0000-0000-000000000001'
const ASSIGNMENT_ID        = '00000000-0000-0000-0003-000000000015'  // BIO Connect HW 1
const ALEX_RIVERA_ID       = '00000000-0000-0000-0000-000000000002'  // Flow A student
const SAM_NGUYEN_ID        = '00000000-0000-0000-0000-000000000006'  // Flow C student

export default async function globalSetup() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error(
      'global-setup: NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY missing. ' +
      'Add them to .env.local or set them as CI environment variables.'
    )
  }

  const db = createClient(url, key)

  // ── Flow A: reset Alex Rivera's submission for BIO Connect HW 1 ──────────────

  await deleteSubmissionsForStudent(db, ASSIGNMENT_ID, ALEX_RIVERA_ID, 'Alex Rivera (Flow A)')

  // ── Flow B: delete any E2E test courses from previous runs ───────────────────

  const { data: e2eCourses, error: courseQueryErr } = await db
    .from('courses')
    .select('id')
    .eq('teacher_id', TEACHER_ID)
    .ilike('title', 'E2E Auto Test%')

  if (courseQueryErr) throw new Error(`global-setup: failed to query e2e courses — ${courseQueryErr.message}`)

  const e2eCourseIds = (e2eCourses ?? []).map((c: { id: string }) => c.id)

  if (e2eCourseIds.length > 0) {
    // ON DELETE CASCADE handles modules → assignments → rubrics / submissions / enrollments
    const { error } = await db.from('courses').delete().in('id', e2eCourseIds)
    if (error) throw new Error(`global-setup: failed to delete e2e courses — ${error.message}`)
  }

  // ── Demo Loop: delete any MATH 143 courses from previous demo runs ───────────
  // publish_course_structure cascades to modules/assignments/rubrics/enrollments/submissions

  const { data: math143Courses, error: math143QueryErr } = await db
    .from('courses')
    .select('id')
    .eq('teacher_id', TEACHER_ID)
    .ilike('title', 'MATH 143%')

  if (math143QueryErr) throw new Error(`global-setup: failed to query MATH 143 courses — ${math143QueryErr.message}`)

  const math143CourseIds = (math143Courses ?? []).map((c: { id: string }) => c.id)

  if (math143CourseIds.length > 0) {
    const { error } = await db.from('courses').delete().in('id', math143CourseIds)
    if (error) throw new Error(`global-setup: failed to delete MATH 143 courses — ${error.message}`)
  }

  // ── Flow C: reset Sam Nguyen's submission, then seed a fresh empty one ───────

  await deleteSubmissionsForStudent(db, ASSIGNMENT_ID, SAM_NGUYEN_ID, 'Sam Nguyen (Flow C)')

  const { error: insertErr } = await db.from('submissions').insert({
    assignment_id: ASSIGNMENT_ID,
    student_id:    SAM_NGUYEN_ID,
    body:          '',
    submitted_at:  new Date().toISOString(),
    status:        'submitted',
  })

  if (insertErr) throw new Error(`global-setup: failed to seed Sam's empty submission — ${insertErr.message}`)
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function deleteSubmissionsForStudent(
  db: any,
  assignmentId: string,
  studentId: string,
  label: string,
) {
  const { data: subs, error: queryErr } = await db
    .from('submissions')
    .select('id')
    .eq('assignment_id', assignmentId)
    .eq('student_id', studentId)

  if (queryErr) throw new Error(`global-setup: failed to query submissions for ${label} — ${queryErr.message}`)

  const subIds = (subs ?? []).map((s: { id: string }) => s.id)
  if (subIds.length === 0) return

  // grades.submission_id has ON DELETE CASCADE, but delete explicitly for clarity
  const { error: gradeErr } = await db.from('grades').delete().in('submission_id', subIds)
  if (gradeErr) throw new Error(`global-setup: failed to delete grades for ${label} — ${gradeErr.message}`)

  const { error: subErr } = await db.from('submissions').delete().in('id', subIds)
  if (subErr) throw new Error(`global-setup: failed to delete submissions for ${label} — ${subErr.message}`)
}
