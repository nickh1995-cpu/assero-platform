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
  const redirectUrl = process.env.NODE_ENV === 'production' 
    ? 'https://assero.io/dashboard' 
    : `${requestUrl.origin}/dashboard`
  return NextResponse.redirect(redirectUrl)
}
