'use server'

import { generateObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { TEACHER_ID } from '@/lib/constants'
import { canApprove, isGradeVisibleToStudent } from '@/lib/speedgrader'

// ── AI output schema ──────────────────────────────────────────────────────────

const gradeOutputSchema = z.object({
  suggested_score: z
    .number()
    .int()
    .min(0)
    .describe('Numeric score based on the rubric'),
  rationale: z
    .string()
    .describe('Brief teacher-facing rationale explaining the score'),
  feedback_draft: z
    .string()
    .describe('Student-facing feedback that the teacher can edit before sending'),
})

// ── Types ─────────────────────────────────────────────────────────────────────

export type SpeedGraderData = {
  submission: {
    id: string
    body: string
    status: 'draft' | 'submitted' | 'graded'
    studentName: string
  }
  assignment: {
    id: string
    title: string
    instructions: string
    points_possible: number
    rubric: { criteria: { description: string; points: number }[] } | null
  }
  grade: GradeData | null
}

export type GradeData = {
  id: string
  ai_suggested_score: number
  ai_suggested_feedback: string
  final_score: number | null
  final_feedback: string | null
  approved_at: string | null
}

export type PublishedGrade = {
  final_score: number
  final_feedback: string
} | null

// ── Server actions ────────────────────────────────────────────────────────────

/**
 * Loads all data needed to render the SpeedGrader page:
 * submission body, assignment details, rubric, and existing grade if any.
 */
export async function getSpeedGraderData(
  submissionId: string,
): Promise<SpeedGraderData | null> {
  const db = createServerClient()

  // Submission + student name
  const { data: submission } = await db
    .from('submissions')
    .select('id, body, status, student_id, assignment_id')
    .eq('id', submissionId)
    .single()

  if (!submission) return null

  const [studentResult, assignmentResult, gradeResult] = await Promise.all([
    db.from('users').select('name').eq('id', submission.student_id).single(),
    db
      .from('assignments')
      .select('id, title, instructions, points_possible')
      .eq('id', submission.assignment_id)
      .single(),
    db
      .from('grades')
      .select(
        'id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at',
      )
      .eq('submission_id', submissionId)
      .single(),
  ])

  if (!assignmentResult.data) return null

  // Fetch rubric separately
  const { data: rubric } = await db
    .from('rubrics')
    .select('criteria')
    .eq('assignment_id', submission.assignment_id)
    .single()

  return {
    submission: {
      id: submission.id,
      body: submission.body,
      status: submission.status as 'draft' | 'submitted' | 'graded',
      studentName: studentResult.data?.name ?? 'Unknown',
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
    grade: gradeResult.data
      ? {
          id: gradeResult.data.id,
          ai_suggested_score: gradeResult.data.ai_suggested_score,
          ai_suggested_feedback: gradeResult.data.ai_suggested_feedback,
          final_score: gradeResult.data.final_score,
          final_feedback: gradeResult.data.final_feedback,
          approved_at: gradeResult.data.approved_at,
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
): Promise<{ grade?: GradeData; error?: string }> {
  const db = createServerClient()

  // Guard: don't overwrite an existing grade
  const { data: existingGrade } = await db
    .from('grades')
    .select('id')
    .eq('submission_id', submissionId)
    .single()

  if (existingGrade) {
    return { error: 'A grade already exists for this submission.' }
  }

  // Fetch submission + assignment + rubric
  const { data: submission } = await db
    .from('submissions')
    .select('body, assignment_id')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found.' }

  const [assignmentResult, rubricResult] = await Promise.all([
    db
      .from('assignments')
      .select('title, instructions, points_possible')
      .eq('id', submission.assignment_id)
      .single(),
    db
      .from('rubrics')
      .select('criteria')
      .eq('assignment_id', submission.assignment_id)
      .single(),
  ])

  if (!assignmentResult.data) return { error: 'Assignment not found.' }

  const { title, instructions, points_possible } = assignmentResult.data
  const criteria = rubricResult.data?.criteria ?? []

  const criteriaText =
    Array.isArray(criteria) && criteria.length > 0
      ? (criteria as { description: string; points: number }[])
          .map((c) => `- ${c.description} (${c.points} pts)`)
          .join('\n')
      : 'No rubric criteria specified.'

  // Call AI
  const { object: aiResult } = await generateObject({
    model: groq('llama-3.3-70b-versatile'),
    schema: gradeOutputSchema,
    system: `You are an expert, fair-minded teacher grading a student submission.
Score the submission strictly according to the rubric.
Keep feedback constructive, specific, and student-facing.
The suggested_score must be between 0 and ${points_possible}.`,
    prompt: `Assignment: ${title}

Instructions:
${instructions}

Rubric (${points_possible} pts total):
${criteriaText}

Student submission:
${submission.body}

Evaluate the submission and provide a score, rationale, and draft feedback.`,
  })

  // Clamp score to points_possible
  const clampedScore = Math.min(
    Math.max(0, aiResult.suggested_score),
    points_possible,
  )

  // Insert pending grade
  const { data: newGrade, error: insertErr } = await db
    .from('grades')
    .insert({
      submission_id: submissionId,
      ai_suggested_score: clampedScore,
      ai_suggested_feedback: aiResult.feedback_draft,
    })
    .select(
      'id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at',
    )
    .single()

  if (insertErr || !newGrade) {
    return { error: 'Failed to save grade. Please try again.' }
  }

  return {
    grade: {
      id: newGrade.id,
      ai_suggested_score: newGrade.ai_suggested_score,
      ai_suggested_feedback: newGrade.ai_suggested_feedback,
      final_score: newGrade.final_score,
      final_feedback: newGrade.final_feedback,
      approved_at: newGrade.approved_at,
    },
  }
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
 * Returns the published grade for a submission if it has been teacher-approved.
 * Applies the approved_at IS NOT NULL filter per ADR-0003 — unapproved grades
 * are never exposed to students.
 */
export async function getPublishedGradeForSubmission(
  submissionId: string,
): Promise<PublishedGrade> {
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
