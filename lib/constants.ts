/**
 * Stable demo user UUIDs — seeded by supabase/seed.sql.
 * These are referenced throughout the app wherever a user ID is needed.
 * Do not change them without also updating the seed file.
 */
export const TEACHER_ID = '00000000-0000-0000-0000-000000000001'
export const STUDENT_ID = '00000000-0000-0000-0000-000000000002'

export type Role = 'teacher' | 'student'

export const ROLE_USER_ID: Record<Role, string> = {
  teacher: TEACHER_ID,
  student: STUDENT_ID,
}
