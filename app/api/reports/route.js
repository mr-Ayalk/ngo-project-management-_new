export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate, requireAuth, requireManager } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const reports = await prisma.report.findMany({ orderBy: { reportDate: 'desc' } });
    return json(
      reports.map((r) => ({
        id: r.id,
        name: r.name,
        description: r.description,
        date: formatDate(r.reportDate),
        reportDate: r.reportDate,
        fileUrl: r.fileUrl,
        fileName: r.fileName,
        fileType: r.fileType,
        fileSize: r.fileSize,
      }))
    );
  } catch (err) {
    return error('Failed to load reports', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.name) return error('Name is required');

    const report = await prisma.report.create({
      data: {
        name: body.name,
        description: body.description,
        reportDate: body.reportDate ? new Date(body.reportDate) : new Date(),
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
        fileType: body.fileType || null,
        fileSize: body.fileSize || null,
      },
    });

    return json(report, 201);
  } catch (err) {
    return error('Failed to create report', 500);
  }
}
