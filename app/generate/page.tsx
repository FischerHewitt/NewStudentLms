import { getCourseDraft } from '@/app/actions/course'
import { GenerateFlow } from './GenerateFlow'

export const dynamic = 'force-dynamic'

export default async function GeneratePage() {
  // Check for a tab-close recovery draft
  const draft = await getCourseDraft()

  return <GenerateFlow draft={draft} />
}
