'use client'

import { useRole } from '@/context/RoleContext'
import { StudentAssignmentView } from '@/components/StudentAssignmentView'
import { TeacherAssignmentView } from '@/components/TeacherAssignmentView'
import type {
  AssignmentWithDetails,
  StudentSubmissionData,
  SubmissionData,
} from '@/app/actions/assignment'
import type { PublishedGrade } from '@/app/actions/speedgrader'

interface AssignmentRouterProps {
  courseId: string
  assignment: AssignmentWithDetails
  studentSubmission: StudentSubmissionData
  allSubmissions: SubmissionData[]
  publishedGrade?: PublishedGrade | null
}

export function AssignmentRouter({
  courseId,
  assignment,
  studentSubmission,
  allSubmissions,
  publishedGrade,
}: AssignmentRouterProps) {
  const { role } = useRole()

  if (role === 'student') {
    return (
      <StudentAssignmentView
        courseId={courseId}
        assignment={assignment}
        studentSubmission={studentSubmission}
        publishedGrade={publishedGrade}
      />
    )
  }

  return (
    <TeacherAssignmentView
      courseId={courseId}
      assignment={assignment}
      allSubmissions={allSubmissions}
    />
  )
}
