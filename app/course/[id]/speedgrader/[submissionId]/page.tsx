import { notFound } from 'next/navigation'
import { SpeedGrader } from '@/components/SpeedGrader'
import { getSpeedGraderData } from '@/app/actions/speedgrader'

export const dynamic = 'force-dynamic'
// Give the AI call enough headroom on Vercel
export const maxDuration = 60

export default async function SpeedGraderPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>
}) {
  const { id: courseId, submissionId } = await params

  const data = await getSpeedGraderData(submissionId)

  if (!data) notFound()

  return (
    <div className="px-4 py-8">
      <SpeedGrader courseId={courseId} data={data} />
    </div>
  )
}
