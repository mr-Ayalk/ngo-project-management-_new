import { verifyJWT } from '@/lib/auth';
import prisma from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const token = req.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const payload = await verifyJWT(token);
    if (!payload) return Response.json({ error: 'Invalid token' }, { status: 401 });

    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { id: true, email: true, name: true, role: true, staffRole: true, avatar: true },
    });
    if (!user) return Response.json({ error: 'User not found' }, { status: 404 });

    return Response.json({ user });
  } catch (err) {
    console.error('Me error', err);
    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
