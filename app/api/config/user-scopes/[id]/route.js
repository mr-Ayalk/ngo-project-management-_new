export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireManager } from '@/lib/api-utils';

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    await prisma.userScopeMapping.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch {
    return error('Failed to delete mapping', 500);
  }
}
