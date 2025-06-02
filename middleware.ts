import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Refresh session
  const { data: { session } } = await supabase.auth.getSession()


  return res
}

export const config = {
  matcher: ['/login', '/dashboard/:path*']
} 