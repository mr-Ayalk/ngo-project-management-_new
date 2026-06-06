export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, formatCurrency, timeAgo, getInitials, AVATAR_COLORS, requireAuth } from '@/lib/api-utils';

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
    const chartTasksCompleted = [];
    const chartProgress = [];
    const chartNewTasks = [];
    const weekCount = 5;

    const startOfDay = (d) => {
      const x = new Date(d);
      x.setHours(0, 0, 0, 0);
      return x;
    };

    const today = startOfDay(now);

    for (let i = weekCount - 1; i >= 0; i--) {
      const weekEnd = new Date(today);
      weekEnd.setDate(weekEnd.getDate() - i * 7);
      const weekStart = new Date(weekEnd);
      weekStart.setDate(weekStart.getDate() - 6);

      chartLabels.push(
        weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      );

      const [completedCount, createdCount] = await Promise.all([
        prisma.task.count({
          where: {
            status: 'completed',
            updatedAt: { gte: weekStart, lte: weekEnd },
          },
        }),
        prisma.task.count({
          where: {
            createdAt: { gte: weekStart, lte: weekEnd },
          },
        }),
      ]);
      chartTasksCompleted.push(completedCount);
      chartNewTasks.push(createdCount);

      const activeAtWeek = projects.filter(
        (p) => new Date(p.startDate) <= weekEnd && new Date(p.endDate) >= weekStart
      );
      if (activeAtWeek.length === 0) {
        chartProgress.push(0);
      } else {
        chartProgress.push(
          Math.round(activeAtWeek.reduce((s, p) => s + p.progress, 0) / activeAtWeek.length)
        );
      }
    }

    const overdueTasks = await prisma.task.count({
      where: {
        status: { in: ['todo', 'in_progress'] },
        dueDate: { lt: today },
      },
    });

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
        tasksCompleted: chartTasksCompleted,
        newTasks: chartNewTasks,
        avgProgress: chartProgress,
        overdueTasks,
        summary: {
          totalCompletedThisPeriod: chartTasksCompleted.reduce((a, b) => a + b, 0),
          totalCreatedThisPeriod: chartNewTasks.reduce((a, b) => a + b, 0),
          currentAvgProgress: chartProgress[chartProgress.length - 1] || 0,
        },
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
