import { describe, it, expect } from 'vitest'
import { needsAiGrading, buildPendingGrade } from '@/lib/grade-computation'

describe('needsAiGrading', () => {
  it('returns false for empty body with no file', () => {
    expect(needsAiGrading(null, null)).toBe(false)
  })

  it('returns false for whitespace-only body', () => {
    expect(needsAiGrading('   ', null)).toBe(false)
  })

  it('returns false when body is empty but a file is attached', () => {
    expect(needsAiGrading('', 'https://example.com/essay.pdf')).toBe(false)
  })

  it('returns true when body has actual content', () => {
    expect(needsAiGrading('I want to develop data analysis skills.', null)).toBe(true)
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
          { description: 'Argument', points_possible: 60, points_awarded: 50, evidence: 'Clear.' },
          { description: 'Evidence', points_possible: 40, points_awarded: 30, evidence: 'Good.' },
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
          { description: 'Argument', points_possible: 60, points_awarded: 80, evidence: 'Inflated.' },
          { description: 'Evidence', points_possible: 40, points_awarded: 40, evidence: 'Full.' },
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
          { description: 'Quality', points_possible: 50, points_awarded: -10, evidence: 'Penalty.' },
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
          { description: 'Argument', points_possible: 60, points_awarded: 45, evidence: 'Strong claim.' },
          { description: 'Evidence', points_possible: 40, points_awarded: 30, evidence: 'Some support.' },
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
          { description: 'Quality', points_possible: 100, points_awarded: 75, evidence: 'Fine.' },
        ],
        feedback_draft: 'Nice work overall.',
      },
    )

    expect(draft.final_feedback).toBe('Nice work overall.')
  })
})
