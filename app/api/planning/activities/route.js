export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, requireManager } from '@/lib/api-utils';
import { assertProjectAccess } from '@/lib/project-access';
import { formatPlanActivity } from '@/lib/planning';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const outputId = searchParams.get('outputId');
    const mine = searchParams.get('mine') === 'true';

    let where = {};
    if (mine) {
      where.assigneeId = auth.user.id;
    }
    if (projectId) {
      const ok = await assertProjectAccess(auth.user, projectId);
      if (!ok) return error('Access denied', 403);
      where.projectId = projectId;
    } else if (outputId) {
      where.outputId = outputId;
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
      where.projectId = { in: projects.map((p) => p.id) };
      if (mine) where.assigneeId = auth.user.id;
    }

    const activities = await prisma.planActivity.findMany({
      where,
      orderBy: [{ endDate: 'asc' }, { title: 'asc' }],
      include: {
        project: { select: { name: true } },
        output: { select: { title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    const [projects, outputs, users] = await Promise.all([
      prisma.project.findMany({ select: { id: true, name: true }, orderBy: { name: 'asc' } }),
      prisma.planOutput.findMany({
        select: { id: true, title: true, projectId: true },
        orderBy: { title: 'asc' },
      }),
      prisma.user.findMany({
        where: { isActive: true },
        select: { id: true, name: true },
        orderBy: { name: 'asc' },
      }),
    ]);

    return json({
      activities: activities.map(formatPlanActivity),
      projects,
      outputs,
      users,
    });
  } catch (err) {
    console.error('Activities GET error:', err);
    return error('Failed to load activities', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.title?.trim()) return error('Activity title is required');
    if (!body?.projectId) return error('Project is required');

    const ok = await assertProjectAccess(auth.user, body.projectId);
    if (!ok) return error('Access denied', 403);

    const activity = await prisma.planActivity.create({
      data: {
        projectId: body.projectId,
        outputId: body.outputId || null,
        title: body.title.trim(),
        description: body.description?.trim() || null,
        assigneeId: body.assigneeId || null,
        startDate: body.startDate ? new Date(body.startDate) : null,
        endDate: body.endDate ? new Date(body.endDate) : null,
        status: body.status || 'planned',
        priority: body.priority || 'medium',
        location: body.location?.trim() || null,
        budget: body.budget != null ? Number(body.budget) : null,
        progress: body.progress != null ? Number(body.progress) : 0,
      },
      include: {
        project: { select: { name: true } },
        output: { select: { title: true } },
        assignee: { select: { id: true, name: true } },
      },
    });

    return json(formatPlanActivity(activity), 201);
  } catch (err) {
    console.error('Activities POST error:', err);
    return error('Failed to create activity', 500);
  }
}
