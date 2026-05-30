import { streamText } from 'ai'
import { getDefaultAiModel } from '@/lib/ai-model'

export const maxDuration = 60

export async function POST(req: Request) {
  const { messages, assignmentTitle, instructions, rubricCriteria, studentDraft } =
    await req.json()

  const rubricBlock =
    rubricCriteria?.length > 0
      ? `\nRubric criteria:\n${rubricCriteria.map((c: { description: string; points: number }) => `- ${c.description} (${c.points} pts)`).join('\n')}`
      : ''

  const draftBlock = studentDraft?.trim()
    ? `\nStudent's current draft:\n"""\n${studentDraft.trim()}\n"""`
    : ''

  const system = `You are an AI learning coach helping a student with the following assignment.

Assignment: ${assignmentTitle}
Instructions: ${instructions}${rubricBlock}${draftBlock}

Your role is to help the student THINK through the assignment, not to do it for them.

Rules you must always follow:
1. Never write the student's answer, submission, or any text they could paste in verbatim.
2. Ask guiding questions that help them arrive at their own conclusions.
3. If asked to write the answer, politely decline and redirect with a question.
4. Keep responses concise — 2–4 sentences max unless explaining a concept step-by-step.
5. Be warm and encouraging. A stuck student is trying.`

  const result = streamText({
    model: getDefaultAiModel(),
    system,
    messages,
  })

  return result.toDataStreamResponse()
}
