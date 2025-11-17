import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const isAuthPage = request.nextUrl.pathname.startsWith('/login') ||
                     request.nextUrl.pathname.startsWith('/signup');

  if (!token && !isAuthPage) {
    // Redirect to login if not authenticated
    const url = new URL('/login', request.url);
    return NextResponse.redirect(url);
  }

  if (token && isAuthPage) {
    // Redirect to home if already authenticated
    const url = new URL('/', request.url);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/profile/:path*',
    '/network/:path*',
    '/jobs/:path*',
    '/messaging/:path*',
    '/notifications/:path*',
    '/login',
    '/signup',
  ],
};
