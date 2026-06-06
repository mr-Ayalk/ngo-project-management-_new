import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';
import { PUBLIC_USER_SELECT } from '@/lib/user-public';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const user = await prisma.user.findUnique({
      where: { id: auth.user.id },
      select: PUBLIC_USER_SELECT,
    });
    if (!user) return error('User not found', 404);

    return json({ user });
  } catch (err) {
    console.error('Me error', err);
    return error('Internal server error', 500);
  }
}
