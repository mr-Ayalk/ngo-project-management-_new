export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';

export async function DELETE(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const message = await prisma.message.findUnique({ where: { id: params.id } });
    if (!message) return error('Message not found', 404);

    const canDelete =
      message.senderId === auth.user.id ||
      ['admin', 'manager', 'project_manager'].includes(auth.user.role);

    if (!canDelete) return error('Forbidden', 403);

    await prisma.message.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch (err) {
    console.error('Message DELETE error:', err);
    return error('Failed to delete message', 500);
  }
}
