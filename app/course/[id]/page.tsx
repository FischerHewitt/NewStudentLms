import { notFound } from 'next/navigation'
import { CourseDashboard } from '@/components/CourseDashboard'
import {
  getCourseWithModules,
  getStudentSubmissionsForCourse,
  getAllSubmissionsForCourse,
} from '@/app/actions/dashboard'

export const dynamic = 'force-dynamic'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const [course, studentSubmissions, allSubmissions] = await Promise.all([
    getCourseWithModules(id),
    getStudentSubmissionsForCourse(id),
    getAllSubmissionsForCourse(id),
  ])

  if (!course) notFound()

  return (
    <div className="px-4 py-8">
      <CourseDashboard
        course={course}
        studentSubmissions={studentSubmissions}
        allSubmissions={allSubmissions}
      />
    </div>
  )
}
