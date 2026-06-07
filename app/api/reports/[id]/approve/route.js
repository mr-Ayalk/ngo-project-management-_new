export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import {
  formatReport,
  REPORT_INCLUDE,
  notifyReportAuthor,
} from '@/lib/reports';

export async function POST(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    const report = await prisma.report.findUnique({ where: { id: params.id } });
    if (!report) return error('Report not found', 404);
    if (!['submitted', 'pending_approval'].includes(report.status)) {
      return error('Only submitted reports can be approved', 400);
    }

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        status: 'approved',
        approvedById: auth.user.id,
        approvedAt: new Date(),
        reviewerNotes: body?.reviewerNotes?.trim() || null,
        rejectionReason: null,
        rejectedAt: null,
      },
      include: REPORT_INCLUDE,
    });

    await logActivity({
      userId: auth.user.id,
      action: 'approved',
      entity: 'report',
      entityId: updated.id,
      description: `Approved report "${updated.name}"`,
    });

    if (updated.submittedById) {
      await notifyReportAuthor(
        updated.submittedById,
        updated,
        'Report approved',
        `Your report "${updated.name}" has been approved.`
      );
    }

    return json(formatReport(updated));
  } catch (err) {
    console.error('Report approve error:', err);
    return error('Failed to approve report', 500);
  }
}
