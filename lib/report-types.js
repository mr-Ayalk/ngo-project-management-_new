export const REPORT_TYPES = [
  { value: 'daily', label: 'Daily / Activity Report', shortLabel: 'Daily', cadence: 'Daily field activities and progress logs' },
  { value: 'weekly', label: 'Weekly Report', shortLabel: 'Weekly', cadence: 'Weekly program summary and milestones' },
  { value: 'monthly', label: 'Monthly Report', shortLabel: 'Monthly', cadence: 'Monthly operational and impact summary' },
  { value: 'quarterly', label: 'Quarterly Report', shortLabel: 'Quarterly', cadence: 'Quarterly donor and board reporting' },
  { value: 'biannual', label: 'Biannual Report', shortLabel: 'Biannual', cadence: 'Mid-year strategic review and outcomes' },
  { value: 'annual', label: 'Annual Report', shortLabel: 'Annual', cadence: 'Full-year organizational impact report' },
  { value: 'incident', label: 'Incident Report', shortLabel: 'Incident', cadence: 'Safety, security, or compliance incidents' },
];

export const REPORT_STATUSES = {
  draft: { label: 'Draft', color: 'gray' },
  submitted: { label: 'Submitted', color: 'blue' },
  pending_approval: { label: 'Pending Approval', color: 'amber' },
  approved: { label: 'Approved', color: 'green' },
  rejected: { label: 'Rejected', color: 'red' },
  revision_requested: { label: 'Revision Requested', color: 'orange' },
};

export const INCIDENT_SEVERITIES = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
];

export function getReportTypeMeta(type) {
  return REPORT_TYPES.find((t) => t.value === type) || REPORT_TYPES[2];
}

export function getReportStatusMeta(status) {
  return REPORT_STATUSES[status] || REPORT_STATUSES.draft;
}

export function pageIdForReportType(type) {
  return `reports-${type}`;
}

export function reportTypeFromPageId(pageId) {
  if (!pageId?.startsWith('reports-')) return null;
  const type = pageId.replace('reports-', '');
  if (type === 'overview' || type === 'approval') return null;
  return REPORT_TYPES.some((t) => t.value === type) ? type : null;
}

export function isReportsPage(pageId) {
  return pageId === 'reports-overview' || pageId === 'reports-approval' || !!reportTypeFromPageId(pageId);
}
