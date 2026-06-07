export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';
import { assertProjectAccess } from '@/lib/project-access';
import { formatOutcome } from '@/lib/planning';

export async function PUT(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const existing = await prisma.planOutcome.findUnique({ where: { id: params.id } });
    if (!existing) return error('Outcome not found', 404);

    const ok = await assertProjectAccess(auth.user, existing.projectId);
    if (!ok) return error('Access denied', 403);

    const body = await parseBody(req);
    const data = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.indicator !== undefined) data.indicator = body.indicator?.trim() || null;
    if (body.targetValue !== undefined) data.targetValue = body.targetValue != null ? Number(body.targetValue) : null;
    if (body.baseline !== undefined) data.baseline = body.baseline != null ? Number(body.baseline) : null;
    if (body.unit !== undefined) data.unit = body.unit?.trim() || null;
    if (body.status !== undefined) data.status = body.status;
    if (body.progress !== undefined) data.progress = Number(body.progress);

    const outcome = await prisma.planOutcome.update({
      where: { id: params.id },
      data,
      include: { project: { select: { name: true } }, _count: { select: { outputs: true } } },
    });

    return json(formatOutcome(outcome));
  } catch (err) {
    return error('Failed to update outcome', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const existing = await prisma.planOutcome.findUnique({ where: { id: params.id } });
    if (!existing) return error('Outcome not found', 404);

    const ok = await assertProjectAccess(auth.user, existing.projectId);
    if (!ok) return error('Access denied', 403);

    await prisma.planOutcome.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch (err) {
    return error('Failed to delete outcome', 500);
  }
}
