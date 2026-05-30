type CriterionScore = {
  description: string
  points_possible: number
  points_awarded: number
  evidence: string
}

type AiGradeResult = {
  criterion_scores: CriterionScore[]
  feedback_draft: string
}

export type PendingGradeDraft = {
  ai_suggested_score: number
  ai_suggested_feedback: string
  final_feedback: string
}

export function needsAiGrading(body: string | null, fileUrl?: string | null): boolean {
  return (body ?? '').trim() !== ''
}

export function buildPendingGrade(
  submission: { body: string | null; file_url?: string | null },
  assignment: { points_possible: number },
  aiResult: AiGradeResult | null,
): PendingGradeDraft {
  if (aiResult === null) {
    const isFileOnly = (submission.file_url ?? null) !== null
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

  const rawTotal = aiResult.criterion_scores.reduce(
    (sum, c) => sum + Math.max(0, c.points_awarded),
    0,
  )

  return {
    ai_suggested_score: Math.min(rawTotal, assignment.points_possible),
    ai_suggested_feedback: aiResult.criterion_scores
      .map((c) => `${c.description} (${c.points_awarded}/${c.points_possible}): ${c.evidence}`)
      .join('\n'),
    final_feedback: aiResult.feedback_draft,
  }
}
