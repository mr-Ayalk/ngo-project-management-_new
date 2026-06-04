'use client';

import { useState, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [projectDetail, setProjectDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    // Initialize chart
    if (chartInstance.current) {
      chartInstance.current.destroy();
    }

    if (chartRef.current) {
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
      if (chartInstance.current) {
        chartInstance.current.destroy();
      }
    };
  }, []);

  const openProjectDetail = (title, donor, loc, start, end, desc) => {
    setProjectDetail({ title, donor, loc, start, end, desc });
    setActiveTab('overview');
  };

  const closeProjectDetail = () => {
    setProjectDetail(null);
  };

  const handleNavClick = (page) => {
    setCurrentPage(page);
    setProjectDetail(null);
  };

  const SidebarIcon = ({ type }) => {
    const icons = {
      dashboard: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>,
      projects: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/><path d="M16 3v4M8 3v4M3 11h18"/></svg>,
      tasks: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/></svg>,
      calendar: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      budget: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>,
      reports: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
      partners: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>,
      beneficiaries: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      documents: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z"/><polyline points="13 2 13 9 20 9"/></svg>,
      messages: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>,
      settings: <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>,
    };
    return icons[type] || null;
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { id: 'projects', label: 'Projects', icon: 'projects' },
    { id: 'tasks', label: 'Tasks', icon: 'tasks' },
    { id: 'calendar', label: 'Calendar', icon: 'calendar' },
    { id: 'budget', label: 'Budget', icon: 'budget' },
    { id: 'reports', label: 'Reports', icon: 'reports' },
    { id: 'partners', label: 'Partners', icon: 'partners' },
    { id: 'beneficiaries', label: 'Beneficiaries', icon: 'beneficiaries' },
    { id: 'documents', label: 'Documents', icon: 'documents' },
    { id: 'messages', label: 'Messages', icon: 'messages' },
    { id: 'settings', label: 'Settings', icon: 'settings' },
  ];

  return (
    <div style={styles.container}>
      <style>{`
        :root {
          --green: #1a6b3c;
          --green-mid: #2d8a52;
          --green-light: #e8f5ee;
          --green-accent: #3daa6a;
          --amber: #f59e0b;
          --amber-light: #fef3c7;
          --red: #ef4444;
          --red-light: #fee2e2;
          --blue: #3b82f6;
          --blue-light: #eff6ff;
          --gray-50: #f9fafb;
          --gray-100: #f3f4f6;
          --gray-200: #e5e7eb;
          --gray-300: #d1d5db;
          --gray-400: #9ca3af;
          --gray-500: #6b7280;
          --gray-600: #4b5563;
          --gray-700: #374151;
          --gray-800: #1f2937;
          --gray-900: #111827;
          --sidebar-w: 200px;
          --header-h: 60px;
          --radius: 10px;
          --shadow: 0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
        }
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'DM Sans', sans-serif; background: var(--gray-50); color: var(--gray-800); font-size: 13px; }
        
        .sidebar {
          width: var(--sidebar-w); background: #fff; border-right: 1px solid var(--gray-200);
          display: flex; flex-direction: column; flex-shrink: 0; overflow-y: auto;
        }
        .sidebar-logo {
          padding: 16px; display: flex; align-items: center; gap: 9px;
          border-bottom: 1px solid var(--gray-100);
        }
        .logo-img {
          width: 34px; height: 34px; border-radius: 8px; background: var(--green);
          display: flex; align-items: center; justify-content: center;
          color: #fff; font-size: 10px; font-weight: 600; text-align: center; line-height: 1.2; padding: 2px;
        }
        .logo-text { font-size: 11px; font-weight: 600; color: var(--gray-900); line-height: 1.3; }
        .nav { padding: 12px 8px; flex: 1; }
        .nav-item {
          display: flex; align-items: center; gap: 9px; padding: 8px 10px;
          border-radius: 8px; cursor: pointer; color: var(--gray-500); font-size: 12.5px;
          transition: all .15s; margin-bottom: 2px; background: none; border: none; font-family: inherit;
        }
        .nav-item:hover { background: var(--gray-100); color: var(--gray-800); }
        .nav-item.active { background: var(--green-light); color: var(--green); font-weight: 500; }
        .nav-item svg { width: 16px; height: 16px; flex-shrink: 0; }
        .sidebar-promo {
          margin: 12px; background: var(--green); border-radius: var(--radius); padding: 16px; color: #fff;
        }
        .sidebar-promo p { font-size: 11px; line-height: 1.5; margin-bottom: 10px; opacity: .9; }
        .sidebar-promo button {
          width: 100%; padding: 7px; background: rgba(255,255,255,0.2); border: 1px solid rgba(255,255,255,0.3);
          border-radius: 7px; color: #fff; font-size: 11px; font-family: inherit; cursor: pointer; font-weight: 500;
        }
        .sidebar-promo button:hover { background: rgba(255,255,255,0.3); }
        
        .main { flex: 1; display: flex; flex-direction: column; overflow: hidden; }
        
        .topbar {
          height: var(--header-h); background: #fff; border-bottom: 1px solid var(--gray-200);
          display: flex; align-items: center; padding: 0 20px; gap: 14px; flex-shrink: 0;
        }
        .menu-btn { background: none; border: none; cursor: pointer; color: var(--gray-500); padding: 4px; }
        .menu-btn svg { width: 18px; height: 18px; }
        .search-wrap {
          flex: 1; max-width: 300px; position: relative;
        }
        .search-wrap input {
          width: 100%; padding: 7px 12px 7px 32px; border: 1px solid var(--gray-200);
          border-radius: 8px; font-family: inherit; font-size: 12px; background: var(--gray-50);
          color: var(--gray-700); outline: none;
        }
        .search-wrap input:focus { border-color: var(--green-accent); }
        .search-wrap svg { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); width: 14px; height: 14px; color: var(--gray-400); }
        .topbar-right { margin-left: auto; display: flex; align-items: center; gap: 12px; }
        .notif-btn {
          position: relative; background: none; border: none; cursor: pointer; color: var(--gray-500);
          width: 34px; height: 34px; display: flex; align-items: center; justify-content: center;
          border-radius: 8px;
        }
        .notif-btn:hover { background: var(--gray-100); }
        .notif-btn svg { width: 18px; height: 18px; }
        .notif-dot {
          position: absolute; top: 5px; right: 5px; width: 8px; height: 8px;
          background: var(--red); border-radius: 50%; border: 2px solid #fff;
        }
        .user-chip {
          display: flex; align-items: center; gap: 8px; padding: 5px 10px;
          background: var(--gray-50); border: 1px solid var(--gray-200); border-radius: 20px; cursor: pointer;
        }
        .avatar {
          width: 26px; height: 26px; border-radius: 50%; background: var(--green);
          color: #fff; display: flex; align-items: center; justify-content: center;
          font-size: 10px; font-weight: 600;
        }
        .user-name { font-size: 12px; font-weight: 500; }
        .user-role { font-size: 10px; color: var(--gray-400); }
        
        .content { flex: 1; overflow-y: auto; padding: 20px; }
        
        .page { display: none; }
        .page.active { display: block; }
        
        .page-header { margin-bottom: 18px; }
        .page-header h1 { font-size: 22px; font-weight: 600; color: var(--gray-900); font-family: 'DM Serif Display', serif; }
        .page-header p { font-size: 12.5px; color: var(--gray-500); margin-top: 3px; }
        
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 14px; margin-bottom: 18px; }
        .kpi-card {
          background: #fff; border: 1px solid var(--gray-200); border-radius: var(--radius);
          padding: 16px; box-shadow: var(--shadow);
        }
        .kpi-top { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 8px; }
        .kpi-icon {
          width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center;
        }
        .kpi-icon svg { width: 18px; height: 18px; }
        .kpi-icon.green { background: var(--green-light); color: var(--green); }
        .kpi-icon.blue { background: var(--blue-light); color: var(--blue); }
        .kpi-value { font-size: 26px; font-weight: 600; color: var(--gray-900); line-height: 1; }
        .kpi-label { font-size: 11.5px; color: var(--gray-500); margin-bottom: 6px; }
        .kpi-delta { font-size: 11px; color: var(--green); font-weight: 500; }
        .kpi-delta.neutral { color: var(--gray-500); }
        
        .mid-row { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 18px; }
        .card { background: #fff; border: 1px solid var(--gray-200); border-radius: var(--radius); padding: 16px; box-shadow: var(--shadow); }
        .card-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 14px; }
        .card-title { font-size: 13.5px; font-weight: 600; color: var(--gray-900); }
        .card-action { font-size: 11.5px; color: var(--green); cursor: pointer; font-weight: 500; }
        .card-select {
          font-size: 11px; border: 1px solid var(--gray-200); border-radius: 6px; padding: 4px 8px;
          background: #fff; color: var(--gray-600); font-family: inherit; cursor: pointer;
        }
        
        .chart-area { position: relative; height: 140px; }
        .chart-legend { display: flex; gap: 16px; margin-top: 8px; }
        .chart-legend-item { display: flex; align-items: center; gap: 5px; font-size: 11px; color: var(--gray-500); }
        .legend-dot { width: 8px; height: 8px; border-radius: 50%; }
        
        .activity-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--gray-100); }
        .activity-item:last-child { border-bottom: none; }
        .act-avatar { width: 30px; height: 30px; border-radius: 50%; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 600; color: #fff; }
        .act-body { flex: 1; }
        .act-title { font-size: 12px; font-weight: 500; color: var(--gray-800); }
        .act-sub { font-size: 11px; color: var(--gray-400); margin-top: 1px; }
        .act-time { font-size: 10.5px; color: var(--gray-400); flex-shrink: 0; }
        
        .bottom-row { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 14px; }
        
        .status-donut { display: flex; align-items: center; gap: 16px; }
        .donut-chart { width: 90px; height: 90px; flex-shrink: 0; }
        .status-legend { display: flex; flex-direction: column; gap: 7px; }
        .status-item { display: flex; align-items: center; gap: 7px; font-size: 11.5px; color: var(--gray-600); }
        .status-dot { width: 9px; height: 9px; border-radius: 50%; }
        
        .task-item { display: flex; align-items: flex-start; gap: 10px; padding: 8px 0; border-bottom: 1px solid var(--gray-100); }
        .task-item:last-child { border-bottom: none; }
        .task-check { width: 14px; height: 14px; border: 1.5px solid var(--gray-300); border-radius: 4px; flex-shrink: 0; margin-top: 1px; }
        .task-body { flex: 1; }
        .task-title { font-size: 12px; font-weight: 500; color: var(--gray-800); }
        .task-project { font-size: 11px; color: var(--gray-400); margin-top: 2px; }
        .task-date { font-size: 11px; color: var(--gray-500); flex-shrink: 0; font-weight: 500; }
        
        .budget-item { margin-bottom: 12px; }
        .budget-item:last-child { margin-bottom: 0; }
        .budget-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 5px; }
        .budget-name { font-size: 12px; color: var(--gray-700); font-weight: 500; }
        .budget-vals { font-size: 11px; color: var(--gray-500); }
        .budget-pct { font-size: 11px; color: var(--gray-600); font-weight: 500; }
        .bar-track { height: 6px; background: var(--gray-100); border-radius: 3px; overflow: hidden; }
        .bar-fill { height: 100%; border-radius: 3px; background: var(--green); transition: width .6s; }
        .bar-fill.amber { background: var(--amber); }
        .bar-fill.red { background: var(--red); }
        
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: var(--gray-200); border-radius: 10px; }
      `}</style>

      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-img">ENA</div>
          <div className="logo-text">ENGAGE NOW<br/>AFRICA</div>
        </div>
        <nav className="nav">
          {navItems.map((item) => (
            <button
              key={item.id}
              className={`nav-item ${currentPage === item.id ? 'active' : ''}`}
              onClick={() => handleNavClick(item.id)}
              style={{width: '100%', textAlign: 'left'}}
            >
              <SidebarIcon type={item.icon} />
              {item.label}
            </button>
          ))}
        </nav>
        <div className="sidebar-promo">
          <div style={{fontSize: '28px', marginBottom: '10px'}}>🌍</div>
          <p>Empowering communities. Building a better future.</p>
          <button>Learn More</button>
        </div>
      </aside>

      {/* Main */}
      <div className="main">
        {/* Topbar */}
        <header className="topbar">
          <button className="menu-btn" type="button">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="search-wrap">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input type="text" placeholder="Search anything..." />
          </div>
          <div className="topbar-right">
            <button className="notif-btn" type="button">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
              </svg>
              <span className="notif-dot" />
            </button>
            <div className="user-chip">
              <div className="avatar">GJ</div>
              <div>
                <div className="user-name">Grace Johnson</div>
                <div className="user-role">Project Manager</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <div className="content">
          {/* Dashboard */}
          {currentPage === 'dashboard' && (
            <div className="page active">
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
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
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
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg>
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
                      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>
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
                    <div style={{position: 'relative', width: '54px', height: '54px'}}>
                      <svg viewBox="0 0 54 54" style={{width: '54px', height: '54px'}}>
                        <circle cx="27" cy="27" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5"/>
                        <circle cx="27" cy="27" r="22" fill="none" stroke="#1a6b3c" strokeWidth="5" strokeDasharray="94 44" strokeLinecap="round"/>
                      </svg>
                      <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, color: 'var(--green)'}}>68%</div>
                    </div>
                  </div>
                  <div className="kpi-delta neutral">$24,560 of $36,000</div>
                </div>
              </div>

              {/* Mid row */}
              <div className="mid-row">
                <div className="card">
                  <div className="card-header">
                    <span className="card-title">Project Overview</span>
                    <select className="card-select"><option>This Month</option><option>Last Month</option></select>
                  </div>
                  <div className="chart-area">
                    <canvas ref={chartRef}></canvas>
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
                  <div className="activity-item">
                    <div className="act-avatar" style={{background:'#1a6b3c'}}>GJ</div>
                    <div className="act-body">
                      <div className="act-title">Community Health Project</div>
                      <div className="act-sub">Task completed by James K.</div>
                    </div>
                    <div className="act-time">2h ago</div>
                  </div>
                  <div className="activity-item">
                    <div className="act-avatar" style={{background:'#3b82f6'}}>SK</div>
                    <div className="act-body">
                      <div className="act-title">Education for All</div>
                      <div className="act-sub">Budget updated</div>
                    </div>
                    <div className="act-time">5h ago</div>
                  </div>
                  <div className="activity-item">
                    <div className="act-avatar" style={{background:'#f59e0b'}}>ML</div>
                    <div className="act-body">
                      <div className="act-title">Clean Water Initiative</div>
                      <div className="act-sub">New beneficiary added</div>
                    </div>
                    <div className="act-time">1d ago</div>
                  </div>
                  <div className="activity-item">
                    <div className="act-avatar" style={{background:'#ef4444'}}>TA</div>
                    <div className="act-body">
                      <div className="act-title">Women Empowerment</div>
                      <div className="act-sub">Document uploaded</div>
                    </div>
                    <div className="act-time">2d ago</div>
                  </div>
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
                  <div className="task-item">
                    <div className="task-check"></div>
                    <div className="task-body">
                      <div className="task-title">Field visit to Kaimu</div>
                      <div className="task-project">Community Health Project</div>
                    </div>
                    <div className="task-date">May 5</div>
                  </div>
                  <div className="task-item">
                    <div className="task-check"></div>
                    <div className="task-body">
                      <div className="task-title">Submit quarterly report</div>
                      <div className="task-project">Education for All</div>
                    </div>
                    <div className="task-date">May 6</div>
                  </div>
                  <div className="task-item">
                    <div className="task-check"></div>
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
                    <select className="card-select"><option>This Month</option></select>
                  </div>
                  <div className="budget-item">
                    <div className="budget-row"><span className="budget-name">Community Health</span><span className="budget-pct">71%</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--gray-400)',marginBottom:'4px'}}>$8,500 / $12,000</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:'71%'}}></div></div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-row"><span className="budget-name">Education for All</span><span className="budget-pct">71%</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--gray-400)',marginBottom:'4px'}}>$9,200 / $13,000</div>
                    <div className="bar-track"><div className="bar-fill" style={{width:'71%'}}></div></div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-row"><span className="budget-name">Clean Water Init.</span><span className="budget-pct">69%</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--gray-400)',marginBottom:'4px'}}>$4,800 / $7,000</div>
                    <div className="bar-track"><div className="bar-fill amber" style={{width:'69%'}}></div></div>
                  </div>
                  <div className="budget-item">
                    <div className="budget-row"><span className="budget-name">Women Empowerment</span><span className="budget-pct">57%</span></div>
                    <div style={{fontSize:'10.5px',color:'var(--gray-400)',marginBottom:'4px'}}>$4,000 / $7,000</div>
                    <div className="bar-track"><div className="bar-fill red" style={{width:'57%'}}></div></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Projects */}
          {currentPage === 'projects' && (
            <div className="page active">
              <div className="page-header">
                <h1>Projects</h1>
                <p>Manage and track all your projects in one place.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Projects page coming soon...</p>
            </div>
          )}

          {/* Tasks */}
          {currentPage === 'tasks' && (
            <div className="page active">
              <div className="page-header">
                <h1>Tasks</h1>
                <p>Track and manage all your tasks.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Tasks page coming soon...</p>
            </div>
          )}

          {/* Calendar */}
          {currentPage === 'calendar' && (
            <div className="page active">
              <div className="page-header">
                <h1>Calendar</h1>
                <p>Track milestones, deadlines, and events.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Calendar page coming soon...</p>
            </div>
          )}

          {/* Budget */}
          {currentPage === 'budget' && (
            <div className="page active">
              <div className="page-header">
                <h1>Budget</h1>
                <p>Track funding, expenses and donor contributions.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Budget page coming soon...</p>
            </div>
          )}

          {/* Reports */}
          {currentPage === 'reports' && (
            <div className="page active">
              <div className="page-header">
                <h1>Reports</h1>
                <p>Generate and view impact reports.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Reports page coming soon...</p>
            </div>
          )}

          {/* Partners */}
          {currentPage === 'partners' && (
            <div className="page active">
              <div className="page-header">
                <h1>Partners</h1>
                <p>Donors, government bodies, and organizational partners.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Partners page coming soon...</p>
            </div>
          )}

          {/* Beneficiaries */}
          {currentPage === 'beneficiaries' && (
            <div className="page active">
              <div className="page-header">
                <h1>Beneficiaries</h1>
                <p>Track and manage all program beneficiaries.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Beneficiaries page coming soon...</p>
            </div>
          )}

          {/* Documents */}
          {currentPage === 'documents' && (
            <div className="page active">
              <div className="page-header">
                <h1>Documents</h1>
                <p>Manage project files, proposals, and contracts.</p>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Documents page coming soon...</p>
            </div>
          )}

          {/* Messages */}
          {currentPage === 'messages' && (
            <div className="page active">
              <div className="page-header">
                <h1>Messages</h1>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Messages page coming soon...</p>
            </div>
          )}

          {/* Settings */}
          {currentPage === 'settings' && (
            <div className="page active">
              <div className="page-header">
                <h1>Settings</h1>
              </div>
              <p style={{color: 'var(--gray-500)', marginTop: '20px'}}>Settings page coming soon...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    fontFamily: '"DM Sans", sans-serif',
    background: '#f9fafb',
    color: '#1f2937',
    fontSize: '13px',
  },
};
