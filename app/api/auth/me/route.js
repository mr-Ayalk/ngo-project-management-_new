import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: { id: true, email: true, name: true, role: true, staffRole: true, avatar: true },
    });
    if (!user) return error('User not found', 404);

    return json({ user });
  } catch (err) {
    console.error('Me error', err);
    return error('Internal server error', 500);
  }
}
