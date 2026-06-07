export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, requireManager } from '@/lib/api-utils';
import { assertProjectAccess } from '@/lib/project-access';
import { formatPlanActivity } from '@/lib/planning';

export async function PUT(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const existing = await prisma.planActivity.findUnique({ where: { id: params.id } });
    if (!existing) return error('Activity not found', 404);

    const ok = await assertProjectAccess(auth.user, existing.projectId);
    if (!ok) return error('Access denied', 403);

    const body = await parseBody(req);
    const isAssignee = existing.assigneeId === auth.user.id;
    const isManager = ['admin', 'manager', 'project_manager'].includes(auth.user.role);

    if (!isManager && !isAssignee) return error('Access denied', 403);

    const data = {};
    if (isManager) {
      if (body.title !== undefined) data.title = body.title.trim();
      if (body.description !== undefined) data.description = body.description?.trim() || null;
      if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId || null;
      if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
      if (body.endDate !== undefined) data.endDate = body.endDate ? new Date(body.endDate) : null;
      if (body.priority !== undefined) data.priority = body.priority;
      if (body.location !== undefined) data.location = body.location?.trim() || null;
      if (body.budget !== undefined) data.budget = body.budget != null ? Number(body.budget) : null;
      if (body.outputId !== undefined) data.outputId = body.outputId || null;
    }
    if (body.status !== undefined) data.status = body.status;
    if (body.progress !== undefined) data.progress = Number(body.progress);

    const activity = await prisma.planActivity.update({
      where: { id: params.id },
      data,
      include: {
        project: { select: { name: true } },
        output: { select: { title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return json(formatPlanActivity(activity));
  } catch (err) {
    return error('Failed to update activity', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const existing = await prisma.planActivity.findUnique({ where: { id: params.id } });
    if (!existing) return error('Activity not found', 404);

    const ok = await assertProjectAccess(auth.user, existing.projectId);
    if (!ok) return error('Access denied', 403);

    await prisma.planActivity.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch (err) {
    return error('Failed to delete activity', 500);
  }
}
