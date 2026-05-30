import { streamText } from 'ai'
import { getDefaultAiModel } from '@/lib/ai-model'

export const maxDuration = 60

export async function POST(req: Request) {
  const { description } = (await req.json()) as { description: string }

  if (!description?.trim()) {
    return new Response(JSON.stringify({ error: 'description is required' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  try {
    const result = streamText({
      model: getDefaultAiModel(),
      system: `You are an expert university course designer. Given a brief course description, write a complete, well-structured course syllabus.

The syllabus should include:
- Course title and description
- Learning objectives (5-8 bullet points)
- Weekly schedule (list each week with topic and key activities)
- Assignment list with descriptions, due dates relative to week number, and point values
- Grading breakdown
- Course policies (brief)

Format it as clean, readable plain text. Use markdown-style headers (##) and bullet points.`,
      prompt: `Write a complete course syllabus for the following course:\n\n${description}`,
      onError: (error) => {
        console.error('[generate-syllabus] stream error:', error)
      },
    })

    return result.toTextStreamResponse()
  } catch (error) {
    console.error('[generate-syllabus] error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { status: 500, headers: { 'Content-Type': 'application/json' } },
    )
  }
}
