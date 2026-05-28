/**
 * Pure business-logic helpers for the Submission domain.
 *
 * Kept separate from server actions so they can be unit-tested in isolation.
 */

/**
 * Returns true if a new submission or body update is allowed given the
 * current submission status. Submissions are immutably locked once they
 * transition past the draft state.
 *
 * See docs/context/domain-model.md — Submission status lifecycle.
 */
export function canSubmit(
  currentStatus: 'draft' | 'submitted' | 'graded' | null,
): boolean {
  return currentStatus === null || currentStatus === 'draft'
}
