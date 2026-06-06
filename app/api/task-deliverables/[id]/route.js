export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';

export async function DELETE(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { id } = params;
    const existing = await prisma.taskDeliverable.findUnique({ where: { id } });
    if (!existing) return error('Deliverable not found', 404);

    await prisma.taskDeliverable.delete({ where: { id } });

    return json({ success: true });
  } catch (err) {
    console.error('TaskDeliverable DELETE error:', err);
    return error('Failed to delete deliverable', 500);
  }
}
