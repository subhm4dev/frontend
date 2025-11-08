import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

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
 * API Route: Check Authentication Status
 * 
 * Reads accessToken cookie, decodes JWT to extract roles, and returns auth status.
 * Client components can't read httpOnly cookies, so they call this API.
 */
export async function GET() {
  try {
    // Read accessToken cookie (set by backend)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (accessToken) {
      // Decode JWT to extract roles and user info
      const payload = decodeJwtPayload(accessToken);
      
      if (payload) {
        // Extract roles from JWT claims
        // Backend stores roles in 'roles' claim as array
        const roles = payload.roles || (payload.role ? [payload.role] : []);
        const userId = payload.sub || payload.userId || payload.id;
        const tenantId = payload.tenantId;
        
        return NextResponse.json({
          isAuthenticated: true,
          hasToken: true,
          roles: Array.isArray(roles) ? roles : [roles],
          userId,
          tenantId,
        });
      } else {
        // Token exists but couldn't decode - still authenticated
        return NextResponse.json({
          isAuthenticated: true,
          hasToken: true,
          roles: [],
        });
      }
    } else {
      // No token - user is not authenticated
      return NextResponse.json({
        isAuthenticated: false,
        hasToken: false,
        roles: [],
      });
    }
  } catch (error) {
    
    return NextResponse.json(
      {
        isAuthenticated: false,
        hasToken: false,
        roles: [],
        error: 'Failed to check auth status',
      },
      { status: 500 }
    );
  }
}