/** Standard NGO activity report table (paper format → digital). */
export const REPORT_TABLE_COLUMNS = [
  { key: 'sno', label: 'No.', width: '48px' },
  { key: 'activity', label: 'Activity / Output', width: 'auto' },
  { key: 'indicator', label: 'Indicator', width: 'auto' },
  { key: 'planned', label: 'Planned Target', width: '110px' },
  { key: 'achieved', label: 'Achieved / Actual', width: '110px' },
  { key: 'unit', label: 'Unit', width: '80px' },
  { key: 'location', label: 'Location', width: 'auto' },
  { key: 'remarks', label: 'Remarks / Variance', width: 'auto' },
];

export function emptyReportTableRow(sno = 1) {
  return {
    sno,
    activity: '',
    indicator: '',
    planned: '',
    achieved: '',
    unit: '',
    location: '',
    remarks: '',
  };
}

export function defaultReportTableRows(count = 3) {
  return Array.from({ length: count }, (_, i) => emptyReportTableRow(i + 1));
}

export function parseReportTable(raw) {
  if (!raw) return defaultReportTableRows();
  if (Array.isArray(raw)) return raw.length ? raw : defaultReportTableRows();
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length ? parsed : defaultReportTableRows();
  } catch {
    return defaultReportTableRows();
  }
}

export function serializeReportTable(rows) {
  return JSON.stringify(
    (rows || []).map((r, i) => ({
      sno: r.sno ?? i + 1,
      activity: String(r.activity || '').trim(),
      indicator: String(r.indicator || '').trim(),
      planned: String(r.planned || '').trim(),
      achieved: String(r.achieved || '').trim(),
      unit: String(r.unit || '').trim(),
      location: String(r.location || '').trim(),
      remarks: String(r.remarks || '').trim(),
    })),
  );
}

export function isValidDriveLink(url) {
  if (!url || typeof url !== 'string') return true;
  const trimmed = url.trim();
  if (!trimmed) return true;
  try {
    const u = new URL(trimmed);
    return u.protocol === 'https:' || u.protocol === 'http:';
  } catch {
    return false;
  }
}
