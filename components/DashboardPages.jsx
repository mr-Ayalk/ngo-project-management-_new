'use client';

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

const DashboardPages = ({ currentPage }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (currentPage === 'dashboard' && chartRef.current) {
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }

      const ctx = chartRef.current.getContext('2d');
      chartInstance.current = new Chart(ctx, {
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
    }

    return () => {
      if (chartInstance.current && currentPage === 'dashboard') {
        chartInstance.current.destroy();
      }
    };
  }, [currentPage]);

  const buildCalendar = () => {
    const year = 2024, month = 4;
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const prevDays = new Date(year, month, 0).getDate();

    const events = {
      1: [{ t: 'Field Visit', c: 'green' }, { t: 'Report Due', c: 'red' }],
      6: [{ t: 'Training', c: 'amber' }],
      11: [{ t: 'Community Event', c: 'blue' }],
      13: [{ t: 'Training', c: 'amber' }],
      18: [{ t: 'Community Event', c: 'red' }],
    };

    let days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push({
        num: prevDays - firstDay + i + 1,
        otherMonth: true,
      });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      days.push({
        num: d,
        today: d === 1,
        events: events[d] || [],
      });
    }
    const remaining = 42 - firstDay - daysInMonth;
    for (let d = 1; d <= remaining; d++) {
      days.push({
        num: d,
        otherMonth: true,
      });
    }
    return days;
  };

  const calendarDays = buildCalendar();

  return (
    <div className="content">
      {/* Dashboard Page */}
      {currentPage === 'dashboard' && (
        <>
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Welcome back, Grace! Here's what's happening with your projects.</p>
          </div>

          {/* KPIs */}
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-top">
                <div>
                  <div className="kpi-label">Active Projects</div>
                  <div className="kpi-value">12</div>
                </div>
                <div className="kpi-icon blue">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/>
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
                    <polyline points="20 6 9 17 4 12"/>
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
                    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/>
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
                    <circle cx="27" cy="27" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5"/>
                    <circle cx="27" cy="27" r="22" fill="none" stroke="#1a6b3c" strokeWidth="5" strokeDasharray="94 44" strokeLinecap="round"/>
                  </svg>
                  <div className="donut-pct">68%</div>
                </div>
              </div>
              <div className="kpi-delta neutral">$24,560 of $36,000</div>
            </div>
          </div>

          {/* Mid row: chart + activities */}
          <div className="mid-row">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Project Overview</span>
                <select className="card-select"><option>This Month</option><option>Last Month</option></select>
              </div>
              <div className="chart-area">
                <canvas ref={chartRef} height="140"></canvas>
              </div>
              <div className="chart-legend">
                <div className="chart-legend-item"><div className="legend-dot" style={{background:'#d1d5db'}}></div>Planned</div>
                <div className="chart-legend-item"><div className="legend-dot" style={{background:'#1a6b3c'}}></div>Actual</div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Activities</span>
                <span className="card-action">View All</span>
              </div>
              {[
                { initials: 'GJ', bg: '#1a6b3c', title: 'Community Health Project', sub: 'Task completed by James K.', time: '2h ago' },
                { initials: 'SK', bg: '#3b82f6', title: 'Education for All', sub: 'Budget updated', time: '5h ago' },
                { initials: 'ML', bg: '#f59e0b', title: 'Clean Water Initiative', sub: 'New beneficiary added', time: '1d ago' },
                { initials: 'TA', bg: '#ef4444', title: 'Women Empowerment', sub: 'Document uploaded', time: '2d ago' },
              ].map((activity, i) => (
                <div key={i} className="activity-item">
                  <div className="act-avatar" style={{background: activity.bg}}>{activity.initials}</div>
                  <div className="act-body">
                    <div className="act-title">{activity.title}</div>
                    <div className="act-sub">{activity.sub}</div>
                  </div>
                  <div className="act-time">{activity.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom row */}
          <div className="bottom-row">
            <div className="card">
              <div className="card-header"><span className="card-title">Projects by Status</span></div>
              <div className="status-donut">
                <svg className="donut-chart" viewBox="0 0 90 90">
                  <circle cx="45" cy="45" r="30" fill="none" stroke="#e5e7eb" strokeWidth="14"/>
                  <circle cx="45" cy="45" r="30" fill="none" stroke="#1a6b3c" strokeWidth="14" strokeDasharray="113 75" strokeDashoffset="-23" transform="rotate(-90 45 45)" strokeLinecap="butt"/>
                  <circle cx="45" cy="45" r="30" fill="none" stroke="#f59e0b" strokeWidth="14" strokeDasharray="47 141" strokeDashoffset="-136" transform="rotate(-90 45 45)" strokeLinecap="butt"/>
                  <circle cx="45" cy="45" r="30" fill="none" stroke="#ef4444" strokeWidth="14" strokeDasharray="29 159" strokeDashoffset="-183" transform="rotate(-90 45 45)" strokeLinecap="butt"/>
                </svg>
                <div className="status-legend">
                  <div className="status-item"><div className="status-dot" style={{background:'#1a6b3c'}}></div>On Track — 7 (58%)</div>
                  <div className="status-item"><div className="status-dot" style={{background:'#f59e0b'}}></div>At Risk — 3 (25%)</div>
                  <div className="status-item"><div className="status-dot" style={{background:'#ef4444'}}></div>Delayed — 2 (17%)</div>
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Upcoming Tasks</span>
                <span className="card-action">View All</span>
              </div>
              {[
                { title: 'Field visit to Kaimu', project: 'Community Health Project', date: 'May 5' },
                { title: 'Submit quarterly report', project: 'Education for All', date: 'May 6' },
                { title: 'Vendor payment approval', project: 'Clean Water Initiative', date: 'May 7' },
              ].map((task, i) => (
                <div key={i} className="task-item">
                  <div className="task-check"></div>
                  <div className="task-body">
                    <div className="task-title">{task.title}</div>
                    <div className="task-project">{task.project}</div>
                  </div>
                  <div className="task-date">{task.date}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Budget Overview</span>
                <select className="card-select"><option>This Month</option></select>
              </div>
              {[
                { name: 'Community Health', amount: '$8,500', total: '$12,000', pct: 71 },
                { name: 'Education for All', amount: '$9,200', total: '$13,000', pct: 71 },
                { name: 'Clean Water Init.', amount: '$4,800', total: '$7,000', pct: 69, amber: true },
                { name: 'Women Empowerment', amount: '$4,000', total: '$7,000', pct: 57, red: true },
              ].map((item, i) => (
                <div key={i} className="budget-item">
                  <div className="budget-row"><span className="budget-name">{item.name}</span><span className="budget-pct">{item.pct}%</span></div>
                  <div className="budget-vals">{item.amount} / {item.total}</div>
                  <div className="bar-track"><div className={`bar-fill${item.amber ? ' amber' : ''}${item.red ? ' red' : ''}`} style={{width:`${item.pct}%`}}></div></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Projects Page */}
      {currentPage === 'projects' && (
        <>
          <div className="projects-topbar">
            <div>
              <h1>Projects</h1>
              <p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Manage and track all your projects in one place.</p>
            </div>
            <button className="btn-primary">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
              New Project
            </button>
          </div>
          <div className="filter-row">
            <select className="filter-select"><option>All Status</option><option>On Track</option><option>At Risk</option><option>Delayed</option></select>
            <select className="filter-select"><option>All Donors</option></select>
            <input className="search-inline" type="text" placeholder="Search projects..."/>
          </div>
          <div className="projects-table">
            <div className="table-head">
              <span>Project</span><span>Status</span><span>Progress</span><span>Budget</span><span>Start Date</span><span></span>
            </div>
            {[
              { name: 'Community Health Project', icon: 'green', status: 'on-track', progress: 71, budget: '$12,000', date: 'Jan 15, 2024' },
              { name: 'Education for All', icon: 'blue', status: 'on-track', progress: 71, budget: '$13,000', date: 'Feb 1, 2024' },
              { name: 'Clean Water Initiative', icon: 'amber', status: 'at-risk', progress: 69, budget: '$7,000', date: 'Mar 10, 2024' },
              { name: 'Women Empowerment', icon: 'red', status: 'delayed', progress: 57, budget: '$7,000', date: 'Jan 20, 2024' },
            ].map((proj, i) => (
              <div key={i} className="table-row" onClick={() => setSelectedProject(i)}>
                <div className="proj-name-cell"><div className={`proj-icon ${proj.icon}`}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div><span className="proj-name">{proj.name}</span></div>
                <span><span className={`status-badge ${proj.status}`}><span className="status-dot"></span>{proj.status === 'on-track' ? 'On Track' : proj.status === 'at-risk' ? 'At Risk' : 'Delayed'}</span></span>
                <span><div className="prog-wrap"><div className="prog-bar"><div className={`prog-fill${proj.status === 'at-risk' ? ' amber' : proj.status === 'delayed' ? ' red' : ''}`} style={{width:`${proj.progress}%`}}></div></div><span className="prog-pct">{proj.progress}%</span></div></span>
                <span className="tbl-budget">{proj.budget}</span>
                <span className="tbl-date">{proj.date}</span>
                <span><button className="more-btn">⋯</button></span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Tasks Page */}
      {currentPage === 'tasks' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Tasks</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track and manage all your tasks.</p></div>
            <button className="btn-primary"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Task</button>
          </div>
          <div className="kanban">
            {['To Do', 'In Progress', 'Completed'].map((col, i) => (
              <div key={i} className="kanban-col">
                <div className="kanban-col-header"><span className="col-title">{col}</span><span className="col-count">{i === 0 ? '4' : i === 1 ? '3' : '5'}</span></div>
                {i === 0 && [
                  { title: 'Training session for volunteers', project: 'Community Health Project', priority: 'medium', date: 'May 6' },
                  { title: 'Procure medical supplies', project: 'Community Health Project', priority: 'high', date: 'May 10' },
                  { title: 'Submit quarterly report', project: 'Education for All', priority: 'high', date: 'May 6' },
                  { title: 'Vendor payment approval', project: 'Clean Water Initiative', priority: 'medium', date: 'May 7' },
                ].map((task, j) => (
                  <div key={j} className="kanban-card"><div className="kanban-card-title">{task.title}</div><div className="kanban-card-project">{task.project}</div><div className="kanban-card-footer"><span className={`priority-badge ${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span><span className="card-due"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{task.date}</span></div></div>
                ))}

                {i === 1 && [
                  { title: 'Conduct community survey', project: 'Community Health Project', priority: 'high', date: 'May 3' },
                  { title: 'Field visit to Kaimu', project: 'Community Health Project', priority: 'medium', date: 'May 5' },
                  { title: 'Beneficiary registration drive', project: 'Women Empowerment', priority: 'low', date: 'May 12' },
                ].map((task, j) => (
                  <div key={j} className="kanban-card"><div className="kanban-card-title">{task.title}</div><div className="kanban-card-project">{task.project}</div><div className="kanban-card-footer"><span className={`priority-badge ${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span><span className="card-due"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{task.date}</span></div></div>
                ))}

                {i === 2 && [
                  { title: 'Stakeholder meeting', project: 'Education for All', priority: 'low', done: true },
                  { title: 'Water pump site survey', project: 'Clean Water Initiative', priority: 'medium', done: true },
                  { title: 'Anti-trafficking awareness session', project: 'Anti-Trafficking Program', priority: 'high', done: true },
                ].map((task, j) => (
                  <div key={j} className="kanban-card" style={{opacity: .8}}><div className="kanban-card-title" style={{textDecoration: 'line-through', color: 'var(--gray-400)'}}>{task.title}</div><div className="kanban-card-project">{task.project}</div><div className="kanban-card-footer"><span className={`priority-badge ${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span><span className="card-due" style={{color:'var(--green)'}}>Done</span></div></div>
                ))}

              </div>
            ))}
          </div>
        </>
      )}

      {/* Calendar Page */}
      {currentPage === 'calendar' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Calendar</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track milestones, deadlines, and events.</p></div>
            <button className="btn-primary">+ Add Event</button>
          </div>
          <div className="cal-grid">
            <div className="cal-main">
              <div className="cal-header">
                <span style={{fontSize:'14px',fontWeight:'600'}}>May 2024</span>
                <div className="cal-nav"><button>‹</button><button>Today</button><button>›</button></div>
              </div>
              <div className="cal-days-head">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div className="cal-days">
                {calendarDays.map((day, i) => (
                  <div key={i} className={`cal-day${day.today ? ' today' : ''}${day.otherMonth ? ' other-month' : ''}`}>
                    <div className="cal-day-num">{day.num}</div>
                    {day.events && day.events.map((evt, j) => (
                      <div key={j} className={`cal-event ${evt.c}`}>{evt.t}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="upcoming-events">
              <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'12px'}}>Upcoming Events</div>
              {[
                { title: 'Field Visit — Kaimu', date: 'May 1 · 9:00 AM', color: 'green' },
                { title: 'Report Due', date: 'May 1 · All Day', color: 'red' },
                { title: 'Training Session', date: 'May 6 · 10:00 AM', color: 'green' },
                { title: 'Community Event', date: 'May 11 · 3:00 PM', color: 'blue' },
              ].map((evt, i) => (
                <div key={i} className="event-item"><div className="event-dot" style={{background:`var(--${evt.color})`}}></div><div className="event-body"><div className="ev-title">{evt.title}</div><div className="ev-date">{evt.date}</div></div></div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Budget Page */}
      {currentPage === 'budget' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Budget</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track funding, expenses and donor contributions.</p></div>
            <button className="btn-primary">+ Add Expense</button>
          </div>
          <div className="budget-overview-grid">
            <div className="budget-big-card"><div className="budget-big-label">Total Budget</div><div className="budget-big-val">$39,000</div><div className="budget-big-sub">Across 4 active projects</div></div>
            <div className="budget-big-card"><div className="budget-big-label">Spent to Date</div><div className="budget-big-val" style={{color:'var(--green)'}}>$26,500</div><div className="budget-big-sub">68% of total budget</div></div>
            <div className="budget-big-card"><div className="budget-big-label">Remaining</div><div className="budget-big-val" style={{color:'var(--amber)'}}>$12,500</div><div className="budget-big-sub">32% remaining</div></div>
          </div>
          <div className="budget-list">
            <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'14px'}}>Project Budget Tracker</div>
            {[
              { name: 'Community Health Project', spent: '$8,500', total: '$12,000', pct: 71 },
              { name: 'Education for All', spent: '$9,200', total: '$13,000', pct: 71 },
              { name: 'Clean Water Initiative', spent: '$4,800', total: '$7,000', pct: 69, amber: true },
              { name: 'Women Empowerment', spent: '$4,000', total: '$7,000', pct: 57, red: true },
            ].map((proj, i) => (
              <div key={i} className="budget-list-row">
                <span className="budget-list-name">{proj.name}</span>
                <div className="budget-list-bar"><div className="budget-list-pcts"><span>{proj.spent} spent</span><span>{proj.total} total</span></div><div className="bar-track"><div className={`bar-fill${proj.amber ? ' amber' : ''}${proj.red ? ' red' : ''}`} style={{width:`${proj.pct}%`}}></div></div></div>
                <span className="budget-list-amt">{proj.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reports Page */}
      {currentPage === 'reports' && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Reports</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Generate and view impact reports.</p></div>
          <div className="reports-grid">
            {[
              { name: 'Project Progress Report', date: 'May 1, 2024' },
              { name: 'Financial Report', date: 'Apr 30, 2024' },
              { name: 'Beneficiary Report', date: 'Apr 28, 2024' },
              { name: 'Impact Report', date: 'Apr 20, 2024' },
            ].map((report, i) => (
              <div key={i} className="report-card"><div className="report-icon"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><div className="report-name">{report.name}</div><div className="report-date">{report.date}</div></div>
            ))}
          </div>
        </>
      )}

      {/* Beneficiaries Page */}
      {currentPage === 'beneficiaries' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Beneficiaries</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track and manage all program beneficiaries.</p></div>
            <button className="btn-primary">+ Add Beneficiary</button>
          </div>
          <div className="bene-stats">
            <div className="bene-card"><div className="bene-num">4,670</div><div className="bene-label">Total Beneficiaries</div></div>
            <div className="bene-card"><div className="bene-num" style={{color:'#3b82f6'}}>1,240</div><div className="bene-label">Children (OVC)</div></div>
            <div className="bene-card"><div className="bene-num" style={{color:'#f59e0b'}}>2,100</div><div className="bene-label">Women & Families</div></div>
            <div className="bene-card"><div className="bene-num" style={{color:'#ef4444'}}>1,330</div><div className="bene-label">Community Members</div></div>
          </div>
          <div className="bene-table">
            <div className="bene-table-head"><span>Name</span><span>Program</span><span>Region</span><span>Status</span><span>Enrolled</span></div>
            {[
              { name: 'Abebe Tadesse', program: 'Health', region: 'Oromia', status: 'on-track', date: 'Jan 2024' },
              { name: 'Tigist Haile', program: 'Education', region: 'Addis Ababa', status: 'on-track', date: 'Feb 2024' },
              { name: 'Worku Girma', program: 'WASH', region: 'South West', status: 'at-risk', date: 'Mar 2024' },
              { name: 'Meron Bekele', program: 'Women Empower.', region: 'Southern', status: 'on-track', date: 'Jan 2024' },
            ].map((bene, i) => (
              <div key={i} className="bene-row"><span className="bene-name">{bene.name}</span><span className="bene-cell">{bene.program}</span><span className="bene-cell">{bene.region}</span><span><span className={`status-badge ${bene.status}`} style={{fontSize:'10px'}}>{bene.status === 'on-track' ? 'Active' : 'Follow-up'}</span></span><span className="bene-cell">{bene.date}</span></div>
            ))}
          </div>
        </>
      )}

      {/* Documents Page */}
      {currentPage === 'documents' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Documents</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Manage project files, proposals, and contracts.</p></div>
            <button className="btn-primary">+ Upload</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'14px'}}>
            {[
              { icon: '📄', name: 'Project Proposal.pdf', date: 'Community Health · Jan 10' },
              { icon: '📊', name: 'Q1 Financial Report.xlsx', date: 'All Projects · Apr 5' },
              { icon: '📋', name: 'MoU_HealthMinistry.pdf', date: 'Gov. Partners · Jan 20' },
              { icon: '🖼️', name: 'Field Photos Apr 2024.zip', date: 'WASH Project · Apr 28' },
            ].map((doc, i) => (
              <div key={i} style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',cursor:'pointer',boxShadow:'var(--shadow)'}}>
                <div style={{fontSize:'32px',marginBottom:'8px'}}>{doc.icon}</div>
                <div style={{fontSize:'12.5px',fontWeight:'500',color:'var(--gray-800)'}}>{doc.name}</div>
                <div style={{fontSize:'11px',color:'var(--gray-400)',marginTop:'3px'}}>{doc.date}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Partners Page */}
      {currentPage === 'partners' && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Partners</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Donors, government bodies, and organizational partners.</p></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'14px'}}>
            {[
              { name: 'Global Health Fund', type: 'Donor', desc: 'Supporting Community Health Project · $12,000' },
              { name: 'Thinking Schools', type: 'Educational Partner', desc: 'Education for All program support' },
              { name: 'Micah Shea', type: 'Donor', desc: 'Women Empowerment & Wellbeing' },
              { name: 'Sunriders Foundation', type: 'Donor', desc: 'Clean Water Initiative · $7,000' },
              { name: 'Ministry of Health', type: 'Government Partner', desc: 'Regional level collaboration' },
              { name: 'Sterling Foundation', type: 'Donor', desc: 'WASH & Education programs' },
            ].map((partner, i) => (
              <div key={i} style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
                <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'4px'}}>{partner.name}</div>
                <div style={{fontSize:'11px',color:'var(--gray-400)',marginBottom:'8px'}}>{partner.type}</div>
                <div style={{fontSize:'12px',color:'var(--gray-600)'}}>{partner.desc}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Messages Page */}
      {currentPage === 'messages' && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Messages</h1></div>
          <div style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'40px',textAlign:'center',boxShadow:'var(--shadow)'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>💬</div>
            <div style={{fontSize:'14px',fontWeight:'500',color:'var(--gray-700)',marginBottom:'6px'}}>Team Messages</div>
            <div style={{fontSize:'12px',color:'var(--gray-400)'}}>In-app messaging module — coming in next sprint.</div>
          </div>
        </>
      )}

      {/* Settings Page */}
      {currentPage === 'settings' && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Settings</h1></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <div style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
              <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'14px'}}>Organization Info</div>
              <div style={{marginBottom:'10px'}}><div style={{fontSize:'11px',color:'var(--gray-500)',marginBottom:'4px'}}>Organization Name</div><input style={{width:'100%',padding:'7px 10px',border:'1px solid var(--gray-200)',borderRadius:'7px',fontFamily:'inherit',fontSize:'12px'}} defaultValue="Engage Now Africa"/></div>
              <div style={{marginBottom:'10px'}}><div style={{fontSize:'11px',color:'var(--gray-500)',marginBottom:'4px'}}>Country</div><input style={{width:'100%',padding:'7px 10px',border:'1px solid var(--gray-200)',borderRadius:'7px',fontFamily:'inherit',fontSize:'12px'}} defaultValue="Ethiopia"/></div>
              <button className="btn-primary" style={{fontSize:'11px'}}>Save Changes</button>
            </div>
            <div style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
              <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'14px'}}>Manage Users & Roles</div>
              <div style={{border:'1px solid var(--gray-100)',borderRadius:'8px',overflow:'hidden'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px',padding:'8px 12px',background:'var(--gray-50)',fontSize:'11px',fontWeight:'600',color:'var(--gray-500)'}}><span>NAME</span><span>ROLE</span><span>STATUS</span></div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px',padding:'9px 12px',borderTop:'1px solid var(--gray-100)',fontSize:'12px'}}><span>Grace Johnson</span><span style={{color:'var(--green)'}}>Program Mgr</span><span style={{color:'var(--green)'}}>Active</span></div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPages;
