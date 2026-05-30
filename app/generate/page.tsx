import { getCourseDraftById } from '@/app/actions/course'
import { GenerateFlow } from './GenerateFlow'

export const dynamic = 'force-dynamic'

export default async function GeneratePage({
  searchParams,
}: {
  searchParams: Promise<{ courseId?: string }>
}) {
  const { courseId } = await searchParams
  const draft = courseId ? await getCourseDraftById(courseId) : null

  return <GenerateFlow draft={draft} />
}
