export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, requireManager } from '@/lib/api-utils';
import { assertProjectAccess } from '@/lib/project-access';
import { hasLeadershipRole } from '@/lib/roles';
import { formatOutput } from '@/lib/planning';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const outcomeId = searchParams.get('outcomeId');

    let where = {};
    if (projectId) {
      const ok = await assertProjectAccess(auth.user, projectId);
      if (!ok) return error('Access denied', 403);
      where.projectId = projectId;
    } else if (outcomeId) {
      where.outcomeId = outcomeId;
    } else if (!hasLeadershipRole(auth.user)) {
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

    const outputs = await prisma.planOutput.findMany({
      where,
      orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
      include: {
        project: { select: { name: true } },
        outcome: { select: { title: true } },
        _count: { select: { planActivities: true } },
      },
    });

    const [projects, outcomes] = await Promise.all([
      prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      prisma.planOutcome.findMany({
        select: { id: true, title: true, projectId: true },
        orderBy: { title: 'asc' },
      }),
    ]);

    return json({ outputs: outputs.map(formatOutput), projects, outcomes });
  } catch (err) {
    console.error('Outputs GET error:', err);
    return error('Failed to load outputs', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.title?.trim()) return error('Output title is required');
    if (!body?.projectId || !body?.outcomeId) return error('Project and outcome are required');

    const ok = await assertProjectAccess(auth.user, body.projectId);
    if (!ok) return error('Access denied', 403);

    const output = await prisma.planOutput.create({
      data: {
        projectId: body.projectId,
        outcomeId: body.outcomeId,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        deliverable: body.deliverable?.trim() || null,
        targetQty: body.targetQty != null ? Number(body.targetQty) : null,
        achievedQty: body.achievedQty != null ? Number(body.achievedQty) : 0,
        unit: body.unit?.trim() || null,
        dueDate: body.dueDate ? new Date(body.dueDate) : null,
        status: body.status || 'planned',
        progress: body.progress != null ? Number(body.progress) : 0,
      },
      include: {
        project: { select: { name: true } },
        outcome: { select: { title: true } },
        _count: { select: { planActivities: true } },
      },
    });

    return json(formatOutput(output), 201);
  } catch (err) {
    console.error('Outputs POST error:', err);
    return error('Failed to create output', 500);
  }
}
