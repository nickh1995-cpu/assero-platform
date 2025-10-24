import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)
  }

  // Redirect to dashboard after successful email confirmation
  const isLocalhost = requestUrl.hostname === 'localhost'
  const redirectUrl = isLocalhost 
    ? `${requestUrl.origin}/dashboard`
    : 'https://assero.io/dashboard'
  return NextResponse.redirect(redirectUrl)
}
