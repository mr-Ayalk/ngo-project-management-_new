export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';
import { isProjectManager } from '@/lib/roles';
import { userCanAccessProject } from '@/lib/project-access';
import { formatOrgPortal, formatOutcome, formatOutput, formatPlanActivity } from '@/lib/planning';

async function accessibleProjectIds(user) {
  if (isProjectManager(user)) {
    const all = await prisma.project.findMany({ select: { id: true } });
    return all.map((p) => p.id);
  }
  const projects = await prisma.project.findMany({
    where: {
      OR: [
        { managerId: user.id },
        { leadId: user.id },
        { members: { some: { userId: user.id } } },
      ],
    },
    select: { id: true },
  });
  return projects.map((p) => p.id);
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const projectIds = await accessibleProjectIds(auth.user);
    const org = await prisma.organization.findFirst();

    const [
      projectCount,
      outcomeCount,
      outputCount,
      activityCount,
      myActivityCount,
      outcomes,
      outputs,
      activities,
      myActivities,
    ] = await Promise.all([
      prisma.project.count({ where: { id: { in: projectIds } } }),
      prisma.planOutcome.count({ where: { projectId: { in: projectIds } } }),
      prisma.planOutput.count({ where: { projectId: { in: projectIds } } }),
      prisma.planActivity.count({ where: { projectId: { in: projectIds } } }),
      prisma.planActivity.count({ where: { projectId: { in: projectIds }, assigneeId: auth.user.id } }),
      prisma.planOutcome.findMany({
        where: { projectId: { in: projectIds } },
        take: 5,
        orderBy: { updatedAt: 'desc' },
        include: { project: { select: { name: true } }, _count: { select: { outputs: true } } },
      }),
      prisma.planOutput.findMany({
        where: { projectId: { in: projectIds } },
        take: 5,
        orderBy: { dueDate: 'asc' },
        include: { project: { select: { name: true } }, outcome: { select: { title: true } } },
      }),
      prisma.planActivity.findMany({
        where: { projectId: { in: projectIds } },
        take: 6,
        orderBy: { endDate: 'asc' },
        include: {
          project: { select: { name: true } },
          assignee: { select: { name: true } },
          output: { select: { title: true } },
        },
      }),
      prisma.planActivity.findMany({
        where: { projectId: { in: projectIds }, assigneeId: auth.user.id },
        take: 5,
        orderBy: { endDate: 'asc' },
        include: {
          project: { select: { name: true } },
          output: { select: { title: true } },
        },
      }),
    ]);

    const completedOutcomes = await prisma.planOutcome.count({
      where: { projectId: { in: projectIds }, status: 'completed' },
    });
    const completedActivities = await prisma.planActivity.count({
      where: { projectId: { in: projectIds }, status: 'completed' },
    });

    const logframeProgress = outcomeCount > 0
      ? Math.round((completedOutcomes / outcomeCount) * 100)
      : 0;

    return json({
      portal: formatOrgPortal(org),
      stats: {
        projects: projectCount,
        outcomes: outcomeCount,
        outputs: outputCount,
        activities: activityCount,
        myActivities: myActivityCount,
        logframeProgress,
        completedActivities,
      },
      recentOutcomes: outcomes.map(formatOutcome),
      upcomingOutputs: outputs.map(formatOutput),
      upcomingActivities: activities.map(formatPlanActivity),
      myUpcoming: myActivities.map(formatPlanActivity),
    });
  } catch (err) {
    console.error('Planning overview error:', err);
    return error('Failed to load planning overview', 500);
  }
}
