export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatCurrency, requireAuth, requireBudgetAccess } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

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

export async function POST(req) {
  try {
    const auth = await requireBudgetAccess(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    if (!body?.projectId || !body?.amount) return error('Project and amount are required');

    const amount = parseFloat(body.amount);
    if (isNaN(amount) || amount <= 0) return error('Invalid amount');

    const project = await prisma.project.findUnique({ where: { id: body.projectId } });
    if (!project) return error('Project not found', 404);

    const newSpent = project.spent + amount;

    await prisma.$transaction([
      prisma.project.update({
        where: { id: body.projectId },
        data: { spent: newSpent },
      }),
      ...(body.category
        ? [
            prisma.budget.create({
              data: {
                projectId: body.projectId,
                category: body.category,
                allocated: amount,
                spent: amount,
              },
            }),
          ]
        : []),
    ]);

    await logActivity({
      userId: user.id,
      action: 'created',
      entity: 'budget',
      entityId: body.projectId,
      description: `Added ${formatCurrency(amount)} expense to ${project.name}`,
      projectId: body.projectId,
    });

    return json({
      success: true,
      spent: formatCurrency(newSpent),
      message: `Added ${formatCurrency(amount)} expense to ${project.name}`,
    });
  } catch (err) {
    console.error('Budget POST error:', err);
    return error('Failed to add expense', 500);
  }
}
