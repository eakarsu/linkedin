import { getToken } from 'next-auth/jwt';
import { NextResponse, type NextRequest } from 'next/server';

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  const isAuthPage = request.nextUrl.pathname.startsWith('/login')
    || request.nextUrl.pathname.startsWith('/signup');

  if (!token && !isAuthPage) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (token && isAuthPage) {
    return NextResponse.redirect(new URL('/', request.url));
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
