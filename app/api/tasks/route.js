export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody } from '@/lib/api-utils';

const COLUMN_MAP = { todo: 'To Do', in_progress: 'In Progress', completed: 'Completed' };

function formatTask(t) {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    project: t.project.name,
    projectId: t.projectId,
    priority: t.priority,
    status: t.status,
    column: t.status,
    dueDate: t.dueDate,
    date: t.dueDate
      ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      : '',
    assignee: t.assignee ? { id: t.assignee.id, name: t.assignee.name } : null,
    done: t.status === 'completed',
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const projectId = searchParams.get('projectId');

    const where = {};
    if (status) where.status = status;
    if (projectId) where.projectId = projectId;

    const tasks = await prisma.task.findMany({
      where,
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
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
    const body = await parseBody(req);
    if (!body?.title || !body?.projectId) return error('Title and project are required');

    const task = await prisma.task.create({
      data: {
        title: body.title,
        description: body.description,
        status: body.status || 'todo',
        priority: body.priority || 'medium',
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        projectId: body.projectId,
        assigneeId: body.assigneeId || null,
      },
      include: {
        project: { select: { name: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return json(formatTask(task), 201);
  } catch (err) {
    console.error('Tasks POST error:', err);
    return error('Failed to create task', 500);
  }
}
