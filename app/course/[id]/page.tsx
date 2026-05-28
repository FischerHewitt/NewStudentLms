import { PlaceholderPage } from '@/components/PlaceholderPage'

export default async function CoursePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return (
    <PlaceholderPage
      title="Course Dashboard"
      description="Modules, upcoming assignments, and course overview."
      issue={5}
      detail={`Course ID: ${id}`}
    />
  )
}
