import type { RubricCriterion } from '@/lib/schemas/course'

export function validateRubricGenerateInput(title: string, instructions: string): boolean {
  return title.trim().length > 0 && instructions.trim().length > 0
}

export function parseRubricResponse(raw: unknown): RubricCriterion[] {
  if (!raw || typeof raw !== 'object') return []
  const obj = raw as Record<string, unknown>
  if (!Array.isArray(obj.criteria)) return []
  return obj.criteria
    .filter(
      (c): c is RubricCriterion =>
        c &&
        typeof c === 'object' &&
        typeof (c as RubricCriterion).description === 'string' &&
        (c as RubricCriterion).description.trim().length > 0 &&
        typeof (c as RubricCriterion).points === 'number' &&
        (c as RubricCriterion).points > 0,
    )
    .map((c) => ({ description: c.description, points: c.points }))
}
