export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, formatCurrency, timeAgo, getInitials, AVATAR_COLORS } from '@/lib/api-utils';

export async function GET() {
  try {
    const [projects, tasks, org, activities] = await Promise.all([
      prisma.project.findMany({ select: { status: true, budget: true, spent: true, progress: true, name: true } }),
      prisma.task.findMany({ where: { status: 'completed' }, select: { id: true } }),
      prisma.organization.findFirst(),
      prisma.activity.findMany({
        take: 4,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } }, project: { select: { name: true } } },
      }),
    ]);

    const activeProjects = projects.filter((p) => p.status !== 'completed').length;
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

    return json({
      kpis: {
        activeProjects,
        activeProjectsDelta: '+2 from last month',
        tasksCompleted: tasks.length,
        tasksCompletedDelta: '+13% from last month',
        totalBeneficiaries: org?.totalBeneficiaries ?? 0,
        beneficiariesDelta: '+532 this month',
        budgetUtilizedPct: budgetPct,
        budgetSpent: formatCurrency(totalSpent),
        budgetTotal: formatCurrency(totalBudget),
      },
      chart: {
        labels: ['Apr 1', 'Apr 8', 'Apr 15', 'Apr 22', 'Apr 29'],
        planned: [20, 40, 55, 70, 90],
        actual: [18, 38, 52, 68, 88],
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
