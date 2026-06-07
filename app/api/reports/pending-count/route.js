export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';
import { isProjectManager } from '@/lib/roles';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const count = await prisma.report.count({
      where: { status: { in: ['submitted', 'pending_approval'] } },
    });

    return json({ count, canApprove: isProjectManager(auth.user) });
  } catch (err) {
    return error('Failed to load pending count', 500);
  }
}
