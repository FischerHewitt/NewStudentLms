'use server'

import { createServerClient } from '@/lib/supabase/server'
import { TEACHER_ID } from '@/lib/constants'
import { parseEnrollmentEmails } from '@/lib/enrollment'
import { parseCsvEnrollment } from '@/lib/csv-enrollment'

async function assertCourseOwnership(db: ReturnType<typeof createServerClient>, courseId: string): Promise<void> {
  const { data } = await db.from('courses').select('id').eq('id', courseId).eq('teacher_id', TEACHER_ID).maybeSingle()
  if (!data) throw new Error('Not authorized to manage enrollment for this course')
}

export type CsvEnrollResult = {
  added: number
  alreadyEnrolled: number
  skippedInvalid: string[]
}

export type EnrolledStudent = {
  id: string
  email: string
  name: string
  status: 'pending' | 'active'
  enrolledAt: string
}

export async function getEnrolledStudents(courseId: string): Promise<EnrolledStudent[]> {
  const db = createServerClient()
  const { data } = await db
    .from('enrollments')
    .select('enrolled_at, users!inner(id, email, name, status)')
    .eq('course_id', courseId)
    .order('enrolled_at')
  return (data ?? []).flatMap((row) => {
    const u = Array.isArray(row.users) ? row.users[0] : row.users
    if (!u) return []
    return [{
      id: u.id,
      email: u.email,
      name: u.name,
      status: u.status as 'pending' | 'active',
      enrolledAt: row.enrolled_at,
    }]
  })
}

/**
 * Enrolls students by email. Creates pending User rows for new emails.
 * Always responds with success — never reveals if an email pre-existed.
 * Returns count of new enrollments added.
 */
export async function enrollStudentsByEmail(
  courseId: string,
  rawInput: string,
): Promise<{ added: number }> {
  const emails = parseEnrollmentEmails(rawInput)
  if (emails.length === 0) return { added: 0 }

  const db = createServerClient()
  await assertCourseOwnership(db, courseId)
  let added = 0

  for (const email of emails) {
    // Find or create the user — always respond success (never leak existence)
    const { data: existing } = await db
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle()

    let userId: string
    if (existing) {
      userId = existing.id
    } else {
      const { data: created, error } = await db
        .from('users')
        .insert({ email, name: email, role: 'student', status: 'pending' })
        .select('id')
        .single()
      if (error || !created) continue
      userId = created.id
    }

    // Upsert enrollment — idempotent
    const { error: enrollError } = await db
      .from('enrollments')
      .upsert({ course_id: courseId, student_id: userId }, { onConflict: 'course_id,student_id', ignoreDuplicates: true })

    if (!enrollError) added++
  }

  return { added }
}

/**
 * Enrolls students from a CSV file (text content).
 * Returns a summary of added / already-enrolled / invalid-row counts.
 */
export async function enrollStudentsByCSV(
  courseId: string,
  csvText: string,
): Promise<CsvEnrollResult> {
  const { valid, invalid } = parseCsvEnrollment(csvText)

  // Get existing enrollments to count already-enrolled
  const db = createServerClient()
  const { data: existing } = await db
    .from('enrollments')
    .select('users!inner(email)')
    .eq('course_id', courseId)
  const existingEmails = new Set(
    (existing ?? []).flatMap((row) => {
      const u = Array.isArray(row.users) ? row.users[0] : row.users
      return u ? [(u as { email: string }).email.toLowerCase()] : []
    }),
  )

  let added = 0
  let alreadyEnrolled = 0

  for (const email of valid) {
    if (existingEmails.has(email)) {
      alreadyEnrolled++
      continue
    }
    const { added: n } = await enrollStudentsByEmail(courseId, email)
    added += n
  }

  return { added, alreadyEnrolled, skippedInvalid: invalid }
}

export async function removeEnrollment(courseId: string, studentId: string): Promise<void> {
  const db = createServerClient()
  await assertCourseOwnership(db, courseId)
  await db.from('enrollments').delete().eq('course_id', courseId).eq('student_id', studentId).throwOnError()
}
