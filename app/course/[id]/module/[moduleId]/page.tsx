import { notFound } from 'next/navigation'
import { ModuleDetail } from '@/components/ModuleDetail'
import {
  getModuleWithAssignments,
  getStudentSubmissionsForCourse,
  getAllSubmissionsForCourse,
} from '@/app/actions/dashboard'

export const dynamic = 'force-dynamic'

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { id: courseId, moduleId } = await params

  const [mod, studentSubmissions, allSubmissions] = await Promise.all([
    getModuleWithAssignments(moduleId),
    getStudentSubmissionsForCourse(courseId),
    getAllSubmissionsForCourse(courseId),
  ])

  if (!mod) notFound()

  // Filter to only submissions for assignments in this module
  const moduleAssignmentIds = new Set(mod.assignments.map((a) => a.id))
  const moduleStudentSubs = studentSubmissions.filter((s) =>
    moduleAssignmentIds.has(s.assignment_id),
  )
  const moduleAllSubs = allSubmissions.filter((s) =>
    moduleAssignmentIds.has(s.assignment_id),
  )

  return (
    <div className="px-4 py-8">
      <ModuleDetail
        courseId={courseId}
        module={mod}
        studentSubmissions={moduleStudentSubs}
        allSubmissions={moduleAllSubs}
      />
    </div>
  )
}
