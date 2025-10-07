import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Protected routes that require authentication
  const protectedRoutes = ['/dashboard', '/rewards', '/redeem'];
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  
  // For now, let the frontend handle authentication checks
  // The frontend will redirect unauthenticated users to login
  // This middleware will be enhanced later to work with localStorage
  
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
