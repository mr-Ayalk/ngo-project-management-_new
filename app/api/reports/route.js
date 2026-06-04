export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate } from '@/lib/api-utils';

export async function GET() {
  try {
    const reports = await prisma.report.findMany({ orderBy: { reportDate: 'desc' } });
    return json(
      reports.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        date: formatDate(r.reportDate),
        reportDate: r.reportDate,
      }))
    );
  } catch (err) {
    return error('Failed to load reports', 500);
  }
}

export async function POST(req) {
  try {
    const body = await parseBody(req);
    if (!body?.name) return error('Name is required');

    const report = await prisma.report.create({
      data: {
        name: body.name,
        description: body.description,
        reportDate: body.reportDate ? new Date(body.reportDate) : new Date(),
      },
    });

    return json(report, 201);
  } catch (err) {
    return error('Failed to create report', 500);
  }
}
