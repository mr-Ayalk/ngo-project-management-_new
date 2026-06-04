'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import Toast from '@/components/Toast';

function Loading() {
  return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>Loading...</div>;
}

function ErrorMsg({ message }) {
  return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontSize: '13px' }}>{message || 'Failed to load data.'}</div>;
}

const EMPTY_PROJECT = { name: '', description: '', status: 'on-track', icon: 'green', budget: '', startDate: '', endDate: '', donor: '', managerId: '' };
const EMPTY_TASK = { title: '', projectId: '', priority: 'medium', status: 'todo', dueDate: '' };
const EMPTY_EVENT = { title: '', date: '', time: '', color: 'green', allDay: false, projectId: '' };
const EMPTY_EXPENSE = { projectId: '', amount: '', category: 'operations' };
const EMPTY_BENEFICIARY = { name: '', email: '', program: '', region: '', status: 'active' };
const EMPTY_DOCUMENT = { name: '', category: 'reports', projectId: '', fileType: 'PDF', size: '1 MB' };
const EMPTY_PARTNER = { name: '', type: 'Donor', description: '', email: '', phone: '', contact: '' };
const EMPTY_REPORT = { name: '', description: '', reportDate: new Date().toISOString().slice(0, 10) };

const KANBAN_COLS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const DOC_CATEGORIES = ['all', 'reports', 'budget', 'data', 'contracts', 'media', 'training', 'feedback'];

const DashboardPages = ({ currentPage, onNavigate, globalSearch, onGlobalSearchClear }) => {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

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
  const [activities, setActivities] = useState([]);

  const [lookup, setLookup] = useState({ users: [], projects: [] });

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(null);

  const [projectFilter, setProjectFilter] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [beneRegion, setBeneRegion] = useState('all');
  const [beneSearch, setBeneSearch] = useState('');
  const [docCategory, setDocCategory] = useState('all');
  const [orgForm, setOrgForm] = useState({ name: '', country: '', email: '', phone: '', location: '', description: '' });

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [chartRange, setChartRange] = useState('month');

  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE);
  const [beneficiaryForm, setBeneficiaryForm] = useState(EMPTY_BENEFICIARY);
  const [documentForm, setDocumentForm] = useState(EMPTY_DOCUMENT);
  const [partnerForm, setPartnerForm] = useState(EMPTY_PARTNER);
  const [reportForm, setReportForm] = useState(EMPTY_REPORT);
  const [viewReport, setViewReport] = useState(null);
  const [viewDocument, setViewDocument] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  }, []);

  const closeModal = () => {
    setModal(null);
    setViewReport(null);
    setViewDocument(null);
    setEditUser(null);
  };

  const loadLookup = useCallback(async () => {
    try {
      const [userList, projectList] = await Promise.all([api.users(), api.projects()]);
      setLookup({ users: userList, projects: projectList });
      return { users: userList, projects: projectList };
    } catch {
      return { users: [], projects: [] };
    }
  }, []);

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
          const search = projectSearch || globalSearch;
          if (search) params.search = search;
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
          setOrgForm({
            name: org.name || '',
            country: org.country || '',
            email: org.email || '',
            phone: org.phone || '',
            location: org.location || '',
            description: org.description || '',
          });
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
  }, [currentPage, projectFilter, projectSearch, beneRegion, beneSearch, docCategory, calYear, calMonth, globalSearch]);

  useEffect(() => { loadPageData(); }, [loadPageData]);
  useEffect(() => { loadLookup(); }, [loadLookup]);

  useEffect(() => {
    if (globalSearch) {
      setProjectSearch(globalSearch);
      if (currentPage === 'projects') loadPageData();
    }
  }, [globalSearch, currentPage]);

  useEffect(() => {
    if (currentPage === 'projects' && globalSearch) {
      onGlobalSearchClear?.();
    }
  }, [currentPage, globalSearch, onGlobalSearchClear]);

  useEffect(() => {
    if (selectedProject?.id) {
      api.project(selectedProject.id).then(setProjectDetail).catch(() => setProjectDetail(null));
    } else setProjectDetail(null);
  }, [selectedProject]);

  useEffect(() => {
    if (currentPage !== 'dashboard' || !dashboard?.chart || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();
    const labels = chartRange === 'month'
      ? dashboard.chart.labels
      : ['Week 1', 'Week 2', 'Week 3', 'Week 4'];
    const planned = chartRange === 'month' ? dashboard.chart.planned : [15, 35, 55, 75];
    const actual = chartRange === 'month' ? dashboard.chart.actual : [14, 33, 52, 72];
    const ctx = chartRef.current.getContext('2d');
    chartInstance.current = new Chart(ctx, {
      type: 'line',
      data: {
        labels,
        datasets: [
          { label: 'Planned', data: planned, borderColor: '#d1d5db', borderDash: [5, 4], borderWidth: 1.5, pointRadius: 0, tension: 0.4, fill: false },
          { label: 'Actual', data: actual, borderColor: '#1a6b3c', borderWidth: 2, pointRadius: 0, tension: 0.4, fill: true, backgroundColor: 'rgba(26,107,60,0.07)' },
        ],
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: { legend: { display: false }, tooltip: { mode: 'index', intersect: false } },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 10, family: 'DM Sans' }, color: '#9ca3af' } },
          y: { grid: { color: '#f3f4f6' }, ticks: { font: { size: 10, family: 'DM Sans' }, color: '#9ca3af' }, min: 0, max: 100 },
        },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [currentPage, dashboard, chartRange]);

  const statusLabel = (s) => (s === 'on-track' ? 'On Track' : s === 'at-risk' ? 'At Risk' : 'Delayed');

  const openProjectModal = async (project = null) => {
    const data = await loadLookup();
    const defaultManager = data.users.find((u) => u.role === 'manager') || data.users[0];
    if (project) {
      setProjectForm({
        id: project.id,
        name: project.name,
        description: project.description || '',
        status: project.status,
        icon: project.icon,
        budget: project.budgetRaw || '',
        startDate: project.startDate ? new Date(project.startDate).toISOString().slice(0, 10) : '',
        endDate: project.endDate ? new Date(project.endDate).toISOString().slice(0, 10) : '',
        donor: project.donor || '',
        managerId: project.manager?.id || defaultManager?.id || '',
      });
    } else {
      setProjectForm({ ...EMPTY_PROJECT, managerId: defaultManager?.id || '' });
    }
    setModal('project');
  };

  const openTaskModal = async (task = null) => {
    const data = await loadLookup();
    if (task) {
      setTaskForm({
        id: task.id,
        title: task.title,
        projectId: task.projectId || data.projects.find((p) => p.name === task.project)?.id || '',
        priority: task.priority,
        status: task.status || task.column,
        dueDate: task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 10) : '',
      });
    } else {
      setTaskForm({ ...EMPTY_TASK, projectId: data.projects[0]?.id || '' });
    }
    setModal('task');
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        name: projectForm.name,
        description: projectForm.description,
        status: projectForm.status,
        icon: projectForm.icon,
        budget: parseFloat(projectForm.budget) || 0,
        startDate: projectForm.startDate || new Date().toISOString(),
        endDate: projectForm.endDate || new Date().toISOString(),
        donor: projectForm.donor,
        managerId: projectForm.managerId,
      };
      if (projectForm.id) {
        await api.updateProject(projectForm.id, body);
        showToast('Project updated');
      } else {
        await api.createProject(body);
        showToast('Project created');
      }
      closeModal();
      loadPageData();
      if (currentPage === 'dashboard') api.dashboard().then(setDashboard);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    if (!confirm('Delete this project?')) return;
    try {
      await api.deleteProject(id);
      showToast('Project deleted');
      setMenuOpen(null);
      setSelectedProject(null);
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveTask = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const body = {
        title: taskForm.title,
        projectId: taskForm.projectId,
        priority: taskForm.priority,
        status: taskForm.status,
        dueDate: taskForm.dueDate || null,
      };
      if (taskForm.id) {
        await api.updateTask(taskForm.id, body);
        showToast('Task updated');
      } else {
        await api.createTask(body);
        showToast('Task created');
      }
      closeModal();
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTaskDrop = async (newStatus) => {
    if (!draggedTask || draggedTask.status === newStatus) {
      setDraggedTask(null);
      setDropTarget(null);
      return;
    }
    try {
      await api.updateTask(draggedTask.id, { status: newStatus });
      showToast('Task moved');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
    setDraggedTask(null);
    setDropTarget(null);
  };

  const handleCompleteTask = async (taskTitle) => {
    if (!tasks?.tasks) return;
    const task = tasks.tasks.find((t) => t.title === taskTitle);
    if (!task) { onNavigate?.('tasks'); return; }
    try {
      await api.updateTask(task.id, { status: 'completed' });
      showToast('Task marked complete');
      const [dash, taskData] = await Promise.all([api.dashboard(), currentPage === 'tasks' ? api.tasks() : Promise.resolve(null)]);
      setDashboard(dash);
      if (taskData) setTasks(taskData);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createEvent({
        title: eventForm.title,
        date: eventForm.date,
        time: eventForm.allDay ? null : eventForm.time,
        allDay: eventForm.allDay,
        color: eventForm.color,
        projectId: eventForm.projectId || null,
      });
      showToast('Event added');
      closeModal();
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveExpense = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await api.addExpense({
        projectId: expenseForm.projectId,
        amount: expenseForm.amount,
        category: expenseForm.category,
      });
      showToast(result.message || 'Expense added');
      closeModal();
      loadPageData();
      if (currentPage === 'dashboard') api.dashboard().then(setDashboard);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveBeneficiary = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createBeneficiary(beneficiaryForm);
      showToast('Beneficiary added');
      closeModal();
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createDocument({
        ...documentForm,
        projectId: documentForm.projectId || null,
        icon: documentForm.fileType === 'PDF' ? '📄' : documentForm.fileType === 'XLSX' ? '📊' : '📋',
      });
      showToast('Document uploaded');
      closeModal();
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSavePartner = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createPartner(partnerForm);
      showToast('Partner added');
      closeModal();
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveReport = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createReport(reportForm);
      showToast('Report created');
      closeModal();
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveOrg = async () => {
    setSubmitting(true);
    try {
      const updated = await api.updateOrganization(orgForm);
      setOrganization(updated);
      showToast('Organization saved');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.updateUser({ id: editUser.id, name: editUser.name, role: editUser.role, isActive: editUser.isActive });
      showToast('User updated');
      closeModal();
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;
    const sender = lookup.users[0];
    if (!sender) { showToast('No users found', 'error'); return; }
    setSubmitting(true);
    try {
      await api.sendMessage({ content: messageInput, senderId: sender.id });
      setMessageInput('');
      setMessages(await api.messages());
      showToast('Message sent');
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openActivities = async () => {
    try {
      setActivities(await api.activities());
      setModal('activities');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const downloadReport = (report) => {
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Report downloaded');
  };

  const shareReport = async (report) => {
    const text = `${report.name} — ${report.date}${report.description ? `\n${report.description}` : ''}`;
    if (navigator.share) {
      await navigator.share({ title: report.name, text });
    } else {
      await navigator.clipboard.writeText(text);
      showToast('Report details copied');
    }
  };

  const downloadDocument = (doc) => {
    const content = `Document: ${doc.name}\nProject: ${doc.project || 'N/A'}\nType: ${doc.fileType}\nUploaded: ${doc.uploaded}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = doc.name;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Document downloaded');
  };

  if (loading && !dashboard && !projects.length && !tasks && !budget && !beneficiaries) {
    return <Loading />;
  }

  return (
    <div className="content" onClick={() => setMenuOpen(null)}>
      <Toast message={toast?.message} type={toast?.type} />

      {/* ── DASHBOARD ── */}
      {currentPage === 'dashboard' && dashboard && (
        <>
          <div className="page-header">
            <h1>Dashboard</h1>
            <p>Welcome back, Grace! Here&apos;s what&apos;s happening with your projects.</p>
          </div>
          <div className="kpi-grid">
            <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('projects')}>
              <div className="kpi-top"><div><div className="kpi-label">Active Projects</div><div className="kpi-value">{dashboard.kpis.activeProjects}</div></div>
                <div className="kpi-icon blue"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg></div></div>
              <div className="kpi-delta">{dashboard.kpis.activeProjectsDelta}</div>
            </div>
            <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('tasks')}>
              <div className="kpi-top"><div><div className="kpi-label">Tasks Completed</div><div className="kpi-value">{dashboard.kpis.tasksCompleted}</div></div>
                <div className="kpi-icon green"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div></div>
              <div className="kpi-delta">{dashboard.kpis.tasksCompletedDelta}</div>
            </div>
            <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('beneficiaries')}>
              <div className="kpi-top"><div><div className="kpi-label">Total Beneficiaries</div><div className="kpi-value">{dashboard.kpis.totalBeneficiaries.toLocaleString()}</div></div>
                <div className="kpi-icon green"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div>
              <div className="kpi-delta">{dashboard.kpis.beneficiariesDelta}</div>
            </div>
            <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('budget')}>
              <div className="kpi-top"><div><div className="kpi-label">Budget Utilized</div><div className="kpi-value">{dashboard.kpis.budgetUtilizedPct}%</div></div>
                <div className="donut-wrap"><svg viewBox="0 0 54 54"><circle cx="27" cy="27" r="22" fill="none" stroke="#e5e7eb" strokeWidth="5"/><circle cx="27" cy="27" r="22" fill="none" stroke="#1a6b3c" strokeWidth="5" strokeDasharray={`${dashboard.kpis.budgetUtilizedPct * 1.38} ${138 - dashboard.kpis.budgetUtilizedPct * 1.38}`} strokeLinecap="round"/></svg><div className="donut-pct">{dashboard.kpis.budgetUtilizedPct}%</div></div></div>
              <div className="kpi-delta neutral">{dashboard.kpis.budgetSpent} of {dashboard.kpis.budgetTotal}</div>
            </div>
          </div>
          <div className="mid-row">
            <div className="card">
              <div className="card-header">
                <span className="card-title">Project Overview</span>
                <select className="card-select" value={chartRange} onChange={(e) => setChartRange(e.target.value)}>
                  <option value="month">This Month</option>
                  <option value="week">Last Month</option>
                </select>
              </div>
              <div className="chart-area"><canvas ref={chartRef} height="140"></canvas></div>
              <div className="chart-legend">
                <div className="chart-legend-item"><div className="legend-dot" style={{ background: '#d1d5db' }}></div>Planned</div>
                <div className="chart-legend-item"><div className="legend-dot" style={{ background: '#1a6b3c' }}></div>Actual</div>
              </div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Recent Activities</span>
                <span className="card-action" onClick={openActivities}>View All</span>
              </div>
              {dashboard.activities.map((a, i) => (
                <div key={i} className="activity-item">
                  <div className="act-avatar" style={{ background: a.bg }}>{a.initials}</div>
                  <div className="act-body"><div className="act-title">{a.title}</div><div className="act-sub">{a.sub}</div></div>
                  <div className="act-time">{a.time}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="bottom-row">
            <div className="card">
              <div className="card-header"><span className="card-title">Projects by Status</span></div>
              <div className="status-donut"><div className="status-legend">
                {dashboard.projectStatusSummary.map((s, i) => (
                  <div key={i} className="status-item" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('projects')}>
                    <div className="status-dot" style={{ background: i === 0 ? '#1a6b3c' : i === 1 ? '#f59e0b' : '#ef4444' }}></div>
                    {s.status} — {s.count} ({s.pct}%)
                  </div>
                ))}
              </div></div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Upcoming Tasks</span>
                <span className="card-action" onClick={() => onNavigate?.('tasks')}>View All</span>
              </div>
              {dashboard.upcomingTasks.map((task, i) => (
                <div key={i} className="task-item" style={{ cursor: 'pointer' }} onClick={() => handleCompleteTask(task.title)}>
                  <div className="task-check" title="Mark complete"></div>
                  <div className="task-body"><div className="task-title">{task.title}</div><div className="task-project">{task.project}</div></div>
                  <div className="task-date">{task.date}</div>
                </div>
              ))}
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Budget Overview</span>
                <span className="card-action" onClick={() => onNavigate?.('budget')}>View All</span>
              </div>
              {dashboard.budgetOverview.map((item, i) => (
                <div key={i} className="budget-item" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('budget')}>
                  <div className="budget-row"><span className="budget-name">{item.name}</span><span className="budget-pct">{item.pct}%</span></div>
                  <div className="budget-vals">{item.amount} / {item.total}</div>
                  <div className="bar-track"><div className={`bar-fill${item.amber ? ' amber' : ''}${item.red ? ' red' : ''}`} style={{ width: `${item.pct}%` }}></div></div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── PROJECTS ── */}
      {currentPage === 'projects' && (
        <>
          <div className="projects-topbar">
            <div><h1>Projects</h1><p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>Manage and track all your projects.</p></div>
            <button className="btn-primary" onClick={() => openProjectModal()}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Project</button>
          </div>
          <div className="filter-row">
            <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="all">All Status</option><option value="on-track">On Track</option><option value="at-risk">At Risk</option><option value="delayed">Delayed</option>
            </select>
            <input className="search-inline" type="text" placeholder="Search projects..." value={projectSearch} onChange={(e) => setProjectSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadPageData()} />
          </div>
          {loading ? <Loading /> : (
            <div className="projects-table">
              <div className="table-head"><span>Project</span><span>Status</span><span>Progress</span><span>Budget</span><span>Start Date</span><span></span></div>
              {projects.map((proj) => (
                <div key={proj.id} className="table-row" onClick={() => setSelectedProject(proj)}>
                  <div className="proj-name-cell"><div className={`proj-icon ${proj.icon}`}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg></div><span className="proj-name">{proj.name}</span></div>
                  <span><span className={`status-badge ${proj.status}`}><span className="status-dot"></span>{statusLabel(proj.status)}</span></span>
                  <span><div className="prog-wrap"><div className="prog-bar"><div className={`prog-fill${proj.status === 'at-risk' ? ' amber' : proj.status === 'delayed' ? ' red' : ''}`} style={{ width: `${proj.progress}%` }}></div></div><span className="prog-pct">{proj.progress}%</span></div></span>
                  <span className="tbl-budget">{proj.budget}</span>
                  <span className="tbl-date">{proj.date}</span>
                  <span style={{ position: 'relative' }}>
                    <button className="more-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === proj.id ? null : proj.id); }}>⋯</button>
                    {menuOpen === proj.id && (
                      <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { setSelectedProject(proj); setMenuOpen(null); }}>View</button>
                        <button onClick={() => { openProjectModal(proj); setMenuOpen(null); }}>Edit</button>
                        <button className="danger" onClick={() => handleDeleteProject(proj.id)}>Delete</button>
                      </div>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
          {selectedProject && projectDetail && (
            <Modal open title={projectDetail.name} onClose={() => setSelectedProject(null)} width={560}>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '16px' }}>{projectDetail.description}</p>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                {['overview', 'tasks', 'budget', 'documents'].map((tab) => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--gray-200)', background: activeTab === tab ? 'var(--green)' : '#fff', color: activeTab === tab ? '#fff' : 'inherit', fontSize: '11px', cursor: 'pointer', textTransform: 'capitalize' }}>{tab}</button>
                ))}
              </div>
              {activeTab === 'overview' && (
                <div style={{ fontSize: '12px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div><strong>Manager:</strong> {projectDetail.manager}</div>
                  <div><strong>Spent:</strong> {projectDetail.spent}</div>
                  <div><strong>Utilization:</strong> {projectDetail.utilization}</div>
                  <div><strong>Due:</strong> {projectDetail.dueDate}</div>
                </div>
              )}
              {activeTab === 'tasks' && projectDetail.tasks.map((t, i) => (
                <div key={i} style={{ padding: '8px 0', borderBottom: '1px solid var(--gray-100)', fontSize: '12px', display: 'flex', justifyContent: 'space-between', cursor: 'pointer' }} onClick={() => { setSelectedProject(null); onNavigate?.('tasks'); }}>
                  <span>{t.name}</span><span style={{ color: 'var(--gray-400)' }}>{t.assignee} · {t.status}</span>
                </div>
              ))}
              {activeTab === 'budget' && projectDetail.budgetCategories.map((b, i) => (
                <div key={i} style={{ padding: '8px 0', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}><span>{b.category}</span><span>{b.spent} / {b.allocated}</span></div>
                  <div className="bar-track" style={{ marginTop: '4px' }}><div className="bar-fill" style={{ width: `${b.pct}%` }}></div></div>
                </div>
              ))}
              {activeTab === 'documents' && (
                <div>{projectDetail.documents?.length ? projectDetail.documents.map((d, i) => (
                  <div key={i} style={{ fontSize: '12px', padding: '6px 0', borderBottom: '1px solid var(--gray-100)', cursor: 'pointer' }} onClick={() => { setSelectedProject(null); onNavigate?.('documents'); }}>{d.name}</div>
                )) : <p style={{ fontSize: '12px', color: 'var(--gray-400)' }}>No documents yet</p>}</div>
              )}
              <div className="form-actions">
                <button className="btn-secondary" onClick={() => { openProjectModal(selectedProject); setSelectedProject(null); }}>Edit Project</button>
                <button className="btn-primary" onClick={() => { setSelectedProject(null); openTaskModal({ projectId: selectedProject.id, project: selectedProject.name }); }}>Add Task</button>
              </div>
            </Modal>
          )}
        </>
      )}

      {/* ── TASKS ── */}
      {currentPage === 'tasks' && tasks && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Tasks</h1><p style={{ fontSize: '12px', color: 'var(--gray-500)', marginTop: '2px' }}>Drag cards between columns to update status.</p></div>
            <button className="btn-primary" onClick={() => openTaskModal()}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Task</button>
          </div>
          <div className="kanban">
            {KANBAN_COLS.map(({ key, label }) => (
              <div key={key} className={`kanban-col${dropTarget === key ? ' drop-target' : ''}`}
                onDragOver={(e) => { e.preventDefault(); setDropTarget(key); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e) => { e.preventDefault(); handleTaskDrop(key); }}>
                <div className="kanban-col-header"><span className="col-title">{label}</span><span className="col-count">{tasks.counts[key]}</span></div>
                {tasks.columns[key].map((task) => (
                  <div key={task.id} className={`kanban-card${draggedTask?.id === task.id ? ' dragging' : ''}`} draggable={!task.done}
                    onDragStart={() => setDraggedTask({ id: task.id, status: key })}
                    onClick={() => openTaskModal(task)} style={task.done ? { opacity: 0.8 } : {}}>
                    <div className="kanban-card-title" style={task.done ? { textDecoration: 'line-through', color: 'var(--gray-400)' } : {}}>{task.title}</div>
                    <div className="kanban-card-project">{task.project}</div>
                    <div className="kanban-card-footer">
                      <span className={`priority-badge ${task.priority}`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span>
                      <span className="card-due" style={task.done ? { color: 'var(--green)' } : {}}>{task.done ? 'Done' : task.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── CALENDAR ── */}
      {currentPage === 'calendar' && calendar && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Calendar</h1></div>
            <button className="btn-primary" onClick={async () => { await loadLookup(); setEventForm({ ...EMPTY_EVENT, date: new Date().toISOString().slice(0, 10) }); setModal('event'); }}>+ Add Event</button>
          </div>
          <div className="cal-grid">
            <div className="cal-main">
              <div className="cal-header">
                <span style={{ fontSize: '14px', fontWeight: '600' }}>{calendar.monthLabel}</span>
                <div className="cal-nav">
                  <button onClick={() => { const m = calMonth === 1 ? 12 : calMonth - 1; setCalYear(calMonth === 1 ? calYear - 1 : calYear); setCalMonth(m); }}>‹</button>
                  <button onClick={() => { const now = new Date(); setCalYear(now.getFullYear()); setCalMonth(now.getMonth() + 1); }}>Today</button>
                  <button onClick={() => { const m = calMonth === 12 ? 1 : calMonth + 1; setCalYear(calMonth === 12 ? calYear + 1 : calYear); setCalMonth(m); }}>›</button>
                </div>
              </div>
              <div className="cal-days-head"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
              <div className="cal-days">
                {calendar.days.map((day, i) => (
                  <div key={i} className={`cal-day${day.today ? ' today' : ''}${day.otherMonth ? ' other-month' : ''}`} onClick={() => !day.otherMonth && (setEventForm({ ...EMPTY_EVENT, date: `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day.num).padStart(2, '0')}` }), setModal('event'))}>
                    <div className="cal-day-num">{day.num}</div>
                    {day.events?.map((evt, j) => (<div key={j} className={`cal-event ${evt.c}`}>{evt.t}</div>))}
                  </div>
                ))}
              </div>
            </div>
            <div className="upcoming-events">
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '12px' }}>Upcoming Events</div>
              {calendar.upcoming.map((evt, i) => (
                <div key={i} className="event-item"><div className="event-dot" style={{ background: `var(--${evt.color})` }}></div><div className="event-body"><div className="ev-title">{evt.title}</div><div className="ev-date">{evt.date}</div></div></div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* ── BUDGET ── */}
      {currentPage === 'budget' && budget && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Budget</h1></div>
            <button className="btn-primary" onClick={async () => { const data = await loadLookup(); setExpenseForm({ ...EMPTY_EXPENSE, projectId: data.projects[0]?.id || '' }); setModal('expense'); }}>+ Add Expense</button>
          </div>
          <div className="budget-overview-grid">
            <div className="budget-big-card"><div className="budget-big-label">Total Budget</div><div className="budget-big-val">{budget.summary.totalBudget}</div><div className="budget-big-sub">Across {budget.summary.projectCount} active projects</div></div>
            <div className="budget-big-card"><div className="budget-big-label">Spent to Date</div><div className="budget-big-val" style={{ color: 'var(--green)' }}>{budget.summary.spent}</div><div className="budget-big-sub">{budget.summary.utilizationPct}% of total budget</div></div>
            <div className="budget-big-card"><div className="budget-big-label">Remaining</div><div className="budget-big-val" style={{ color: 'var(--amber)' }}>{budget.summary.remaining}</div><div className="budget-big-sub">{100 - budget.summary.utilizationPct}% remaining</div></div>
          </div>
          <div className="budget-list">
            <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Project Budget Tracker</div>
            {budget.projects.map((proj) => (
              <div key={proj.id} className="budget-list-row" style={{ cursor: 'pointer' }} onClick={() => { setExpenseForm({ projectId: proj.id, amount: '', category: 'operations' }); setModal('expense'); }}>
                <span className="budget-list-name">{proj.name}</span>
                <div className="budget-list-bar"><div className="budget-list-pcts"><span>{proj.spent} spent</span><span>{proj.total} total</span></div><div className="bar-track"><div className={`bar-fill${proj.amber ? ' amber' : ''}${proj.red ? ' red' : ''}`} style={{ width: `${proj.pct}%` }}></div></div></div>
                <span className="budget-list-amt">{proj.pct}%</span>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── REPORTS ── */}
      {currentPage === 'reports' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Reports</h1></div>
            <button className="btn-primary" onClick={() => { setReportForm(EMPTY_REPORT); setModal('report'); }}>+ New Report</button>
          </div>
          <div className="reports-grid">
            {reports.map((report) => (
              <div key={report.id} className="report-card" onClick={() => { setViewReport(report); setModal('reportView'); }}>
                <div className="report-icon"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
                <div className="report-name">{report.name}</div>
                <div className="report-date">{report.date}</div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── BENEFICIARIES ── */}
      {currentPage === 'beneficiaries' && beneficiaries && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Beneficiaries</h1></div>
            <button className="btn-primary" onClick={() => { setBeneficiaryForm(EMPTY_BENEFICIARY); setModal('beneficiary'); }}>+ Add Beneficiary</button>
          </div>
          <div className="bene-stats">
            <div className="bene-card"><div className="bene-num">{beneficiaries.stats.total.toLocaleString()}</div><div className="bene-label">Total Beneficiaries</div></div>
            <div className="bene-card"><div className="bene-num" style={{ color: '#3b82f6' }}>{beneficiaries.stats.children.toLocaleString()}</div><div className="bene-label">Children (OVC)</div></div>
            <div className="bene-card"><div className="bene-num" style={{ color: '#f59e0b' }}>{beneficiaries.stats.womenFamilies.toLocaleString()}</div><div className="bene-label">Women & Families</div></div>
            <div className="bene-card"><div className="bene-num" style={{ color: '#ef4444' }}>{beneficiaries.stats.communityMembers.toLocaleString()}</div><div className="bene-label">Community Members</div></div>
          </div>
          <div className="filter-row" style={{ marginBottom: '12px' }}>
            <select className="filter-select" value={beneRegion} onChange={(e) => setBeneRegion(e.target.value)}>
              <option value="all">All Regions</option>
              {beneficiaries.regions.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <input className="search-inline" type="text" placeholder="Search beneficiaries..." value={beneSearch} onChange={(e) => setBeneSearch(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && loadPageData()} />
          </div>
          <div className="bene-table">
            <div className="bene-table-head"><span>Name</span><span>Program</span><span>Region</span><span>Status</span><span>Enrolled</span></div>
            {beneficiaries.beneficiaries.map((bene) => (
              <div key={bene.id} className="bene-row"><span className="bene-name">{bene.name}</span><span className="bene-cell">{bene.program}</span><span className="bene-cell">{bene.region}</span><span><span className={`status-badge ${bene.status}`} style={{ fontSize: '10px' }}>{bene.statusLabel}</span></span><span className="bene-cell">{bene.date}</span></div>
            ))}
          </div>
        </>
      )}

      {/* ── DOCUMENTS ── */}
      {currentPage === 'documents' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Documents</h1></div>
            <button className="btn-primary" onClick={async () => { await loadLookup(); setDocumentForm({ ...EMPTY_DOCUMENT, projectId: lookup.projects[0]?.id || '' }); setModal('document'); }}>+ Upload</button>
          </div>
          <div className="category-tabs">
            {DOC_CATEGORIES.map((cat) => (
              <button key={cat} className={docCategory === cat ? 'active' : ''} onClick={() => setDocCategory(cat)}>{cat === 'all' ? 'All' : cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
            ))}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
            {documents.map((doc) => (
              <div key={doc.id} style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '16px', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>{doc.icon}</div>
                <div style={{ fontSize: '12.5px', fontWeight: '500', color: 'var(--gray-800)' }}>{doc.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '3px' }}>{doc.date}</div>
                <div className="doc-card-actions">
                  <button onClick={() => { setViewDocument(doc); setModal('documentView'); }}>View</button>
                  <button onClick={() => downloadDocument(doc)}>Download</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── PARTNERS ── */}
      {currentPage === 'partners' && (
        <>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Partners</h1></div>
            <button className="btn-primary" onClick={() => { setPartnerForm(EMPTY_PARTNER); setModal('partner'); }}>+ Add Partner</button>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            {partners.map((partner) => (
              <div key={partner.id} style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '16px', boxShadow: 'var(--shadow)' }}>
                <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{partner.name}</div>
                <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginBottom: '8px' }}>{partner.type}</div>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>{partner.desc || partner.description}</div>
                {(partner.email || partner.phone) && (
                  <div className="partner-actions">
                    {partner.email && <a href={`mailto:${partner.email}`}>Email</a>}
                    {partner.phone && <a href={`tel:${partner.phone}`}>Call</a>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── MESSAGES ── */}
      {currentPage === 'messages' && messages && (
        <>
          <div style={{ marginBottom: '16px' }}><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Messages</h1></div>
          <div className="messages-panel">
            <div className="messages-list">
              {messages.messages?.length ? messages.messages.map((msg) => (
                <div key={msg.id} className="message-bubble">
                  <div className="msg-avatar" style={{ background: msg.color }}>{msg.initials}</div>
                  <div><div style={{ fontSize: '12px', fontWeight: '600' }}>{msg.senderName} <span style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '10px' }}>{msg.time}</span></div><div style={{ fontSize: '13px', marginTop: '2px' }}>{msg.content}</div></div>
                </div>
              )) : <p style={{ textAlign: 'center', color: 'var(--gray-400)', fontSize: '13px' }}>No messages yet. Send the first one!</p>}
            </div>
            <form className="message-compose" onSubmit={handleSendMessage}>
              <input type="text" placeholder="Type a message to the team..." value={messageInput} onChange={(e) => setMessageInput(e.target.value)} />
              <button className="btn-primary" type="submit" disabled={submitting}>Send</button>
            </form>
          </div>
        </>
      )}

      {/* ── SETTINGS ── */}
      {currentPage === 'settings' && organization && (
        <>
          <div style={{ marginBottom: '16px' }}><h1 style={{ fontSize: '20px', fontWeight: '600', fontFamily: "'DM Serif Display',serif" }}>Settings</h1></div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '16px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Organization Info</div>
              {['name', 'country', 'email', 'phone', 'location'].map((field) => (
                <div key={field} className="form-field">
                  <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                  <input value={orgForm[field] || ''} onChange={(e) => setOrgForm({ ...orgForm, [field]: e.target.value })} />
                </div>
              ))}
              <div className="form-field"><label>Description</label><textarea value={orgForm.description || ''} onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })} /></div>
              <button className="btn-primary" style={{ fontSize: '11px' }} onClick={handleSaveOrg} disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
            </div>
            <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderRadius: 'var(--radius)', padding: '16px', boxShadow: 'var(--shadow)' }}>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '14px' }}>Manage Users & Roles</div>
              <div style={{ border: '1px solid var(--gray-100)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', padding: '8px 12px', background: 'var(--gray-50)', fontSize: '11px', fontWeight: '600', color: 'var(--gray-500)' }}><span>NAME</span><span>ROLE</span><span>STATUS</span></div>
                {users.map((u) => (
                  <div key={u.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 80px', padding: '9px 12px', borderTop: '1px solid var(--gray-100)', fontSize: '12px', cursor: 'pointer' }} onClick={() => { setEditUser({ ...u }); setModal('user'); }}>
                    <span>{u.name}</span><span style={{ color: 'var(--green)' }}>{u.roleLabel}</span><span style={{ color: u.isActive ? 'var(--green)' : 'var(--gray-400)' }}>{u.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── MODALS ── */}
      <Modal open={modal === 'project'} title={projectForm.id ? 'Edit Project' : 'New Project'} onClose={closeModal}>
        <form onSubmit={handleSaveProject}>
          <div className="form-field"><label>Name *</label><input required value={projectForm.name} onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })} /></div>
          <div className="form-field"><label>Description</label><textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field"><label>Status</label><select value={projectForm.status} onChange={(e) => setProjectForm({ ...projectForm, status: e.target.value })}><option value="on-track">On Track</option><option value="at-risk">At Risk</option><option value="delayed">Delayed</option></select></div>
            <div className="form-field"><label>Icon Color</label><select value={projectForm.icon} onChange={(e) => setProjectForm({ ...projectForm, icon: e.target.value })}><option value="green">Green</option><option value="blue">Blue</option><option value="amber">Amber</option><option value="red">Red</option></select></div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Budget ($)</label><input type="number" value={projectForm.budget} onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })} /></div>
            <div className="form-field"><label>Donor</label><input value={projectForm.donor} onChange={(e) => setProjectForm({ ...projectForm, donor: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Start Date</label><input type="date" value={projectForm.startDate} onChange={(e) => setProjectForm({ ...projectForm, startDate: e.target.value })} /></div>
            <div className="form-field"><label>End Date</label><input type="date" value={projectForm.endDate} onChange={(e) => setProjectForm({ ...projectForm, endDate: e.target.value })} /></div>
          </div>
          <div className="form-field"><label>Manager *</label><select required value={projectForm.managerId} onChange={(e) => setProjectForm({ ...projectForm, managerId: e.target.value })}>{lookup.users.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Project'}</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'task'} title={taskForm.id ? 'Edit Task' : 'New Task'} onClose={closeModal}>
        <form onSubmit={handleSaveTask}>
          <div className="form-field"><label>Title *</label><input required value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
          <div className="form-field"><label>Project *</label><select required value={taskForm.projectId} onChange={(e) => setTaskForm({ ...taskForm, projectId: e.target.value })}>{lookup.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-row">
            <div className="form-field"><label>Priority</label><select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></div>
            <div className="form-field"><label>Status</label><select value={taskForm.status} onChange={(e) => setTaskForm({ ...taskForm, status: e.target.value })}><option value="todo">To Do</option><option value="in_progress">In Progress</option><option value="completed">Completed</option></select></div>
          </div>
          <div className="form-field"><label>Due Date</label><input type="date" value={taskForm.dueDate} onChange={(e) => setTaskForm({ ...taskForm, dueDate: e.target.value })} /></div>
          <div className="form-actions">
            {taskForm.id && <button type="button" className="btn-danger" onClick={async () => { if (confirm('Delete task?')) { await api.deleteTask(taskForm.id); showToast('Task deleted'); closeModal(); loadPageData(); } }}>Delete</button>}
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Task'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'event'} title="Add Event" onClose={closeModal}>
        <form onSubmit={handleSaveEvent}>
          <div className="form-field"><label>Title *</label><input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field"><label>Date *</label><input type="date" required value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} /></div>
            <div className="form-field"><label>Color</label><select value={eventForm.color} onChange={(e) => setEventForm({ ...eventForm, color: e.target.value })}><option value="green">Green</option><option value="red">Red</option><option value="amber">Amber</option><option value="blue">Blue</option></select></div>
          </div>
          <div className="form-field"><label><input type="checkbox" checked={eventForm.allDay} onChange={(e) => setEventForm({ ...eventForm, allDay: e.target.checked })} /> All Day</label></div>
          {!eventForm.allDay && <div className="form-field"><label>Time</label><input type="time" value={eventForm.time} onChange={(e) => setEventForm({ ...eventForm, time: e.target.value })} /></div>}
          <div className="form-field"><label>Project (optional)</label><select value={eventForm.projectId} onChange={(e) => setEventForm({ ...eventForm, projectId: e.target.value })}><option value="">None</option>{lookup.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Add Event</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'expense'} title="Add Expense" onClose={closeModal}>
        <form onSubmit={handleSaveExpense}>
          <div className="form-field"><label>Project *</label><select required value={expenseForm.projectId} onChange={(e) => setExpenseForm({ ...expenseForm, projectId: e.target.value })}>{lookup.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-row">
            <div className="form-field"><label>Amount ($) *</label><input type="number" required min="1" step="0.01" value={expenseForm.amount} onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} /></div>
            <div className="form-field"><label>Category</label><select value={expenseForm.category} onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value })}><option value="operations">Operations</option><option value="personnel">Personnel</option><option value="materials">Materials</option><option value="equipment">Equipment</option></select></div>
          </div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Add Expense</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'beneficiary'} title="Add Beneficiary" onClose={closeModal}>
        <form onSubmit={handleSaveBeneficiary}>
          <div className="form-field"><label>Name *</label><input required value={beneficiaryForm.name} onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, name: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field"><label>Program</label><input value={beneficiaryForm.program} onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, program: e.target.value })} placeholder="Health, Education, WASH..." /></div>
            <div className="form-field"><label>Region</label><input value={beneficiaryForm.region} onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, region: e.target.value })} /></div>
          </div>
          <div className="form-row">
            <div className="form-field"><label>Email</label><input type="email" value={beneficiaryForm.email} onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, email: e.target.value })} /></div>
            <div className="form-field"><label>Status</label><select value={beneficiaryForm.status} onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, status: e.target.value })}><option value="active">Active</option><option value="follow-up">Follow-up</option></select></div>
          </div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Add Beneficiary</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'document'} title="Upload Document" onClose={closeModal}>
        <form onSubmit={handleSaveDocument}>
          <div className="form-field"><label>File Name *</label><input required value={documentForm.name} onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })} placeholder="Report Q2.pdf" /></div>
          <div className="form-row">
            <div className="form-field"><label>Category</label><select value={documentForm.category} onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}>{DOC_CATEGORIES.filter((c) => c !== 'all').map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-field"><label>Type</label><select value={documentForm.fileType} onChange={(e) => setDocumentForm({ ...documentForm, fileType: e.target.value })}><option>PDF</option><option>XLSX</option><option>DOCX</option><option>CSV</option><option>ZIP</option></select></div>
          </div>
          <div className="form-field"><label>Project</label><select value={documentForm.projectId} onChange={(e) => setDocumentForm({ ...documentForm, projectId: e.target.value })}><option value="">All Projects</option>{lookup.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Upload</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'documentView'} title={viewDocument?.name || 'Document'} onClose={closeModal}>
        {viewDocument && (<>
          <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}><strong>Project:</strong> {viewDocument.project || 'All Projects'}</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}><strong>Category:</strong> {viewDocument.category}</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}><strong>Type:</strong> {viewDocument.fileType}</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-600)' }}><strong>Uploaded:</strong> {viewDocument.uploaded}</p>
          <div className="form-actions"><button className="btn-primary" onClick={() => downloadDocument(viewDocument)}>Download</button></div>
        </>)}
      </Modal>

      <Modal open={modal === 'partner'} title="Add Partner" onClose={closeModal}>
        <form onSubmit={handleSavePartner}>
          <div className="form-field"><label>Name *</label><input required value={partnerForm.name} onChange={(e) => setPartnerForm({ ...partnerForm, name: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field"><label>Type *</label><select value={partnerForm.type} onChange={(e) => setPartnerForm({ ...partnerForm, type: e.target.value })}><option>Donor</option><option>Health</option><option>Education</option><option>WASH</option><option>Government Partner</option></select></div>
            <div className="form-field"><label>Contact</label><input value={partnerForm.contact} onChange={(e) => setPartnerForm({ ...partnerForm, contact: e.target.value })} /></div>
          </div>
          <div className="form-field"><label>Description</label><textarea value={partnerForm.description} onChange={(e) => setPartnerForm({ ...partnerForm, description: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field"><label>Email</label><input type="email" value={partnerForm.email} onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })} /></div>
            <div className="form-field"><label>Phone</label><input value={partnerForm.phone} onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })} /></div>
          </div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Add Partner</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'report'} title="New Report" onClose={closeModal}>
        <form onSubmit={handleSaveReport}>
          <div className="form-field"><label>Name *</label><input required value={reportForm.name} onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })} /></div>
          <div className="form-field"><label>Description</label><textarea value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} /></div>
          <div className="form-field"><label>Date</label><input type="date" value={reportForm.reportDate} onChange={(e) => setReportForm({ ...reportForm, reportDate: e.target.value })} /></div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Create Report</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'reportView'} title={viewReport?.name || 'Report'} onClose={closeModal}>
        {viewReport && (<>
          <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '12px' }}>{viewReport.date}</p>
          <p style={{ fontSize: '13px', color: 'var(--gray-700)' }}>{viewReport.description || 'No description provided.'}</p>
          <div className="report-actions">
            <button onClick={() => downloadReport(viewReport)}>Download</button>
            <button onClick={() => shareReport(viewReport)}>Share</button>
          </div>
        </>)}
      </Modal>

      <Modal open={modal === 'activities'} title="All Activities" onClose={closeModal} width={560}>
        <div className="activity-list-full">
          {activities.length ? activities.map((a, i) => (
            <div key={a.id || i} className="activity-item">
              <div className="act-avatar" style={{ background: AVATAR_COLORS[i % 4] }}>{a.user?.name?.split(' ').map((n) => n[0]).join('').slice(0, 2)}</div>
              <div className="act-body"><div className="act-title">{a.project?.name || a.entity}</div><div className="act-sub">{a.description || `${a.action} on ${a.entity}`}</div></div>
            </div>
          )) : <p style={{ color: 'var(--gray-400)', fontSize: '13px' }}>No activities found.</p>}
        </div>
      </Modal>

      <Modal open={modal === 'user'} title="Edit User" onClose={closeModal}>
        {editUser && (
          <form onSubmit={handleSaveUser}>
            <div className="form-field"><label>Name</label><input value={editUser.name} onChange={(e) => setEditUser({ ...editUser, name: e.target.value })} /></div>
            <div className="form-field"><label>Role</label><select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}><option value="admin">Admin</option><option value="manager">Manager</option><option value="staff">Staff</option><option value="donor">Donor</option></select></div>
            <div className="form-field"><label><input type="checkbox" checked={editUser.isActive} onChange={(e) => setEditUser({ ...editUser, isActive: e.target.checked })} /> Active</label></div>
            <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Save</button></div>
          </form>
        )}
      </Modal>
    </div>
  );
};

const AVATAR_COLORS = ['#1a6b3c', '#3b82f6', '#f59e0b', '#ef4444'];

export default DashboardPages;
