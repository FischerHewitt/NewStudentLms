import { createClient } from '@supabase/supabase-js'

/**
 * Server-side Supabase client using the service role key.
 * Use ONLY in Server Actions and API routes — never import in Client Components.
 * The service role key bypasses RLS. This is acceptable for the hackathon MVP
 * (see docs/context/security.md). Add real RLS + per-user auth post-hackathon.
 */
export function createServerClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}
