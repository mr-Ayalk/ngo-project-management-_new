import { verifyJWT, extractBearerToken } from './jwt';

export async function verifyTokenFromRequest(req) {
  const token = extractBearerToken(req);
  if (!token) return null;
  return verifyJWT(token);
}
