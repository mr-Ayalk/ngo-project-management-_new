export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, formatCurrency } from '@/lib/api-utils';

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      select: { id: true, name: true, budget: true, spent: true, status: true, icon: true },
      orderBy: { name: 'asc' },
    });

    const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
    const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
    const remaining = totalBudget - totalSpent;
    const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

    return json({
      summary: {
        totalBudget: formatCurrency(totalBudget),
        totalBudgetRaw: totalBudget,
        spent: formatCurrency(totalSpent),
        spentRaw: totalSpent,
        remaining: formatCurrency(remaining),
        remainingRaw: remaining,
        utilizationPct: pct,
        projectCount: projects.length,
      },
      projects: projects.map((p) => ({
        id: p.id,
        name: p.name,
        spent: formatCurrency(p.spent),
        total: formatCurrency(p.budget),
        spentRaw: p.spent,
        allocatedRaw: p.budget,
        pct: p.budget > 0 ? Math.round((p.spent / p.budget) * 100) : 0,
        amber: p.status === 'at-risk',
        red: p.status === 'delayed',
        color: p.icon,
      })),
    });
  } catch (err) {
    console.error('Budget GET error:', err);
    return error('Failed to load budget data', 500);
  }
}
