export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, requireManager } from '@/lib/api-utils';
import { logActivity } from '@/lib/activity';
import { formatReport, REPORT_INCLUDE, canEditReport } from '@/lib/reports';
import { REPORT_TYPES } from '@/lib/report-types';
import { serializeReportTable, isValidDriveLink } from '@/lib/report-table';
import { unlink } from 'fs/promises';
import path from 'path';

const VALID_TYPES = REPORT_TYPES.map((t) => t.value);

export async function GET(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const report = await prisma.report.findUnique({
      where: { id: params.id },
      include: REPORT_INCLUDE,
    });
    if (!report) return error('Report not found', 404);

    return json(formatReport(report));
  } catch (err) {
    return error('Failed to load report', 500);
  }
}

export async function PUT(req, { params }) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const existing = await prisma.report.findUnique({ where: { id: params.id } });
    if (!existing) return error('Report not found', 404);
    if (!canEditReport(auth.user, existing)) {
      return error('You cannot edit this report in its current status', 403);
    }

    const body = await parseBody(req);
    const data = {};

    if (body.name !== undefined) data.name = String(body.name).trim();
    if (body.description !== undefined) data.description = String(body.description).trim() || null;
    if (body.content !== undefined) data.content = String(body.content).trim() || null;
    if (body.reportDate) data.reportDate = new Date(body.reportDate);
    if (body.periodStart !== undefined) data.periodStart = body.periodStart ? new Date(body.periodStart) : null;
    if (body.periodEnd !== undefined) data.periodEnd = body.periodEnd ? new Date(body.periodEnd) : null;
    if (body.projectId !== undefined) data.projectId = body.projectId || null;
    if (body.type && VALID_TYPES.includes(body.type)) data.type = body.type;
    if (body.incidentSeverity !== undefined) data.incidentSeverity = body.incidentSeverity || null;
    if (body.incidentLocation !== undefined) data.incidentLocation = String(body.incidentLocation).trim() || null;
    if (body.actionsTaken !== undefined) data.actionsTaken = String(body.actionsTaken).trim() || null;
    if (body.fileUrl !== undefined) data.fileUrl = body.fileUrl || null;
    if (body.fileName !== undefined) data.fileName = body.fileName || null;
    if (body.fileType !== undefined) data.fileType = body.fileType || null;
    if (body.fileSize !== undefined) data.fileSize = body.fileSize || null;
    if (body.activityTable !== undefined) {
      data.activityTable = Array.isArray(body.activityTable)
        ? serializeReportTable(body.activityTable)
        : body.activityTable;
    }
    if (body.driveLink !== undefined) {
      const link = String(body.driveLink || '').trim();
      if (link && !isValidDriveLink(link)) return error('Invalid Google Drive link URL', 400);
      data.driveLink = link || null;
    }

    if (existing.status === 'approved') {
      data.editedAfterApproval = true;
      data.editedAfterApprovalAt = new Date();
    }

    data.updatedAt = new Date();

    if (!Object.keys(data).length) return error('No valid fields to update');

    const report = await prisma.report.update({
      where: { id: params.id },
      data,
      include: REPORT_INCLUDE,
    });

    await logActivity({
      userId: auth.user.id,
      action: 'updated',
      entity: 'report',
      entityId: report.id,
      description: `Updated report "${report.name}"`,
    });

    return json(formatReport(report));
  } catch (err) {
    console.error('Report PUT error:', err);
    return error('Failed to update report', 500);
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
