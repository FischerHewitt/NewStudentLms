import { describe, it, expect } from 'vitest'
import { toTeacherPanel, toStudentView, type Grade } from '@/lib/grade'

const approvedGrade: Grade = {
  id: 'grade-1',
  submission_id: 'sub-1',
  ai_suggested_score: 8,
  ai_suggested_feedback: 'Good coverage of the topic.',
  final_score: 9,
  final_feedback: 'Excellent work with minor gaps.',
  approved_at: '2026-05-30T12:00:00.000Z',
  approved_by: 'teacher-uuid',
}

const pendingGrade: Grade = {
  id: 'grade-2',
  submission_id: 'sub-2',
  ai_suggested_score: 5,
  ai_suggested_feedback: 'Minimal demonstration of concepts.',
  final_score: null,
  final_feedback: null,
  approved_at: null,
  approved_by: null,
}

describe('toTeacherPanel', () => {
  it('projects an approved grade to the teacher panel shape', () => {
    expect(toTeacherPanel(approvedGrade)).toEqual({
      ai_suggested_score: 8,
      ai_suggested_feedback: 'Good coverage of the topic.',
      final_score: 9,
      final_feedback: 'Excellent work with minor gaps.',
    })
  })

  it('projects a pending grade with null finals to the teacher panel shape', () => {
    expect(toTeacherPanel(pendingGrade)).toEqual({
      ai_suggested_score: 5,
      ai_suggested_feedback: 'Minimal demonstration of concepts.',
      final_score: null,
      final_feedback: null,
    })
  })

  it('omits id, submission_id, approved_at, and approved_by from the result', () => {
    const result = toTeacherPanel(approvedGrade)
    expect(result).not.toHaveProperty('id')
    expect(result).not.toHaveProperty('submission_id')
    expect(result).not.toHaveProperty('approved_at')
    expect(result).not.toHaveProperty('approved_by')
  })
})

describe('toStudentView', () => {
  it('projects an approved grade to the student-visible shape', () => {
    expect(toStudentView(approvedGrade)).toEqual({
      final_score: 9,
      final_feedback: 'Excellent work with minor gaps.',
    })
  })

  it('throws when final_score is null (grade not yet approved)', () => {
    expect(() => toStudentView(pendingGrade)).toThrow(
      'Cannot project an unapproved grade to StudentGradeView',
    )
  })

  it('throws when only final_feedback is null', () => {
    const partialGrade: Grade = {
      ...approvedGrade,
      final_score: 7,
      final_feedback: null,
    }
    expect(() => toStudentView(partialGrade)).toThrow(
      'Cannot project an unapproved grade to StudentGradeView',
    )
  })

  it('omits ai_suggested fields, approved_at, and approved_by from the result', () => {
    const result = toStudentView(approvedGrade)
    expect(result).not.toHaveProperty('ai_suggested_score')
    expect(result).not.toHaveProperty('ai_suggested_feedback')
    expect(result).not.toHaveProperty('approved_at')
    expect(result).not.toHaveProperty('approved_by')
  })
})
