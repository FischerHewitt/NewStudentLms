import { generateObject } from 'ai'
import { z } from 'zod'
import { getDefaultAiModel } from '@/lib/ai-model'
import { validateRubricGenerateInput, parseRubricResponse } from '@/lib/rubric-generator'

const rubricResponseSchema = z.object({
  criteria: z.array(
    z.object({
      description: z.string().describe('What this criterion measures'),
      points: z.number().describe('Points allocated to this criterion'),
    }),
  ).describe('2-4 grading criteria whose points sum to points_possible'),
})

export async function POST(req: Request) {
  const { title, instructions } = (await req.json()) as { title: string; instructions: string }

  if (!validateRubricGenerateInput(title, instructions)) {
    return new Response(JSON.stringify({ error: 'title and instructions are required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const { object } = await generateObject({
      model: getDefaultAiModel(),
      schema: rubricResponseSchema,
      prompt: `Generate 2-4 specific, measurable rubric criteria for this assignment.
The criteria point values must sum to the assignment's total points.
Use reasonable point values (the teacher will adjust as needed).

Assignment title: ${title}
Assignment instructions: ${instructions}`,
    })

    return new Response(JSON.stringify({ criteria: parseRubricResponse(object) }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('[generate-rubric] error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
