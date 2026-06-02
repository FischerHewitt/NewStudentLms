import { notFound } from 'next/navigation'
import { SpeedGrader } from '@/components/SpeedGrader'
import { getSpeedGraderData } from '@/app/actions/speedgrader'
import { getTeacherAutorunSetting } from '@/app/actions/settings'
import { SetBreadcrumb } from '@/components/SetBreadcrumb'
import { RoleGuard } from '@/components/RoleGuard'

export const dynamic = 'force-dynamic'
// Give the AI call enough headroom on Vercel
export const maxDuration = 60

export default async function SpeedGraderPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>
}) {
  const { id: courseId, submissionId } = await params

  const [data, autorun] = await Promise.all([
    getSpeedGraderData(submissionId),
    getTeacherAutorunSetting(),
  ])

  if (!data) notFound()

  return (
    <RoleGuard
      requiredRole="teacher"
      redirectTo={`/course/${courseId}/assignment/${data.assignment.id}`}
    >
      <SetBreadcrumb items={[
        { label: data.course.title, href: `/course/${courseId}` },
        { label: data.assignment.title, href: `/course/${courseId}/assignment/${data.assignment.id}` },
        { label: 'Grading' },
      ]} />
      <div className="px-4 py-8">
        <SpeedGrader courseId={courseId} data={data} autorun={autorun} />
      </div>
    </RoleGuard>
  )
}
