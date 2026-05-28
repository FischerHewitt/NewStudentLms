'use server'

import { createServerClient } from '@/lib/supabase/server'
import { STUDENT_ID } from '@/lib/constants'
import { canSubmit } from '@/lib/submission'

export type AssignmentWithDetails = {
  id: string
  title: string
  instructions: string
  due_date: string | null
  points_possible: number
  rubric: { criteria: { description: string; points: number }[] } | null
}

export type StudentSubmissionData = {
  id: string | null
  body: string
  status: 'draft' | 'submitted' | 'graded' | null
  submitted_at: string | null
}

export type SubmissionData = {
  id: string
  student_id: string
  studentName: string
  body: string
  status: 'draft' | 'submitted' | 'graded'
  submitted_at: string | null
}

/**
 * Fetches assignment details and its rubric criteria.
 * Returns null if the assignment doesn't exist.
 */
export async function getAssignmentWithDetails(
  assignmentId: string,
): Promise<AssignmentWithDetails | null> {
  const db = createServerClient()

  const [assignmentResult, rubricResult] = await Promise.all([
    db
      .from('assignments')
      .select('id, title, instructions, due_date, points_possible')
      .eq('id', assignmentId)
      .single(),
    db.from('rubrics').select('criteria').eq('assignment_id', assignmentId).single(),
  ])

  if (!assignmentResult.data) return null

  return {
    ...assignmentResult.data,
    rubric: rubricResult.data
      ? (rubricResult.data as { criteria: { description: string; points: number }[] })
      : null,
  }
}

/**
 * Fetches the demo student's existing submission for an assignment.
 * Returns a null-ID record if no submission exists yet.
 */
export async function getStudentSubmission(
  assignmentId: string,
): Promise<StudentSubmissionData> {
  const db = createServerClient()

  const { data } = await db
    .from('submissions')
    .select('id, body, status, submitted_at')
    .eq('assignment_id', assignmentId)
    .eq('student_id', STUDENT_ID)
    .single()

  if (!data) return { id: null, body: '', status: null, submitted_at: null }

  return {
    id: data.id,
    body: data.body,
    status: data.status as 'draft' | 'submitted' | 'graded',
    submitted_at: data.submitted_at,
  }
}

/**
 * Fetches all submitted/graded submissions for an assignment.
 * Used by the teacher view to list received submissions.
 */
export async function getAllSubmissionsForAssignment(
  assignmentId: string,
): Promise<SubmissionData[]> {
  const db = createServerClient()

  const { data: submissions } = await db
    .from('submissions')
    .select('id, student_id, body, status, submitted_at')
    .eq('assignment_id', assignmentId)
    .in('status', ['submitted', 'graded'])
    .order('submitted_at', { ascending: false })

  if (!submissions || submissions.length === 0) return []

  // Resolve student names
  const studentIds = [...new Set(submissions.map((s) => s.student_id))]
  const { data: users } = await db
    .from('users')
    .select('id, name')
    .in('id', studentIds)

  const nameMap = Object.fromEntries((users ?? []).map((u) => [u.id, u.name]))

  return submissions.map((s) => ({
    id: s.id,
    student_id: s.student_id,
    studentName: nameMap[s.student_id] ?? 'Unknown',
    body: s.body,
    status: s.status as 'draft' | 'submitted' | 'graded',
    submitted_at: s.submitted_at,
  }))
}

/**
 * Submits an assignment for the demo student.
 *
 * Invariants enforced server-side:
 * - Body must be non-empty.
 * - Status must be null (no prior submission) or 'draft'. Submitted/graded
 *   submissions are immutably locked.
 */
export async function submitAssignment(
  assignmentId: string,
  body: string,
): Promise<{ error?: string }> {
  if (!body.trim()) return { error: 'Submission body cannot be empty.' }

  const db = createServerClient()

  // Check for existing submission
  const { data: existing } = await db
    .from('submissions')
    .select('id, status')
    .eq('assignment_id', assignmentId)
    .eq('student_id', STUDENT_ID)
    .single()

  const currentStatus = (existing?.status ?? null) as
    | 'draft'
    | 'submitted'
    | 'graded'
    | null

  if (!canSubmit(currentStatus)) {
    return {
      error:
        'This submission has already been submitted and cannot be modified.',
    }
  }

  if (existing) {
    const { error } = await db
      .from('submissions')
      .update({
        body,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
      })
      .eq('id', existing.id)

    if (error) return { error: 'Failed to submit. Please try again.' }
  } else {
    const { error } = await db.from('submissions').insert({
      assignment_id: assignmentId,
      student_id: STUDENT_ID,
      body,
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })

    if (error) return { error: 'Failed to submit. Please try again.' }
  }

  return {}
}
