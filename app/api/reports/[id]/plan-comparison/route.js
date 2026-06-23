export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';
import { parseReportTable } from '@/lib/report-table';

export async function GET(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      select: { projectId: true, activityTable: true },
    });
    if (!report) return error('Report not found', 404);

    const activityRows = parseReportTable(report.activityTable);

    if (!report.projectId) {
      return json({ outcomes: [], outputs: [], activities: [], activityRows });
    }

    const [outcomes, outputs, activities] = await Promise.all([
      prisma.planOutcome.findMany({
        where: { projectId: report.projectId },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        select: {
          id: true,
          title: true,
          indicator: true,
          targetValue: true,
          baseline: true,
          unit: true,
          progress: true,
          status: true,
        },
      }),
      prisma.planOutput.findMany({
        where: { projectId: report.projectId },
        orderBy: [{ sortOrder: 'asc' }, { title: 'asc' }],
        select: {
          id: true,
          title: true,
          targetQty: true,
          achievedQty: true,
          unit: true,
          progress: true,
          status: true,
        },
      }),
      prisma.planActivity.findMany({
        where: { projectId: report.projectId },
        orderBy: { title: 'asc' },
        take: 20,
        select: {
          id: true,
          title: true,
          status: true,
          progress: true,
          startDate: true,
          endDate: true,
        },
      }),
    ]);

    return json({ outcomes, outputs, activities, activityRows });
  } catch (err) {
    console.error('Report plan comparison error:', err);
    return error('Failed to load plan comparison', 500);
  }
}
