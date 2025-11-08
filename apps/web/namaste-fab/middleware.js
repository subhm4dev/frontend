import { NextResponse } from 'next/server';

/**
 * Decode JWT token payload (without validation)
 * JWT format: header.payload.signature
 * We only decode the payload to extract claims like roles
 */
function decodeJwtPayload(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    // Decode base64url encoded payload
    const payload = parts[1];
    // Replace URL-safe base64 characters
    const base64 = payload.replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const decoded = Buffer.from(padded, 'base64').toString('utf-8');
    
    return JSON.parse(decoded);
  } catch (error) {
    return null;
  }
}

/**
 * Next.js Middleware
 * 
 * Reads authentication cookies and:
 * 1. Protects admin routes (requires ADMIN role)
 * 2. Passes auth state to client components
 */
export function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Read accessToken cookie (set by backend)
  const accessToken = request.cookies.get('accessToken')?.value;
  
  // Check if accessing admin routes
  if (pathname.startsWith('/admin')) {
    if (!accessToken) {
      // Not authenticated - redirect to home with login prompt
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('login', 'true');
      return NextResponse.redirect(url);
    }
    
    // Decode JWT to check roles
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      const roles = payload.roles || (payload.role ? [payload.role] : []);
      const isAdmin = Array.isArray(roles) 
        ? roles.includes('ADMIN') 
        : roles === 'ADMIN';
      
      if (!isAdmin) {
        // Not admin - redirect to home
        const url = request.nextUrl.clone();
        url.pathname = '/';
        return NextResponse.redirect(url);
      }
    } else {
      // Couldn't decode token - redirect to home
      const url = request.nextUrl.clone();
      url.pathname = '/';
      return NextResponse.redirect(url);
    }
  }
  
  const response = NextResponse.next();
  
  // Pass auth state to client via response header
  if (accessToken) {
    response.headers.set('X-Auth-Status', 'authenticated');
    
    // Decode and pass roles
    const payload = decodeJwtPayload(accessToken);
    if (payload) {
      const roles = payload.roles || (payload.role ? [payload.role] : []);
      response.headers.set('X-User-Roles', JSON.stringify(roles));
    }
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