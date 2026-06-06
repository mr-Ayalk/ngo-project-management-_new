import bcrypt from 'bcryptjs';
import { signJWT, verifyJWT } from './jwt';

export { signJWT, verifyJWT };

export async function hashPassword(password) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password, hashedPassword) {
  return bcrypt.compare(password, hashedPassword);
}
