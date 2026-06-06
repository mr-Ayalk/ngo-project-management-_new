export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, formatDate, requireAuth, requireManager } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const report = await prisma.report.findUnique({ where: { id: params.id } });
    if (!report) return error('Report not found', 404);

    return json({
      id: report.id,
      name: report.name,
      description: report.description,
      date: formatDate(report.reportDate),
      reportDate: report.reportDate,
      fileUrl: report.fileUrl,
      fileName: report.fileName,
      fileType: report.fileType,
      fileSize: report.fileSize,
      createdAt: report.createdAt,
    });
  } catch (err) {
    return error('Failed to load report', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const report = await prisma.report.findUnique({ where: { id: params.id } });
    if (!report) return error('Report not found', 404);

    if (report.fileUrl?.startsWith('/uploads/')) {
      try {
        await unlink(path.join(process.cwd(), 'public', report.fileUrl));
      } catch {
        /* ignore */
      }
    }

    await prisma.report.delete({ where: { id: params.id } });

    await logActivity({
      userId: auth.user.id,
      action: 'deleted',
      entity: 'report',
      entityId: report.id,
      description: `Deleted report "${report.name}"`,
    });

    return json({ success: true });
  } catch (err) {
    console.error('Report DELETE error:', err);
    return error('Failed to delete report', 500);
  }
}
