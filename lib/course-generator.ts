/**
 * explodeCoursePreview
 *
 * Converts the AI-generated JSON blob stored in courses.generation_preview
 * into normalized row shapes ready for bulk-insert into the DB.
 *
 * This is a pure function with no side effects — all DB writes happen in the
 * calling Server Action. Keeping it pure makes it straightforward to test.
 *
 * See docs/context/ai-flows.md — Syllabus-to-Course Generator (B-lite flow).
 */

import type { CoursePreview, ModulePreview, AssignmentPreview, RubricCriterion } from '@/lib/schemas/course'

export type { CoursePreview, ModulePreview, AssignmentPreview, RubricCriterion }

// ---------------------------------------------------------------------------
// Row shapes returned by explodeCoursePreview (IDs are assigned by the DB)
// ---------------------------------------------------------------------------

export interface ModuleRow {
  title: string
  description: string
  order: number
  week_number: number
}

export interface AssignmentRow {
  title: string
  instructions: string
  due_date: string | null
  points_possible: number
  /** module index — resolved to a real module_id after modules are inserted */
  moduleIndex: number
}

export interface RubricRow {
  criteria: RubricCriterion[]
  /** assignment index — resolved to a real assignment_id after assignments are inserted */
  assignmentIndex: number
}

export interface ExplodedCourse {
  title: string
  modules: ModuleRow[]
  assignments: AssignmentRow[]
  rubrics: RubricRow[]
}

/**
 * Converts a CoursePreview (AI output) into flat arrays of row shapes.
 * Assignments and rubrics carry an index reference to their parent module/assignment
 * so the calling Server Action can wire up foreign keys after inserting.
 */
export function explodeCoursePreview(preview: CoursePreview): ExplodedCourse {
  const modules: ModuleRow[] = []
  const assignments: AssignmentRow[] = []
  const rubrics: RubricRow[] = []

  for (let moduleIndex = 0; moduleIndex < preview.modules.length; moduleIndex++) {
    const mod = preview.modules[moduleIndex]

    modules.push({
      title: mod.title ?? '',
      description: mod.description ?? '',
      order: moduleIndex,
      week_number: mod.week_number ?? moduleIndex + 1,
    })

    for (const assignment of mod.assignments ?? []) {
      const assignmentIndex = assignments.length

      assignments.push({
        title: assignment.title ?? '',
        instructions: assignment.instructions ?? '',
        due_date: assignment.due_date ?? null,
        points_possible: assignment.points_possible ?? 100,
        moduleIndex,
      })

      rubrics.push({
        criteria: Array.isArray(assignment.rubric?.criteria)
          ? assignment.rubric.criteria.map((c) => ({
              description: c.description ?? '',
              points: typeof c.points === 'number' ? c.points : 0,
            }))
          : [],
        assignmentIndex,
      })
    }
  }

  return {
    title: preview.title ?? 'Untitled Course',
    modules,
    assignments,
    rubrics,
  }
}
