import { verifyJWT } from './jwt';

export async function withAuth(req) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.match(/^Bearer\s+(.+)$/i)?.[1]?.trim();

  if (!token) {
    return { error: 'Unauthorized', status: 401 };
  }

  const user = await verifyJWT(token);
  if (!user) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  return { user };
}

export function withRole(...roles) {
  return async (req) => {
    const auth = await withAuth(req);
    if (auth.error) return auth;

    if (!roles.includes(auth.user.role)) {
      return { error: 'Forbidden', status: 403 };
    }

    return { user: auth.user };
  };
}
