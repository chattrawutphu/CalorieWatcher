import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if token exists
  const token = await getToken({ 
    req: request,
    secret: process.env.NEXTAUTH_SECRET 
  })
  
  const isAuthenticated = !!token
  
  // Handle homepage route
  if (pathname === '/') {
    // If authenticated, redirect to dashboard
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }
    // If not authenticated, redirect to login
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }

  // Protect main routes
  if (pathname.startsWith('/(main)') && !isAuthenticated) {
    return NextResponse.redirect(new URL('/auth/signin', request.url))
  }
  
  return NextResponse.next()
}

// Specify the paths that this middleware will run on
export const config = {
  matcher: [
    '/',
    '/(main)/:path*'
  ],
} 