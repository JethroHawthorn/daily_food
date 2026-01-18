import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const userId = request.cookies.get('user_id')?.value;
  const { pathname } = request.nextUrl;

  // Public paths that don't require auth
  const publicPaths = ['/welcome', '/manifest.json', '/favicon.ico', '/sw.js', '/workbox-', '/icon.png', '/apple-icon.png'];
  
  // Check if path is public
  const isPublicPath = publicPaths.some(path => pathname.startsWith(path)) || 
                       pathname.startsWith('/_next') || 
                       pathname.startsWith('/static');

  if (isPublicPath) {
    // If user is logged in and trying to go to welcome, redirect to home
    if (userId && pathname === '/welcome') {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.next();
  }

  // If not logged in, redirect to welcome
  if (!userId) {
    return NextResponse.redirect(new URL('/welcome', request.url));
  }

  return NextResponse.next();
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
};
