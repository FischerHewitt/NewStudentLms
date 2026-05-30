import type { CoursePreview, ModulePreview, AssignmentPreview, RubricCriterion } from '@/lib/schemas/course'

export function addModule(preview: CoursePreview): CoursePreview {
  const nextWeek = preview.modules.reduce((max, m) => Math.max(max, m.week_number), 0) + 1
  const blank: ModulePreview = {
    title: '',
    week_number: nextWeek,
    description: '',
    assignments: [],
  }
  return { ...preview, modules: [...preview.modules, blank] }
}

export function removeModule(preview: CoursePreview, moduleIndex: number): CoursePreview {
  if (moduleIndex < 0 || moduleIndex >= preview.modules.length) return preview
  return {
    ...preview,
    modules: preview.modules.filter((_, i) => i !== moduleIndex),
  }
}

export function addAssignment(preview: CoursePreview, moduleIndex: number): CoursePreview {
  const blank: AssignmentPreview = {
    title: '',
    instructions: '',
    due_date: null,
    points_possible: 100,
    rubric: { criteria: [] },
  }
  return {
    ...preview,
    modules: preview.modules.map((m, i) =>
      i === moduleIndex ? { ...m, assignments: [...m.assignments, blank] } : m,
    ),
  }
}

export function removeAssignment(
  preview: CoursePreview,
  moduleIndex: number,
  assignmentIndex: number,
): CoursePreview {
  return {
    ...preview,
    modules: preview.modules.map((m, i) =>
      i === moduleIndex
        ? { ...m, assignments: m.assignments.filter((_, j) => j !== assignmentIndex) }
        : m,
    ),
  }
}

export function addCriterion(
  preview: CoursePreview,
  moduleIndex: number,
  assignmentIndex: number,
): CoursePreview {
  const blank: RubricCriterion = { description: '', points: 0 }
  return {
    ...preview,
    modules: preview.modules.map((m, i) =>
      i === moduleIndex
        ? {
            ...m,
            assignments: m.assignments.map((a, j) =>
              j === assignmentIndex
                ? { ...a, rubric: { criteria: [...a.rubric.criteria, blank] } }
                : a,
            ),
          }
        : m,
    ),
  }
}

export function removeCriterion(
  preview: CoursePreview,
  moduleIndex: number,
  assignmentIndex: number,
  criterionIndex: number,
): CoursePreview {
  return {
    ...preview,
    modules: preview.modules.map((m, i) =>
      i === moduleIndex
        ? {
            ...m,
            assignments: m.assignments.map((a, j) =>
              j === assignmentIndex
                ? {
                    ...a,
                    rubric: {
                      criteria: a.rubric.criteria.filter((_, k) => k !== criterionIndex),
                    },
                  }
                : a,
            ),
          }
        : m,
    ),
  }
}

export function updateCriterion(
  preview: CoursePreview,
  moduleIndex: number,
  assignmentIndex: number,
  criterionIndex: number,
  patch: Partial<RubricCriterion>,
): CoursePreview {
  return {
    ...preview,
    modules: preview.modules.map((m, i) =>
      i === moduleIndex
        ? {
            ...m,
            assignments: m.assignments.map((a, j) =>
              j === assignmentIndex
                ? {
                    ...a,
                    rubric: {
                      criteria: a.rubric.criteria.map((c, k) =>
                        k === criterionIndex ? { ...c, ...patch } : c,
                      ),
                    },
                  }
                : a,
            ),
          }
        : m,
    ),
  }
}
