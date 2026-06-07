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
    if (!body?.reason?.trim()) return error('Rejection reason is required');

    const report = await prisma.report.findUnique({ where: { id: params.id } });
    if (!report) return error('Report not found', 404);
    if (!['submitted', 'pending_approval'].includes(report.status)) {
      return error('Only submitted reports can be rejected', 400);
    }

    const status = body.requestRevision ? 'revision_requested' : 'rejected';

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        status,
        approvedById: auth.user.id,
        rejectedAt: new Date(),
        approvedAt: null,
        rejectionReason: body.reason.trim(),
        reviewerNotes: body.reviewerNotes?.trim() || null,
      },
      include: REPORT_INCLUDE,
    });

    await logActivity({
      userId: auth.user.id,
      action: status === 'revision_requested' ? 'revision_requested' : 'rejected',
      entity: 'report',
      entityId: updated.id,
      description: `Returned report "${updated.name}" for revision`,
    });

    if (updated.submittedById) {
      await notifyReportAuthor(
        updated.submittedById,
        updated,
        status === 'revision_requested' ? 'Report revision requested' : 'Report rejected',
        body.reason.trim()
      );
    }

    return json(formatReport(updated));
  } catch (err) {
    console.error('Report reject error:', err);
    return error('Failed to reject report', 500);
  }
}
