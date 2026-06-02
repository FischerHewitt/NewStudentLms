export {
  deriveAssignmentStatus,
  type AssignmentDashboardStatus,
} from '@/lib/grade-lifecycle'

import type { StudentDashboardAssignment } from '@/app/actions/dashboard'

export function filterOpenAssignments(
  assignments: StudentDashboardAssignment[],
  courseFilter: string | null,
  dayFilter: string | null,
): StudentDashboardAssignment[] {
  return assignments.filter(
    (a) =>
      (a.status === 'not-started' || a.status === 'in-progress') &&
      (!courseFilter || a.courseId === courseFilter) &&
      // When dayFilter is active, only match dated assignments on that day.
      // Undated assignments are always included when dayFilter is null.
      (!dayFilter || a.due === dayFilter),
  )
}
