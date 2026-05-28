/**
 * Pure business-logic helpers for the Gradebook domain.
 */

export type GradebookCellState = 'blank' | 'pending' | 'ai_suggested' | 'final'

export interface GradebookCellInput {
  hasSubmission: boolean
  hasGrade: boolean
  approvedAt: string | null
}

/**
 * Returns the display state for a single gradebook cell.
 *
 * | State        | Condition                                 |
 * |--------------|-------------------------------------------|
 * | blank        | No submission for this student/assignment |
 * | pending      | Submission exists, no grade yet           |
 * | ai_suggested | Pending grade (approved_at = null)        |
 * | final        | Published grade (approved_at IS NOT NULL) |
 *
 * Student-facing views must suppress `ai_suggested` — they should display it
 * the same as `pending` (awaiting grade). Only the teacher sees the AI score.
 */
export function gradebookCellState(
  input: GradebookCellInput,
): GradebookCellState {
  if (!input.hasSubmission) return 'blank'
  if (!input.hasGrade) return 'pending'
  if (input.approvedAt === null) return 'ai_suggested'
  return 'final'
}
