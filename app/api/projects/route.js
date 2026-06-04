export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate, formatCurrency } from '@/lib/api-utils';

function formatProject(p) {
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
    date: formatDate(p.startDate),
    startDate: p.startDate,
    endDate: p.endDate,
    dueDate: formatDate(p.endDate),
    donor: p.donor,
    location: p.location,
    manager: p.manager ? { id: p.manager.id, name: p.manager.name } : null,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const projects = await prisma.project.findMany({
      where,
      include: { manager: { select: { id: true, name: true } } },
      orderBy: { startDate: 'desc' },
    });

    return json(projects.map(formatProject));
  } catch (err) {
    console.error('Projects GET error:', err);
    return error('Failed to load projects', 500);
  }
}

export async function POST(req) {
  try {
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
        location: body.location,
        donor: body.donor,
        managerId: body.managerId,
      },
      include: { manager: { select: { id: true, name: true } } },
    });

    return json(formatProject(project), 201);
  } catch (err) {
    console.error('Projects POST error:', err);
    return error('Failed to create project', 500);
  }
}
