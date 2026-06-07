export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, requireManager } from '@/lib/api-utils';
import { assertProjectAccess } from '@/lib/project-access';
import { formatOutcome } from '@/lib/planning';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');

    let where = {};
    if (projectId) {
      const ok = await assertProjectAccess(auth.user, projectId);
      if (!ok) return error('Access denied', 403);
      where = { projectId };
    } else if (!['admin', 'manager', 'project_manager'].includes(auth.user.role)) {
      const projects = await prisma.project.findMany({
        where: {
          OR: [
            { managerId: auth.user.id },
            { leadId: auth.user.id },
            { members: { some: { userId: auth.user.id } } },
          ],
        },
        select: { id: true },
      });
      where = { projectId: { in: projects.map((p) => p.id) } };
    }

    const outcomes = await prisma.planOutcome.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: {
        project: { select: { name: true } },
        _count: { select: { outputs: true } },
      },
    });

    const projects = await prisma.project.findMany({
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });

    return json({ outcomes: outcomes.map(formatOutcome), projects });
  } catch (err) {
    console.error('Outcomes GET error:', err);
    return error('Failed to load outcomes', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.title?.trim()) return error('Outcome title is required');
    if (!body?.projectId) return error('Project is required');

    const ok = await assertProjectAccess(auth.user, body.projectId);
    if (!ok) return error('Access denied', 403);

    const outcome = await prisma.planOutcome.create({
      data: {
        projectId: body.projectId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        indicator: body.indicator?.trim() || null,
        targetValue: body.targetValue != null ? Number(body.targetValue) : null,
        baseline: body.baseline != null ? Number(body.baseline) : null,
        unit: body.unit?.trim() || null,
        status: body.status || 'on-track',
        progress: body.progress != null ? Number(body.progress) : 0,
      },
      include: { project: { select: { name: true } }, _count: { select: { outputs: true } } },
    });

    return json(formatOutcome(outcome), 201);
  } catch (err) {
    console.error('Outcomes POST error:', err);
    return error('Failed to create outcome', 500);
  }
}
