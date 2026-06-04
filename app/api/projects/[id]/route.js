export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate, formatCurrency } from '@/lib/api-utils';

export async function GET(req, { params }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        manager: { select: { id: true, name: true } },
        tasks: { include: { assignee: { select: { name: true } } } },
        budgets: true,
        documents: true,
      },
    });

    if (!project) return error('Project not found', 404);

    const utilization = project.budget > 0 ? Math.round((project.spent / project.budget) * 100) : 0;

    return json({
      id: project.id,
      name: project.name,
      description: project.description || 'A community-focused initiative delivering sustainable impact.',
      status: project.status,
      icon: project.icon,
      progress: project.progress,
      budget: formatCurrency(project.budget),
      spent: formatCurrency(project.spent),
      utilization: `${utilization}%`,
      dueDate: formatDate(project.endDate),
      startDate: formatDate(project.startDate),
      manager: project.manager?.name || 'Jane Smith',
      tasks: project.tasks.map((t) => ({
        id: t.id,
        name: t.title,
        assignee: t.assignee?.name || 'Unassigned',
        status: t.status === 'completed' ? 'Completed' : t.status === 'in_progress' ? 'In Progress' : 'At Risk',
      })),
      budgetCategories: project.budgets.map((b) => ({
        category: b.category.charAt(0).toUpperCase() + b.category.slice(1),
        spent: formatCurrency(b.spent),
        allocated: formatCurrency(b.allocated),
        pct: b.allocated > 0 ? Math.round((b.spent / b.allocated) * 100) : 0,
      })),
      documents: project.documents,
    });
  } catch (err) {
    console.error('Project GET error:', err);
    return error('Failed to load project', 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const body = await parseBody(req);
    const data = {};
    if (body.name) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.status) data.status = body.status;
    if (body.icon) data.icon = body.icon;
    if (body.progress !== undefined) data.progress = body.progress;
    if (body.budget !== undefined) data.budget = body.budget;
    if (body.spent !== undefined) data.spent = body.spent;
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: { manager: { select: { id: true, name: true } } },
    });

    return json(project);
  } catch (err) {
    console.error('Project PUT error:', err);
    return error('Failed to update project', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    await prisma.project.delete({ where: { id: params.id } });
    return json({ success: true });
  } catch (err) {
    console.error('Project DELETE error:', err);
    return error('Failed to delete project', 500);
  }
}
