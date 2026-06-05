export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, formatCurrency, timeAgo, getInitials, AVATAR_COLORS, requireAuth } from '@/lib/api-utils';

function plannedProgress(project, asOf) {
  const start = new Date(project.startDate).getTime();
  const end = new Date(project.endDate).getTime();
  const t = asOf.getTime();
  if (t <= start) return 0;
  if (t >= end) return 100;
  return Math.round(((t - start) / (end - start)) * 100);
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const sixtyDaysAgo = new Date(now);
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [projects, org, activities, completedLast30, completedPrev30] = await Promise.all([
      prisma.project.findMany({
        select: {
          status: true, budget: true, spent: true, progress: true,
          name: true, startDate: true, endDate: true, createdAt: true,
        },
      }),
      prisma.organization.findFirst(),
      prisma.activity.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } }, project: { select: { name: true } } },
      }),
      prisma.task.count({
        where: { status: 'completed', updatedAt: { gte: thirtyDaysAgo } },
      }),
      prisma.task.count({
        where: {
          status: 'completed',
          updatedAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo },
        },
      }),
    ]);

    const activeProjects = projects.filter((p) => p.status !== 'completed').length;
    const longstandingActive = projects.filter(
      (p) => p.status !== 'completed' && new Date(p.createdAt) <= thirtyDaysAgo
    ).length;
    const activeDelta = activeProjects - longstandingActive;
    const activeProjectsDelta =
      activeDelta > 0
        ? `+${activeDelta} from last month`
        : activeDelta < 0
          ? `${activeDelta} from last month`
          : 'No change from last month';

    const tasksCompleted = await prisma.task.count({ where: { status: 'completed' } });
    let tasksCompletedDelta = 'No change from last month';
    if (completedPrev30 > 0) {
      const pctChange = Math.round(((completedLast30 - completedPrev30) / completedPrev30) * 100);
      tasksCompletedDelta =
        pctChange > 0
          ? `+${pctChange}% from last month`
          : pctChange < 0
            ? `${pctChange}% from last month`
            : 'No change from last month';
    } else if (completedLast30 > 0) {
      tasksCompletedDelta = `+${completedLast30} completed this month`;
    }

    const beneficiariesThisMonth = org?.beneficiariesThisMonth ?? 0;
    const beneficiariesDelta =
      beneficiariesThisMonth > 0
        ? `+${beneficiariesThisMonth} this month`
        : 'No new beneficiaries this month';

    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    const budgetPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    const statusCounts = { 'on-track': 0, 'at-risk': 0, delayed: 0 };
    projects.forEach((p) => {
      if (statusCounts[p.status] !== undefined) statusCounts[p.status]++;
    });
    const total = projects.length || 1;

    const upcomingTasks = await prisma.task.findMany({
      where: { status: { in: ['todo', 'in_progress'] } },
      take: 3,
      orderBy: { dueDate: 'asc' },
      include: { project: { select: { name: true } } },
    });

    const budgetOverview = projects.slice(0, 4).map((p) => ({
      name: p.name.replace(' Project', '').replace(' Initiative', ' Init.'),
      amount: formatCurrency(p.spent),
      total: formatCurrency(p.budget),
      pct: p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0,
      amber: p.status === 'at-risk',
      red: p.status === 'delayed',
    }));

    const chartLabels = [];
    const chartPlanned = [];
    const chartActual = [];
    for (let i = 4; i >= 0; i--) {
      const weekEnd = new Date(now);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      chartLabels.push(
        weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );

      const activeAtWeek = projects.filter(
        (p) => new Date(p.startDate) <= weekEnd && new Date(p.endDate) >= weekEnd
      );
      if (activeAtWeek.length === 0) {
        chartPlanned.push(0);
        chartActual.push(0);
      } else {
        const plannedAvg = Math.round(
          activeAtWeek.reduce((s, p) => s + plannedProgress(p, weekEnd), 0) / activeAtWeek.length
        );
        const actualAvg = Math.round(
          activeAtWeek.reduce((s, p) => s + p.progress, 0) / activeAtWeek.length
        );
        chartPlanned.push(plannedAvg);
        chartActual.push(actualAvg);
      }
    }

    return json({
      kpis: {
        activeProjects,
        activeProjectsDelta,
        tasksCompleted,
        tasksCompletedDelta,
        totalBeneficiaries: org?.totalBeneficiaries ?? 0,
        beneficiariesDelta,
        budgetUtilizedPct: budgetPct,
        budgetSpent: formatCurrency(totalSpent),
        budgetTotal: formatCurrency(totalBudget),
      },
      chart: {
        labels: chartLabels,
        planned: chartPlanned,
        actual: chartActual,
      },
      activities: activities.map((a, i) => ({
        initials: getInitials(a.user.name),
        bg: AVATAR_COLORS[i % AVATAR_COLORS.length],
        title: a.project?.name || a.entity,
        sub: a.description || `${a.action} on ${a.entity}`,
        time: timeAgo(a.createdAt),
      })),
      projectStatusSummary: [
        { status: 'On Track', count: statusCounts['on-track'], pct: Math.round((statusCounts['on-track'] / total) * 100) },
        { status: 'At Risk', count: statusCounts['at-risk'], pct: Math.round((statusCounts['at-risk'] / total) * 100) },
        { status: 'Delayed', count: statusCounts.delayed, pct: Math.round((statusCounts.delayed / total) * 100) },
      ],
      upcomingTasks: upcomingTasks.map((t) => ({
        title: t.title,
        project: t.project.name,
        date: t.dueDate
          ? new Date(t.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
          : '',
      })),
      budgetOverview,
    });
  } catch (err) {
    console.error('Dashboard API error:', err);
    return error('Failed to load dashboard data', 500);
  }
}
