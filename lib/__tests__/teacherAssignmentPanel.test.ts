import { describe, expect, it } from 'vitest'
import {
  displaySubmissionStatus,
  gradeFormFromGrade,
  getTeacherAssignmentPanelState,
  markSubmissionGraded,
} from '@/lib/teacherAssignmentPanel'

const submissions = [
  { id: 'sub-1', studentName: 'Alex Rivera', status: 'submitted' as const, finalScore: null },
  { id: 'sub-2', studentName: 'Maya Patel', status: 'submitted' as const, finalScore: null },
  { id: 'sub-3', studentName: 'Jordan Lee', status: 'graded' as const, finalScore: 8 },
]

describe('teacher assignment panel state', () => {
  it('selects the first Submission by default and derives next navigation', () => {
    const state = getTeacherAssignmentPanelState(submissions)

    expect(state.selected?.id).toBe('sub-1')
    expect(state.previous).toBeNull()
    expect(state.next?.studentName).toBe('Maya Patel')
    expect(state.isLast).toBe(false)
  })

  it('marks a Submission graded locally after publishing a Final Grade', () => {
    const updated = markSubmissionGraded(submissions, 'sub-2', 9)

    expect(updated.find((submission) => submission.id === 'sub-2')).toMatchObject({
      status: 'graded',
      finalScore: 9,
    })
    expect(updated.find((submission) => submission.id === 'sub-1')?.status).toBe('submitted')
  })

  it('displays submitted submissions with visible final scores as graded', () => {
    expect(displaySubmissionStatus({
      id: 'sub-4',
      studentName: 'Maya Patel',
      status: 'submitted',
      finalScore: 100,
    })).toBe('graded')
  })

  it('builds editable grade fields from an AI Suggested Grade', () => {
    const form = gradeFormFromGrade({
      ai_suggested_score: 7,
      ai_suggested_feedback: 'Rubric breakdown.',
      final_score: null,
      final_feedback: 'Student-facing draft feedback.',
    })

    expect(form).toEqual({
      score: 7,
      feedback: 'Student-facing draft feedback.',
    })
  })
})
