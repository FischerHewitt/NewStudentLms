/**
 * Pure business-logic helpers for the Grade / SpeedGrader domain.
 *
 * Kept separate from server actions so they can be unit-tested in isolation.
 * See docs/adr/0003-grade-pending-published-lifecycle.md
 */

/**
 * Returns true if this grade has not yet been approved.
 * Used by the approveGrade Server Action to enforce idempotency — calling
 * approveGrade twice must not overwrite the first approved_at timestamp.
 */
export function canApprove(approvedAt: string | null): boolean {
  return approvedAt === null
}

/**
 * Returns true if the grade is visible to the student.
 * Per ADR-0003, grades are student-visible ONLY after teacher approval
 * (approved_at IS NOT NULL). Any student-facing query must apply this filter.
 */
export function isGradeVisibleToStudent(approvedAt: string | null): boolean {
  return approvedAt !== null
}
