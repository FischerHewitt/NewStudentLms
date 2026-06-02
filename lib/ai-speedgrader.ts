import { generateObject } from 'ai'
import { z } from 'zod'
import { getDefaultAiModel } from '@/lib/ai-model'
import { needsAiGrading, buildPendingGrade, type PendingGradeDraft, type CriterionScore } from '@/lib/grade-computation'
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
        anomaly_flag: z
          .string()
          .nullable()
          .describe(
            'Set to a one-sentence teacher note when the student used a valid but unexpectedly advanced method not yet covered in the course. Null otherwise.',
          ),
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

type UpdateBuilder = {
  eq: (column: string, value: unknown) => {
    select: (columns?: string) => {
      single: () => QueryResult<Record<string, unknown>>
    }
  } & { then?: never }
}

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
    update: (data: Record<string, unknown>) => UpdateBuilder
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
    ai_criterion_scores: (row.ai_criterion_scores as CriterionScore[] | null) ?? null,
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
- A very short or minimal submission should score very low.

Method vs. outcome:
- If a rubric criterion names a specific method, technique, structure, or tool (e.g. "uses the power rule", "applies MLA citation", "implements recursion"), that method is REQUIRED. The student must demonstrate it to earn credit — a correct answer via a different method does not satisfy the criterion.
- If a rubric criterion does not name a specific method (e.g. "correctly differentiates the function", "supports the argument with evidence"), award full credit for ANY approach that is demonstrably correct. Do not penalise a student for using a valid alternative method.
- "Demonstrably correct" means the work is clearly right, not merely plausible or vaguely gesturing at the concept.

Anomaly flag:
- If a student uses a valid but unexpectedly advanced method — one that appears beyond the scope of the course based on the assignment context — award full credit for the criterion but set anomaly_flag to a one-sentence note for the teacher (e.g. "Student used L'Hôpital's rule, which is not covered until later in the course — teacher may want to verify understanding.").
- Do NOT dock points for advanced methods. The flag is informational only.
- Set anomaly_flag to null for all other criteria.`,
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
      ai_criterion_scores: draft.ai_criterion_scores ?? null,
    })
    .select(
      'id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by, ai_criterion_scores',
    )
    .single()

  if (error || !data) return { error: 'Failed to save grade. Please try again.' }

  return { grade: toGrade(data) }
}

async function updatePendingGrade(
  db: AiSpeedGraderDb,
  existingId: string,
  submissionId: string,
  draft: PendingGradeDraft,
): Promise<{ grade?: Grade; error?: string }> {
  // Overwrite AI suggestion fields only — reset approval so the teacher
  // must re-publish after a fresh AI run.
  const { data, error } = await db
    .from('grades')
    .update({
      ai_suggested_score: draft.ai_suggested_score,
      ai_suggested_feedback: draft.ai_suggested_feedback,
      final_feedback: draft.final_feedback,
      ai_criterion_scores: draft.ai_criterion_scores ?? null,
      // Clear any prior approval so the teacher reviews the new suggestion
      final_score: null,
      approved_by: null,
      approved_at: null,
    })
    .eq('id', existingId)
    .select('id, submission_id, ai_suggested_score, ai_suggested_feedback, final_score, final_feedback, approved_at, approved_by, ai_criterion_scores')
    .single()

  if (error || !data) return { error: 'Failed to save grade. Please try again.' }

  // If the submission was previously graded, revert it to submitted so the
  // teacher sees it as pending review again.
  await db
    .from('submissions')
    .update({ status: 'submitted' })
    .eq('id', submissionId)

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

  // If a grade already exists (AI or manual), re-run AI and overwrite it
  // rather than blocking. The caller holds a snapshot for undo.

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

  if (existingGrade) {
    return updatePendingGrade(db, existingGrade.id as string, submissionId, draft)
  }

  return insertPendingGrade(db, submissionId, draft)
}
