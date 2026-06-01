import { describe, it, expect } from 'vitest'
import { needsAiGrading, buildPendingGrade } from '@/lib/grade-computation'

describe('needsAiGrading', () => {
  it('returns false for empty body with no file', () => {
    expect(needsAiGrading(null)).toBe(false)
  })

  it('returns false for whitespace-only body', () => {
    expect(needsAiGrading('   ')).toBe(false)
  })

  it('returns false when body is empty but a file is attached', () => {
    expect(needsAiGrading('')).toBe(false)
  })

  it('returns true when body has actual content', () => {
    expect(needsAiGrading('I want to develop data analysis skills.')).toBe(true)
  })
})

describe('buildPendingGrade', () => {
  it('short-circuit path: score=0 and empty-submission feedback when aiResult is null and no file', () => {
    const draft = buildPendingGrade(
      { body: '', file_url: null },
      { points_possible: 100 },
      null,
    )

    expect(draft.ai_suggested_score).toBe(0)
    expect(draft.final_feedback).not.toMatch(/file/i)
  })

  it('short-circuit path: score=0 and file-specific feedback when aiResult is null and file is present', () => {
    const draft = buildPendingGrade(
      { body: '', file_url: 'https://example.com/essay.pdf' },
      { points_possible: 100 },
      null,
    )

    expect(draft.ai_suggested_score).toBe(0)
    expect(draft.final_feedback).toMatch(/file/i)
    expect(draft.ai_suggested_feedback).toMatch(/file/i)
  })

  it('AI path: sums criterion points_awarded', () => {
    const draft = buildPendingGrade(
      { body: 'A real response', file_url: null },
      { points_possible: 100 },
      {
        criterion_scores: [
          { description: 'Argument', points_possible: 60, points_awarded: 50, evidence: 'Clear.', anomaly_flag: null },
          { description: 'Evidence', points_possible: 40, points_awarded: 30, evidence: 'Good.', anomaly_flag: null },
        ],
        feedback_draft: 'Well done.',
      },
    )

    expect(draft.ai_suggested_score).toBe(80)
  })

  it('AI path: clamps total to points_possible when criterion sum exceeds it', () => {
    const draft = buildPendingGrade(
      { body: 'Great work', file_url: null },
      { points_possible: 100 },
      {
        criterion_scores: [
          { description: 'Argument', points_possible: 60, points_awarded: 80, evidence: 'Inflated.', anomaly_flag: null },
          { description: 'Evidence', points_possible: 40, points_awarded: 40, evidence: 'Full.', anomaly_flag: null },
        ],
        feedback_draft: 'Too high.',
      },
    )

    expect(draft.ai_suggested_score).toBe(100)
  })

  it('AI path: floors negative points_awarded at 0', () => {
    const draft = buildPendingGrade(
      { body: 'Something', file_url: null },
      { points_possible: 50 },
      {
        criterion_scores: [
          { description: 'Quality', points_possible: 50, points_awarded: -10, evidence: 'Penalty.', anomaly_flag: null },
        ],
        feedback_draft: 'Poor.',
      },
    )

    expect(draft.ai_suggested_score).toBe(0)
  })

  it('AI path: formats per-criterion rationale in ai_suggested_feedback', () => {
    const draft = buildPendingGrade(
      { body: 'My essay', file_url: null },
      { points_possible: 100 },
      {
        criterion_scores: [
          { description: 'Argument', points_possible: 60, points_awarded: 45, evidence: 'Strong claim.', anomaly_flag: null },
          { description: 'Evidence', points_possible: 40, points_awarded: 30, evidence: 'Some support.', anomaly_flag: null },
        ],
        feedback_draft: 'Good start.',
      },
    )

    expect(draft.ai_suggested_feedback).toContain('Argument (45/60): Strong claim.')
    expect(draft.ai_suggested_feedback).toContain('Evidence (30/40): Some support.')
  })

  it('AI path: copies feedback_draft to final_feedback', () => {
    const draft = buildPendingGrade(
      { body: 'My essay', file_url: null },
      { points_possible: 100 },
      {
        criterion_scores: [
          { description: 'Quality', points_possible: 100, points_awarded: 75, evidence: 'Fine.', anomaly_flag: null },
        ],
        feedback_draft: 'Nice work overall.',
      },
    )

    expect(draft.final_feedback).toBe('Nice work overall.')
  })

  it('AI path: preserves structured criterion scores including anomaly_flag on ai_criterion_scores', () => {
    const draft = buildPendingGrade(
      { body: 'My essay', file_url: null },
      { points_possible: 100 },
      {
        criterion_scores: [
          {
            description: 'Argument',
            points_possible: 60,
            points_awarded: 60,
            evidence: 'Strong claim.',
            anomaly_flag: 'Student used a method not yet covered in the course — teacher may want to verify understanding.',
          },
          {
            description: 'Evidence',
            points_possible: 40,
            points_awarded: 30,
            evidence: 'Some support.',
            anomaly_flag: null,
          },
        ],
        feedback_draft: 'Good work.',
      },
    )

    expect(draft.ai_criterion_scores).toHaveLength(2)
    expect(draft.ai_criterion_scores![0].anomaly_flag).toBe(
      'Student used a method not yet covered in the course — teacher may want to verify understanding.',
    )
    expect(draft.ai_criterion_scores![1].anomaly_flag).toBeNull()
    expect(draft.ai_criterion_scores![0].points_awarded).toBe(60)
    expect(draft.ai_criterion_scores![1].evidence).toBe('Some support.')
  })

  it('short-circuit path: ai_criterion_scores is null when aiResult is null', () => {
    const draft = buildPendingGrade(
      { body: '', file_url: null },
      { points_possible: 100 },
      null,
    )

    expect(draft.ai_criterion_scores).toBeNull()
  })
})
