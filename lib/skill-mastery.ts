// Pure skill-mastery computation functions — no Next.js or Supabase dependencies.

export type SkillRating = {
  name: string
  rating: 'strong' | 'needs-practice' | 'insufficient-data'
}

export type CriterionScore = {
  description: string
  points_possible: number
  points_awarded: number
}

export type CriterionAggregate = {
  earned: number
  possible: number
  count: number
}

/**
 * Aggregates raw ai_criterion_scores JSONB records across multiple graded
 * submissions for a course into a per-criterion performance summary.
 *
 * Criterion descriptions are the grouping key (case-insensitive, trimmed).
 * Repeated rubrics across assignments are merged so scores accumulate correctly.
 */
export function aggregateCriterionPerformance(
  criterionScores: CriterionScore[][],
): Map<string, CriterionAggregate> {
  const agg = new Map<string, CriterionAggregate>()

  for (const submissionScores of criterionScores) {
    for (const score of submissionScores) {
      const key = score.description.trim().toLowerCase()
      const existing = agg.get(key)
      if (existing) {
        existing.earned += score.points_awarded
        existing.possible += score.points_possible
        existing.count += 1
      } else {
        agg.set(key, {
          earned: score.points_awarded,
          possible: score.points_possible,
          count: 1,
        })
      }
    }
  }

  return agg
}

export type RubricCriterion = {
  description: string
  points: number
}

export type SkillPromptInput = {
  criteria: Array<{ description: string; pointsPossible: number }>
  performance: Array<{
    description: string
    earnedPct: number | null
    gradedCount: number
  }>
}

/**
 * Assembles the structured input passed to the AI for skill name extraction.
 *
 * Each distinct rubric criterion is paired with the student's aggregate performance
 * (earned %, graded count). Criteria with no submission data get earnedPct: null
 * so the AI can emit 'insufficient-data'.
 */
export function buildSkillPromptInput(
  rubricCriteria: RubricCriterion[],
  aggregated: Map<string, CriterionAggregate>,
): SkillPromptInput {
  const criteria = rubricCriteria.map((c) => ({
    description: c.description,
    pointsPossible: c.points,
  }))

  const performance = rubricCriteria.map((c) => {
    const key = c.description.trim().toLowerCase()
    const agg = aggregated.get(key)
    const earnedPct =
      agg && agg.possible > 0 ? Math.round((agg.earned / agg.possible) * 100) : null
    return {
      description: c.description,
      earnedPct,
      gradedCount: agg?.count ?? 0,
    }
  })

  return { criteria, performance }
}
