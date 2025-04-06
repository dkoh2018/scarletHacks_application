import { NextResponse } from 'next/server';

export function middleware(request) {
  if (request.nextUrl.pathname === '/api/auth/session') {
    // For session endpoint requests, intercept any errors
    try {
      return NextResponse.next();
    } catch (error) {
      console.error('Session middleware error:', error);
      
      // Return a valid empty session to prevent client-side errors
      return NextResponse.json({ 
        user: null,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() 
      }, { status: 200 });
    }
  }
  
  return NextResponse.next();
}

// Only run middleware for session endpoint
export const config = {
  matcher: '/api/auth/session',
};
