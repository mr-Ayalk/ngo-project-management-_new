'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { useRouter } from 'next/navigation';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const chartRef = useRef(null);
  const [chartInstance, setChartInstance] = useState(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (chartRef.current && !chartInstance) {
      const ctx = chartRef.current.getContext('2d');
      const newChart = new Chart(ctx, {
        type: 'line',
        data: {
          labels: ['Apr 1', 'Apr 8', 'Apr 15', 'Apr 22', 'Apr 29'],
          datasets: [
            {
              label: 'Planned',
              data: [20, 40, 55, 70, 90],
              borderColor: '#d1d5db',
              borderDash: [5, 4],
              borderWidth: 1.5,
              pointRadius: 0,
              tension: 0.4,
              fill: false,
            },
            {
              label: 'Actual',
              data: [18, 38, 52, 68, 88],
              borderColor: '#1a6b3c',
              borderWidth: 2,
              pointRadius: 0,
              tension: 0.4,
              fill: true,
              backgroundColor: 'rgba(26,107,60,0.07)',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: { mode: 'index', intersect: false },
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: { font: { size: 10, family: 'DM Sans' }, color: '#9ca3af' },
            },
            y: {
              grid: { color: '#f3f4f6' },
              ticks: { font: { size: 10, family: 'DM Sans' }, color: '#9ca3af' },
              min: 0,
              max: 100,
            },
          },
        },
      });
      setChartInstance(newChart);
    }
    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartInstance]);

  if (loading || !user) return <div className="flex items-center justify-center h-screen">Loading...</div>;

  return (
    <>
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Welcome back, {user.name}! Here's what's happening with your projects.</p>
      </div>

      {/* KPI Grid */}
      <div className="kpi-grid">
        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Active Projects</div>
              <div className="kpi-value">12</div>
            </div>
            <div className="kpi-icon blue">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
              </svg>
            </div>
          </div>
          <div className="kpi-delta">+2 from last month</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Tasks Completed</div>
              <div className="kpi-value">248</div>
            </div>
            <div className="kpi-icon green">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
          </div>
          <div className="kpi-delta">+13% from last month</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Total Beneficiaries</div>
              <div className="kpi-value">4,670</div>
            </div>
            <div className="kpi-icon green">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
            </div>
          </div>
          <div className="kpi-delta">+532 this month</div>
        </div>

        <div className="kpi-card">
          <div className="kpi-top">
            <div>
              <div className="kpi-label">Budget Utilized</div>
              <div className="kpi-value">68%</div>
            </div>
            <div className="donut-wrap">
              <svg viewBox="0 0 54 54">
                <circle cx="27" cy="27" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                <circle cx="27" cy="27" r="22" fill="none" stroke="#1a6b3c" strokeWidth="5" strokeDasharray="94 44" strokeLinecap="round" />
              </svg>
              <div className="donut-pct">68%</div>
            </div>
          </div>
          <div className="kpi-delta neutral">$24,560 of $36,000</div>
        </div>
      </div>

      {/* Mid Row: Chart + Activities */}
      <div className="mid-row">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Project Overview</span>
            <select className="card-select">
              <option>This Month</option>
              <option>Last Month</option>
            </select>
          </div>
          <div className="chart-area">
            <canvas ref={chartRef} height="140" />
          </div>
          <div className="chart-legend">
            <div className="chart-legend-item">
              <div className="legend-dot" style={{ background: '#d1d5db' }} />
              Planned
            </div>
            <div className="chart-legend-item">
              <div className="legend-dot" style={{ background: '#1a6b3c' }} />
              Actual
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Activities</span>
            <span className="card-action">View All</span>
          </div>
          <div className="activity-item">
            <div className="act-avatar" style={{ background: '#1a6b3c' }}>
              GJ
            </div>
            <div className="act-body">
              <div className="act-title">Community Health Project</div>
              <div className="act-sub">Task completed by James K.</div>
            </div>
            <div className="act-time">2h ago</div>
          </div>
          <div className="activity-item">
            <div className="act-avatar" style={{ background: '#3b82f6' }}>
              SK
            </div>
            <div className="act-body">
              <div className="act-title">Education for All</div>
              <div className="act-sub">Budget updated</div>
            </div>
            <div className="act-time">5h ago</div>
          </div>
          <div className="activity-item">
            <div className="act-avatar" style={{ background: '#f59e0b' }}>
              ML
            </div>
            <div className="act-body">
              <div className="act-title">Clean Water Initiative</div>
              <div className="act-sub">New beneficiary added</div>
            </div>
            <div className="act-time">1d ago</div>
          </div>
          <div className="activity-item">
            <div className="act-avatar" style={{ background: '#ef4444' }}>
              TA
            </div>
            <div className="act-body">
              <div className="act-title">Women Empowerment</div>
              <div className="act-sub">Document uploaded</div>
            </div>
            <div className="act-time">2d ago</div>
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="bottom-row">
        <div className="card">
          <div className="card-header">
            <span className="card-title">Projects by Status</span>
          </div>
          <div className="status-donut">
            <svg className="donut-chart" viewBox="0 0 90 90">
              <circle cx="45" cy="45" r="30" fill="none" stroke="#e5e7eb" strokeWidth="14" />
              <circle cx="45" cy="45" r="30" fill="none" stroke="#1a6b3c" strokeWidth="14" strokeDasharray="113 75" strokeDashoffset="-23" transform="rotate(-90 45 45)" strokeLinecap="butt" />
              <circle cx="45" cy="45" r="30" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="47 141" strokeDashoffset="-136" transform="rotate(-90 45 45)" strokeLinecap="butt" />
              <circle cx="45" cy="45" r="30" fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray="29 159" strokeDashoffset="-183" transform="rotate(-90 45 45)" strokeLinecap="butt" />
            </svg>
            <div className="status-legend">
              <div className="status-item">
                <div className="status-dot" style={{ background: '#1a6b3c' }} />
                On Track — 7 (58%)
              </div>
              <div className="status-item">
                <div className="status-dot" style={{ background: '#f59e0b' }} />
                At Risk — 3 (25%)
              </div>
              <div className="status-item">
                <div className="status-dot" style={{ background: '#ef4444' }} />
                Delayed — 2 (17%)
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Upcoming Tasks</span>
            <span className="card-action">View All</span>
          </div>
          <div className="task-item">
            <div className="task-check" />
            <div className="task-body">
              <div className="task-title">Field visit to Kaimu</div>
              <div className="task-project">Community Health Project</div>
            </div>
            <div className="task-date">May 5</div>
          </div>
          <div className="task-item">
            <div className="task-check" />
            <div className="task-body">
              <div className="task-title">Submit quarterly report</div>
              <div className="task-project">Education for All</div>
            </div>
            <div className="task-date">May 6</div>
          </div>
          <div className="task-item">
            <div className="task-check" />
            <div className="task-body">
              <div className="task-title">Vendor payment approval</div>
              <div className="task-project">Clean Water Initiative</div>
            </div>
            <div className="task-date">May 7</div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">Budget Overview</span>
            <select className="card-select">
              <option>This Month</option>
            </select>
          </div>
          <div className="budget-item">
            <div className="budget-row">
              <span className="budget-name">Community Health</span>
              <span className="budget-pct">71%</span>
            </div>
            <div className="budget-vals">$8,500 / $12,000</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: '71%' }} />
            </div>
          </div>
          <div className="budget-item">
            <div className="budget-row">
              <span className="budget-name">Education for All</span>
              <span className="budget-pct">71%</span>
            </div>
            <div className="budget-vals">$9,200 / $13,000</div>
            <div className="bar-track">
              <div className="bar-fill" style={{ width: '71%' }} />
            </div>
          </div>
          <div className="budget-item">
            <div className="budget-row">
              <span className="budget-name">Clean Water Init.</span>
              <span className="budget-pct">69%</span>
            </div>
            <div className="budget-vals">$4,800 / $7,000</div>
            <div className="bar-track">
              <div className="bar-fill amber" style={{ width: '69%' }} />
            </div>
          </div>
          <div className="budget-item">
            <div className="budget-row">
              <span className="budget-name">Women Empowerment</span>
              <span className="budget-pct">57%</span>
            </div>
            <div className="budget-vals">$4,000 / $7,000</div>
            <div className="bar-track">
              <div className="bar-fill red" style={{ width: '57%' }} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
