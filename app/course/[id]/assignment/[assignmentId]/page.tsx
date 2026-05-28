import { notFound } from 'next/navigation'
import { AssignmentView } from '@/components/AssignmentView'
import {
  getAssignmentWithDetails,
  getStudentSubmission,
  getAllSubmissionsForAssignment,
} from '@/app/actions/assignment'

export const dynamic = 'force-dynamic'

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>
}) {
  const { id: courseId, assignmentId } = await params

  const [assignment, studentSubmission, allSubmissions] = await Promise.all([
    getAssignmentWithDetails(assignmentId),
    getStudentSubmission(assignmentId),
    getAllSubmissionsForAssignment(assignmentId),
  ])

  if (!assignment) notFound()

  return (
    <div className="px-4 py-8">
      <AssignmentView
        courseId={courseId}
        assignment={assignment}
        studentSubmission={studentSubmission}
        allSubmissions={allSubmissions}
      />
    </div>
  )
}
