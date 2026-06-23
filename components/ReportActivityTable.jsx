'use client';

import { REPORT_TABLE_COLUMNS } from '@/lib/report-table';

export default function ReportActivityTable({ rows = [], onChange, readOnly = false }) {
  const updateRow = (index, field, value) => {
    if (readOnly || !onChange) return;
    const next = rows.map((r, i) => (i === index ? { ...r, [field]: value } : r));
    onChange(next);
  };

  const addRow = () => {
    if (readOnly || !onChange) return;
    onChange([
      ...rows,
      {
        sno: rows.length + 1,
        activity: '',
        indicator: '',
        planned: '',
        achieved: '',
        unit: '',
        location: '',
        remarks: '',
      },
    ]);
  };

  const removeRow = (index) => {
    if (readOnly || !onChange || rows.length <= 1) return;
    onChange(rows.filter((_, i) => i !== index).map((r, i) => ({ ...r, sno: i + 1 })));
  };

  return (
    <div className="report-activity-table-wrap">
      <div className="report-activity-table-header">
        <h4 className="report-detail-heading">Activity Report Table</h4>
        {!readOnly && (
          <button type="button" className="btn-secondary btn-sm" onClick={addRow}>+ Add Row</button>
        )}
      </div>
      <div className="report-activity-table-scroll">
        <table className="report-activity-table">
          <thead>
            <tr>
              {REPORT_TABLE_COLUMNS.map((col) => (
                <th key={col.key} style={col.width !== 'auto' ? { width: col.width } : undefined}>{col.label}</th>
              ))}
              {!readOnly && <th className="report-table-actions-col" />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={index}>
                <td className="report-table-sno">{row.sno ?? index + 1}</td>
                {REPORT_TABLE_COLUMNS.slice(1).map((col) => (
                  <td key={col.key}>
                    {readOnly ? (
                      <span className="report-table-cell-text">{row[col.key] || '—'}</span>
                    ) : (
                      <input
                        type="text"
                        className="report-table-input"
                        value={row[col.key] || ''}
                        onChange={(e) => updateRow(index, col.key, e.target.value)}
                        placeholder={col.label}
                      />
                    )}
                  </td>
                ))}
                {!readOnly && (
                  <td className="report-table-actions-col">
                    <button type="button" className="report-table-remove" onClick={() => removeRow(index)} aria-label="Remove row">×</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
