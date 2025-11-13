import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createServerClient } from '@supabase/ssr'

const PROTECTED_ROUTES = [
  "/dealroom",
  "/wallet",
  "/valuation",
  "/list/create",
];

export async function middleware(request: NextRequest) {
  // Handle CORS preflight requests
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    })
  }

  // Create response to modify headers
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const { pathname } = request.nextUrl;
  const isProtectedRoute = PROTECTED_ROUTES.some((route) => {
    if (route === pathname) return true;
    return pathname.startsWith(`${route}/`);
  });

  let session = null;

  // Setup Supabase client for session refresh
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
        cookies: {
          get(name: string) {
            return request.cookies.get(name)?.value
          },
          set(name: string, value: string, options: any) {
            request.cookies.set({
              name,
              value,
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value,
              ...options,
            })
          },
          remove(name: string, options: any) {
            request.cookies.set({
              name,
              value: '',
              ...options,
            })
            response = NextResponse.next({
              request: {
                headers: request.headers,
              },
            })
            response.cookies.set({
              name,
              value: '',
              ...options,
            })
          },
        },
      })

      // Refresh session if user is authenticated
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
      
      if (currentSession && !sessionError) {
        session = currentSession;
        // Refresh the session to update cookies and keep user logged in
        console.log('Middleware: Refreshing session for user', currentSession.user.id);
        await supabase.auth.getUser();
      } else if (sessionError) {
        console.warn('Middleware: Session error', sessionError.message);
      }
    }
  } catch (error) {
    // If session refresh fails, continue anyway
    console.warn('Middleware session refresh failed:', error)
  }

  if (isProtectedRoute && !session) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/sign-in';
    redirectUrl.searchParams.set('redirect_to', `${pathname}${request.nextUrl.search}`);
    return NextResponse.redirect(redirectUrl);
  }

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}