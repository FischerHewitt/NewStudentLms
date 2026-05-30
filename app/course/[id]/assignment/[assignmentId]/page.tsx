import { notFound } from 'next/navigation'
import { AssignmentRouter } from './AssignmentRouter'
import {
  getAssignmentWithDetails,
  getStudentSubmission,
  getAllSubmissionsForAssignment,
} from '@/app/actions/assignment'
import { getPublishedGradeForSubmission } from '@/app/actions/speedgrader'

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

  // Fetch published grade for the student's submission (null if not yet approved)
  const publishedGrade = studentSubmission.id
    ? await getPublishedGradeForSubmission(studentSubmission.id)
    : null

  return (
    <div className="px-4 py-8">
      <AssignmentRouter
        courseId={courseId}
        assignment={assignment}
        studentSubmission={studentSubmission}
        allSubmissions={allSubmissions}
        publishedGrade={publishedGrade}
      />
    </div>
  )
}
