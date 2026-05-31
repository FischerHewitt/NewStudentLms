import { notFound } from 'next/navigation'
import { AssignmentRouter } from './AssignmentRouter'
import { SetBreadcrumb } from '@/components/SetBreadcrumb'
import {
  getAssignmentWithDetails,
  getStudentSubmission,
  getAllSubmissionsForAssignment,
} from '@/app/actions/assignment'
import { getPublishedGradeForSubmission } from '@/app/actions/speedgrader'
import { getCourseWithModules } from '@/app/actions/dashboard'

export const dynamic = 'force-dynamic'

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>
}) {
  const { id: courseId, assignmentId } = await params

  const [course, assignment, studentSubmission, allSubmissions] = await Promise.all([
    getCourseWithModules(courseId),
    getAssignmentWithDetails(assignmentId),
    getStudentSubmission(assignmentId),
    getAllSubmissionsForAssignment(assignmentId),
  ])

  if (!assignment) notFound()

  const publishedGrade = studentSubmission.id
    ? await getPublishedGradeForSubmission(studentSubmission.id)
    : null

  return (
    <>
      <SetBreadcrumb items={[
        { label: 'Courses', href: '/courses' },
        { label: course?.title ?? 'Course', href: `/course/${courseId}` },
        { label: assignment.title },
      ]} />
      <AssignmentRouter
        courseId={courseId}
        assignment={assignment}
        studentSubmission={studentSubmission}
        allSubmissions={allSubmissions}
        publishedGrade={publishedGrade}
      />
    </>
  )
}
