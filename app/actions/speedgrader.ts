'use server'

import { createServerClient } from '@/lib/supabase/server'
import { TEACHER_ID } from '@/lib/constants'
import { createPendingGradeFromAiSpeedGrader, type AiSpeedGraderDb } from '@/lib/ai-speedgrader'
import { canApprove, isGradeVisibleToStudent } from '@/lib/grade-lifecycle'
import { submissionAttachmentFromRow, type FileAttachment } from '@/lib/submission-attachment'
import type { Grade, StudentGradeView } from '@/lib/grade'
import type { CriterionScore } from '@/lib/grade-computation'

// ── Types ─────────────────────────────────────────────────────────────────────

export type SpeedGraderData = {
  submission: {
    id: string
    body: string
    status: 'draft' | 'submitted' | 'graded'
    studentName: string
    attachment: FileAttachment | null
  }
  assignment: {
    id: string
    title: string
    instructions: string
    points_possible: number
    rubric: { criteria: { description: string; points: number }[] } | null
  }
  course: {
    id: string
    title: string
  }
  navigation: {
    previousSubmissionId: string | null
    nextSubmissionId: string | null
  }
  grade: Grade | null
}

export type { Grade as GradeData }
export type PublishedGrade = StudentGradeView | null

// ── Server actions ────────────────────────────────────────────────────────────

/**
 * Loads all data needed to render the SpeedGrader page:
 * submission body, assignment details, rubric, and existing grade if any.
 */
export async function getSpeedGraderData(
  submissionId: string,
): Promise<SpeedGraderData | null> {
  const db = createServerClient()

  // file_url/name/type/size needed to populate attachment in the return value
  const { data: submission } = await db
    .from('submissions')
    .select('id, body, status, student_id, assignment_id, file_url, file_name, file_type, file_size')
    .eq('id', submissionId)
    .single()

  if (!submission) return null

  const [studentResult, assignmentResult, gradeResult] = await Promise.all([
    db.from('users').select('name').eq('id', submission.student_id).single(),
    db
      .from('assignments')
      .select('id, title, instructions, points_possible, course_id')
      .eq('id', submission.assignment_id)
      .single(),
    db
      .from('grades')
      .select(
        'id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by, ai_criterion_scores',
      )
      .eq('submission_id', submissionId)
      .single(),
  ])

  if (!assignmentResult.data) return null

  // Fetch rubric and course in parallel
  const [rubricResult, courseResult] = await Promise.all([
    db.from('rubrics').select('criteria').eq('assignment_id', submission.assignment_id).single(),
    db.from('courses').select('id, title').eq('id', assignmentResult.data.course_id).single(),
  ])
  const rubric = rubricResult.data
  const course = courseResult.data
  const { data: siblingSubmissions } = await db
    .from('submissions')
    .select('id, submitted_at')
    .eq('assignment_id', submission.assignment_id)
    .in('status', ['submitted', 'graded'])
    .order('submitted_at', { ascending: false })

  const siblingIds = (siblingSubmissions ?? []).map((row) => row.id)
  const currentIndex = siblingIds.indexOf(submission.id)
  const previousSubmissionId = currentIndex > 0 ? siblingIds[currentIndex - 1] : null
  const nextSubmissionId =
    currentIndex >= 0 && currentIndex < siblingIds.length - 1
      ? siblingIds[currentIndex + 1]
      : null

  return {
    submission: {
      id: submission.id,
      body: submission.body,
      status: submission.status as 'draft' | 'submitted' | 'graded',
      studentName: studentResult.data?.name ?? 'Unknown',
      attachment: submissionAttachmentFromRow(submission),
    },
    assignment: {
      id: assignmentResult.data.id,
      title: assignmentResult.data.title,
      instructions: assignmentResult.data.instructions,
      points_possible: assignmentResult.data.points_possible,
      rubric: rubric
        ? (rubric as { criteria: { description: string; points: number }[] })
        : null,
    },
    course: {
      id: course?.id ?? assignmentResult.data.course_id,
      title: course?.title ?? 'Course',
    },
    navigation: {
      previousSubmissionId,
      nextSubmissionId,
    },
    grade: gradeResult.data
      ? {
          id: gradeResult.data.id,
          submission_id: gradeResult.data.submission_id,
          ai_suggested_score: gradeResult.data.ai_suggested_score,
          ai_suggested_feedback: gradeResult.data.ai_suggested_feedback,
          final_score: gradeResult.data.final_score,
          final_feedback: gradeResult.data.final_feedback,
          approved_at: gradeResult.data.approved_at,
          approved_by: gradeResult.data.approved_by ?? null,
          ai_criterion_scores: (gradeResult.data.ai_criterion_scores as CriterionScore[] | null) ?? null,
        }
      : null,
  }
}

/**
 * Runs the AI SpeedGrader for a submission.
 * Creates a Pending Grade row (approved_at = null).
 * Returns an error string if a grade already exists (immutable after creation).
 */
export async function runSpeedGrader(
  submissionId: string,
): Promise<{ grade?: Grade; error?: string }> {
  const db = createServerClient() as unknown as AiSpeedGraderDb
  return createPendingGradeFromAiSpeedGrader(db, submissionId)
}

/**
 * Approves a grade: sets final_score, final_feedback, approved_by, and approved_at.
 * Idempotent — if the grade is already approved, returns the existing grade unchanged.
 * Also transitions the submission status to 'graded'.
 */
export async function approveGrade(
  gradeId: string,
  finalScore: number,
  finalFeedback: string,
): Promise<{ error?: string }> {
  const db = createServerClient()

  // Fetch current approved_at to enforce idempotency
  const { data: grade } = await db
    .from('grades')
    .select('id, approved_at, submission_id')
    .eq('id', gradeId)
    .single()

  if (!grade) return { error: 'Grade not found.' }

  if (!canApprove(grade.approved_at)) {
    // Already approved — idempotent success
    return {}
  }

  // Approve the grade
  const { error: gradeErr } = await db
    .from('grades')
    .update({
      final_score: finalScore,
      final_feedback: finalFeedback,
      approved_by: TEACHER_ID,
      approved_at: new Date().toISOString(),
    })
    .eq('id', gradeId)

  if (gradeErr) return { error: 'Failed to approve grade. Please try again.' }

  // Transition submission to graded
  await db
    .from('submissions')
    .update({ status: 'graded' })
    .eq('id', grade.submission_id)

  return {}
}

/**
 * Publishes a manually-entered grade.
 * If no grade row exists yet (AI never ran), creates one and immediately approves it.
 * If a grade row already exists (AI ran), updates it with the final values.
 */
export async function publishManualGrade(
  submissionId: string,
  score: number,
  feedback: string,
): Promise<{ grade?: Grade; error?: string }> {
  const db = createServerClient()

  const { data: existing } = await db
    .from('grades')
    .select('id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by, ai_criterion_scores')
    .eq('submission_id', submissionId)
    .single()

  if (existing) {
    const { data: updatedGrade, error } = await db
      .from('grades')
      .update({
        final_score: score,
        final_feedback: feedback,
        approved_by: TEACHER_ID,
        approved_at: new Date().toISOString(),
      })
      .eq('id', existing.id)
      .select('id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by, ai_criterion_scores')
      .single()

    if (error || !updatedGrade) return { error: 'Failed to save grade. Please try again.' }

    await db.from('submissions').update({ status: 'graded' }).eq('id', submissionId)

    return {
      grade: {
        id: updatedGrade.id,
        submission_id: updatedGrade.submission_id,
        ai_suggested_score: updatedGrade.ai_suggested_score,
        ai_suggested_feedback: updatedGrade.ai_suggested_feedback,
        final_score: updatedGrade.final_score,
        final_feedback: updatedGrade.final_feedback,
        approved_at: updatedGrade.approved_at,
        approved_by: updatedGrade.approved_by ?? null,
        ai_criterion_scores: (updatedGrade.ai_criterion_scores as CriterionScore[] | null) ?? null,
      },
    }
  }

  const { data: newGrade, error: insertErr } = await db
    .from('grades')
    .insert({
      submission_id: submissionId,
      ai_suggested_score: score,
      ai_suggested_feedback: feedback,
      final_score: score,
      final_feedback: feedback,
      approved_by: TEACHER_ID,
      approved_at: new Date().toISOString(),
    })
    .select('id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by')
    .single()

  if (insertErr || !newGrade) return { error: 'Failed to save grade. Please try again.' }

  await db.from('submissions').update({ status: 'graded' }).eq('id', submissionId)

  return {
    grade: {
      id: newGrade.id,
      submission_id: newGrade.submission_id,
      ai_suggested_score: newGrade.ai_suggested_score,
      ai_suggested_feedback: newGrade.ai_suggested_feedback,
      final_score: newGrade.final_score,
      final_feedback: newGrade.final_feedback,
      approved_at: newGrade.approved_at,
      approved_by: newGrade.approved_by ?? null,
      ai_criterion_scores: null,
    },
  }
}

/**
 * Restores the previous in-session grade snapshot after an AI suggestion
 * overwrote the persisted grade row.
 */
export async function restoreGradeSnapshot(
  snapshot: Grade,
): Promise<{ grade?: Grade; error?: string }> {
  const db = createServerClient()

  const { data: restoredGrade, error } = await db
    .from('grades')
    .update({
      ai_suggested_score: snapshot.ai_suggested_score,
      ai_suggested_feedback: snapshot.ai_suggested_feedback,
      final_score: snapshot.final_score,
      final_feedback: snapshot.final_feedback,
      approved_by: snapshot.approved_by,
      approved_at: snapshot.approved_at,
      ai_criterion_scores: snapshot.ai_criterion_scores,
    })
    .eq('id', snapshot.id)
    .select('id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by, ai_criterion_scores')
    .single()

  if (error || !restoredGrade) return { error: 'Failed to restore previous grade. Please try again.' }

  await db
    .from('submissions')
    .update({ status: snapshot.approved_at ? 'graded' : 'submitted' })
    .eq('id', snapshot.submission_id)

  return {
    grade: {
      id: restoredGrade.id,
      submission_id: restoredGrade.submission_id,
      ai_suggested_score: restoredGrade.ai_suggested_score,
      ai_suggested_feedback: restoredGrade.ai_suggested_feedback,
      final_score: restoredGrade.final_score,
      final_feedback: restoredGrade.final_feedback,
      approved_at: restoredGrade.approved_at,
      approved_by: restoredGrade.approved_by ?? null,
      ai_criterion_scores: (restoredGrade.ai_criterion_scores as CriterionScore[] | null) ?? null,
    },
  }
}

/**
 * Updates an already-approved grade with new score and feedback.
 * Use this for post-publish edits. Unlike approveGrade (which is idempotent),
 * this explicitly overwrites final_score, final_feedback, and approved_at.
 */
export async function updateApprovedGrade(
  gradeId: string,
  finalScore: number,
  finalFeedback: string,
): Promise<{ error?: string }> {
  const db = createServerClient()

  const { data: grade } = await db
    .from('grades')
    .select('id, submission_id')
    .eq('id', gradeId)
    .single()

  if (!grade) return { error: 'Grade not found.' }

  const { error: gradeErr } = await db
    .from('grades')
    .update({
      final_score: finalScore,
      final_feedback: finalFeedback,
      approved_by: TEACHER_ID,
      approved_at: new Date().toISOString(),
    })
    .eq('id', gradeId)

  if (gradeErr) return { error: 'Failed to update grade. Please try again.' }

  // Ensure submission stays graded
  await db
    .from('submissions')
    .update({ status: 'graded' })
    .eq('id', grade.submission_id)

  return {}
}

/**
 * Returns the published grade for a submission if it has been teacher-approved.
 * Applies the approved_at IS NOT NULL filter per ADR-0003 — unapproved grades
 * are never exposed to students.
 */
export async function getPublishedGradeForSubmission(
  submissionId: string,
): Promise<StudentGradeView | null> {
  const db = createServerClient()

  const { data } = await db
    .from('grades')
    .select('final_score, final_feedback, approved_at')
    .eq('submission_id', submissionId)
    .not('approved_at', 'is', null)
    .single()

  if (!data || !isGradeVisibleToStudent(data.approved_at)) return null

  return {
    final_score: data.final_score!,
    final_feedback: data.final_feedback!,
  }
}
