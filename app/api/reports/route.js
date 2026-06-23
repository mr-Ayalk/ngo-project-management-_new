export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { formatReport, REPORT_INCLUDE, notifyReportApprovers } from '@/lib/reports';
import { REPORT_TYPES } from '@/lib/report-types';
import { serializeReportTable, isValidDriveLink } from '@/lib/report-table';

const VALID_TYPES = REPORT_TYPES.map((t) => t.value);

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const status = searchParams.get('status');
    const pending = searchParams.get('pending') === 'true';

    const where = {};
    if (type && VALID_TYPES.includes(type)) where.type = type;
    if (status) where.status = status;
    if (pending) where.status = { in: ['submitted', 'pending_approval'] };

    const reports = await prisma.report.findMany({
      where,
      include: REPORT_INCLUDE,
      orderBy: [{ reportDate: 'desc' }, { createdAt: 'desc' }],
    });

    return json(reports.map(formatReport));
  } catch (err) {
    console.error('Reports GET error:', err);
    return error('Failed to load reports', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    if (!body?.name) return error('Report title is required');
    if (body.type && !VALID_TYPES.includes(body.type)) return error('Invalid report type');

    const status = body.submit ? 'pending_approval' : 'draft';
    const now = new Date();
    const driveLink = String(body.driveLink || '').trim();
    if (driveLink && !isValidDriveLink(driveLink)) return error('Invalid Google Drive link URL', 400);

    const report = await prisma.report.create({
      data: {
        name: body.name.trim(),
        type: body.type || 'monthly',
        status,
        description: body.description?.trim() || null,
        content: body.content?.trim() || null,
        reportDate: body.reportDate ? new Date(body.reportDate) : now,
        periodStart: body.periodStart ? new Date(body.periodStart) : null,
        periodEnd: body.periodEnd ? new Date(body.periodEnd) : null,
        projectId: body.projectId || null,
        submittedById: user.id,
        submittedAt: body.submit ? now : null,
        incidentSeverity: body.incidentSeverity || null,
        incidentLocation: body.incidentLocation?.trim() || null,
        actionsTaken: body.actionsTaken?.trim() || null,
        fileUrl: body.fileUrl || null,
        fileName: body.fileName || null,
        fileType: body.fileType || null,
        fileSize: body.fileSize || null,
        activityTable: body.activityTable
          ? (Array.isArray(body.activityTable) ? serializeReportTable(body.activityTable) : body.activityTable)
          : null,
        driveLink: driveLink || null,
        updatedAt: now,
      },
      include: REPORT_INCLUDE,
    });

    await logActivity({
      userId: user.id,
      action: body.submit ? 'submitted' : 'created',
      entity: 'report',
      entityId: report.id,
      description: `${body.submit ? 'Submitted' : 'Created'} ${report.type} report "${report.name}"`,
    });

    if (body.submit) {
      await notifyReportApprovers(report, user.name);
    }

    return json(formatReport(report), 201);
  } catch (err) {
    console.error('Reports POST error:', err);
    return error('Failed to create report', 500);
  }
}
