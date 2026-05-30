export type GradebookCellState = 'blank' | 'pending' | 'ai_suggested' | 'final'
export type AssignmentDashboardStatus = 'not-started' | 'in-progress' | 'submitted' | 'graded'

export type GradebookCellInput = {
  hasSubmission: boolean
  hasGrade: boolean
  approvedAt: string | null
}

export type GradebookCellProjectionInput = {
  hasSubmission: boolean
  grade:
    | {
        aiScore: number
        finalScore: number | null
        approvedAt: string | null
      }
    | null
    | undefined
}

type RawSubmission = { body: string; status: 'draft' | 'submitted' | 'graded' } | null
type RawPublishedGrade = { final_score: number; approved_at: string | null } | null

export function canApprove(approvedAt: string | null): boolean {
  return approvedAt === null
}

export function isPublishedGrade(approvedAt: string | null): boolean {
  return approvedAt !== null
}

export function isGradeVisibleToStudent(approvedAt: string | null): boolean {
  return isPublishedGrade(approvedAt)
}

export function gradebookCellState(input: GradebookCellInput): GradebookCellState {
  if (!input.hasSubmission) return 'blank'
  if (!input.hasGrade) return 'pending'
  if (!isPublishedGrade(input.approvedAt)) return 'ai_suggested'
  return 'final'
}

export function gradebookCellProjection(
  input: GradebookCellProjectionInput,
): { state: GradebookCellState; score: number | null } {
  const state = gradebookCellState({
    hasSubmission: input.hasSubmission,
    hasGrade: !!input.grade,
    approvedAt: input.grade?.approvedAt ?? null,
  })

  if (!input.grade) return { state, score: null }
  if (state === 'final') return { state, score: input.grade.finalScore }
  if (state === 'ai_suggested') return { state, score: input.grade.aiScore }
  return { state, score: null }
}

export function deriveAssignmentStatus(
  submission: RawSubmission,
  grade: RawPublishedGrade,
): { status: AssignmentDashboardStatus; grade?: number } {
  if (!submission) return { status: 'not-started' }
  if (submission.status === 'draft') {
    return submission.body.trim().length > 0
      ? { status: 'in-progress' }
      : { status: 'not-started' }
  }
  if (submission.status === 'submitted') return { status: 'submitted' }
  if (submission.status === 'graded' && grade && isPublishedGrade(grade.approved_at)) {
    return { status: 'graded', grade: grade.final_score }
  }
  return { status: 'submitted' }
}
