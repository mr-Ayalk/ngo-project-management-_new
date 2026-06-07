import prisma from '@/lib/db';
import { formatDate } from '@/lib/api-utils';
import { getReportStatusMeta, getReportTypeMeta } from '@/lib/report-types';
import { isProjectManager } from '@/lib/roles';

export const REPORT_INCLUDE = {
  project: { select: { id: true, name: true } },
  submittedBy: { select: { id: true, name: true, email: true } },
  approvedBy: { select: { id: true, name: true } },
};

export function formatReport(r) {
  const typeMeta = getReportTypeMeta(r.type);
  const statusMeta = getReportStatusMeta(r.status);

  return {
    id: r.id,
    name: r.name,
    type: r.type,
    typeLabel: typeMeta.label,
    typeShortLabel: typeMeta.shortLabel,
    status: r.status,
    statusLabel: statusMeta.label,
    statusColor: statusMeta.color,
    description: r.description,
    content: r.content,
    reportDate: r.reportDate,
    date: formatDate(r.reportDate),
    periodStart: r.periodStart,
    periodEnd: r.periodEnd,
    periodLabel: r.periodStart && r.periodEnd
      ? `${formatDate(r.periodStart)} – ${formatDate(r.periodEnd)}`
      : null,
    projectId: r.projectId,
    project: r.project ? { id: r.project.id, name: r.project.name } : null,
    submittedById: r.submittedById,
    submittedBy: r.submittedBy ? { id: r.submittedBy.id, name: r.submittedBy.name } : null,
    approvedById: r.approvedById,
    approvedBy: r.approvedBy ? { id: r.approvedBy.id, name: r.approvedBy.name } : null,
    submittedAt: r.submittedAt,
    approvedAt: r.approvedAt,
    rejectedAt: r.rejectedAt,
    rejectionReason: r.rejectionReason,
    reviewerNotes: r.reviewerNotes,
    incidentSeverity: r.incidentSeverity,
    incidentLocation: r.incidentLocation,
    actionsTaken: r.actionsTaken,
    fileUrl: r.fileUrl,
    fileName: r.fileName,
    fileType: r.fileType,
    fileSize: r.fileSize,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  };
}

export function canEditReport(user, report) {
  if (!user || !report) return false;
  if (isProjectManager(user)) return true;
  if (!['draft', 'revision_requested', 'rejected'].includes(report.status)) return false;
  return report.submittedById === user.id;
}

export function canSubmitReport(user, report) {
  if (!user || !report) return false;
  if (!['draft', 'revision_requested', 'rejected'].includes(report.status)) return false;
  return isProjectManager(user) || report.submittedById === user.id;
}

export function canApproveReport(user) {
  return isProjectManager(user);
}

export async function notifyReportApprovers(report, submitterName) {
  const managers = await prisma.user.findMany({
    where: { role: { in: ['admin', 'manager', 'project_manager'] }, isActive: true },
    select: { id: true },
  });

  if (!managers.length) return;

  await prisma.notification.createMany({
    data: managers.map((m) => ({
      userId: m.id,
      title: 'Report pending approval',
      message: `${submitterName} submitted "${report.name}" for review.`,
      type: 'report_approval',
      linkType: 'reports_approval',
    })),
  });
}

export async function notifyReportAuthor(userId, report, title, message) {
  if (!userId) return;
  await prisma.notification.create({
    data: {
      userId,
      title,
      message,
      type: 'report_status',
      linkType: 'reports',
    },
  });
}
