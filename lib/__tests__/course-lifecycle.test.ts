import { describe, expect, it } from 'vitest'
import {
  isCourseVisibleToStudent,
  canPublish,
  canUnpublish,
} from '@/lib/course-lifecycle'

describe('Course lifecycle predicates', () => {
  it('draft course is not visible to students', () => {
    expect(isCourseVisibleToStudent('draft')).toBe(false)
  })

  it('published course is visible to students', () => {
    expect(isCourseVisibleToStudent('published')).toBe(true)
  })

  it('draft course can be published', () => {
    expect(canPublish('draft')).toBe(true)
    expect(canPublish('published')).toBe(false)
  })

  it('published course can be unpublished', () => {
    expect(canUnpublish('published')).toBe(true)
    expect(canUnpublish('draft')).toBe(false)
  })
})
