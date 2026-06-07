export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAuth } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import {
  formatReport,
  REPORT_INCLUDE,
  canSubmitReport,
  notifyReportApprovers,
} from '@/lib/reports';

export async function POST(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const report = await prisma.report.findUnique({ where: { id: params.id } });
    if (!report) return error('Report not found', 404);
    if (!canSubmitReport(auth.user, report)) {
      return error('This report cannot be submitted', 403);
    }

    const updated = await prisma.report.update({
      where: { id: params.id },
      data: {
        status: 'pending_approval',
        submittedById: auth.user.id,
        submittedAt: new Date(),
        rejectedAt: null,
        rejectionReason: null,
      },
      include: REPORT_INCLUDE,
    });

    await logActivity({
      userId: auth.user.id,
      action: 'submitted',
      entity: 'report',
      entityId: updated.id,
      description: `Submitted report "${updated.name}" for approval`,
    });

    await notifyReportApprovers(updated, auth.user.name);

    return json(formatReport(updated));
  } catch (err) {
    console.error('Report submit error:', err);
    return error('Failed to submit report', 500);
  }
}
