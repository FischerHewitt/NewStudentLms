export { canApprove, isGradeVisibleToStudent } from '@/lib/grade-lifecycle'

/**
 * Returns true if the submission has no text content for the AI to grade.
 * Used to short-circuit the Groq API call and write a 0 grade directly.
 * Both Scenario D (empty) and Scenario E (file-only) satisfy this condition.
 */
export function isEmptySubmission(body: string): boolean {
  return body.trim() === ''
}

/**
 * Returns true if the student uploaded a file but provided no text body.
 * Used to show the "submission appears empty — possible technical difficulty"
 * warning in AssignmentView and SpeedGrader. Score is still 0.
 */
export function hasAttachmentWithoutBody(body: string, fileUrl: string | null): boolean {
  return body.trim() === '' && fileUrl !== null
}
