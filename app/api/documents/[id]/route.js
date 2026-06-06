export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth, requireManager } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { unlink } from 'fs/promises';
import path from 'path';

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const doc = await prisma.document.findUnique({ where: { id: params.id } });
    if (!doc) return error('Document not found', 404);

    if (doc.url?.startsWith('/uploads/')) {
      try {
        await unlink(path.join(process.cwd(), 'public', doc.url));
      } catch {
        /* file may already be removed */
      }
    }

    await prisma.document.delete({ where: { id: params.id } });

    await logActivity({
      userId: auth.user.id,
      action: 'deleted',
      entity: 'document',
      entityId: doc.id,
      description: `Deleted document "${doc.name}"`,
      projectId: doc.projectId || undefined,
    });

    return json({ success: true });
  } catch (err) {
    console.error('Document DELETE error:', err);
    return error('Failed to delete document', 500);
  }
}
