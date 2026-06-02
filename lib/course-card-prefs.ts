/**
 * CourseCardPrefs — per-student, per-course display preferences.
 *
 * Persisted in localStorage under `alumos_card_prefs_<courseId>`.
 * SSR-safe: all reads return null when window is not available.
 * Follows the same hydration pattern as RoleContext (lms_active_role).
 *
 * Issue: #88
 */

export type CourseCardPrefs = {
  /** Lucide icon key (e.g. 'Dna', 'Calculator') or 'Flag' for emoji mode */
  iconKey: string
  /** Accent color key (e.g. 'violet', 'emerald') */
  colorKey: string
  /**
   * Student's short display label shown in the course code pill.
   * Defaults to the auto-generated course code abbreviation.
   * Never affects the canonical course title on the server.
   */
  nickname: string
  /** Only set when iconKey === 'Flag' */
  flagEmoji?: string
}

function storageKey(courseId: string): string {
  return `alumos_card_prefs_${courseId}`
}

function isWindowAvailable(): boolean {
  return typeof window !== 'undefined'
}

/**
 * Read preferences for a course.
 * Returns null if no preference has been saved or if called during SSR.
 */
export function getCourseCardPrefs(courseId: string): CourseCardPrefs | null {
  if (!isWindowAvailable()) return null
  try {
    const raw = window.localStorage.getItem(storageKey(courseId))
    if (!raw) return null
    return JSON.parse(raw) as CourseCardPrefs
  } catch {
    return null
  }
}

/**
 * Persist preferences for a course.
 * Silently no-ops during SSR or if localStorage is unavailable.
 */
export function setCourseCardPrefs(courseId: string, prefs: CourseCardPrefs): void {
  if (!isWindowAvailable()) return
  try {
    window.localStorage.setItem(storageKey(courseId), JSON.stringify(prefs))
  } catch {
    // Quota exceeded or private browsing — fail silently
  }
}

/**
 * Remove saved preferences for a course, restoring defaults.
 */
export function clearCourseCardPrefs(courseId: string): void {
  if (!isWindowAvailable()) return
  try {
    window.localStorage.removeItem(storageKey(courseId))
  } catch {
    // Fail silently
  }
}
