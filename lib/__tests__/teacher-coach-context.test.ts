import { describe, expect, it } from 'vitest'
import { buildTeacherCoachRequest, normalizeTeacherCoachContext } from '@/lib/teacher-coach-context'

describe('Teacher Coach context payloads', () => {
  it('includes the active Submission context when the teacher asks from SpeedGrader', () => {
    const messages = [{ role: 'user' as const, content: 'Run AI SpeedGrader here' }]

    expect(
      buildTeacherCoachRequest(messages, { submissionId: 'submission-1' }),
    ).toEqual({
      messages,
      context: { submissionId: 'submission-1' },
    })
  })

  it('includes the active Syllabus context when the teacher asks from course generation', () => {
    const messages = [{ role: 'user' as const, content: 'Build this course' }]

    expect(
      buildTeacherCoachRequest(messages, { syllabus: 'BIO 111 syllabus' }),
    ).toEqual({
      messages,
      context: { syllabus: 'BIO 111 syllabus' },
    })
  })

  it('does not send blank context fields', () => {
    expect(
      normalizeTeacherCoachContext({ submissionId: ' ', syllabus: '' }),
    ).toEqual({})
  })
})
