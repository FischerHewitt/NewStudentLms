import type { CriterionScore } from '@/lib/grade-computation'

/**
 * Canonical Grade type and projection functions.
 *
 * `Grade` mirrors the DB row shape from the `grades` table.
 * Derived view types are projections used by specific UI consumers.
 * ai-speedgrader.ts and app/actions/speedgrader.ts import from here (issue #53).
 */

// ── Canonical DB row ──────────────────────────────────────────────────────────

export type Grade = {
  id: string
  submission_id: string
  ai_suggested_score: number
  ai_suggested_feedback: string
  final_score: number | null
  final_feedback: string | null
  approved_at: string | null
  approved_by: string | null
  ai_criterion_scores: CriterionScore[] | null
}

// ── View projections ──────────────────────────────────────────────────────────

/**
 * The subset of Grade needed to render the teacher-facing SpeedGrader panel.
 * Replaces the local `TeacherPanelGrade` that was defined in teacherAssignmentPanel.ts.
 */
export type TeacherPanelView = {
  ai_suggested_score: number
  ai_suggested_feedback: string
  final_score: number | null
  final_feedback: string | null
}

/**
 * The student-visible subset of an approved grade.
 * app/actions/speedgrader.ts exports `PublishedGrade = StudentGradeView | null`.
 */
export type StudentGradeView = {
  final_score: number
  final_feedback: string
}

// ── Pure projection functions ─────────────────────────────────────────────────

/**
 * Projects a full Grade row down to the fields the teacher panel needs.
 */
export function toTeacherPanel(grade: Grade): TeacherPanelView {
  return {
    ai_suggested_score: grade.ai_suggested_score,
    ai_suggested_feedback: grade.ai_suggested_feedback,
    final_score: grade.final_score,
    final_feedback: grade.final_feedback,
  }
}

/**
 * Projects a full Grade row down to the student-visible fields.
 * Callers are responsible for ensuring the grade is approved before calling this
 * (i.e. approved_at is not null and final_score/final_feedback are present).
 * Throws if the grade has not been approved (missing final values).
 */
export function toStudentView(grade: Grade): StudentGradeView {
  if (grade.final_score === null || grade.final_feedback === null) {
    throw new Error('Cannot project an unapproved grade to StudentGradeView')
  }
  return {
    final_score: grade.final_score,
    final_feedback: grade.final_feedback,
  }
}
