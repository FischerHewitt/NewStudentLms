import { describe, expect, it } from 'vitest'
import {
  buildAiSuggestedPendingGrade,
  buildEmptySubmissionPendingGrade,
} from '@/lib/ai-speedgrader'

describe('buildEmptySubmissionPendingGrade', () => {
  it('returns null when the Submission has body text', () => {
    expect(buildEmptySubmissionPendingGrade('A real response', null)).toBeNull()
  })

  it('builds a Pending Grade draft for an empty Submission', () => {
    const draft = buildEmptySubmissionPendingGrade('', null)

    expect(draft?.ai_suggested_score).toBe(0)
    expect(draft?.ai_suggested_feedback).toContain('Groq not called')
    expect(draft?.final_feedback).not.toMatch(/file/i)
  })

  it('builds a file-specific Pending Grade draft for a file-only Submission', () => {
    const draft = buildEmptySubmissionPendingGrade('', 'https://example.com/file.pdf')

    expect(draft?.ai_suggested_score).toBe(0)
    expect(draft?.ai_suggested_feedback).toMatch(/file/i)
    expect(draft?.final_feedback).toMatch(/file/i)
  })
})

describe('buildAiSuggestedPendingGrade', () => {
  it('sums criterion scores and clamps the AI Suggested Grade', () => {
    const draft = buildAiSuggestedPendingGrade(
      {
        criterion_scores: [
          {
            description: 'Argument',
            points_possible: 50,
            points_awarded: 70,
            evidence: 'Strong claim.',
          },
          {
            description: 'Evidence',
            points_possible: 50,
            points_awarded: 40,
            evidence: 'Some support.',
          },
        ],
        feedback_draft: 'Good start.',
      },
      100,
    )

    expect(draft.ai_suggested_score).toBe(100)
    expect(draft.ai_suggested_feedback).toContain('Argument (70/50): Strong claim.')
    expect(draft.final_feedback).toBe('Good start.')
  })
})
