'use client'

import { useRole } from '@/context/RoleContext'
import { useSearchParams } from 'next/navigation'
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
  const { role, mounted } = useRole()
  const searchParams = useSearchParams()
  const requestedView = searchParams.get('view')
  const routeRole =
    requestedView === 'student' || requestedView === 'teacher' ? requestedView : null
  const effectiveRole = routeRole ?? role

  if (!mounted && !routeRole) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm font-medium text-slate-500 shadow-sm">
        Loading assignment...
      </div>
    )
  }

  if (effectiveRole === 'student') {
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
