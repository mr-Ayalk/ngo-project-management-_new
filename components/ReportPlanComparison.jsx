'use client';

export default function ReportPlanComparison({ planData, activityRows = [] }) {
  if (!planData && !activityRows?.length) {
    return (
      <div className="report-plan-compare empty">
        <p>Select a project to compare planned outputs with reported achievements.</p>
      </div>
    );
  }

  const outputs = planData?.outputs || [];
  const outcomes = planData?.outcomes || [];

  return (
    <div className="report-plan-compare">
      <h4 className="report-detail-heading">Planned vs Reported Comparison</h4>
      <p className="report-plan-compare-hint">
        Review what was planned in the project logframe against what the author reported in the activity table.
      </p>

      {outputs.length > 0 && (
        <div className="report-plan-section">
          <h5>Planned Outputs (Logframe)</h5>
          <div className="report-plan-table-wrap">
            <table className="report-plan-table">
              <thead>
                <tr>
                  <th>Output</th>
                  <th>Target</th>
                  <th>Achieved (Plan)</th>
                  <th>Unit</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {outputs.map((o) => (
                  <tr key={o.id}>
                    <td>{o.title}</td>
                    <td>{o.targetQty ?? '—'}</td>
                    <td>{o.achievedQty ?? 0}</td>
                    <td>{o.unit || '—'}</td>
                    <td>
                      <span className={`report-plan-pct${o.progress >= 100 ? ' complete' : o.progress < 50 ? ' low' : ''}`}>
                        {o.progress ?? 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {outcomes.length > 0 && (
        <div className="report-plan-section">
          <h5>Planned Outcomes</h5>
          <div className="report-plan-table-wrap">
            <table className="report-plan-table">
              <thead>
                <tr>
                  <th>Outcome</th>
                  <th>Indicator</th>
                  <th>Target</th>
                  <th>Baseline</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {outcomes.map((o) => (
                  <tr key={o.id}>
                    <td>{o.title}</td>
                    <td>{o.indicator || '—'}</td>
                    <td>{o.targetValue ?? '—'}</td>
                    <td>{o.baseline ?? '—'}</td>
                    <td>{o.progress ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activityRows.length > 0 && (
        <div className="report-plan-section">
          <h5>Reported Activities (This Submission)</h5>
          <div className="report-plan-table-wrap">
            <table className="report-plan-table">
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Indicator</th>
                  <th>Planned</th>
                  <th>Achieved</th>
                  <th>Variance</th>
                </tr>
              </thead>
              <tbody>
                {activityRows.map((row, i) => {
                  const planned = parseFloat(row.planned);
                  const achieved = parseFloat(row.achieved);
                  let variance = '—';
                  let varianceClass = '';
                  if (!Number.isNaN(planned) && !Number.isNaN(achieved) && planned > 0) {
                    const pct = Math.round((achieved / planned) * 100);
                    variance = `${pct}%`;
                    varianceClass = pct >= 100 ? ' complete' : pct < 75 ? ' low' : '';
                  }
                  return (
                    <tr key={i}>
                      <td>{row.activity || '—'}</td>
                      <td>{row.indicator || '—'}</td>
                      <td>{row.planned || '—'}</td>
                      <td>{row.achieved || '—'}</td>
                      <td><span className={`report-plan-pct${varianceClass}`}>{variance}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
