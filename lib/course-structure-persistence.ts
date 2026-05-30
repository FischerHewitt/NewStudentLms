import type { CoursePreview } from '@/lib/schemas/course'

type RpcError = { message?: string } | null

export type CourseStructurePersistenceDb = {
  rpc: (
    fn: 'publish_course_structure',
    args: {
      p_course_id: string
      p_teacher_id: string
      p_student_id: string
      p_preview: CoursePreview
    },
  ) => PromiseLike<{ data: unknown; error: RpcError }>
}

export async function publishCourseStructure(
  db: CourseStructurePersistenceDb,
  input: {
    courseId: string
    teacherId: string
    studentId: string
    preview: CoursePreview
  },
): Promise<{ courseId: string }> {
  const { data, error } = await db.rpc('publish_course_structure', {
    p_course_id: input.courseId,
    p_teacher_id: input.teacherId,
    p_student_id: input.studentId,
    p_preview: input.preview,
  })

  if (error) {
    throw new Error(error.message ?? 'Failed to publish course structure')
  }

  return { courseId: typeof data === 'string' ? data : input.courseId }
}
