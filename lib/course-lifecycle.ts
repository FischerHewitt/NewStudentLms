import type { CourseStatus } from '@/lib/course-schema'

export const isCourseVisibleToStudent = (status: CourseStatus): boolean =>
  status === 'published'

export const canPublish = (status: CourseStatus): boolean => status === 'draft'

export const canUnpublish = (status: CourseStatus): boolean => status === 'published'
