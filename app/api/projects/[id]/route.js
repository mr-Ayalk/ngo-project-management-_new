export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate, formatCurrency } from '@/lib/api-utils';

export async function GET(req, { params }) {
  try {
    const project = await prisma.project.findUnique({
      where: { id: params.id },
      include: {
        manager: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, staffRole: true, role: true } } } },
        tasks: { include: { assignee: { select: { id: true, name: true } } } },
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
      budgetRaw: project.budget,
      spent: formatCurrency(project.spent),
      income: formatCurrency(project.income || 0),
      utilization: `${utilization}%`,
      dueDate: formatDate(project.endDate),
      startDate: formatDate(project.startDate),
      endDate: project.endDate,
      donor: project.donor,
      donorName: project.donorName,
      assumptions: project.assumptions,
      risks: project.risks,
      indicators: project.indicators,
      outcomes: project.outcomes,
      locationType: project.locationType,
      region: project.region,
      zone: project.zone,
      town: project.town,
      kebele: project.kebele,
      woreda: project.woreda,
      woredaBudget: project.woredaBudget,
      mitigationStrategies: project.mitigationStrategies,
      manager: project.manager?.name || 'Unassigned',
      managerId: project.manager?.id,
      lead: project.lead?.name,
      leadId: project.lead?.id,
      members: project.members.map((m) => ({
        id: m.user.id,
        name: m.user.name,
        role: m.role,
        staffRole: m.user.staffRole,
      })),
      tasks: project.tasks.map((t) => ({
        id: t.id,
        title: t.title,
        name: t.title,
        description: t.description,
        status: t.status,
        priority: t.priority,
        dueDate: t.dueDate,
        assignee: t.assignee?.name || 'Unassigned',
        assigneeId: t.assignee?.id,
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
    const fields = [
      'name', 'description', 'status', 'icon', 'progress', 'budget', 'spent', 'income',
      'location', 'donor', 'donorName', 'assumptions', 'risks', 'indicators', 'outcomes',
      'locationType', 'region', 'zone', 'town', 'kebele', 'woreda', 'woredaBudget',
      'mitigationStrategies', 'managerId', 'leadId',
    ];
    fields.forEach((f) => { if (body[f] !== undefined) data[f] = body[f]; });
    if (body.startDate) data.startDate = new Date(body.startDate);
    if (body.endDate) data.endDate = new Date(body.endDate);

    const project = await prisma.project.update({
      where: { id: params.id },
      data,
      include: { manager: { select: { id: true, name: true } }, lead: { select: { id: true, name: true } } },
    });

    if (body.memberIds) {
      await prisma.projectMember.deleteMany({ where: { projectId: params.id } });
      if (body.memberIds.length) {
        await prisma.projectMember.createMany({
          data: body.memberIds.map((userId) => ({
            projectId: params.id,
            userId,
            role: body.leadId === userId ? 'lead' : 'member',
          })),
        });
      }
    }

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
