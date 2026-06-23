export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate, formatCurrency, requireAuth, requireDean } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { userCanAccessProject, assertProjectManageAccess } from '@/lib/project-access';

function formatProject(p, user) {
  const hasAccess = userCanAccessProject(user, {
    managerId: p.managerId,
    leadId: p.leadId,
    members: p.members,
  });

  return {
    id: p.id,
    name: p.name,
    description: p.description,
    status: p.status,
    icon: p.icon,
    progress: p.progress,
    budget: formatCurrency(p.budget),
    budgetRaw: p.budget,
    spent: p.spent,
    income: p.income,
    date: formatDate(p.startDate),
    startDate: p.startDate,
    endDate: p.endDate,
    dueDate: formatDate(p.endDate),
    donor: p.donor,
    donorName: p.donorName,
    managerId: p.managerId,
    leadId: p.leadId,
    hasAccess,
    assumptions: p.assumptions,
    risks: p.risks,
    indicators: p.indicators,
    outcomes: p.outcomes,
    location: p.location,
    locationType: p.locationType,
    region: p.region,
    zone: p.zone,
    town: p.town,
    kebele: p.kebele,
    woreda: p.woreda,
    woredaBudget: p.woredaBudget,
    mitigationStrategies: p.mitigationStrategies,
    manager: p.manager ? { id: p.manager.id, name: p.manager.name } : null,
    lead: p.lead ? { id: p.lead.id, name: p.lead.name } : null,
    members: p.members?.map((m) => ({
      id: m.user.id,
      name: m.user.name,
      role: m.role,
      staffRole: m.user.staffRole,
    })) || [],
  };
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const projects = await prisma.project.findMany({
      where,
      include: {
        manager: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, staffRole: true } } } },
      },
      orderBy: { startDate: 'desc' },
    });

    return json(projects.map((p) => formatProject(p, auth.user)));
  } catch (err) {
    console.error('Projects GET error:', err);
    return error('Failed to load projects', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireDean(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    if (!body?.name || !body?.managerId) return error('Name and manager are required');

    const project = await prisma.project.create({
      data: {
        name: body.name,
        description: body.description,
        status: body.status || 'on-track',
        icon: body.icon || 'green',
        startDate: body.startDate ? new Date(body.startDate) : new Date(),
        endDate: body.endDate ? new Date(body.endDate) : new Date(),
        budget: body.budget || 0,
        spent: body.spent || 0,
        progress: body.progress || 0,
        income: body.income || 0,
        location: body.location,
        donor: body.donor || body.donorName,
        donorName: body.donorName || body.donor,
        assumptions: body.assumptions,
        risks: body.risks,
        indicators: body.indicators,
        outcomes: body.outcomes,
        locationType: body.locationType,
        region: body.region,
        zone: body.zone,
        town: body.town,
        kebele: body.kebele,
        woreda: body.woreda,
        woredaBudget: body.woredaBudget,
        mitigationStrategies: body.mitigationStrategies,
        managerId: body.managerId,
        leadId: body.leadId || body.managerId,
        members: body.memberIds?.length ? {
          create: body.memberIds.map((userId) => ({
            userId,
            role: body.leadId === userId ? 'lead' : 'member',
          })),
        } : undefined,
      },
      include: {
        manager: { select: { id: true, name: true } },
        lead: { select: { id: true, name: true } },
        members: { include: { user: { select: { id: true, name: true, staffRole: true } } } },
      },
    });

    await logActivity({
      userId: user.id,
      action: 'created',
      entity: 'project',
      entityId: project.id,
      description: `Created project "${project.name}"`,
      projectId: project.id,
    });

    return json(formatProject(project, user), 201);
  } catch (err) {
    console.error('Projects POST error:', err);
    return error('Failed to create project', 500);
  }
}
