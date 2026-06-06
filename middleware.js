import { NextResponse } from 'next/server';
import { verifyJWT, extractBearerToken } from '@/lib/jwt';

const PUBLIC_API_PREFIXES = ['/api/auth/login', '/api/auth/signup'];
const SELF_AUTH_API_PREFIXES = ['/api/uploadthing'];

function isPublicApi(pathname) {
  return PUBLIC_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

function isSelfAuthApi(pathname) {
  return SELF_AUTH_API_PREFIXES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  if (!pathname.startsWith('/api/')) {
    return NextResponse.next();
  }

  if (isPublicApi(pathname) || isSelfAuthApi(pathname)) {
    return NextResponse.next();
  }

  const token = extractBearerToken(request);

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await verifyJWT(token);
  if (!user) {
    return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-user-id', String(user.id));
  requestHeaders.set('x-user-role', String(user.role));

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: ['/api/:path*'],
};
