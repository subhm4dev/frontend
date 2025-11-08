import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * API Route: Get Access Token
 * 
 * Reads accessToken cookie and returns it to the client.
 * This allows the API client to send the token in Authorization header.
 * 
 * Note: This exposes the token to client-side JavaScript, but it's necessary
 * because the backend services expect the token in the Authorization header,
 * not just in cookies. The token is already accessible via cookies, so this
 * doesn't introduce additional security risk.
 */
export async function GET() {
  try {
    // Read accessToken cookie (set by backend)
    const cookieStore = await cookies();
    const accessToken = cookieStore.get('accessToken')?.value;
    
    if (accessToken) {
      return NextResponse.json({
        accessToken,
        hasToken: true,
      });
    } else {
      return NextResponse.json({
        accessToken: null,
        hasToken: false,
      });
    }
  } catch (error) {
    
    return NextResponse.json(
      {
        accessToken: null,
        hasToken: false,
        error: 'Failed to get token',
      },
      { status: 500 }
    );
  }
}

