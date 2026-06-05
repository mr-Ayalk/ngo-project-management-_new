import { NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const PUBLIC_API = ['/api/auth/login'];
const PUBLIC_PAGES = ['/login'];

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === 'production') return null;
    return new TextEncoder().encode('dev-only-secret-not-for-production');
  }
  return new TextEncoder().encode(secret);
}

async function verifyToken(token) {
  const secret = getSecret();
  if (!secret) return null;
  try {
    const { payload } = await jwtVerify(token, secret);
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (pathname.startsWith('/api/')) {
    if (PUBLIC_API.some((p) => pathname === p)) {
      return NextResponse.next();
    }

    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await verifyToken(token);
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', user.id);
    requestHeaders.set('x-user-role', user.role);

    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (PUBLIC_PAGES.includes(pathname)) {
    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*', '/dashboard/:path*'],
};
