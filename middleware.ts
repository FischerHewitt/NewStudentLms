import { type NextRequest, NextResponse } from 'next/server'
import { createMiddlewareClient } from '@/lib/supabase/middleware-client'

const PUBLIC_PATHS = ['/login', '/auth/callback', '/landing', '/about']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Always allow Next.js internals, static files, and API routes through
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api/') ||
    pathname.match(/\.(?:ico|png|jpg|jpeg|svg|webp|gif|woff2?)$/)
  ) {
    return NextResponse.next()
  }

  const { supabase, response } = createMiddlewareClient(request)

  // Refresh session if expired — required by @supabase/ssr
  const { data: { session } } = await supabase.auth.getSession()

  const isPublic = PUBLIC_PATHS.includes(pathname)

  // Skip auth in development so the preview panel and hot-reload work without a session
  if (process.env.NODE_ENV === 'development') {
    return response
  }

  // No session → send to login (preserve intended destination)
  if (!session && !isPublic) {
    const loginUrl = request.nextUrl.clone()
    loginUrl.pathname = '/login'
    return NextResponse.redirect(loginUrl)
  }

  // Already signed in → skip the login page
  if (session && isPublic) {
    const homeUrl = request.nextUrl.clone()
    homeUrl.pathname = '/'
    return NextResponse.redirect(homeUrl)
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all paths except Next.js internals and static assets.
     * API routes are excluded above inside the function body.
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
