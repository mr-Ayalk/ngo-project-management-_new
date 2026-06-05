export const dynamic = 'force-dynamic';

import { verifyPassword, signJWT } from '@/lib/auth';
import prisma from '@/lib/db';

export async function POST(req) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return Response.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    const ok = await verifyPassword(password, user.password);
    if (!ok) return Response.json({ error: 'Invalid credentials' }, { status: 401 });

    const token = await signJWT({ id: user.id, email: user.email, name: user.name, role: user.role });

    // update lastLogin
    await prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } });

    return Response.json({
      token,
      user: { id: user.id, email: user.email, name: user.name, role: user.role, staffRole: user.staffRole },
    });
  } catch (err) {
    console.error('Login error', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
