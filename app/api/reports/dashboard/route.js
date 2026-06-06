export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, formatDate, formatCurrency, requireAuth } from '@/lib/api-utils';

function statusLabel(status) {
  const map = {
    'on-track': 'On Track',
    'at-risk': 'At Risk',
    delayed: 'Delayed',
    completed: 'Completed',
  };
  return map[status] || status;
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const [projects, org, manualReports, beneficiaryLinks] = await Promise.all([
      prisma.project.findMany({
        select: {
          id: true,
          name: true,
          budget: true,
          spent: true,
          progress: true,
          status: true,
          location: true,
          region: true,
          indicators: true,
          outcomes: true,
        },
        orderBy: { name: 'asc' },
      }),
      prisma.organization.findFirst(),
      prisma.report.findMany({ orderBy: { reportDate: 'desc' } }),
      prisma.beneficiaryProject.groupBy({
        by: ['projectId'],
        _count: { beneficiaryId: true },
      }),
    ]);

    const beneByProject = Object.fromEntries(
      beneficiaryLinks.map((b) => [b.projectId, b._count.beneficiaryId])
    );

    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    const utilizationPct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 1000) / 10 : 0;
    const avgProgress =
      projects.length > 0
        ? Math.round(projects.reduce((s, p) => s + p.progress, 0) / projects.length)
        : 0;

    const budgetVsActuals = projects.map((p) => {
      const varianceRaw = p.budget - p.spent;
      const utilization = p.budget > 0 ? Math.round((p.spent / p.budget) * 1000) / 10 : 0;
      return {
        id: p.id,
        name: p.name,
        budgetAllocated: formatCurrency(p.budget),
        budgetAllocatedRaw: p.budget,
        budgetSpent: formatCurrency(p.spent),
        budgetSpentRaw: p.spent,
        variance: formatCurrency(varianceRaw),
        varianceRaw,
        utilizationPct: utilization,
        overBudget: p.spent > p.budget,
        status: p.status,
      };
    });

    const impactKpis = projects.map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region || p.location || '—',
      progress: p.progress,
      target: 100,
      status: p.status,
      statusLabel: statusLabel(p.status),
      beneficiaries: beneByProject[p.id] || 0,
      hasIndicators: Boolean(p.indicators?.trim()),
      hasOutcomes: Boolean(p.outcomes?.trim()),
    }));

    const globalKpis = [
      {
        id: 'beneficiaries',
        label: 'Total Beneficiaries',
        current: org?.totalBeneficiaries ?? 0,
        target: org?.totalBeneficiaries ? Math.ceil((org.totalBeneficiaries || 0) * 1.2) : 1000,
        unit: 'people',
      },
      {
        id: 'programs',
        label: 'Active Programs',
        current: org?.activePrograms ?? projects.filter((p) => p.status !== 'completed').length,
        target: Math.max(projects.length, org?.activePrograms ?? 0),
        unit: 'programs',
      },
      {
        id: 'completion',
        label: 'Completion Rate',
        current: org?.completionRate ?? avgProgress,
        target: 100,
        unit: '%',
      },
      {
        id: 'monthly',
        label: 'Beneficiaries This Month',
        current: org?.beneficiariesThisMonth ?? 0,
        target: Math.max(org?.beneficiariesThisMonth ?? 0, 100),
        unit: 'people',
      },
    ].map((k) => ({
      ...k,
      progressPct: k.target > 0 ? Math.min(100, Math.round((k.current / k.target) * 100)) : 0,
    }));

    return json({
      summary: {
        totalBudgeted: formatCurrency(totalBudget),
        totalBudgetedRaw: totalBudget,
        totalSpent: formatCurrency(totalSpent),
        totalSpentRaw: totalSpent,
        utilizationPct,
        kpiProgressPct: org?.completionRate ?? avgProgress,
        kpiTargetCount: globalKpis.length,
        projectCount: projects.length,
        orgName: org?.name || 'Engage Now Africa',
      },
      budgetVsActuals,
      impactKpis,
      globalKpis,
      manualReports: manualReports.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        date: formatDate(r.reportDate),
        reportDate: r.reportDate,
        fileUrl: r.fileUrl,
        fileName: r.fileName,
        fileType: r.fileType,
        fileSize: r.fileSize,
      })),
    });
  } catch (err) {
    console.error('Reports dashboard error:', err);
    return error('Failed to load reports dashboard', 500);
  }
}
