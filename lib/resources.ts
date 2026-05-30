import type { ResourceType } from '@/lib/course-schema'

export type Resource = {
  id: string
  assignment_id: string
  title: string
  type: ResourceType
  url: string
  created_at: string
}

type ResourceInput = { title: string; type: string; url: string }
type ValidationResult = { ok: true } | { ok: false; error: string }

const VALID_TYPES: ReadonlySet<string> = new Set<ResourceType>(['file', 'link'])

// Only allow safe URL schemes. Relative paths (starting with /) are also fine
// for internally-served storage URLs. This blocks javascript:, data:, vbscript:, etc.
const SAFE_URL_RE = /^(https?:\/\/|\/)/i

export function validateResource(input: ResourceInput): ValidationResult {
  if (!input.title.trim()) return { ok: false, error: 'Title is required' }
  if (!input.url.trim()) return { ok: false, error: 'URL is required' }
  if (!VALID_TYPES.has(input.type)) return { ok: false, error: 'Type must be file or link' }
  if (!SAFE_URL_RE.test(input.url.trim())) {
    return { ok: false, error: 'URL must start with https://, http://, or /' }
  }
  return { ok: true }
}

export function groupResourcesByAssignment(resources: Resource[]): Record<string, Resource[]> {
  const groups: Record<string, Resource[]> = {}
  for (const r of resources) {
    groups[r.assignment_id] ??= []
    groups[r.assignment_id].push(r)
  }
  return groups
}
