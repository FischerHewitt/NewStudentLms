import { describe, expect, it } from 'vitest'
import {
  aggregateCriterionPerformance,
  buildSkillPromptInput,
  type CriterionScore,
  type RubricCriterion,
} from '../skill-mastery'

describe('aggregateCriterionPerformance', () => {
  it('returns an empty map for empty input', () => {
    expect(aggregateCriterionPerformance([])).toEqual(new Map())
  })

  it('aggregates a single submission correctly', () => {
    const scores: CriterionScore[][] = [
      [
        { description: 'Thesis clarity', points_possible: 10, points_awarded: 8 },
        { description: 'Evidence quality', points_possible: 15, points_awarded: 12 },
      ],
    ]
    const agg = aggregateCriterionPerformance(scores)
    expect(agg.get('thesis clarity')).toEqual({ earned: 8, possible: 10, count: 1 })
    expect(agg.get('evidence quality')).toEqual({ earned: 12, possible: 15, count: 1 })
  })

  it('merges the same criterion across multiple submissions', () => {
    const scores: CriterionScore[][] = [
      [{ description: 'Argument strength', points_possible: 20, points_awarded: 16 }],
      [{ description: 'Argument strength', points_possible: 20, points_awarded: 18 }],
      [{ description: 'Argument strength', points_possible: 20, points_awarded: 14 }],
    ]
    const agg = aggregateCriterionPerformance(scores)
    expect(agg.get('argument strength')).toEqual({ earned: 48, possible: 60, count: 3 })
  })

  it('normalises description case and whitespace when grouping', () => {
    const scores: CriterionScore[][] = [
      [{ description: '  Grammar & Spelling  ', points_possible: 10, points_awarded: 9 }],
      [{ description: 'grammar & spelling', points_possible: 10, points_awarded: 7 }],
    ]
    const agg = aggregateCriterionPerformance(scores)
    expect(agg.size).toBe(1)
    expect(agg.get('grammar & spelling')).toEqual({ earned: 16, possible: 20, count: 2 })
  })

  it('keeps distinct criteria separate', () => {
    const scores: CriterionScore[][] = [
      [
        { description: 'Introduction', points_possible: 5, points_awarded: 5 },
        { description: 'Conclusion', points_possible: 5, points_awarded: 3 },
      ],
    ]
    const agg = aggregateCriterionPerformance(scores)
    expect(agg.size).toBe(2)
    expect(agg.get('introduction')?.earned).toBe(5)
    expect(agg.get('conclusion')?.earned).toBe(3)
  })
})

describe('buildSkillPromptInput', () => {
  const rubric: RubricCriterion[] = [
    { description: 'Thesis clarity', points: 10 },
    { description: 'Evidence quality', points: 15 },
    { description: 'Grammar & spelling', points: 5 },
  ]

  it('returns all criteria in the criteria list', () => {
    const input = buildSkillPromptInput(rubric, new Map())
    expect(input.criteria).toHaveLength(3)
    expect(input.criteria[0]).toEqual({ description: 'Thesis clarity', pointsPossible: 10 })
  })

  it('emits earnedPct null for criteria with no data (insufficient-data path)', () => {
    const input = buildSkillPromptInput(rubric, new Map())
    expect(input.performance.every((p) => p.earnedPct === null)).toBe(true)
    expect(input.performance.every((p) => p.gradedCount === 0)).toBe(true)
  })

  it('computes earnedPct correctly for all-strong performance', () => {
    const agg = new Map([
      ['thesis clarity', { earned: 95, possible: 100, count: 2 }],
      ['evidence quality', { earned: 90, possible: 100, count: 2 }],
      ['grammar & spelling', { earned: 48, possible: 50, count: 2 }],
    ])
    const input = buildSkillPromptInput(rubric, agg)
    expect(input.performance[0].earnedPct).toBe(95)
    expect(input.performance[0].gradedCount).toBe(2)
    expect(input.performance[1].earnedPct).toBe(90)
  })

  it('computes earnedPct correctly for mixed performance (needs-practice path)', () => {
    const agg = new Map([['thesis clarity', { earned: 60, possible: 100, count: 3 }]])
    const input = buildSkillPromptInput(rubric, agg)
    const thesis = input.performance.find((p) => p.description === 'Thesis clarity')!
    expect(thesis.earnedPct).toBe(60)
    const evidence = input.performance.find((p) => p.description === 'Evidence quality')!
    expect(evidence.earnedPct).toBeNull()
  })

  it('returns earnedPct null when possible points is zero (no divide-by-zero)', () => {
    const agg = new Map([['thesis clarity', { earned: 0, possible: 0, count: 1 }]])
    const input = buildSkillPromptInput(rubric, agg)
    const thesis = input.performance.find((p) => p.description === 'Thesis clarity')!
    expect(thesis.earnedPct).toBeNull()
  })
})
