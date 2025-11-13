import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'
import { getBaseUrl } from '@/lib/utils/url'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    const { error, data } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.session) {
      // User is now logged in via email confirmation
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        // Update profile verification status after email confirmation
        try {
          await supabase
            .from('profiles')
            .update({ 
              is_verified: true,
              verification_date: new Date().toISOString(),
              profile_complete: true
            })
            .eq('id', user.id)
        } catch (profileError) {
          // If profile doesn't exist yet, create it
          console.log('Profile update failed, might need to create profile:', profileError);
        }
      }
      
      // Always redirect to home page after successful email confirmation
      const baseUrl = getBaseUrl()
      return NextResponse.redirect(`${baseUrl}/?verified=true`)
    }
  }

  // If code exchange failed, redirect to home with error
  const baseUrl = getBaseUrl()
  return NextResponse.redirect(`${baseUrl}/?verification_error=true`)
}
