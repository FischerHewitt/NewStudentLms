import { createTeacherCoachResponse, teacherCoachTextResponse } from '@/lib/teacher-coach'
import { createServerClient } from '@/lib/supabase/server'
import {
  createPendingGradeFromAiSpeedGrader,
  type AiSpeedGraderDb,
} from '@/lib/ai-speedgrader'
import { generateObject } from 'ai'
import { coursePreviewSchema } from '@/lib/schemas/course'
import { getDefaultAiModel, LMS_STRUCTURED_OBJECT_MODE } from '@/lib/ai-model'

export const maxDuration = 60

const COURSE_GENERATOR_SYSTEM_PROMPT = `You are the Teacher Coach Course Generator agent.
Given a Syllabus, generate a Course structure with Modules, Assignments, due dates, and Rubrics.
Use the domain terms Course structure, Module, Assignment, and Rubric.`

export async function POST(req: Request) {
  const body = await req.json()

  const result = await createTeacherCoachResponse(
    {
      messages: body.messages ?? [],
      submissionId: body.submissionId ?? body.context?.submissionId,
      syllabus: body.syllabus ?? body.context?.syllabus,
    },
    {
      runSpeedGrader: (submissionId) =>
        createPendingGradeFromAiSpeedGrader(
          createServerClient() as unknown as AiSpeedGraderDb,
          submissionId,
        ),
      generateCourseStructure: async (syllabus) => {
        const { object } = await generateObject({
          model: getDefaultAiModel(),
          mode: LMS_STRUCTURED_OBJECT_MODE,
          schema: coursePreviewSchema,
          system: COURSE_GENERATOR_SYSTEM_PROMPT,
          prompt: `Generate a Course structure from this Syllabus:\n\n${syllabus}`,
        })
        return object
      },
    },
  )

  return teacherCoachTextResponse(result.content)
}
