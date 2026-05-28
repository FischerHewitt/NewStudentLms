import { PlaceholderPage } from '@/components/PlaceholderPage'

export default async function SpeedGraderPage({
  params,
}: {
  params: Promise<{ id: string; submissionId: string }>
}) {
  const { submissionId } = await params
  return (
    <PlaceholderPage
      title="AI SpeedGrader"
      description="Student submission alongside AI-suggested score and feedback."
      issue={7}
      detail={`Submission ID: ${submissionId}`}
    />
  )
}
