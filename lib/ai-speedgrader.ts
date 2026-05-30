import { generateObject } from 'ai'
import { z } from 'zod'
import { getDefaultAiModel } from '@/lib/ai-model'
import { hasAttachmentWithoutBody, isEmptySubmission } from '@/lib/speedgrader'

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

type PendingGradeDraft = {
  ai_suggested_score: number
  ai_suggested_feedback: string
  final_feedback: string
}

export type AiSpeedGraderGrade = {
  id: string
  ai_suggested_score: number
  ai_suggested_feedback: string
  final_score: number | null
  final_feedback: string | null
  approved_at: string | null
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

function toGrade(row: Record<string, unknown>): AiSpeedGraderGrade {
  return {
    id: row.id as string,
    ai_suggested_score: row.ai_suggested_score as number,
    ai_suggested_feedback: row.ai_suggested_feedback as string,
    final_score: (row.final_score as number | null) ?? null,
    final_feedback: (row.final_feedback as string | null) ?? null,
    approved_at: (row.approved_at as string | null) ?? null,
  }
}

export function buildEmptySubmissionPendingGrade(
  body: string | null,
  fileUrl: string | null,
): PendingGradeDraft | null {
  const submissionBody = body ?? ''
  if (!isEmptySubmission(submissionBody)) return null

  const isFileOnly = hasAttachmentWithoutBody(submissionBody, fileUrl)

  return {
    ai_suggested_score: 0,
    ai_suggested_feedback: isFileOnly
      ? 'Short-circuit: file attached but body empty - Groq not called.'
      : 'Short-circuit: empty submission - Groq not called.',
    final_feedback: isFileOnly
      ? 'This submission appears empty - a file was attached but no written response was provided. If you experienced a technical difficulty, please contact your instructor and resubmit.'
      : 'No submission content was provided. A score of 0 has been recorded.',
  }
}

export function buildAiSuggestedPendingGrade(
  aiResult: GradeOutput,
  pointsPossible: number,
): PendingGradeDraft {
  const rawTotal = aiResult.criterion_scores.reduce(
    (sum, criterion) => sum + Math.max(0, criterion.points_awarded),
    0,
  )

  return {
    ai_suggested_score: Math.min(rawTotal, pointsPossible),
    ai_suggested_feedback: aiResult.criterion_scores
      .map(
        (criterion) =>
          `${criterion.description} (${criterion.points_awarded}/${criterion.points_possible}): ${criterion.evidence}`,
      )
      .join('\n'),
    final_feedback: aiResult.feedback_draft,
  }
}

function criteriaText(criteria: RubricCriterion[]): string {
  if (criteria.length === 0) return 'No rubric criteria specified.'
  return criteria.map((criterion) => `- ${criterion.description} (${criterion.points} pts)`).join('\n')
}

async function buildAiGradeDraft(input: {
  assignment: AssignmentForSpeedGrader
  criteria: RubricCriterion[]
  submissionBody: string | null
}): Promise<PendingGradeDraft> {
  const submissionContent = input.submissionBody?.trim() || '(No text response.)'

  const { object: aiResult } = await generateObject({
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

  return buildAiSuggestedPendingGrade(aiResult, input.assignment.points_possible)
}

async function insertPendingGrade(
  db: AiSpeedGraderDb,
  submissionId: string,
  draft: PendingGradeDraft,
): Promise<{ grade?: AiSpeedGraderGrade; error?: string }> {
  const { data, error } = await db
    .from('grades')
    .insert({
      submission_id: submissionId,
      ai_suggested_score: draft.ai_suggested_score,
      ai_suggested_feedback: draft.ai_suggested_feedback,
      final_feedback: draft.final_feedback,
    })
    .select(
      'id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at',
    )
    .single()

  if (error || !data) return { error: 'Failed to save grade. Please try again.' }

  return { grade: toGrade(data) }
}

export async function createPendingGradeFromAiSpeedGrader(
  db: AiSpeedGraderDb,
  submissionId: string,
): Promise<{ grade?: AiSpeedGraderGrade; error?: string }> {
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

  const speedGraderSubmission = submission as SubmissionForSpeedGrader
  const emptyDraft = buildEmptySubmissionPendingGrade(
    speedGraderSubmission.body,
    speedGraderSubmission.file_url ?? null,
  )

  if (emptyDraft) {
    return insertPendingGrade(db, submissionId, emptyDraft)
  }

  const [assignmentResult, rubricResult] = await Promise.all([
    db
      .from('assignments')
      .select('title, instructions, points_possible')
      .eq('id', speedGraderSubmission.assignment_id)
      .single(),
    db
      .from('rubrics')
      .select('criteria')
      .eq('assignment_id', speedGraderSubmission.assignment_id)
      .single(),
  ])

  if (!assignmentResult.data) return { error: 'Assignment not found.' }

  const draft = await buildAiGradeDraft({
    assignment: assignmentResult.data as AssignmentForSpeedGrader,
    criteria: Array.isArray(rubricResult.data?.criteria)
      ? (rubricResult.data.criteria as RubricCriterion[])
      : [],
    submissionBody: speedGraderSubmission.body,
  })

  return insertPendingGrade(db, submissionId, draft)
}
