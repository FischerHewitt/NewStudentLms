import { notFound } from 'next/navigation'
import { Gradebook } from '@/components/Gradebook'
import { getGradebookData } from '@/app/actions/gradebook'

export const dynamic = 'force-dynamic'

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id: courseId } = await params

  const data = await getGradebookData(courseId)

  if (!data) notFound()

  return (
    <div className="px-4 py-8">
      <Gradebook data={data} />
    </div>
  )
}
