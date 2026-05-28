'use server'

import { createServerClient } from '@/lib/supabase/server'
import { TEACHER_ID } from '@/lib/constants'

/**
 * Returns the demo teacher's current SpeedGrader autorun preference.
 * Defaults to false if not set.
 */
export async function getTeacherAutorunSetting(): Promise<boolean> {
  const db = createServerClient()
  const { data } = await db
    .from('users')
    .select('speedgrader_autorun')
    .eq('id', TEACHER_ID)
    .single()
  return data?.speedgrader_autorun ?? false
}

/**
 * Persists the teacher's SpeedGrader autorun preference to the DB.
 */
export async function updateSpeedGraderAutorun(value: boolean): Promise<void> {
  const db = createServerClient()
  await db
    .from('users')
    .update({ speedgrader_autorun: value })
    .eq('id', TEACHER_ID)
}
