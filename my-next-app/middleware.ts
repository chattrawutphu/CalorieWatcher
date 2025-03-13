import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclude API routes and next-auth routes from middleware processing
  if (pathname.startsWith('/api/') || pathname.includes('/api/auth/')) {
    return NextResponse.next();
  }

  try {
    // Check if token exists with improved options
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
      secureCookie: process.env.NODE_ENV === 'production',
    });
    
    const isAuthenticated = !!token;
    
    // Handle homepage route
    if (pathname === '/') {
      // If authenticated, redirect to dashboard
      if (isAuthenticated) {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
      // If not authenticated, redirect to login
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    // Public routes that don't require authentication
    if (pathname.startsWith('/auth/') || pathname.includes('_next') || pathname.includes('favicon.ico')) {
      return NextResponse.next();
    }
    
    // Protect main routes
    if (pathname.startsWith('/(main)') && !isAuthenticated) {
      // Redirect unauthenticated users to sign in page
      return NextResponse.redirect(new URL('/auth/signin', request.url));
    }
    
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware authentication error:', error);
    // In case of error, allow the request to proceed and let client-side auth handle it
    return NextResponse.next();
  }
}

// Specify the paths that this middleware will run on
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
} 