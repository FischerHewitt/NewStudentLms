import type { CoursePreview } from '@/lib/schemas/course'
import type { Grade } from '@/lib/grade'

export type TeacherCoachMessage = {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export type TeacherCoachAgent = 'fallback' | 'speedgrader' | 'course-generator'

export type TeacherCoachInput = {
  messages: TeacherCoachMessage[]
  submissionId?: string
  syllabus?: string
}

export type TeacherCoachAdapters = {
  runSpeedGrader: (submissionId: string) => Promise<{ grade?: Grade; error?: string }>
  generateCourseStructure: (syllabus: string) => Promise<CoursePreview>
}

export type TeacherCoachResponse = {
  agent: TeacherCoachAgent
  content: string
  grade?: Grade
  coursePreview?: CoursePreview
}

export const TEACHER_COACH_SUB_AGENTS = [
  {
    name: 'speedgrader',
    description:
      'Use for a teacher request to run AI SpeedGrader on a specific Submission and create a Pending Grade.',
  },
  {
    name: 'course-generator',
    description:
      'Use for a teacher request to generate a Course structure from Syllabus text, including Modules, Assignments, and Rubrics.',
  },
] as const

function lastUserMessage(messages: TeacherCoachMessage[]): string {
  return [...messages].reverse().find((message) => message.role === 'user')?.content ?? ''
}

function fallbackResponse(): TeacherCoachResponse {
  return {
    agent: 'fallback',
    content:
      'Teacher Coach: tell me which Course, Assignment, or Submission you want help with. I can run AI SpeedGrader for a Submission or generate a Course structure from Syllabus text.',
  }
}

export async function createTeacherCoachResponse(
  input: TeacherCoachInput,
  adapters: TeacherCoachAdapters,
): Promise<TeacherCoachResponse> {
  const message = lastUserMessage(input.messages)

  if (input.submissionId) {
    const result = await adapters.runSpeedGrader(input.submissionId)
    if (result.error) {
      return {
        agent: 'speedgrader',
        content: result.error.replace('submission', 'Submission'),
      }
    }
    if (result.grade) {
      return {
        agent: 'speedgrader',
        grade: result.grade,
        content: `Pending Grade created. AI Suggested Grade: ${result.grade.ai_suggested_score}. Feedback draft: ${result.grade.final_feedback ?? result.grade.ai_suggested_feedback}`,
      }
    }
  }

  if (input.syllabus?.trim()) {
    const coursePreview = await adapters.generateCourseStructure(input.syllabus)
    const moduleCount = coursePreview.modules.length
    const assignmentCount = coursePreview.modules.reduce(
      (sum, mod) => sum + mod.assignments.length,
      0,
    )

    return {
      agent: 'course-generator',
      coursePreview,
      content: `Course structure generated for ${coursePreview.title}: ${moduleCount} ${moduleCount === 1 ? 'Module' : 'Modules'} and ${assignmentCount} ${assignmentCount === 1 ? 'Assignment' : 'Assignments'}.`,
    }
  }

  if (!input.submissionId && !input.syllabus && message.trim().length === 0) {
    return fallbackResponse()
  }

  return fallbackResponse()
}

export function teacherCoachTextResponse(content: string): Response {
  const encoder = new TextEncoder()
  const stream = new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(content))
      controller.close()
    },
  })

  return new Response(stream, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  })
}
