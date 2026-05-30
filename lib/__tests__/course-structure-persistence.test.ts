import { describe, expect, it, vi } from 'vitest'
import { publishCourseStructure, type CourseStructurePersistenceDb } from '@/lib/course-structure-persistence'
import type { CoursePreview } from '@/lib/schemas/course'

const preview: CoursePreview = {
  title: 'Intro to Biology',
  modules: [
    {
      title: 'Cells',
      week_number: 1,
      description: 'Cell structure and function',
      assignments: [
        {
          title: 'Cell reflection',
          instructions: 'Explain one cell organelle.',
          due_date: '2026-09-01',
          points_possible: 20,
          rubric: {
            criteria: [{ description: 'Names and explains an organelle', points: 20 }],
          },
        },
      ],
    },
  ],
}

describe('publishCourseStructure', () => {
  it('publishes through the transactional Course structure function', async () => {
    const rpc = vi.fn().mockResolvedValue({ data: 'course-1', error: null })
    const db = { rpc } as CourseStructurePersistenceDb

    const result = await publishCourseStructure(db, {
      courseId: 'course-1',
      teacherId: 'teacher-1',
      studentId: 'student-1',
      preview,
    })

    expect(result).toEqual({ courseId: 'course-1' })
    expect(rpc).toHaveBeenCalledWith('publish_course_structure', {
      p_course_id: 'course-1',
      p_teacher_id: 'teacher-1',
      p_student_id: 'student-1',
      p_preview: preview,
    })
  })

  it('throws the database error when publishing fails', async () => {
    const db = {
      rpc: vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Course structure already exists' },
      }),
    } as CourseStructurePersistenceDb

    await expect(
      publishCourseStructure(db, {
        courseId: 'course-1',
        teacherId: 'teacher-1',
        studentId: 'student-1',
        preview,
      }),
    ).rejects.toThrow('Course structure already exists')
  })
})
