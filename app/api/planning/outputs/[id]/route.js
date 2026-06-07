export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';
import { assertProjectAccess } from '@/lib/project-access';
import { formatOutput } from '@/lib/planning';

export async function PUT(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const existing = await prisma.planOutput.findUnique({ where: { id: params.id } });
    if (!existing) return error('Output not found', 404);

    const ok = await assertProjectAccess(auth.user, existing.projectId);
    if (!ok) return error('Access denied', 403);

    const body = await parseBody(req);
    const data = {};
    if (body.title !== undefined) data.title = body.title.trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.deliverable !== undefined) data.deliverable = body.deliverable?.trim() || null;
    if (body.targetQty !== undefined) data.targetQty = body.targetQty != null ? Number(body.targetQty) : null;
    if (body.achievedQty !== undefined) data.achievedQty = body.achievedQty != null ? Number(body.achievedQty) : null;
    if (body.unit !== undefined) data.unit = body.unit?.trim() || null;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.status !== undefined) data.status = body.status;
    if (body.progress !== undefined) data.progress = Number(body.progress);
    if (body.outcomeId !== undefined) data.outcomeId = body.outcomeId;

    const output = await prisma.planOutput.update({
      where: { id: params.id },
      data,
      include: {
        project: { select: { name: true } },
        outcome: { select: { title: true } },
        _count: { select: { planActivities: true } },
      },
    });

    return json(formatOutput(output));
  } catch (err) {
    return error('Failed to update output', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const existing = await prisma.planOutput.findUnique({ where: { id: params.id } });
    if (!existing) return error('Output not found', 404);

    const ok = await assertProjectAccess(auth.user, existing.projectId);
    if (!ok) return error('Access denied', 403);

    await prisma.planOutput.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch (err) {
    return error('Failed to delete output', 500);
  }
}
