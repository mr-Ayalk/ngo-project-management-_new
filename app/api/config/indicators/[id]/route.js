export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';

export async function PUT(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const body = await parseBody(req);
    const indicator = await prisma.programIndicator.update({
      where: { id: params.id },
      data: {
        name: body.name?.trim(),
        code: body.code?.trim(),
        category: body.category?.trim(),
        unit: body.unit?.trim(),
        target: body.target != null ? Number(body.target) : undefined,
        baseline: body.baseline != null ? Number(body.baseline) : undefined,
        description: body.description?.trim(),
        isActive: body.isActive,
      },
    });
    return json(indicator);
  } catch {
    return error('Failed to update indicator', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    await prisma.programIndicator.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch {
    return error('Failed to delete indicator', 500);
  }
}
