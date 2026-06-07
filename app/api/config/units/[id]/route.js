export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';

export async function PUT(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const body = await parseBody(req);
    const unit = await prisma.orgUnit.update({
      where: { id: params.id },
      data: {
        name: body.name?.trim(),
        code: body.code?.trim(),
        description: body.description?.trim(),
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      },
    });
    return json(unit);
  } catch {
    return error('Failed to update unit', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    await prisma.orgUnit.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch {
    return error('Failed to delete unit', 500);
  }
}
