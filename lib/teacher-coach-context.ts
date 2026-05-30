export type TeacherCoachRequestMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type TeacherCoachContext = {
  submissionId?: string | null
  syllabus?: string | null
}

export type TeacherCoachRequest = {
  messages: TeacherCoachRequestMessage[]
  context?: {
    submissionId?: string
    syllabus?: string
  }
}

export function normalizeTeacherCoachContext(
  context: TeacherCoachContext,
): NonNullable<TeacherCoachRequest['context']> {
  const submissionId = context.submissionId?.trim()
  const syllabus = context.syllabus?.trim()

  return {
    ...(submissionId ? { submissionId } : {}),
    ...(syllabus ? { syllabus } : {}),
  }
}

export function buildTeacherCoachRequest(
  messages: TeacherCoachRequestMessage[],
  context: TeacherCoachContext,
): TeacherCoachRequest {
  const normalized = normalizeTeacherCoachContext(context)
  return Object.keys(normalized).length > 0
    ? { messages, context: normalized }
    : { messages }
}
