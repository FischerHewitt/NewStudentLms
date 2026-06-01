'use server'

import { createServerClient } from '@/lib/supabase/server'
import { STUDENT_ID } from '@/lib/constants'
import { canSubmit } from '@/lib/submission'
import {
  submissionAttachmentFromRow,
  submissionAttachmentToFields,
  type FileAttachment,
} from '@/lib/submission-attachment'

export type { FileAttachment } from '@/lib/submission-attachment'

export type AssignmentWithDetails = {
  id: string
  title: string
  instructions: string
  due_date: string | null
  points_possible: number
  rubric: { criteria: { description: string; points: number }[] } | null
  resources: import('@/lib/resources').Resource[]
}

export type StudentSubmissionData = {
  id: string | null
  body: string
  status: 'draft' | 'submitted' | 'graded' | null
  submitted_at: string | null
  attachment: FileAttachment | null
}

export type SubmissionData = {
  id: string
  student_id: string
  studentName: string
  body: string
  status: 'draft' | 'submitted' | 'graded'
  submitted_at: string | null
  attachment: FileAttachment | null
  finalScore: number | null
  grade: {
    id: string
    ai_suggested_score: number
    ai_suggested_feedback: string
    final_score: number | null
    final_feedback: string | null
    approved_at: string | null
  } | null
}

/**
 * Fetches assignment details and its rubric criteria.
 * Returns null if the assignment doesn't exist.
 */
export async function getAssignmentWithDetails(
  assignmentId: string,
): Promise<AssignmentWithDetails | null> {
  const db = createServerClient()

  const [assignmentResult, rubricResult, resourcesResult] = await Promise.all([
    db
      .from('assignments')
      .select('id, title, instructions, due_date, points_possible')
      .eq('id', assignmentId)
      .single(),
    db.from('rubrics').select('criteria').eq('assignment_id', assignmentId).single(),
    db.from('resources').select('id, assignment_id, title, type, url, created_at').eq('assignment_id', assignmentId).order('created_at'),
  ])

  if (!assignmentResult.data) return null

  return {
    ...assignmentResult.data,
    rubric: rubricResult.data
      ? (rubricResult.data as { criteria: { description: string; points: number }[] })
      : null,
    resources: (resourcesResult.data ?? []) as import('@/lib/resources').Resource[],
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
    .select('id, body, status, submitted_at, file_url, file_name, file_type, file_size')
    .eq('assignment_id', assignmentId)
    .eq('student_id', STUDENT_ID)
    .single()

  if (!data) return { id: null, body: '', status: null, submitted_at: null, attachment: null }

  return {
    id: data.id,
    body: data.body,
    status: data.status as 'draft' | 'submitted' | 'graded',
    submitted_at: data.submitted_at,
    attachment: submissionAttachmentFromRow(data),
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
    .select('id, student_id, body, status, submitted_at, file_url, file_name, file_type, file_size')
    .eq('assignment_id', assignmentId)
    .in('status', ['submitted', 'graded'])
    .order('submitted_at', { ascending: false })

  if (!submissions || submissions.length === 0) return []

  // Resolve student names
  const studentIds = [...new Set(submissions.map((s) => s.student_id))]
  const submissionIds = submissions.map((s) => s.id)
  const [usersResult, gradesResult] = await Promise.all([
    db.from('users').select('id, name').in('id', studentIds),
    db
      .from('grades')
      .select(
        'id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at',
      )
      .in('submission_id', submissionIds),
  ])

  const nameMap = Object.fromEntries((usersResult.data ?? []).map((u) => [u.id, u.name]))
  const gradeMap = Object.fromEntries(
    (gradesResult.data ?? []).map((grade) => [grade.submission_id, grade]),
  )

  return submissions.map((s) => ({
    grade: gradeMap[s.id]
      ? {
          id: gradeMap[s.id].id,
          ai_suggested_score: gradeMap[s.id].ai_suggested_score,
          ai_suggested_feedback: gradeMap[s.id].ai_suggested_feedback,
          final_score: gradeMap[s.id].final_score,
          final_feedback: gradeMap[s.id].final_feedback,
          approved_at: gradeMap[s.id].approved_at,
        }
      : null,
    finalScore:
      gradeMap[s.id]?.approved_at && gradeMap[s.id]?.final_score != null
        ? gradeMap[s.id].final_score
        : null,
    id: s.id,
    student_id: s.student_id,
    studentName: nameMap[s.student_id] ?? 'Unknown',
    body: s.body,
    status: s.status as 'draft' | 'submitted' | 'graded',
    submitted_at: s.submitted_at,
    attachment: submissionAttachmentFromRow(s),
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
  attachment?: FileAttachment,
): Promise<{ error?: string }> {
  if (!body.trim() && !attachment) {
    return { error: 'Please write a response or upload a file.' }
  }

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

  const fileFields = submissionAttachmentToFields(attachment)

  if (existing) {
    const { error } = await db
      .from('submissions')
      .update({
        body,
        status: 'submitted',
        submitted_at: new Date().toISOString(),
        ...fileFields,
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
      ...fileFields,
    })

    if (error) return { error: 'Failed to submit. Please try again.' }
  }

  return {}
}

/**
 * Marks an assignment as turned in without a text submission — for paper
 * handouts, in-class work, or any assignment where the student completed work
 * outside the LMS. Creates an empty submission with status 'submitted' so the
 * teacher can record a manual grade via SpeedGrader.
 */
export type NewAssignmentInput = {
  courseId: string
  moduleId: string
  title: string
  instructions: string
  dueDate: string | null
  pointsPossible: number
  criteria: { description: string; points: number }[]
}

export async function createAssignment(input: NewAssignmentInput): Promise<{ id: string }> {
  const db = createServerClient()

  const { data: assignment, error: aErr } = await db
    .from('assignments')
    .insert({
      course_id: input.courseId,
      module_id: input.moduleId,
      title: input.title,
      instructions: input.instructions,
      due_date: input.dueDate || null,
      points_possible: input.pointsPossible,
    })
    .select('id')
    .single()

  if (aErr || !assignment) throw new Error(aErr?.message ?? 'Failed to create assignment')

  if (input.criteria.length > 0) {
    await db
      .from('rubrics')
      .insert({ assignment_id: assignment.id, criteria: input.criteria })
      .throwOnError()
  }

  return { id: assignment.id }
}

export async function publishAssignment(assignmentId: string): Promise<void> {
  const db = createServerClient()

  const { data: assignment } = await db
    .from('assignments')
    .select('instructions, due_date, points_possible, rubrics(criteria)')
    .eq('id', assignmentId)
    .single()

  if (!assignment) throw new Error('Assignment not found')

  const rubric = Array.isArray(assignment.rubrics) ? assignment.rubrics[0] : assignment.rubrics

  await db
    .from('assignment_versions')
    .insert({
      assignment_id: assignmentId,
      instructions: assignment.instructions,
      due_date: assignment.due_date,
      points_possible: assignment.points_possible,
      rubric_snapshot: rubric?.criteria ?? null,
    })
    .throwOnError()
}

export async function checkOffAssignment(
  assignmentId: string,
): Promise<{ error?: string }> {
  const db = createServerClient()

  const { data: existing } = await db
    .from('submissions')
    .select('id, status')
    .eq('assignment_id', assignmentId)
    .eq('student_id', STUDENT_ID)
    .single()

  if (existing?.status === 'submitted' || existing?.status === 'graded') {
    return {}
  }

  if (existing) {
    const { error } = await db
      .from('submissions')
      .update({ body: '', status: 'submitted', submitted_at: new Date().toISOString() })
      .eq('id', existing.id)
    if (error) return { error: 'Failed to check off. Please try again.' }
  } else {
    const { error } = await db.from('submissions').insert({
      assignment_id: assignmentId,
      student_id: STUDENT_ID,
      body: '',
      status: 'submitted',
      submitted_at: new Date().toISOString(),
    })
    if (error) return { error: 'Failed to check off. Please try again.' }
  }

  return {}
}
