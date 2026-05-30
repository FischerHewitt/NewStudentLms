/**
 * Minimal chainable Supabase mock for integration tests.
 *
 * Supports the exact query patterns used in app/actions/speedgrader.ts:
 *   from(table).select(cols).eq(col, val).single()          → select + filter
 *   from(table).select(cols).eq(...).not(...).single()      → select + multi-filter
 *   from(table).insert(data).select(cols).single()          → insert + return row
 *   from(table).update(data).eq(col, val)                   → update in-place
 *
 * The _store property is exposed so tests can assert on DB state after actions run.
 *
 * Usage:
 *   const db = createMockDb({
 *     submissions: [{ id: 'sub-1', body: '...', ... }],
 *     assignments: [{ id: 'asgn-1', title: '...', ... }],
 *     rubrics:     [{ assignment_id: 'asgn-1', criteria: [...] }],
 *     grades:      [],
 *   })
 *   // in vi.mock factory: createServerClient: () => db
 */

type Row = Record<string, unknown>
export type DbStore = Record<string, Row[]>

/**
 * Builds a mutable filter chain for SELECT queries.
 * Each .eq() / .not() call narrows the result set.
 */
function makeSelectChain(tableRows: Row[]) {
  // Start with a shallow copy so multiple queries on the same table are independent.
  let filtered = [...tableRows]

  const chain = {
    eq(col: string, val: unknown) {
      filtered = filtered.filter((r) => r[col] === val)
      return chain
    },
    not(col: string, op: string, val: unknown) {
      if (op === 'is') {
        filtered = filtered.filter((r) => r[col] !== val)
      }
      return chain
    },
    single(): Promise<{ data: Row | null; error: unknown }> {
      const row = filtered[0] ?? null
      return Promise.resolve({
        data: row,
        // Mimic Supabase PGRST116 "no rows found" error so callers that check
        // `if (!data)` behave correctly even though we return error: non-null.
        error: row ? null : { code: 'PGRST116', message: 'Row not found' },
      })
    },
  }
  return chain
}

export function createMockDb(store: DbStore = {}) {
  let idCounter = 0
  const nextId = () => `mock-${String(++idCounter).padStart(4, '0')}`

  return {
    /** Exposed so tests can inspect DB state after an action runs. */
    _store: store,

    from(table: string) {
      // Capture a reference to the table array at call time so inserts/updates
      // made mid-test are visible to subsequent queries on the same table.
      const rows = (): Row[] => store[table] ?? []

      return {
        select() {
          return makeSelectChain(rows())
        },

        insert(data: Row | Row[]) {
          const newRows = (Array.isArray(data) ? data : [data]).map((r) => ({
            // Supabase auto-fills these columns; pre-fill with sane defaults so
            // the server action can destructure them without null-checks failing.
            id: nextId(),
            final_score: null,
            final_feedback: null,
            approved_at: null,
            approved_by: null,
            ...r,
          }))
          if (!store[table]) store[table] = []
          store[table].push(...newRows)
          const last = newRows[newRows.length - 1]

          return {
            select() {
              return {
                single(): Promise<{ data: Row | null; error: unknown }> {
                  return Promise.resolve({ data: last, error: null })
                },
              }
            },
          }
        },

        update(data: Row) {
          return {
            eq(col: string, val: unknown): Promise<{ error: unknown }> {
              const tableRows = store[table] ?? []
              tableRows.forEach((r) => {
                if (r[col] === val) Object.assign(r, data)
              })
              return Promise.resolve({ error: null })
            },
          }
        },
      }
    },
  }
}

export type MockDb = ReturnType<typeof createMockDb>
