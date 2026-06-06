import { SignJWT, jwtVerify } from 'jose';

export function getJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();
  if (!secret) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('JWT_SECRET environment variable is required in production');
    }
    return new TextEncoder().encode('dev-only-secret-not-for-production');
  }
  return new TextEncoder().encode(secret);
}

export async function signJWT(payload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(getJwtSecret());
}

export async function verifyJWT(token) {
  if (!token || typeof token !== 'string') return null;
  const normalized = token.trim();
  if (!normalized) return null;
  try {
    const verified = await jwtVerify(normalized, getJwtSecret());
    return verified.payload;
  } catch {
    return null;
  }
}

export function extractBearerToken(req) {
  const authHeader = req.headers.get('authorization');
  if (!authHeader) return null;
  const match = authHeader.match(/^Bearer\s+(.+)$/i);
  return match?.[1]?.trim() || null;
}
