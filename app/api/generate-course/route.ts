import { streamObject } from 'ai'
import { createGroq } from '@ai-sdk/groq'

const groq = createGroq({ apiKey: process.env.GROQ_API_KEY })
import { coursePreviewSchema } from '@/lib/schemas/course'

export const maxDuration = 60

const SYSTEM_PROMPT = `You are an expert university course designer.
Given a course syllabus, extract and structure the course into a clear, well-organized format.

Guidelines:
- Create one module per week or major unit in the syllabus
- Extract real assignment names, instructions, and due dates from the syllabus text
- If due dates aren't explicit, space them evenly across the semester (use YYYY-MM-DD format)
- Generate 2-4 specific, measurable rubric criteria per assignment based on the assignment type
- Rubric criteria point values must sum to points_possible for that assignment
- Keep instructions student-facing: clear, actionable, and specific
- Points per assignment: typically 10–100 depending on weight in syllabus
- Week numbers start at 1`

export async function POST(req: Request) {
  const { syllabus } = (await req.json()) as { syllabus: string }

  try {
    const result = streamObject({
      model: groq('llama-3.3-70b-versatile'),
      mode: 'tool',
      schema: coursePreviewSchema,
      system: SYSTEM_PROMPT,
      prompt: `Here is the course syllabus. Extract the full course structure:\n\n${syllabus}`,
      onError: (error) => {
        console.error('[generate-course] stream error:', error)
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[generate-course] error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
}
