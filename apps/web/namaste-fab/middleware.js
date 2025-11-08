
import { NextResponse } from 'next/server';

/**
 * Next.js Middleware
 * 
 * Reads authentication cookies and passes auth state to client components.
 * Cookies are set by backend (IAM service) and sent automatically by browser.
 */
export function middleware(request) {
  const response = NextResponse.next();
  
  // Read accessToken cookie (set by backend)
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Pass auth state to client via response header
  // Client components can read this header to know auth status
  if (accessToken) {
    response.headers.set('X-Auth-Status', 'authenticated');
  } else {
    response.headers.set('X-Auth-Status', 'unauthenticated');
  }
  
  return response;
}

// Run middleware on all routes except static files and API routes
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