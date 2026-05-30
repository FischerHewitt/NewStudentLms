'use server'

import { createServerClient } from '@/lib/supabase/server'
import { validateResource, type Resource } from '@/lib/resources'
import { TEACHER_ID } from '@/lib/constants'

export type { Resource }

export async function getResourcesForAssignment(assignmentId: string): Promise<Resource[]> {
  const db = createServerClient()
  const { data } = await db
    .from('resources')
    .select('id, assignment_id, title, type, url, created_at')
    .eq('assignment_id', assignmentId)
    .order('created_at')
  return (data ?? []) as Resource[]
}

export async function addResource(
  assignmentId: string,
  input: { title: string; type: 'file' | 'link'; url: string },
): Promise<Resource> {
  const validation = validateResource(input)
  if (!validation.ok) throw new Error(validation.error)

  const db = createServerClient()

  // Verify the assignment belongs to a course owned by this teacher
  const { data: assignment } = await db
    .from('assignments')
    .select('course_id, courses!inner(teacher_id)')
    .eq('id', assignmentId)
    .single()

  const courseTeacherId = assignment
    ? (Array.isArray(assignment.courses) ? assignment.courses[0] : assignment.courses as { teacher_id: string } | null)?.teacher_id
    : null

  if (courseTeacherId !== TEACHER_ID) {
    throw new Error('Not authorized to add resources to this assignment')
  }

  const { data, error } = await db
    .from('resources')
    .insert({ assignment_id: assignmentId, title: input.title, type: input.type, url: input.url })
    .select('id, assignment_id, title, type, url, created_at')
    .single()

  if (error || !data) throw new Error(error?.message ?? 'Failed to add resource')
  return data as Resource
}

export async function removeResource(resourceId: string): Promise<void> {
  const db = createServerClient()

  // Verify the resource belongs to a course owned by this teacher before deleting
  const { data: resource } = await db
    .from('resources')
    .select('assignment_id, assignments!inner(course_id, courses!inner(teacher_id))')
    .eq('id', resourceId)
    .single()

  type AssignmentShape = { course_id: string; courses: { teacher_id: string } | { teacher_id: string }[] }
  const assignment = resource
    ? (Array.isArray(resource.assignments) ? resource.assignments[0] : resource.assignments) as AssignmentShape | null
    : null
  const courseTeacherId = assignment
    ? (Array.isArray(assignment.courses) ? assignment.courses[0] : assignment.courses)?.teacher_id
    : null

  if (courseTeacherId !== TEACHER_ID) {
    throw new Error('Not authorized to remove this resource')
  }

  await db.from('resources').delete().eq('id', resourceId).throwOnError()
}
