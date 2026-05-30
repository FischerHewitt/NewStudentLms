'use client'

import { useEffect } from 'react'
import {
  normalizeTeacherCoachContext,
  type TeacherCoachContext,
} from '@/lib/teacher-coach-context'

export const TEACHER_COACH_CONTEXT_EVENT = 'teacher-coach-context'

export type TeacherCoachContextWindow = Window & {
  __teacherCoachContext?: ReturnType<typeof normalizeTeacherCoachContext>
}

function contextKind(context: TeacherCoachContext): 'submission' | 'syllabus' | 'none' {
  const normalized = normalizeTeacherCoachContext(context)
  if (normalized.submissionId) return 'submission'
  if (normalized.syllabus) return 'syllabus'
  return 'none'
}

function announceTeacherCoachContext(context: TeacherCoachContext) {
  const normalized = normalizeTeacherCoachContext(context)
  const coachWindow = window as TeacherCoachContextWindow
  coachWindow.__teacherCoachContext = normalized
  window.dispatchEvent(
    new CustomEvent(TEACHER_COACH_CONTEXT_EVENT, {
      detail: normalized,
    }),
  )
}

export function TeacherCoachContextBridge({
  context,
}: {
  context: TeacherCoachContext
}) {
  const submissionId = context.submissionId ?? ''
  const syllabus = context.syllabus ?? ''

  useEffect(() => {
    announceTeacherCoachContext({ submissionId, syllabus })
    return () => announceTeacherCoachContext({})
  }, [submissionId, syllabus])

  return (
    <span
      hidden
      aria-hidden="true"
      data-teacher-coach-context={contextKind(context)}
    />
  )
}
