import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  clearCourseCardPrefs,
  getCourseCardPrefs,
  setCourseCardPrefs,
  type CourseCardPrefs,
} from '@/lib/course-card-prefs'

// ── localStorage mock ────────────────────────────────────────────────────────

const store: Record<string, string> = {}

const localStorageMock = {
  getItem: (key: string) => store[key] ?? null,
  setItem: (key: string, value: string) => { store[key] = value },
  removeItem: (key: string) => { delete store[key] },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]) },
}

beforeEach(() => {
  vi.stubGlobal('window', { localStorage: localStorageMock })
  localStorageMock.clear()
})

afterEach(() => {
  vi.unstubAllGlobals()
})

// ── Fixtures ─────────────────────────────────────────────────────────────────

const COURSE_A = 'course-id-aaa'
const COURSE_B = 'course-id-bbb'

const prefsA: CourseCardPrefs = {
  iconKey: 'Dna',
  colorKey: 'emerald',
  nickname: 'Bio',
}

const prefsB: CourseCardPrefs = {
  iconKey: 'Flag',
  colorKey: 'rose',
  nickname: 'Spanish',
  flagEmoji: '🇪🇸',
}

// ── Tests ─────────────────────────────────────────────────────────────────────

describe('getCourseCardPrefs', () => {
  it('returns null when no preference has been saved', () => {
    expect(getCourseCardPrefs(COURSE_A)).toBeNull()
  })

  it('returns the saved preference after a write', () => {
    setCourseCardPrefs(COURSE_A, prefsA)
    expect(getCourseCardPrefs(COURSE_A)).toEqual(prefsA)
  })

  it('preserves the optional flagEmoji field', () => {
    setCourseCardPrefs(COURSE_B, prefsB)
    const result = getCourseCardPrefs(COURSE_B)
    expect(result?.flagEmoji).toBe('🇪🇸')
  })
})

describe('setCourseCardPrefs', () => {
  it('round-trips all fields correctly', () => {
    setCourseCardPrefs(COURSE_A, prefsA)
    const result = getCourseCardPrefs(COURSE_A)
    expect(result).toEqual(prefsA)
  })

  it('overwrites an existing preference with new values', () => {
    setCourseCardPrefs(COURSE_A, prefsA)
    const updated: CourseCardPrefs = { ...prefsA, nickname: 'Biology', colorKey: 'blue' }
    setCourseCardPrefs(COURSE_A, updated)
    expect(getCourseCardPrefs(COURSE_A)).toEqual(updated)
  })
})

describe('clearCourseCardPrefs', () => {
  it('removes a saved preference so get returns null', () => {
    setCourseCardPrefs(COURSE_A, prefsA)
    clearCourseCardPrefs(COURSE_A)
    expect(getCourseCardPrefs(COURSE_A)).toBeNull()
  })

  it('silently no-ops when no preference exists', () => {
    expect(() => clearCourseCardPrefs(COURSE_A)).not.toThrow()
  })
})

describe('course isolation', () => {
  it('preferences for different courses are stored independently', () => {
    setCourseCardPrefs(COURSE_A, prefsA)
    setCourseCardPrefs(COURSE_B, prefsB)

    expect(getCourseCardPrefs(COURSE_A)).toEqual(prefsA)
    expect(getCourseCardPrefs(COURSE_B)).toEqual(prefsB)
  })

  it('clearing one course does not affect another', () => {
    setCourseCardPrefs(COURSE_A, prefsA)
    setCourseCardPrefs(COURSE_B, prefsB)
    clearCourseCardPrefs(COURSE_A)

    expect(getCourseCardPrefs(COURSE_A)).toBeNull()
    expect(getCourseCardPrefs(COURSE_B)).toEqual(prefsB)
  })
})

describe('SSR safety', () => {
  it('getCourseCardPrefs returns null when window is undefined', () => {
    vi.unstubAllGlobals()
    // window is not defined in the node environment without stubbing
    expect(getCourseCardPrefs(COURSE_A)).toBeNull()
  })

  it('setCourseCardPrefs does not throw when window is undefined', () => {
    vi.unstubAllGlobals()
    expect(() => setCourseCardPrefs(COURSE_A, prefsA)).not.toThrow()
  })

  it('clearCourseCardPrefs does not throw when window is undefined', () => {
    vi.unstubAllGlobals()
    expect(() => clearCourseCardPrefs(COURSE_A)).not.toThrow()
  })
})
