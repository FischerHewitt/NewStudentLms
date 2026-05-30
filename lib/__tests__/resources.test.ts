import { describe, expect, it } from 'vitest'
import { validateResource, groupResourcesByAssignment } from '@/lib/resources'

describe('validateResource', () => {
  it('passes for a valid file resource', () => {
    expect(validateResource({ title: 'Lecture 1', type: 'file', url: '/storage/lecture1.pdf' })).toEqual({ ok: true })
  })

  it('passes for a valid link resource', () => {
    expect(validateResource({ title: 'Reference', type: 'link', url: 'https://example.com' })).toEqual({ ok: true })
  })

  it('fails when title is empty', () => {
    const r = validateResource({ title: '', type: 'link', url: 'https://example.com' })
    expect(r.ok).toBe(false)
  })

  it('fails when url is empty', () => {
    const r = validateResource({ title: 'Lecture', type: 'file', url: '' })
    expect(r.ok).toBe(false)
  })

  it('fails for unknown type', () => {
    const r = validateResource({ title: 'Lecture', type: 'video' as 'file', url: 'https://x.com' })
    expect(r.ok).toBe(false)
  })

  it('rejects javascript: URLs (XSS)', () => {
    const r = validateResource({ title: 'Evil', type: 'link', url: 'javascript:alert(1)' })
    expect(r.ok).toBe(false)
  })

  it('rejects data: URLs', () => {
    const r = validateResource({ title: 'Evil', type: 'link', url: 'data:text/html,<script>alert(1)</script>' })
    expect(r.ok).toBe(false)
  })

  it('rejects vbscript: URLs', () => {
    const r = validateResource({ title: 'Evil', type: 'link', url: 'vbscript:msgbox(1)' })
    expect(r.ok).toBe(false)
  })

  it('accepts http:// URLs', () => {
    expect(validateResource({ title: 'Ref', type: 'link', url: 'http://example.com' })).toEqual({ ok: true })
  })

  it('accepts storage-relative paths', () => {
    expect(validateResource({ title: 'Slide', type: 'file', url: '/storage/v1/object/public/file.pdf' })).toEqual({ ok: true })
  })
})

describe('groupResourcesByAssignment', () => {
  it('groups resources by assignment_id', () => {
    const resources = [
      { id: '1', assignment_id: 'a1', title: 'Slide 1', type: 'file' as const, url: '/s/1', created_at: '' },
      { id: '2', assignment_id: 'a1', title: 'Link 1', type: 'link' as const, url: 'https://x.com', created_at: '' },
      { id: '3', assignment_id: 'a2', title: 'Slide 2', type: 'file' as const, url: '/s/2', created_at: '' },
    ]
    const grouped = groupResourcesByAssignment(resources)
    expect(grouped['a1']).toHaveLength(2)
    expect(grouped['a2']).toHaveLength(1)
    expect(grouped['a3']).toBeUndefined()
  })

  it('returns empty object for no resources', () => {
    expect(groupResourcesByAssignment([])).toEqual({})
  })
})
