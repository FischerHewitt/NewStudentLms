import { PlaceholderPage } from '@/components/PlaceholderPage'

export default async function AssignmentPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>
}) {
  const { assignmentId } = await params
  return (
    <PlaceholderPage
      title="Assignment"
      description="Assignment instructions, submission form, and rubric."
      issue={6}
      detail={`Assignment ID: ${assignmentId}`}
    />
  )
}
