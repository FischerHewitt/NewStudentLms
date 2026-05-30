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
      (!dayFilter || a.due === dayFilter) &&
      a.due !== null,
  )
}
