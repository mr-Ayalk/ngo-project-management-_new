export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error } from '@/lib/api-utils';

export async function GET() {
  try {
    const activities = await prisma.activity.findMany({
      take: 20,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { name: true } },
        project: { select: { name: true } },
      },
    });

    return json(activities);
  } catch (err) {
    return error('Failed to load activities', 500);
  }
}
