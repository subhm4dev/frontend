import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API Route: Check Authentication Status
 * 
 * Reads accessToken cookie and returns auth status.
 * Client components can't read httpOnly cookies, so they call this API.
 */
export async function GET() {
  try {
    // Read accessToken cookie (set by backend)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (accessToken) {
      // Token exists - user is authenticated
      // Note: We're not validating the token here, just checking if cookie exists
      // Gateway will validate the token when making API calls
      return NextResponse.json({
        isAuthenticated: true,
        hasToken: true,
      });
    } else {
      // No token - user is not authenticated
      return NextResponse.json({
        isAuthenticated: false,
        hasToken: false,
      });
    }
  } catch (error) {
    console.error('Auth status check error:', error);
    return NextResponse.json(
      {
        isAuthenticated: false,
        hasToken: false,
        error: 'Failed to check auth status',
      },
      { status: 500 }
    );
  }
}