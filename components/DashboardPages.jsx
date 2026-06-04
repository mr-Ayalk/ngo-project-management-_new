'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import api from '@/lib/api';

function Loading() {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>
      Loading...
    </div>
  );
}

function ErrorMsg({ message }) {
  return (
    <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontSize: '13px' }}>
      {message || 'Failed to load data. Make sure the database is connected and seeded.'}
    </div>
  );
}

const DashboardPages = ({ currentPage }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState(null);
  const [calendar, setCalendar] = useState(null);
  const [budget, setBudget] = useState(null);
  const [reports, setReports] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [partners, setPartners] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [users, setUsers] = useState([]);
  const [messages, setMessages] = useState(null);

  const [projectFilter, setProjectFilter] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [beneRegion, setBeneRegion] = useState('all');
  const [beneSearch, setBeneSearch] = useState('');
  const [docCategory, setDocCategory] = useState('all');
  const [orgForm, setOrgForm] = useState({ name: '', country: '' });
  const [savingOrg, setSavingOrg] = useState(false);

  const [calYear, setCalYear] = useState(2024);
  const [calMonth, setCalMonth] = useState(5);

  const loadPageData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      switch (currentPage) {
        case 'dashboard':
          setDashboard(await api.dashboard());
          break;
        case 'projects': {
          const params = {};
          if (projectFilter !== 'all') params.status = projectFilter;
          if (projectSearch) params.search = projectSearch;
          setProjects(await api.projects(params));
          break;
        }
        case 'tasks':
          setTasks(await api.tasks());
          break;
        case 'calendar':
          setCalendar(await api.calendar(calYear, calMonth));
          break;
        case 'budget':
          setBudget(await api.budget());
          break;
        case 'reports':
          setReports(await api.reports());
          break;
        case 'beneficiaries': {
          const params = {};
          if (beneRegion !== 'all') params.region = beneRegion;
          if (beneSearch) params.search = beneSearch;
          setBeneficiaries(await api.beneficiaries(params));
          break;
        }
        case 'documents': {
          const params = {};
          if (docCategory !== 'all') params.category = docCategory;
          const data = await api.documents(params);
          setDocuments(data.documents || data);
          break;
        }
        case 'partners':
          setPartners(await api.partners());
          break;
        case 'messages':
          setMessages(await api.messages());
          break;
        case 'settings': {
          const [org, userList] = await Promise.all([api.organization(), api.users()]);
          setOrganization(org);
          setOrgForm({ name: org.name || '', country: org.country || '' });
          setUsers(userList);
          break;
        }
        default:
          break;
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentPage, projectFilter, projectSearch, beneRegion, beneSearch, docCategory, calYear, calMonth]);

  useEffect(() => {
    loadPageData();
  }, [loadPageData]);

  useEffect(() => {
    if (selectedProject?.id) {
      api.project(selectedProject.id).then(setProjectDetail).catch(() => setProjectDetail(null));
    } else {
      setProjectDetail(null);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (currentPage !== 'dashboard' || !dashboard?.chart || !chartRef.current) return;

    if (chartInstance.current) chartInstance.current.destroy();

    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dashboard.chart.labels,
        datasets: [
          {
            label: 'Planned',
            data: dashboard.chart.planned,
            borderColor: '#d1d5db',
            borderDash: [5, 4],
            borderWidth: 1.5,
            pointRadius: 0,
            tension: 0.4,
            fill: false,
          },
          {
            label: 'Actual',
            data: dashboard.chart.actual,
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
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10, family: 'DM Sans' }, color: '#9ca3af' } },
          y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10, family: 'DM Sans' }, color: '#9ca3af' }, min: 0, max: 100 },
        },
      },
    });

    return () => {
      if (chartInstance.current) chartInstance.current.destroy();
    };
  }, [currentPage, dashboard]);

  const handleSaveOrg = async () => {
    setSavingOrg(true);
    try {
      const updated = await api.updateOrganization(orgForm);
      setOrganization(updated);
    } catch (err) {
      alert(err.message);
    } finally {
      setSavingOrg(false);
    }
  };

  const statusLabel = (s) => (s === 'on-track' ? 'On Track' : s === 'at-risk' ? 'At Risk' : 'Delayed');

  if (loading && !dashboard && !projects.length && !tasks) {
    return <Loading />;
  }

  if (error && !dashboard && !projects.length && !tasks && !budget) {
    return <ErrorMsg message={error} />;
  }

  return (
    <div className="content">
      {/* Dashboard */}
      {currentPage === 'dashboard' && dashboard && (
        <>
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Welcome back, Grace! Here&apos;s what&apos;s happening with your projects.</p>
          </div>
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-top">
                <div>
                  <div className="kpi-label">Active Projects</div>
                  <div className="kpi-value">{dashboard.kpis.activeProjects}</div>
                </div>
                <div className="kpi-icon blue">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
                </div>
              </div>
              <div className="kpi-delta">{dashboard.kpis.activeProjectsDelta}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-top">
                <div>
                  <div className="kpi-label">Tasks Completed</div>
                  <div className="kpi-value">{dashboard.kpis.tasksCompleted}</div>
                </div>
                <div className="kpi-icon green">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
                </div>
              </div>
              <div className="kpi-delta">{dashboard.kpis.tasksCompletedDelta}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-top">
                <div>
                  <div className="kpi-label">Total Beneficiaries</div>
                  <div className="kpi-value">{dashboard.kpis.totalBeneficiaries.toLocaleString()}</div>
                </div>
                <div className="kpi-icon green">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
                </div>
              </div>
              <div className="kpi-delta">{dashboard.kpis.beneficiariesDelta}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-top">
                <div>
                  <div className="kpi-label">Budget Utilized</div>
                  <div className="kpi-value">{dashboard.kpis.budgetUtilizedPct}%</div>
                </div>
                <div className="donut-wrap">
                  <svg viewBox="0 0 54 54">
                    <circle cx="27" cy="27" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5"/>
                    <circle cx="27" cy="27" r="22" fill="none" stroke="#1a6b3c" strokeWidth="5" strokeDasharray={`${dashboard.kpis.budgetUtilizedPct * 1.38} ${138 - dashboard.kpis.budgetUtilizedPct * 1.38}`} strokeLinecap="round"/>
                  </svg>
                  <div className="donut-pct">{dashboard.kpis.budgetUtilizedPct}%</div>
                </div>
              </div>
              <div className="kpi-delta neutral">{dashboard.kpis.budgetSpent} of {dashboard.kpis.budgetTotal}</div>
            </div>
          </div>

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
              {dashboard.activities.map((activity, i) => (
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

          <div className="bottom-row">
            <div className="card">
              <div className="card-header"><span className="card-title">Projects by Status</span></div>
              <div className="status-donut">
                <div className="status-legend">
                  {dashboard.projectStatusSummary.map((s, i) => (
                    <div key={i} className="status-item">
                      <div className="status-dot" style={{background: i === 0 ? '#1a6b3c' : i === 1 ? '#f59e0b' : '#ef4444'}}></div>
                      {s.status} — {s.count} ({s.pct}%)
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Upcoming Tasks</span>
                <span className="card-action">View All</span>
              </div>
              {dashboard.upcomingTasks.map((task, i) => (
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
              {dashboard.budgetOverview.map((item, i) => (
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

      {/* Projects */}
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
            <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="all">All Status</option>
              <option value="on-track">On Track</option>
              <option value="at-risk">At Risk</option>
              <option value="delayed">Delayed</option>
            </select>
            <input className="search-inline" type="text" placeholder="Search projects..." value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadPageData()} />
          </div>
          {loading ? <Loading /> : (
            <div className="projects-table">
              <div className="table-head">
                <span>Project</span><span>Status</span><span>Progress</span><span>Budget</span><span>Start Date</span><span></span>
              </div>
              {projects.map((proj) => (
                <div key={proj.id} className="table-row" onClick={() => setSelectedProject(proj)}>
                  <div className="proj-name-cell">
                    <div className={`proj-icon ${proj.icon}`}>
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
                    </div>
                    <span className="proj-name">{proj.name}</span>
                  </div>
                  <span><span className={`status-badge ${proj.status}`}><span className="status-dot"></span>{statusLabel(proj.status)}</span></span>
                  <span><div className="prog-wrap"><div className="prog-bar"><div className={`prog-fill${proj.status === 'at-risk' ? ' amber' : proj.status === 'delayed' ? ' red' : ''}`} style={{width:`${proj.progress}%`}}></div></div><span className="prog-pct">{proj.progress}%</span></div></span>
                  <span className="tbl-budget">{proj.budget}</span>
                  <span className="tbl-date">{proj.date}</span>
                  <span><button className="more-btn">⋯</button></span>
                </div>
              ))}
            </div>
          )}
          {selectedProject && projectDetail && (
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.4)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:100}} onClick={() => setSelectedProject(null)}>
              <div style={{background:'#fff',borderRadius:'12px',padding:'24px',width:'560px',maxHeight:'80vh',overflow:'auto'}} onClick={(e) => e.stopPropagation()}>
                <h2 style={{fontSize:'18px',fontWeight:'600',marginBottom:'8px'}}>{projectDetail.name}</h2>
                <p style={{fontSize:'12px',color:'var(--gray-500)',marginBottom:'16px'}}>{projectDetail.description}</p>
                <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
                  {['overview','tasks','budget','documents'].map((tab) => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{padding:'6px 12px',borderRadius:'6px',border:'1px solid var(--gray-200)',background:activeTab===tab?'var(--green)':'#fff',color:activeTab===tab?'#fff':'inherit',fontSize:'11px',cursor:'pointer',textTransform:'capitalize'}}>{tab}</button>
                  ))}
                </div>
                {activeTab === 'overview' && (
                  <div style={{fontSize:'12px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                    <div><strong>Manager:</strong> {projectDetail.manager}</div>
                    <div><strong>Spent:</strong> {projectDetail.spent}</div>
                    <div><strong>Utilization:</strong> {projectDetail.utilization}</div>
                    <div><strong>Due:</strong> {projectDetail.dueDate}</div>
                  </div>
                )}
                {activeTab === 'tasks' && projectDetail.tasks.map((t, i) => (
                  <div key={i} style={{padding:'8px 0',borderBottom:'1px solid var(--gray-100)',fontSize:'12px',display:'flex',justifyContent:'space-between'}}>
                    <span>{t.name}</span><span style={{color:'var(--gray-400)'}}>{t.assignee} · {t.status}</span>
                  </div>
                ))}
                {activeTab === 'budget' && projectDetail.budgetCategories.map((b, i) => (
                  <div key={i} style={{padding:'8px 0',fontSize:'12px'}}>
                    <div style={{display:'flex',justifyContent:'space-between'}}><span>{b.category}</span><span>{b.spent} / {b.allocated}</span></div>
                    <div className="bar-track" style={{marginTop:'4px'}}><div className="bar-fill" style={{width:`${b.pct}%`}}></div></div>
                  </div>
                ))}
                {activeTab === 'documents' && (
                  <p style={{fontSize:'12px',color:'var(--gray-400)'}}>{projectDetail.documents?.length || 0} documents attached</p>
                )}
              </div>
            </div>
          )}
        </>
      )}

      {/* Tasks */}
      {currentPage === 'tasks' && tasks && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Tasks</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track and manage all your tasks.</p></div>
            <button className="btn-primary"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Task</button>
          </div>
          <div className="kanban">
            {[
              { key: 'todo', label: 'To Do' },
              { key: 'in_progress', label: 'In Progress' },
              { key: 'completed', label: 'Completed' },
            ].map(({ key, label }) => (
              <div key={key} className="kanban-col">
                <div className="kanban-col-header">
                  <span className="col-title">{label}</span>
                  <span className="col-count">{tasks.counts[key]}</span>
                </div>
                {tasks.columns[key].map((task) => (
                  <div key={task.id} className="kanban-card" style={task.done ? {opacity: 0.8} : {}}>
                    <div className="kanban-card-title" style={task.done ? {textDecoration:'line-through',color:'var(--gray-400)'} : {}}>{task.title}</div>
                    <div className="kanban-card-project">{task.project}</div>
                    <div className="kanban-card-footer">
                      <span className={`priority-badge ${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                      <span className="card-due" style={task.done ? {color:'var(--green)'} : {}}>
                        {task.done ? 'Done' : task.date}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Calendar */}
      {currentPage === 'calendar' && calendar && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Calendar</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track milestones, deadlines, and events.</p></div>
            <button className="btn-primary">+ Add Event</button>
          </div>
          <div className="cal-grid">
            <div className="cal-main">
              <div className="cal-header">
                <span style={{fontSize:'14px',fontWeight:'600'}}>{calendar.monthLabel}</span>
                <div className="cal-nav">
                  <button onClick={() => { const m = calMonth === 1 ? 12 : calMonth - 1; setCalYear(calMonth === 1 ? calYear - 1 : calYear); setCalMonth(m); }}>‹</button>
                  <button onClick={() => { setCalYear(new Date().getFullYear()); setCalMonth(new Date().getMonth() + 1); }}>Today</button>
                  <button onClick={() => { const m = calMonth === 12 ? 1 : calMonth + 1; setCalYear(calMonth === 12 ? calYear + 1 : calYear); setCalMonth(m); }}>›</button>
                </div>
              </div>
              <div className="cal-days-head">
                <span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span>
              </div>
              <div className="cal-days">
                {calendar.days.map((day, i) => (
                  <div key={i} className={`cal-day${day.today ? ' today' : ''}${day.otherMonth ? ' other-month' : ''}`}>
                    <div className="cal-day-num">{day.num}</div>
                    {day.events?.map((evt, j) => (
                      <div key={j} className={`cal-event ${evt.c}`}>{evt.t}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            <div className="upcoming-events">
              <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'12px'}}>Upcoming Events</div>
              {calendar.upcoming.map((evt, i) => (
                <div key={i} className="event-item">
                  <div className="event-dot" style={{background:`var(--${evt.color})`}}></div>
                  <div className="event-body"><div className="ev-title">{evt.title}</div><div className="ev-date">{evt.date}</div></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Budget */}
      {currentPage === 'budget' && budget && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Budget</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track funding, expenses and donor contributions.</p></div>
            <button className="btn-primary">+ Add Expense</button>
          </div>
          <div className="budget-overview-grid">
            <div className="budget-big-card"><div className="budget-big-label">Total Budget</div><div className="budget-big-val">{budget.summary.totalBudget}</div><div className="budget-big-sub">Across {budget.summary.projectCount} active projects</div></div>
            <div className="budget-big-card"><div className="budget-big-label">Spent to Date</div><div className="budget-big-val" style={{color:'var(--green)'}}>{budget.summary.spent}</div><div className="budget-big-sub">{budget.summary.utilizationPct}% of total budget</div></div>
            <div className="budget-big-card"><div className="budget-big-label">Remaining</div><div className="budget-big-val" style={{color:'var(--amber)'}}>{budget.summary.remaining}</div><div className="budget-big-sub">{100 - budget.summary.utilizationPct}% remaining</div></div>
          </div>
          <div className="budget-list">
            <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'14px'}}>Project Budget Tracker</div>
            {budget.projects.map((proj, i) => (
              <div key={i} className="budget-list-row">
                <span className="budget-list-name">{proj.name}</span>
                <div className="budget-list-bar">
                  <div className="budget-list-pcts"><span>{proj.spent} spent</span><span>{proj.total} total</span></div>
                  <div className="bar-track"><div className={`bar-fill${proj.amber ? ' amber' : ''}${proj.red ? ' red' : ''}`} style={{width:`${proj.pct}%`}}></div></div>
                </div>
                <span className="budget-list-amt">{proj.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Reports */}
      {currentPage === 'reports' && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Reports</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Generate and view impact reports.</p></div>
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report.id} className="report-card">
                <div className="report-icon"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div className="report-name">{report.name}</div>
                <div className="report-date">{report.date}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Beneficiaries */}
      {currentPage === 'beneficiaries' && beneficiaries && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Beneficiaries</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Track and manage all program beneficiaries.</p></div>
            <button className="btn-primary">+ Add Beneficiary</button>
          </div>
          <div className="bene-stats">
            <div className="bene-card"><div className="bene-num">{beneficiaries.stats.total.toLocaleString()}</div><div className="bene-label">Total Beneficiaries</div></div>
            <div className="bene-card"><div className="bene-num" style={{color:'#3b82f6'}}>{beneficiaries.stats.children.toLocaleString()}</div><div className="bene-label">Children (OVC)</div></div>
            <div className="bene-card"><div className="bene-num" style={{color:'#f59e0b'}}>{beneficiaries.stats.womenFamilies.toLocaleString()}</div><div className="bene-label">Women & Families</div></div>
            <div className="bene-card"><div className="bene-num" style={{color:'#ef4444'}}>{beneficiaries.stats.communityMembers.toLocaleString()}</div><div className="bene-label">Community Members</div></div>
          </div>
          <div className="filter-row" style={{marginBottom:'12px'}}>
            <select className="filter-select" value={beneRegion} onChange={(e) => setBeneRegion(e.target.value)}>
              <option value="all">All Regions</option>
              {beneficiaries.regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input className="search-inline" type="text" placeholder="Search beneficiaries..." value={beneSearch} onChange={(e) => setBeneSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadPageData()} />
          </div>
          <div className="bene-table">
            <div className="bene-table-head"><span>Name</span><span>Program</span><span>Region</span><span>Status</span><span>Enrolled</span></div>
            {beneficiaries.beneficiaries.map((bene) => (
              <div key={bene.id} className="bene-row">
                <span className="bene-name">{bene.name}</span>
                <span className="bene-cell">{bene.program}</span>
                <span className="bene-cell">{bene.region}</span>
                <span><span className={`status-badge ${bene.status}`} style={{fontSize:'10px'}}>{bene.statusLabel}</span></span>
                <span className="bene-cell">{bene.date}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Documents */}
      {currentPage === 'documents' && (
        <>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'16px'}}>
            <div><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Documents</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Manage project files, proposals, and contracts.</p></div>
            <button className="btn-primary">+ Upload</button>
          </div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:'14px'}}>
            {documents.map((doc) => (
              <div key={doc.id} style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',cursor:'pointer',boxShadow:'var(--shadow)'}}>
                <div style={{fontSize:'32px',marginBottom:'8px'}}>{doc.icon}</div>
                <div style={{fontSize:'12.5px',fontWeight:'500',color:'var(--gray-800)'}}>{doc.name}</div>
                <div style={{fontSize:'11px',color:'var(--gray-400)',marginTop:'3px'}}>{doc.date}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Partners */}
      {currentPage === 'partners' && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Partners</h1><p style={{fontSize:'12px',color:'var(--gray-500)',marginTop:'2px'}}>Donors, government bodies, and organizational partners.</p></div>
          <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)',gap:'14px'}}>
            {partners.map((partner) => (
              <div key={partner.id} style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
                <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'4px'}}>{partner.name}</div>
                <div style={{fontSize:'11px',color:'var(--gray-400)',marginBottom:'8px'}}>{partner.type}</div>
                <div style={{fontSize:'12px',color:'var(--gray-600)'}}>{partner.desc || partner.description}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Messages */}
      {currentPage === 'messages' && messages && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Messages</h1></div>
          <div style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'40px',textAlign:'center',boxShadow:'var(--shadow)'}}>
            <div style={{fontSize:'40px',marginBottom:'12px'}}>💬</div>
            <div style={{fontSize:'14px',fontWeight:'500',color:'var(--gray-700)',marginBottom:'6px'}}>Team Messages</div>
            <div style={{fontSize:'12px',color:'var(--gray-400)'}}>{messages.message}</div>
          </div>
        </>
      )}

      {/* Settings */}
      {currentPage === 'settings' && organization && (
        <>
          <div style={{marginBottom:'16px'}}><h1 style={{fontSize:'20px',fontWeight:'600',fontFamily:"'DM Serif Display',serif"}}>Settings</h1></div>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'14px'}}>
            <div style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
              <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'14px'}}>Organization Info</div>
              <div style={{marginBottom:'10px'}}>
                <div style={{fontSize:'11px',color:'var(--gray-500)',marginBottom:'4px'}}>Organization Name</div>
                <input style={{width:'100%',padding:'7px 10px',border:'1px solid var(--gray-200)',borderRadius:'7px',fontFamily:'inherit',fontSize:'12px'}} value={orgForm.name} onChange={(e) => setOrgForm({...orgForm, name: e.target.value})} />
              </div>
              <div style={{marginBottom:'10px'}}>
                <div style={{fontSize:'11px',color:'var(--gray-500)',marginBottom:'4px'}}>Country</div>
                <input style={{width:'100%',padding:'7px 10px',border:'1px solid var(--gray-200)',borderRadius:'7px',fontFamily:'inherit',fontSize:'12px'}} value={orgForm.country} onChange={(e) => setOrgForm({...orgForm, country: e.target.value})} />
              </div>
              <button className="btn-primary" style={{fontSize:'11px'}} onClick={handleSaveOrg} disabled={savingOrg}>
                {savingOrg ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
            <div style={{background:'#fff',border:'1px solid var(--gray-200)',borderRadius:'var(--radius)',padding:'16px',boxShadow:'var(--shadow)'}}>
              <div style={{fontSize:'13px',fontWeight:'600',marginBottom:'14px'}}>Manage Users & Roles</div>
              <div style={{border:'1px solid var(--gray-100)',borderRadius:'8px',overflow:'hidden'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px',padding:'8px 12px',background:'var(--gray-50)',fontSize:'11px',fontWeight:'600',color:'var(--gray-500)'}}><span>NAME</span><span>ROLE</span><span>STATUS</span></div>
                {users.map((u) => (
                  <div key={u.id} style={{display:'grid',gridTemplateColumns:'1fr 1fr 80px',padding:'9px 12px',borderTop:'1px solid var(--gray-100)',fontSize:'12px'}}>
                    <span>{u.name}</span>
                    <span style={{color:'var(--green)'}}>{u.roleLabel}</span>
                    <span style={{color: u.isActive ? 'var(--green)' : 'var(--gray-400)'}}>{u.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default DashboardPages;
