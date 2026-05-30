import { generateObject } from 'ai'
import { z } from 'zod'
import { getDefaultAiModel } from '@/lib/ai-model'
import { needsAiGrading, buildPendingGrade, type PendingGradeDraft } from '@/lib/grade-computation'
import type { Grade } from '@/lib/grade'

const gradeOutputSchema = z.object({
  criterion_scores: z
    .array(
      z.object({
        description: z.string().describe('The rubric criterion (copy verbatim)'),
        points_possible: z.number().int().describe('Max points for this criterion'),
        points_awarded: z
          .number()
          .int()
          .min(0)
          .describe('Points awarded - 0 if not demonstrated, full only if clearly met'),
        evidence: z
          .string()
          .describe('One sentence: what in the submission earned or lost points'),
      }),
    )
    .describe('One entry per rubric criterion, in order'),
  feedback_draft: z
    .string()
    .describe('Student-facing feedback the teacher can edit before sending'),
})

type GradeOutput = z.infer<typeof gradeOutputSchema>

type RubricCriterion = {
  description: string
  points: number
}

type AssignmentForSpeedGrader = {
  title: string
  instructions: string
  points_possible: number
}

type SubmissionForSpeedGrader = {
  body: string | null
  assignment_id: string
  file_url?: string | null
}

type QueryResult<T> = PromiseLike<{ data: T | null; error?: unknown }>

export type AiSpeedGraderDb = {
  from: (table: string) => {
    select: (columns?: string) => {
      eq: (column: string, value: unknown) => {
        single: () => QueryResult<Record<string, unknown>>
      }
    }
    insert: (data: Record<string, unknown>) => {
      select: (columns?: string) => {
        single: () => QueryResult<Record<string, unknown>>
      }
    }
  }
}

function toGrade(row: Record<string, unknown>): Grade {
  return {
    id: row.id as string,
    submission_id: (row.submission_id as string | null) ?? '',
    ai_suggested_score: row.ai_suggested_score as number,
    ai_suggested_feedback: row.ai_suggested_feedback as string,
    final_score: (row.final_score as number | null) ?? null,
    final_feedback: (row.final_feedback as string | null) ?? null,
    approved_at: (row.approved_at as string | null) ?? null,
    approved_by: (row.approved_by as string | null) ?? null,
  }
}

function criteriaText(criteria: RubricCriterion[]): string {
  if (criteria.length === 0) return 'No rubric criteria specified.'
  return criteria.map((criterion) => `- ${criterion.description} (${criterion.points} pts)`).join('\n')
}

async function callGroqForGrade(input: {
  assignment: AssignmentForSpeedGrader
  criteria: RubricCriterion[]
  submissionBody: string | null
}): Promise<GradeOutput> {
  const submissionContent = input.submissionBody?.trim() || '(No text response.)'

  const { object } = await generateObject({
    model: getDefaultAiModel(),
    schema: gradeOutputSchema,
    system: `You are a rigorous but fair teacher grading a student submission.

Rules:
- Score ONLY what is explicitly and clearly demonstrated in the submission.
- Do NOT give benefit of the doubt. If it is not shown, it is not earned.
- Do NOT infer effort, intent, or unstated work.
- Award 0 for any criterion with no evidence in the submission.
- Award partial credit only when partial work is clearly visible.
- Award full credit only when the criterion is fully and clearly met.
- A very short or minimal submission should score very low.`,
    prompt: `Assignment: ${input.assignment.title}

Instructions:
${input.assignment.instructions}

Rubric - score each criterion independently (${input.assignment.points_possible} pts total):
${criteriaText(input.criteria)}

Student submission:
"""
${submissionContent}
"""

For each rubric criterion above, provide the criterion description, max points, points awarded (0 if not demonstrated), and one-sentence evidence note. Then write student-facing feedback.`,
  })

  return object
}

async function insertPendingGrade(
  db: AiSpeedGraderDb,
  submissionId: string,
  draft: PendingGradeDraft,
): Promise<{ grade?: Grade; error?: string }> {
  const { data, error } = await db
    .from('grades')
    .insert({
      submission_id: submissionId,
      ai_suggested_score: draft.ai_suggested_score,
      ai_suggested_feedback: draft.ai_suggested_feedback,
      final_feedback: draft.final_feedback,
    })
    .select(
      'id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by',
    )
    .single()

  if (error || !data) return { error: 'Failed to save grade. Please try again.' }

  return { grade: toGrade(data) }
}

export async function createPendingGradeFromAiSpeedGrader(
  db: AiSpeedGraderDb,
  submissionId: string,
): Promise<{ grade?: Grade; error?: string }> {
  const { data: existingGrade } = await db
    .from('grades')
    .select('id')
    .eq('submission_id', submissionId)
    .single()

  if (existingGrade) {
    return { error: 'A grade already exists for this submission.' }
  }

  const { data: submission } = await db
    .from('submissions')
    .select('body, assignment_id, file_url')
    .eq('id', submissionId)
    .single()

  if (!submission) return { error: 'Submission not found.' }

  const sub = submission as SubmissionForSpeedGrader

  let aiResult: GradeOutput | null = null
  let assignment: AssignmentForSpeedGrader = { title: '', instructions: '', points_possible: 0 }

  if (needsAiGrading(sub.body)) {
    const [assignmentResult, rubricResult] = await Promise.all([
      db
        .from('assignments')
        .select('title, instructions, points_possible')
        .eq('id', sub.assignment_id)
        .single(),
      db
        .from('rubrics')
        .select('criteria')
        .eq('assignment_id', sub.assignment_id)
        .single(),
    ])

    if (!assignmentResult.data) return { error: 'Assignment not found.' }

    assignment = assignmentResult.data as AssignmentForSpeedGrader
    aiResult = await callGroqForGrade({
      assignment,
      criteria: Array.isArray(rubricResult.data?.criteria)
        ? (rubricResult.data.criteria as RubricCriterion[])
        : [],
      submissionBody: sub.body,
    })
  }

  const draft = buildPendingGrade(
    { body: sub.body, file_url: sub.file_url },
    assignment,
    aiResult,
  )

  return insertPendingGrade(db, submissionId, draft)
}
