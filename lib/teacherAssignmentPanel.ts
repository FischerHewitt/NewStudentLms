import { type TeacherPanelView } from '@/lib/grade'

export type { TeacherPanelView as TeacherPanelGrade }

export type TeacherPanelSubmission = {
  id: string
  studentName: string
  status: 'draft' | 'submitted' | 'graded'
  finalScore?: number | null
}

export type TeacherAssignmentPanelState<T extends TeacherPanelSubmission> = {
  selected: T | null
  selectedIndex: number
  previous: T | null
  next: T | null
  isFirst: boolean
  isLast: boolean
}

export function getTeacherAssignmentPanelState<T extends TeacherPanelSubmission>(
  submissions: T[],
  selectedId?: string | null,
): TeacherAssignmentPanelState<T> {
  if (submissions.length === 0) {
    return {
      selected: null,
      selectedIndex: -1,
      previous: null,
      next: null,
      isFirst: true,
      isLast: true,
    }
  }

  const selectedIndex = Math.max(
    0,
    submissions.findIndex((submission) => submission.id === selectedId),
  )

  return {
    selected: submissions[selectedIndex],
    selectedIndex,
    previous: submissions[selectedIndex - 1] ?? null,
    next: submissions[selectedIndex + 1] ?? null,
    isFirst: selectedIndex === 0,
    isLast: selectedIndex === submissions.length - 1,
  }
}

export function markSubmissionGraded<T extends TeacherPanelSubmission>(
  submissions: T[],
  submissionId: string,
  finalScore: number,
): T[] {
  return submissions.map((submission) =>
    submission.id === submissionId
      ? { ...submission, status: 'graded', finalScore }
      : submission,
  )
}

export function gradeFormFromGrade(grade: TeacherPanelView): {
  score: number
  feedback: string
} {
  return {
    score: grade.final_score ?? grade.ai_suggested_score,
    feedback: grade.final_feedback ?? grade.ai_suggested_feedback,
  }
}
