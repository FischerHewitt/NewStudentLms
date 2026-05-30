import { describe, expect, it, vi } from 'vitest'
import { createTeacherCoachResponse, TEACHER_COACH_SUB_AGENTS } from '@/lib/teacher-coach'
import { coursePreviewSchema } from '@/lib/schemas/course'

describe('Teacher Coach fallback', () => {
  it('asks for actionable teacher context when no sub-agent can help', async () => {
    const result = await createTeacherCoachResponse(
      { messages: [{ role: 'user', content: 'help me with this' }] },
      {
        runSpeedGrader: vi.fn(),
        generateCourseStructure: vi.fn(),
      },
    )

    expect(result.agent).toBe('fallback')
    expect(result.content).toContain('Teacher Coach')
    expect(result.content).toContain('Course')
    expect(result.content).toContain('Submission')
    expect(result.content).not.toContain("won't write your answer")
  })

  it('registers load-bearing SpeedGrader and Course Generator sub-agents', () => {
    expect(TEACHER_COACH_SUB_AGENTS.map((agent) => agent.name)).toEqual([
      'speedgrader',
      'course-generator',
    ])
    expect(TEACHER_COACH_SUB_AGENTS[0].description).toContain('Submission')
    expect(TEACHER_COACH_SUB_AGENTS[1].description).toContain('Syllabus')
  })
})

describe('Teacher Coach SpeedGrader agent', () => {
  it('creates a Pending Grade for a Submission and summarizes the AI Suggested Grade', async () => {
    const runSpeedGrader = vi.fn().mockResolvedValue({
      grade: {
        id: 'grade-1',
        ai_suggested_score: 18,
        ai_suggested_feedback: 'Claim (8/10): clear.\nEvidence (10/10): specific.',
        final_score: null,
        final_feedback: 'Strong work.',
        approved_at: null,
      },
    })

    const result = await createTeacherCoachResponse(
      {
        messages: [{ role: 'user', content: 'run AI SpeedGrader' }],
        submissionId: 'submission-1',
      },
      {
        runSpeedGrader,
        generateCourseStructure: vi.fn(),
      },
    )

    expect(runSpeedGrader).toHaveBeenCalledWith('submission-1')
    expect(result.agent).toBe('speedgrader')
    expect(result.grade?.approved_at).toBeNull()
    expect(result.content).toContain('Pending Grade')
    expect(result.content).toContain('AI Suggested Grade: 18')
    expect(result.content).toContain('Strong work.')
  })

  it('reports an existing Grade instead of creating another one', async () => {
    const result = await createTeacherCoachResponse(
      {
        messages: [{ role: 'user', content: 'run AI SpeedGrader' }],
        submissionId: 'submission-1',
      },
      {
        runSpeedGrader: vi.fn().mockResolvedValue({
          error: 'A grade already exists for this submission.',
        }),
        generateCourseStructure: vi.fn(),
      },
    )

    expect(result.agent).toBe('speedgrader')
    expect(result.content).toContain('A grade already exists for this Submission')
  })
})

describe('Teacher Coach Course Generator agent', () => {
  it('generates a Course structure from Syllabus text', async () => {
    const coursePreview = {
      title: 'BIO 111',
      modules: [
        {
          title: 'Scientific Method',
          week_number: 1,
          description: 'How biologists investigate questions.',
          assignments: [
            {
              title: 'Connect Homework 1',
              instructions: 'Explain the scientific method.',
              due_date: '2026-09-01',
              points_possible: 5,
              rubric: {
                criteria: [{ description: 'Explains the scientific method', points: 5 }],
              },
            },
          ],
        },
      ],
    }

    const result = await createTeacherCoachResponse(
      {
        messages: [{ role: 'user', content: 'generate a course from this syllabus' }],
        syllabus: 'BIO 111 syllabus...',
      },
      {
        runSpeedGrader: vi.fn(),
        generateCourseStructure: vi.fn().mockResolvedValue(coursePreview),
      },
    )

    expect(result.agent).toBe('course-generator')
    expect(result.coursePreview).toEqual(coursePreview)
    expect(coursePreviewSchema.safeParse(result.coursePreview).success).toBe(true)
    expect(result.content).toContain('Course structure generated')
    expect(result.content).toContain('1 Module')
    expect(result.content).toContain('1 Assignment')
  })
})
