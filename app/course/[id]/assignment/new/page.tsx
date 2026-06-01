import { notFound } from 'next/navigation'
import { getCourseWithModules } from '@/app/actions/dashboard'
import { SetBreadcrumb } from '@/components/SetBreadcrumb'
import { NewAssignmentForm } from '@/components/NewAssignmentForm'

export const dynamic = 'force-dynamic'

export default async function NewAssignmentPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ moduleId?: string }>
}) {
  const { id: courseId } = await params
  const { moduleId } = await searchParams

  const course = await getCourseWithModules(courseId)
  if (!course) notFound()

  const selectedModule = moduleId ? course.modules.find((m) => m.id === moduleId) : null

  return (
    <>
      <SetBreadcrumb items={[
        { label: 'Courses', href: '/courses' },
        { label: course.title, href: `/course/${courseId}` },
        { label: 'New Assignment' },
      ]} />
      <NewAssignmentForm
        courseId={courseId}
        moduleId={moduleId ?? course.modules[0]?.id ?? ''}
        moduleName={selectedModule ? `Wk ${selectedModule.week_number} · ${selectedModule.title}` : ''}
        modules={course.modules.map((m) => ({ id: m.id, label: `Wk ${m.week_number} · ${m.title}` }))}
      />
    </>
  )
}
