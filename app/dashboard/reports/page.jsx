'use client';

export default function ReportsPage() {
  const reports = [
    { id: 1, name: 'Quarterly Impact Report', description: 'Comprehensive overview of project outcomes and beneficiary impact metrics', date: 'Apr 25, 2024' },
    { id: 2, name: 'Financial Report', description: 'Detailed breakdown of income, expenses, and budget utilization across projects', date: 'Apr 20, 2024' },
    { id: 3, name: 'Beneficiary Survey Results', description: 'Feedback and satisfaction scores from recent beneficiary engagement survey', date: 'Apr 15, 2024' },
    { id: 4, name: 'Risk & Mitigation Analysis', description: 'Identified risks, mitigation strategies, and monitoring plan for Q2 2024', date: 'Apr 10, 2024' },
  ];

  const handleDownload = (reportName) => {
    alert(`Downloading: ${reportName}`);
  };

  const handleShare = (reportName) => {
    alert(`Sharing: ${reportName}`);
  };

  return (
    <>
      <div className="page-header">
        <h1>Reports</h1>
        <p>Access and download all your project reports and analytics.</p>
      </div>

      <div className="reports-grid">
        {reports.map((report) => (
          <div key={report.id} className="report-card">
            <div className="report-icon">
              <svg fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8 14 8.67 14 9.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5 7.67 11 8.5 11zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
              </svg>
            </div>
            <div className="report-name">{report.name}</div>
            <div className="report-date">{report.description}</div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 8 }}>
              Generated: {report.date}
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
              <button
                onClick={() => handleDownload(report.name)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: '#1a6b3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Download
              </button>
              <button
                onClick={() => handleShare(report.name)}
                style={{
                  flex: 1,
                  padding: '6px 12px',
                  background: '#f9fafb',
                  color: '#1a6b3c',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 11,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
