import { describe, expect, it } from 'vitest'
import {
  validateCourseStatus,
  validateResourceType,
  validateUserStatus,
} from '@/lib/course-schema'

describe('Course status', () => {
  it('accepts draft', () => {
    expect(validateCourseStatus('draft')).toBe(true)
  })

  it('accepts published', () => {
    expect(validateCourseStatus('published')).toBe(true)
  })

  it('rejects unknown values', () => {
    expect(validateCourseStatus('active')).toBe(false)
    expect(validateCourseStatus('')).toBe(false)
  })
})

describe('Resource type', () => {
  it('accepts file', () => {
    expect(validateResourceType('file')).toBe(true)
  })

  it('accepts link', () => {
    expect(validateResourceType('link')).toBe(true)
  })

  it('rejects unknown values', () => {
    expect(validateResourceType('document')).toBe(false)
    expect(validateResourceType('')).toBe(false)
  })
})

describe('User status', () => {
  it('accepts pending', () => {
    expect(validateUserStatus('pending')).toBe(true)
  })

  it('accepts active', () => {
    expect(validateUserStatus('active')).toBe(true)
  })

  it('rejects unknown values', () => {
    expect(validateUserStatus('inactive')).toBe(false)
    expect(validateUserStatus('')).toBe(false)
  })
})
