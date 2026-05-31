import { notFound } from 'next/navigation'
import { CourseDashboard } from '@/components/CourseDashboard'
import { SetBreadcrumb } from '@/components/SetBreadcrumb'
import {
  getCourseWithModules,
  getStudentSubmissionsForCourse,
  getAllSubmissionsForCourse,
} from '@/app/actions/dashboard'
import { getEnrolledStudents } from '@/app/actions/enrollment'
export const dynamic = 'force-dynamic'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [course, studentSubmissions, allSubmissions, enrolledStudents] = await Promise.all([
    getCourseWithModules(id),
    getStudentSubmissionsForCourse(id),
    getAllSubmissionsForCourse(id),
    getEnrolledStudents(id),
  ])

  if (!course) notFound()

  return (
    <>
      <SetBreadcrumb items={[
        { label: 'Courses', href: '/courses' },
        { label: course.title },
      ]} />
      <div className="px-4 py-8">
        <CourseDashboard
          course={course}
          studentSubmissions={studentSubmissions}
          allSubmissions={allSubmissions}
          enrolledStudents={enrolledStudents}
        />
      </div>
    </>
  )
}
