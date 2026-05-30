import { streamText } from 'ai'
import { getDefaultAiModel } from '@/lib/ai-model'
import { buildStudentCoachSystemPrompt } from '@/lib/student-coach'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, assignmentTitle, instructions, rubricCriteria, studentDraft } =
    await req.json()

  const system = buildStudentCoachSystemPrompt(
    assignmentTitle,
    instructions,
    rubricCriteria,
    studentDraft,
  )

  const result = streamText({
    model: getDefaultAiModel(),
    system,
    messages,
  })

  return result.toDataStreamResponse()
}
