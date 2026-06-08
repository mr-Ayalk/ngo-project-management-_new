export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const activities = await prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        project: { select: { id: true, name: true } },
      },
    });

    return json(activities);
  } catch (err) {
    return error('Failed to load activities', 500);
  }
}
