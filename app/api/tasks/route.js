export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { assertProjectAccess, assertProjectManageAccess } from '@/lib/project-access';

const COLUMN_MAP = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' };

function formatShort(date) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatTask(t) {
  const start = formatShort(t.startDate);
  const end = formatShort(t.endDate || t.dueDate);
  const dateRange = start && end ? `${start} – ${end}` : end || start || '';
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    project: t.project.name,
    projectId: t.projectId,
    priority: t.priority,
    status: t.status,
    column: t.status,
    startDate: t.startDate,
    endDate: t.endDate,
    dueDate: t.dueDate || t.endDate,
    date: dateRange,
    dateRange,
    assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name } : null,
    done: t.status === 'completed',
  };
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');

    const where = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    if (projectId) {
      const hasAccess = await assertProjectAccess(auth.user, projectId);
      if (!hasAccess) return error('You do not have access to this project', 403);
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: [{ startDate: 'asc' }, { endDate: 'asc' }],
    });

    const columns = {
      todo: tasks.filter((t) => t.status === 'todo').map(formatTask),
      in_progress: tasks.filter((t) => t.status === 'in_progress').map(formatTask),
      completed: tasks.filter((t) => t.status === 'completed').map(formatTask),
    };

    return json({
      tasks: tasks.map(formatTask),
      columns,
      columnLabels: COLUMN_MAP,
      counts: {
        todo: columns.todo.length,
        in_progress: columns.in_progress.length,
        completed: columns.completed.length,
      },
    });
  } catch (err) {
    console.error('Tasks GET error:', err);
    return error('Failed to load tasks', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    if (!body?.title || !body?.projectId) return error('Title and project are required');

    const canManage = await assertProjectManageAccess(auth.user, body.projectId);
    if (!canManage) return error('You do not have permission to create tasks on this project', 403);

    const endDate = body.endDate || body.dueDate;

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        dueDate: endDate ? new Date(endDate) : null,
        projectId: body.projectId,
        assigneeId: body.assigneeId || null,
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'created',
      entity: 'task',
      entityId: task.id,
      description: `Created task "${task.title}"`,
      projectId: task.projectId,
      taskId: task.id,
    });

    return json(formatTask(task), 201);
  } catch (err) {
    console.error('Tasks POST error:', err);
    return error('Failed to create task', 500);
  }
}
