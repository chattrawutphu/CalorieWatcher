import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simple middleware that skips authentication for now
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Exclude API routes and next-auth routes from middleware processing
  if (pathname.startsWith('/api/') || pathname.includes('/api/auth/')) {
    return NextResponse.next();
  }

  // Handle homepage route
  if (pathname === '/') {
    // Just redirect to login
    return NextResponse.redirect(new URL('/auth/signin', request.url));
  }
  
  // Public routes that don't require authentication
  if (pathname.startsWith('/auth/') || pathname.includes('_next') || pathname.includes('favicon.ico')) {
    return NextResponse.next();
  }

  // Allow requests to proceed for now
  return NextResponse.next();
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