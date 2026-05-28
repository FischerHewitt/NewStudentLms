import { PlaceholderPage } from '@/components/PlaceholderPage'

export default async function GradebookPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <PlaceholderPage
      title="Gradebook"
      description="Student × assignment grid with four-state cells."
      issue={8}
      detail={`Course ID: ${id}`}
    />
  )
}
