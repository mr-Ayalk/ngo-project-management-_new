export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody } from '@/lib/api-utils';

export async function GET(req, { params }) {
  try {
    const task = await prisma.task.findUnique({
      where: { id: params.id },
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });
    if (!task) return error('Task not found', 404);
    return json(task);
  } catch (err) {
    return error('Failed to load task', 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await parseBody(req);
    const data = {};
    if (body.title) data.title = body.title;
    if (body.description !== undefined) data.description = body.description;
    if (body.status) data.status = body.status;
    if (body.priority) data.priority = body.priority;
    if (body.dueDate !== undefined) data.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.assigneeId !== undefined) data.assigneeId = body.assigneeId;

    const task = await prisma.task.update({
      where: { id: params.id },
      data,
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return json({
      id: task.id,
      title: task.title,
      project: task.project.name,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate,
      date: task.dueDate
        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
        : '',
      done: task.status === 'completed',
    });
  } catch (err) {
    console.error('Task PUT error:', err);
    return error('Failed to update task', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.task.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch (err) {
    return error('Failed to delete task', 500);
  }
}
