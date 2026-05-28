import { PlaceholderPage } from '@/components/PlaceholderPage'

export default async function ModulePage({
  params,
}: {
  params: Promise<{ id: string; moduleId: string }>
}) {
  const { moduleId } = await params
  return (
    <PlaceholderPage
      title="Module"
      description="Assignments and content within this module."
      issue={5}
      detail={`Module ID: ${moduleId}`}
    />
  )
}
