export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { assertProjectAccess, assertProjectManageAccess } from '@/lib/project-access';
import { isDean } from '@/lib/roles';

function formatShort(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export async function GET(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
    if (!task) return error('Task not found', 404);

    const hasAccess = await assertProjectAccess(auth.user, task.projectId);
    if (!hasAccess) return error('Access denied', 403);

    return json(task);
  } catch (err) {
    return error('Failed to load task', 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const existing = await prisma.task.findUnique({
      where: { id: params.id },
      select: { projectId: true, assigneeId: true },
    });
    if (!existing) return error('Task not found', 404);

    const isAssignee = existing.assigneeId === user.id;
    const canManage = await assertProjectManageAccess(auth.user, existing.projectId);
    if (!canManage && !isAssignee) return error('Access denied', 403);

    const body = await parseBody(req);
    const data = {};
    if (canManage || isDean(user)) {
      if (body.title) data.title = body.title;
      if (body.description !== undefined) data.description = body.description;
      if (body.status) data.status = body.status;
      if (body.priority) data.priority = body.priority;
      if (body.startDate !== undefined) data.startDate = body.startDate ? new Date(body.startDate) : null;
      if (body.endDate !== undefined) {
        data.endDate = body.endDate ? new Date(body.endDate) : null;
        data.dueDate = body.endDate ? new Date(body.endDate) : null;
      }
      if (body.dueDate !== undefined && body.endDate === undefined) {
        data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
        data.endDate = body.dueDate ? new Date(body.dueDate) : null;
      }
      if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId;
    } else if (isAssignee) {
      if (body.status) data.status = body.status;
      if (body.description !== undefined) data.description = body.description;
    }

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'updated',
      entity: 'task',
      entityId: task.id,
      description: `Updated task "${task.title}"`,
      projectId: task.projectId,
      taskId: task.id,
    });

    const start = formatShort(task.startDate);
    const end = formatShort(task.endDate || task.dueDate);

    return json({
      id: task.id,
      title: task.title,
      project: task.project.name,
      priority: task.priority,
      status: task.status,
      startDate: task.startDate,
      endDate: task.endDate,
      dueDate: task.dueDate,
      date: start && end ? `${start} – ${end}` : end || start || '',
      done: task.status === 'completed',
    });
  } catch (err) {
    console.error('Task PUT error:', err);
    return error('Failed to update task', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const task = await prisma.task.findUnique({
      where: { id: params.id },
      select: { id: true, title: true, projectId: true },
    });
    if (!task) return error('Task not found', 404);

    const canManage = await assertProjectManageAccess(auth.user, task.projectId);
    if (!canManage) return error('Access denied', 403);

    await prisma.task.delete({ where: { id: params.id } });

    await logActivity({
      userId: user.id,
      action: 'deleted',
      entity: 'task',
      entityId: task.id,
      description: `Deleted task "${task.title}"`,
      projectId: task.projectId,
      taskId: task.id,
    });

    return json({ success: true });
  } catch (err) {
    return error('Failed to delete task', 500);
  }
}
