'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Chart from 'chart.js/auto';
import api from '@/lib/api';
import Modal from '@/components/Modal';
import toast from '@/lib/toast';
import { confirmToast } from '@/lib/confirmToast';
import MessagesInbox from '@/components/MessagesInbox';
import DocumentsLibrary from '@/components/DocumentsLibrary';
import LogisticsPage from '@/components/LogisticsPage';
import ProfileSettings from '@/components/ProfileSettings';
import ReportsDashboard from '@/components/ReportsDashboard';
import ReportsManagement from '@/components/ReportsManagement';
import ReportsApproval from '@/components/ReportsApproval';
import ConfigurationHub from '@/components/ConfigurationHub';
import PlanningModule from '@/components/PlanningModule';
import AuditLogPage from '@/components/AuditLogPage';
import { reportTypeFromPageId, getReportTypeMeta, INCIDENT_SEVERITIES } from '@/lib/report-types';
import { isConfigPage } from '@/lib/config-pages';
import { isPlanningPage } from '@/lib/planning-pages';
import ProjectFormModal, { EMPTY_PROJECT_FORM, parseBudgetInput } from '@/components/ProjectFormModal';
import ProjectIcon from '@/components/ProjectIcon';
import TaskDetailView from '@/components/TaskDetailView';
import { useAuth } from '@/components/AuthProvider';
import { isProjectManager, canManageUsers, STAFF_ROLES } from '@/lib/roles';
import { formatBudgetInput } from '@/lib/ethiopia-locations';
import { useDebouncedValue } from '@/lib/useDebouncedValue';
import { BENEFICIARY_STATUSES } from '@/lib/beneficiary-status';

function Loading() {
  return <div className="page-loading"><div className="login-spinner" /><span>Loading…</span></div>;
}

function ErrorMsg({ message }) {
  return <div style={{ padding: '40px', textAlign: 'center', color: '#ef4444', fontSize: '13px' }}>{message || 'Failed to load data.'}</div>;
}

const EMPTY_PROJECT = EMPTY_PROJECT_FORM;
const EMPTY_TASK = { title: '', projectId: '', priority: 'medium', status: 'todo', dueDate: '' };
const EMPTY_EVENT = { title: '', date: '', time: '', color: 'green', allDay: false, projectId: '' };
const EMPTY_EXPENSE = { projectId: '', amount: '', category: 'operations' };
const EMPTY_BENEFICIARY = { name: '', email: '', program: '', region: '', status: 'active' };
const EMPTY_DOCUMENT = { name: '', category: 'reports', projectId: '', fileType: 'PDF', size: '1 MB' };
const EMPTY_PARTNER = { name: '', type: 'Donor', description: '', email: '', phone: '', contact: '' };
const EMPTY_REPORT = {
  name: '',
  type: 'monthly',
  description: '',
  content: '',
  reportDate: new Date().toISOString().slice(0, 10),
  periodStart: '',
  periodEnd: '',
  projectId: '',
  incidentSeverity: '',
  incidentLocation: '',
  actionsTaken: '',
};

const KANBAN_COLS = [
  { key: 'todo', label: 'To Do' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

function KanbanBoard({ tasks, draggedTask, dropTarget, onDragStart, onDragOver, onDragLeave, onDrop, onTaskClick, showProject = true }) {
  if (!tasks) return <Loading />;
  return (
    <div className="kanban">
      {KANBAN_COLS.map(({ key, label }) => (
        <div
          key={key}
          className={`kanban-col${dropTarget === key ? ' drop-target' : ''}`}
          onDragOver={(e) => onDragOver(e, key)}
          onDragLeave={onDragLeave}
          onDrop={(e) => onDrop(e, key)}
        >
          <div className="kanban-col-header">
            <span className="col-title">{label}</span>
            <span className="col-count">{tasks.counts[key]}</span>
          </div>
          {tasks.columns[key].map((task) => (
            <div
              key={task.id}
              className={`kanban-card${draggedTask?.id === task.id ? ' dragging' : ''}`}
              draggable={!task.done}
              onDragStart={() => onDragStart({ id: task.id, status: key })}
              onClick={() => onTaskClick(task)}
              style={task.done ? { opacity: 0.8 } : {}}
            >
              <div className="kanban-card-title" style={task.done ? { textDecoration: 'line-through', color: 'var(--gray-400)' } : {}}>
                {task.title}
              </div>
              {showProject && <div className="kanban-card-project">{task.project}</div>}
              <div className="kanban-card-footer">
                <span className={`priority-badge ${task.priority}`}>
                  {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                </span>
                <span className="card-due" style={task.done ? { color: 'var(--green)' } : {}}>
                  {task.done ? 'Done' : task.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

const DOC_CATEGORIES = ['all', 'reports', 'budget', 'data', 'contracts', 'media', 'training', 'feedback'];

const DashboardPages = ({
  currentPage, onNavigate,
  topbarSearch = '',
  onTopbarSearchSync,
  pinnedProjects = [], onPinsChange, pendingNav, onPendingNavHandled,
  onReportsChange,
}) => {
  const { user } = useAuth();
  const isManager = isProjectManager(user);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [modal, setModal] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [projects, setProjects] = useState([]);
  const [calendar, setCalendar] = useState(null);
  const [budget, setBudget] = useState(null);
  const [reportsDashboard, setReportsDashboard] = useState(null);
  const [typedReports, setTypedReports] = useState([]);
  const [configData, setConfigData] = useState(null);
  const [planningData, setPlanningData] = useState(null);
  const [beneficiaries, setBeneficiaries] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [docSearch, setDocSearch] = useState('');
  const [logistics, setLogistics] = useState(null);
  const [partners, setPartners] = useState([]);
  const [organization, setOrganization] = useState(null);
  const [users, setUsers] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [activities, setActivities] = useState([]);

  const [lookup, setLookup] = useState({ users: [], projects: [] });

  const [selectedProject, setSelectedProject] = useState(null);
  const [projectDetail, setProjectDetail] = useState(null);
  const [projectView, setProjectView] = useState('list');
  const [projectTasks, setProjectTasks] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [menuOpen, setMenuOpen] = useState(null);

  const [projectFilter, setProjectFilter] = useState('all');
  const [projectSearch, setProjectSearch] = useState('');
  const [beneRegion, setBeneRegion] = useState('all');
  const [beneProgram, setBeneProgram] = useState('all');
  const [beneStatus, setBeneStatus] = useState('all');
  const [beneSearch, setBeneSearch] = useState('');
  const debouncedProjectSearch = useDebouncedValue(projectSearch, 350);
  const debouncedBeneSearch = useDebouncedValue(beneSearch, 350);
  const pageDataLoaded = useRef({});
  const [docCategory, setDocCategory] = useState('all');
  const [orgForm, setOrgForm] = useState({
    name: '', country: '', email: '', phone: '', location: '', description: '',
    dateFormat: 'DD/MM/YYYY', timezone: 'Africa/Addis_Ababa', fiscalYearStart: 'July',
  });
  const [selectedTask, setSelectedTask] = useState(null);
  const [newStaffForm, setNewStaffForm] = useState({ name: '', email: '', password: '', staffRole: 'field_worker' });
  const [isPinned, setIsPinned] = useState(false);

  const [calYear, setCalYear] = useState(new Date().getFullYear());
  const [calMonth, setCalMonth] = useState(new Date().getMonth() + 1);
  const [msgInitialSelection, setMsgInitialSelection] = useState(null);

  const [projectForm, setProjectForm] = useState(EMPTY_PROJECT);
  const [taskForm, setTaskForm] = useState(EMPTY_TASK);
  const [eventForm, setEventForm] = useState(EMPTY_EVENT);
  const [expenseForm, setExpenseForm] = useState(EMPTY_EXPENSE);
  const [beneficiaryForm, setBeneficiaryForm] = useState(EMPTY_BENEFICIARY);
  const [documentForm, setDocumentForm] = useState(EMPTY_DOCUMENT);
  const [documentFile, setDocumentFile] = useState(null);
  const fileInputRef = useRef(null);
  const [partnerForm, setPartnerForm] = useState(EMPTY_PARTNER);
  const [reportForm, setReportForm] = useState(EMPTY_REPORT);
  const [reportFile, setReportFile] = useState(null);
  const reportFileInputRef = useRef(null);
  const [viewReport, setViewReport] = useState(null);
  const [rejectForm, setRejectForm] = useState({ reportId: null, reason: '', requestRevision: true });
  const [viewDocument, setViewDocument] = useState(null);
  const [editUser, setEditUser] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [dropTarget, setDropTarget] = useState(null);

  const showToast = useCallback((message, type = 'success') => {
    if (type === 'error') toast.error(message);
    else toast.success(message);
  }, []);

  const closeModal = () => {
    setModal(null);
    setViewReport(null);
    setViewDocument(null);
    setEditUser(null);
    setDocumentFile(null);
    setReportFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (reportFileInputRef.current) reportFileInputRef.current.value = '';
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

  const loadPageData = useCallback(async (fullLoader = false) => {
    const cacheKey = `${currentPage}-${projectFilter}-${debouncedProjectSearch}-${beneRegion}-${beneProgram}-${beneStatus}-${debouncedBeneSearch}-${docCategory}-${calYear}-${calMonth}`;
    const hasCache = pageDataLoaded.current[cacheKey];
    if (fullLoader || !hasCache) setLoading(true);
    else setRefreshing(true);
    setError(null);
    try {
      switch (currentPage) {
        case 'dashboard':
          setDashboard(await api.dashboard());
          break;
        case 'projects': {
          const params = {};
          if (projectFilter !== 'all') params.status = projectFilter;
          if (debouncedProjectSearch) params.search = debouncedProjectSearch;
          setProjects(await api.projects(params));
          break;
        }
        case 'calendar':
          setCalendar(await api.calendar(calYear, calMonth));
          break;
        case 'budget':
          setBudget(await api.budget());
          break;
        case 'reports':
        case 'reports-overview':
          setReportsDashboard(await api.reportsDashboard());
          break;
        case 'reports-approval':
          setTypedReports(await api.reports({ pending: 'true' }));
          break;
        case 'reports-daily':
        case 'reports-weekly':
        case 'reports-monthly':
        case 'reports-quarterly':
        case 'reports-biannual':
        case 'reports-annual':
        case 'reports-incident': {
          const rt = reportTypeFromPageId(currentPage);
          if (rt) setTypedReports(await api.reports({ type: rt }));
          break;
        }
        case 'beneficiaries': {
          const params = {};
          if (beneRegion !== 'all') params.region = beneRegion;
          if (beneProgram !== 'all') params.program = beneProgram;
          if (beneStatus !== 'all') params.status = beneStatus;
          if (debouncedBeneSearch) params.search = debouncedBeneSearch;
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
        case 'logistics':
          setLogistics(await api.logistics());
          break;
        case 'partners':
          setPartners(await api.partners());
          break;
        case 'messages':
          await loadLookup();
          break;
        case 'audit-log':
          if (user?.role === 'admin') {
            setAuditLogs(await api.auditLogs({ limit: '200' }));
          }
          break;
        case 'settings': {
          const tasks = [];
          if (user?.role === 'admin') {
            tasks.push(api.organization().then((org) => {
              setOrganization(org);
              setOrgForm({
                name: org.name || '',
                country: org.country || '',
                email: org.email || '',
                phone: org.phone || '',
                location: org.location || '',
                description: org.description || '',
                dateFormat: org.dateFormat || 'DD/MM/YYYY',
                timezone: org.timezone || 'Africa/Addis_Ababa',
                fiscalYearStart: org.fiscalYearStart || 'July',
              });
            }));
          }
          if (canManageUsers(user)) {
            tasks.push(api.users().then(setUsers));
          }
          await Promise.all(tasks);
          break;
        }
        case 'planning':
          setPlanningData(await api.planning());
          break;
        case 'planning-projects': {
          const list = await api.projects();
          setProjects(list);
          setPlanningData({ projects: list });
          break;
        }
        case 'planning-outcomes':
          setPlanningData(await api.planningOutcomes());
          break;
        case 'planning-outputs':
          setPlanningData(await api.planningOutputs());
          break;
        case 'planning-activities':
          setPlanningData(await api.planningActivities());
          break;
        case 'planning-my-activities':
          setPlanningData(await api.planningActivities({ mine: 'true' }));
          break;
        default:
          if (isConfigPage(currentPage)) {
            setConfigData(await api.config());
          }
          break;
      }
      pageDataLoaded.current[cacheKey] = true;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentPage, projectFilter, debouncedProjectSearch, beneRegion, beneProgram, beneStatus, debouncedBeneSearch, docCategory, calYear, calMonth, user?.role]);

  const prevPageRef = useRef(currentPage);
  useEffect(() => {
    const fullLoader = prevPageRef.current !== currentPage;
    prevPageRef.current = currentPage;
    loadPageData(fullLoader);
  }, [currentPage, projectFilter, debouncedProjectSearch, beneRegion, beneProgram, beneStatus, debouncedBeneSearch, docCategory, calYear, calMonth]);

  const loadProjectTasks = useCallback(async (projectId) => {
    if (!projectId) return;
    try {
      setProjectTasks(await api.tasks({ projectId }));
    } catch (err) {
      showToast(err.message, 'error');
    }
  }, [showToast]);

  const openProjectDetail = (proj, tab = 'overview') => {
    if (proj.hasAccess === false) {
      showToast('You are not assigned to this project and cannot view its details.', 'error');
      return;
    }
    setSelectedProject(proj);
    setProjectView('detail');
    setActiveTab(tab);
  };

  const closeProjectDetail = () => {
    setProjectView('list');
    setSelectedProject(null);
    setProjectDetail(null);
    setProjectTasks(null);
    setSelectedTask(null);
    setActiveTab('overview');
  };

  useEffect(() => { loadLookup(); }, [loadLookup]);

  useEffect(() => {
    if (currentPage !== 'projects') {
      setProjectView('list');
      setSelectedProject(null);
      setProjectDetail(null);
      setProjectTasks(null);
    }
  }, [currentPage]);

  useEffect(() => {
    if (currentPage === 'projects') {
      setProjectSearch(topbarSearch);
    } else if (currentPage === 'beneficiaries') {
      setBeneSearch(topbarSearch);
    }
  }, [topbarSearch]);

  useEffect(() => {
    if (currentPage === 'projects') {
      onTopbarSearchSync?.(projectSearch);
    } else if (currentPage === 'beneficiaries') {
      onTopbarSearchSync?.(beneSearch);
    } else {
      onTopbarSearchSync?.('');
    }
  }, [currentPage]);

  useEffect(() => {
    if (!pendingNav?.projectId) return;
    const openPending = async () => {
      try {
        if (pendingNav.openMessages) {
          onNavigate?.('messages');
          setMsgInitialSelection({
            projectId: pendingNav.projectId,
          });
          onPendingNavHandled?.();
          return;
        }
        const proj = await api.project(pendingNav.projectId);
        setSelectedProject({ id: proj.id, name: proj.name, status: proj.status, icon: proj.icon, progress: proj.progress, budget: proj.budget });
        setProjectView('detail');
        setActiveTab(pendingNav.tab || 'tasks');
        if (pendingNav.taskId && proj.tasks) {
          const task = proj.tasks.find((t) => t.id === pendingNav.taskId);
          if (task) setSelectedTask(task);
        }
        onPendingNavHandled?.();
      } catch (err) {
        showToast(err.message || 'You do not have access to this project', 'error');
        onPendingNavHandled?.();
      }
    };
    openPending();
  }, [pendingNav, onPendingNavHandled, onNavigate]);

  useEffect(() => {
    if (selectedProject?.id) {
      setIsPinned(pinnedProjects.some((p) => p.projectId === selectedProject.id));
    }
  }, [selectedProject, pinnedProjects]);

  useEffect(() => {
    if (selectedProject?.id) {
      api.project(selectedProject.id)
        .then(setProjectDetail)
        .catch((err) => {
          setProjectDetail(null);
          setProjectView('list');
          setSelectedProject(null);
          showToast(err.message || 'You do not have access to this project', 'error');
        });
    } else {
      setProjectDetail(null);
    }
  }, [selectedProject]);

  useEffect(() => {
    if (projectView === 'detail' && selectedProject?.id && activeTab === 'tasks') {
      loadProjectTasks(selectedProject.id);
    }
  }, [projectView, selectedProject, activeTab, loadProjectTasks]);

  useEffect(() => {
    if (currentPage !== 'dashboard' || !dashboard?.chart?.taskStatus || !chartRef.current) return;
    if (chartInstance.current) chartInstance.current.destroy();

    const { taskStatus } = dashboard.chart;
    const ctx = chartRef.current.getContext('2d');

    chartInstance.current = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: taskStatus.labels,
        datasets: [
          {
            label: 'Tasks',
            data: taskStatus.counts,
            backgroundColor: [
              'rgba(148, 163, 184, 0.75)',
              'rgba(59, 130, 246, 0.85)',
              'rgba(34, 197, 94, 0.85)',
            ],
            borderRadius: 8,
            borderSkipped: false,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.label}: ${ctx.raw} task${ctx.raw === 1 ? '' : 's'}`,
            },
          },
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { size: 11 }, color: '#64748b' } },
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' },
            ticks: { stepSize: 1, font: { size: 10 }, color: '#94a3b8' },
            title: { display: true, text: 'Task count', font: { size: 10 }, color: '#94a3b8' },
          },
        },
      },
    });
    return () => { if (chartInstance.current) chartInstance.current.destroy(); };
  }, [currentPage, dashboard]);

  const statusLabel = (s) => (s === 'on-track' ? 'On Track' : s === 'at-risk' ? 'At Risk' : 'Delayed');

  const openProjectModal = async (project = null) => {
    const data = await loadLookup();
    const defaultManager = data.users.find((u) => ['manager', 'project_manager', 'admin'].includes(u.role)) || data.users[0];
    if (project) {
      let detail = project;
      if (project.id && !project.assumptions) {
        try { detail = await api.project(project.id); } catch { /* use list data */ }
      }
      setProjectForm({
        id: detail.id,
        name: detail.name,
        description: detail.description || '',
        status: detail.status,
        icon: detail.icon,
        budget: detail.budgetRaw ? formatBudgetInput(detail.budgetRaw) : '',
        income: detail.income ? formatBudgetInput(detail.income) : '',
        startDate: detail.startDate ? new Date(detail.startDate).toISOString().slice(0, 10) : '',
        endDate: detail.endDate ? new Date(detail.endDate).toISOString().slice(0, 10) : '',
        donor: detail.donor || '',
        donorName: detail.donorName || detail.donor || '',
        managerId: detail.managerId || detail.manager?.id || defaultManager?.id || '',
        leadId: detail.leadId || '',
        assumptions: detail.assumptions || '',
        risks: detail.risks || '',
        indicators: detail.indicators || '',
        outcomes: detail.outcomes || '',
        mitigationStrategies: detail.mitigationStrategies || '',
        locationType: detail.locationType || '',
        region: detail.region || '',
        zone: detail.zone || '',
        town: detail.town || '',
        kebele: detail.kebele || '',
        woreda: detail.woreda || '',
        woredaBudget: detail.woredaBudget ? formatBudgetInput(detail.woredaBudget) : '',
        memberIds: detail.members?.map((m) => m.id) || [],
      });
    } else {
      setProjectForm({ ...EMPTY_PROJECT, managerId: defaultManager?.id || '', leadId: defaultManager?.id || '' });
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
      setTaskForm({
        ...EMPTY_TASK,
        projectId: selectedProject?.id || data.projects[0]?.id || '',
      });
    }
    setModal('task');
  };

  const handleSaveProject = async (e) => {
    e.preventDefault();
    if (!isManager) { showToast('Only project managers can create projects', 'error'); return; }
    setSubmitting(true);
    try {
      const body = {
        name: projectForm.name,
        description: projectForm.description,
        status: projectForm.status,
        icon: projectForm.icon,
        budget: parseBudgetInput(projectForm.budget),
        income: parseBudgetInput(projectForm.income),
        startDate: projectForm.startDate || new Date().toISOString(),
        endDate: projectForm.endDate || new Date().toISOString(),
        donor: projectForm.donorName || projectForm.donor,
        donorName: projectForm.donorName || projectForm.donor,
        managerId: projectForm.managerId,
        leadId: projectForm.leadId || projectForm.managerId,
        assumptions: projectForm.assumptions,
        risks: projectForm.risks,
        indicators: projectForm.indicators,
        outcomes: projectForm.outcomes,
        mitigationStrategies: projectForm.mitigationStrategies,
        locationType: projectForm.locationType,
        region: projectForm.region,
        zone: projectForm.zone,
        town: projectForm.town,
        kebele: projectForm.kebele,
        woreda: projectForm.woreda,
        woredaBudget: parseBudgetInput(projectForm.woredaBudget),
        memberIds: projectForm.memberIds || [],
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
      if (projectView === 'detail' && selectedProject?.id) {
        api.project(selectedProject.id).then(setProjectDetail);
      }
      if (currentPage === 'dashboard') api.dashboard().then(setDashboard);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePin = async () => {
    if (!selectedProject?.id) return;
    try {
      if (isPinned) {
        await api.unpinProject(selectedProject.id);
        showToast('Project unpinned');
      } else {
        await api.pinProject(selectedProject.id);
        showToast('Project pinned to sidebar');
      }
      onPinsChange?.();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.createUser({ ...newStaffForm, role: 'staff' });
      showToast('Staff member added');
      setNewStaffForm({ name: '', email: '', password: '', staffRole: 'field_worker' });
      const userList = await api.users();
      setUsers(userList);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id) => {
    const ok = await confirmToast('Delete this project?', {
      description: 'All tasks and related data will be removed.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api.deleteProject(id);
      showToast('Project deleted');
      setMenuOpen(null);
      closeProjectDetail();
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
      if (projectView === 'detail' && selectedProject?.id && activeTab === 'tasks') {
        loadProjectTasks(selectedProject.id);
      }
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
      if (projectView === 'detail' && selectedProject?.id) {
        loadProjectTasks(selectedProject.id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
    setDraggedTask(null);
    setDropTarget(null);
  };

  const handleSaveEvent = async (e) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    if (eventForm.date < today) {
      showToast('Events cannot be scheduled on past dates', 'error');
      return;
    }
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
      if (projectView === 'detail' && selectedProject?.id && activeTab === 'tasks') {
        loadProjectTasks(selectedProject.id);
      }
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
      if (projectView === 'detail' && selectedProject?.id && activeTab === 'tasks') {
        loadProjectTasks(selectedProject.id);
      }
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
      if (projectView === 'detail' && selectedProject?.id && activeTab === 'tasks') {
        loadProjectTasks(selectedProject.id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDocumentFileSelect = (file) => {
    if (!file) return;
    const ext = file.name.split('.').pop()?.toUpperCase() || 'FILE';
    setDocumentFile(file);
    setDocumentForm((prev) => ({
      ...prev,
      name: file.name,
      fileType: ['PDF', 'XLSX', 'DOCX', 'CSV', 'ZIP', 'PNG', 'JPEG'].includes(ext) ? ext : prev.fileType,
      size: file.size < 1024 * 1024 ? `${(file.size / 1024).toFixed(1)} KB` : `${(file.size / (1024 * 1024)).toFixed(1)} MB`,
    }));
  };

  const handleSaveDocument = async (e) => {
    e.preventDefault();
    if (!documentFile) {
      showToast('Please choose a file from your computer', 'error');
      return;
    }
    setSubmitting(true);
    try {
      const uploaded = await api.uploadDocumentFile(documentFile);
      await api.createDocument({
        name: documentForm.name || uploaded.name,
        url: uploaded.url,
        fileType: uploaded.fileType || documentForm.fileType,
        category: documentForm.category,
        size: uploaded.size || documentForm.size,
        icon: uploaded.icon,
        projectId: documentForm.projectId || null,
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
      if (projectView === 'detail' && selectedProject?.id && activeTab === 'tasks') {
        loadProjectTasks(selectedProject.id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveReport = async (e, submitForApproval = false) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      let fileData = {};
      if (reportFile) {
        const uploaded = await api.uploadDocumentFile(reportFile);
        fileData = {
          fileUrl: uploaded.url,
          fileName: uploaded.name,
          fileType: uploaded.fileType,
          fileSize: uploaded.size,
        };
      }
      const payload = { ...reportForm, ...fileData, submit: submitForApproval };
      if (reportForm.id) {
        await api.updateReport(reportForm.id, payload);
        if (submitForApproval) await api.submitReport(reportForm.id);
        showToast(submitForApproval ? 'Report submitted for approval' : 'Report updated');
      } else {
        await api.createReport(payload);
        showToast(submitForApproval ? 'Report submitted for approval' : 'Report saved as draft');
      }
      closeModal();
      loadPageData();
      onReportsChange?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitReport = async (reportId) => {
    setSubmitting(true);
    try {
      await api.submitReport(reportId);
      showToast('Report submitted for approval');
      closeModal();
      loadPageData();
      onReportsChange?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleApproveReport = async (report) => {
    setSubmitting(true);
    try {
      await api.approveReport(report.id, {});
      showToast('Report approved');
      closeModal();
      loadPageData();
      onReportsChange?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRejectReport = async (e) => {
    e.preventDefault();
    if (!rejectForm.reason.trim()) {
      showToast('Please provide a reason', 'error');
      return;
    }
    setSubmitting(true);
    try {
      await api.rejectReport(rejectForm.reportId, {
        reason: rejectForm.reason,
        requestRevision: rejectForm.requestRevision,
      });
      showToast('Report returned to author');
      setRejectForm({ reportId: null, reason: '', requestRevision: true });
      setModal(null);
      closeModal();
      loadPageData();
      onReportsChange?.();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const openCreateReport = (type) => {
    setReportForm({ ...EMPTY_REPORT, type, reportDate: new Date().toISOString().slice(0, 10) });
    setReportFile(null);
    setModal('report');
  };

  const handleSaveConfigOrg = async (payload) => {
    setSubmitting(true);
    try {
      await api.updateConfig(payload);
      showToast('Configuration saved');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateConfigUnit = async (body) => {
    setSubmitting(true);
    try {
      await api.createConfigUnit(body);
      showToast('Unit added');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfigUnit = async (id) => {
    const ok = await confirmToast('Remove this organizational unit?', { description: 'This cannot be undone.' });
    if (!ok) return;
    try {
      await api.deleteConfigUnit(id);
      showToast('Unit removed');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateConfigIndicator = async (body) => {
    setSubmitting(true);
    try {
      await api.createConfigIndicator(body);
      showToast('Indicator added');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfigIndicator = async (id) => {
    const ok = await confirmToast('Remove this indicator?', { description: 'It will no longer appear in M&E tracking.' });
    if (!ok) return;
    try {
      await api.deleteConfigIndicator(id);
      showToast('Indicator removed');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreateConfigScope = async (body) => {
    setSubmitting(true);
    try {
      await api.createConfigScope(body);
      showToast('Staff scope mapping saved');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteConfigScope = async (id) => {
    const ok = await confirmToast('Remove this scope mapping?', { description: 'Staff member will lose this field assignment.' });
    if (!ok) return;
    try {
      await api.deleteConfigScope(id);
      showToast('Mapping removed');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleSaveReportWorkflow = async (body) => {
    setSubmitting(true);
    try {
      await api.saveReportWorkflow(body);
      showToast('Report workflow updated');
      await loadPageData();
      return true;
    } catch (err) {
      showToast(err.message, 'error');
      return false;
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreatePlanningOutcome = async (body) => {
    setSubmitting(true);
    try {
      await api.createPlanningOutcome(body);
      showToast('Outcome added');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlanningOutcome = async (id, body) => {
    setSubmitting(true);
    try {
      await api.updatePlanningOutcome(id, body);
      showToast('Outcome updated');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlanningOutcome = async (id) => {
    const ok = await confirmToast('Remove this outcome?', { description: 'Linked outputs may be affected.' });
    if (!ok) return;
    try {
      await api.deletePlanningOutcome(id);
      showToast('Outcome removed');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreatePlanningOutput = async (body) => {
    setSubmitting(true);
    try {
      await api.createPlanningOutput(body);
      showToast('Output added');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlanningOutput = async (id, body) => {
    setSubmitting(true);
    try {
      await api.updatePlanningOutput(id, body);
      showToast('Output updated');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlanningOutput = async (id) => {
    const ok = await confirmToast('Remove this output?', { description: 'Linked activities will be unlinked.' });
    if (!ok) return;
    try {
      await api.deletePlanningOutput(id);
      showToast('Output removed');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleCreatePlanningActivity = async (body) => {
    setSubmitting(true);
    try {
      await api.createPlanningActivity(body);
      showToast('Activity scheduled');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdatePlanningActivity = async (id, body) => {
    setSubmitting(true);
    try {
      await api.updatePlanningActivity(id, body);
      showToast('Activity updated');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePlanningActivity = async (id) => {
    const ok = await confirmToast('Remove this activity?', { description: 'This cannot be undone.' });
    if (!ok) return;
    try {
      await api.deletePlanningActivity(id);
      showToast('Activity removed');
      loadPageData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openPlanningProject = (proj) => {
    onNavigate?.('projects');
    setTimeout(() => openProjectDetail(proj), 0);
  };

  const handleReportFileSelect = (file) => {
    if (!file) return;
    setReportFile(file);
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
      await api.updateUser({ id: editUser.id, name: editUser.name, role: editUser.role, staffRole: editUser.staffRole, isActive: editUser.isActive });
      showToast('User updated');
      closeModal();
      loadPageData();
      if (projectView === 'detail' && selectedProject?.id && activeTab === 'tasks') {
        loadProjectTasks(selectedProject.id);
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteDocument = async (docId) => {
    const ok = await confirmToast('Delete this document permanently?', {
      description: 'This file will be removed from the library.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api.deleteDocument(docId);
      showToast('Document deleted');
      closeModal();
      loadPageData(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const handleDeleteReport = async (reportId) => {
    const ok = await confirmToast('Delete this report permanently?', {
      description: 'This report and its attachments will be removed.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api.deleteReport(reportId);
      showToast('Report deleted');
      closeModal();
      loadPageData(false);
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openReportDetail = async (report) => {
    try {
      const full = await api.report(report.id);
      setViewReport(full);
    } catch {
      setViewReport(report);
    }
    setModal('reportView');
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
    if (report.fileUrl && report.fileUrl !== '#') {
      const a = document.createElement('a');
      a.href = report.fileUrl;
      a.download = report.fileName || report.name;
      a.click();
      showToast('Report downloaded');
      return;
    }
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
    if (doc.url && doc.url !== '#') {
      const a = document.createElement('a');
      a.href = doc.url;
      a.download = doc.name;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      a.click();
      showToast('Download started');
      return;
    }
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

  const firstName = user?.name?.split(' ')[0] || 'there';

  if (loading && !dashboard && !projects.length && !budget && !beneficiaries) {
    return <Loading />;
  }

  return (
    <div className="content" onClick={() => setMenuOpen(null)}>
      {refreshing && <div className="refresh-bar" aria-hidden="true" />}

      {/* ── DASHBOARD ── */}
      {currentPage === 'dashboard' && dashboard && (
        <>
          {dashboard.portal && (
            <section className="portal-welcome-card">
              <div className="page-header page-header-row portal-welcome-inner">
                <div>
                  <p className="portal-greeting">Welcome! <strong>{firstName}</strong>,</p>
                  <p className="portal-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                  <h1>{dashboard.portal.title}</h1>
                  <p className="portal-welcome-sub">{dashboard.portal.subtitle}</p>
                  {dashboard.portal.tagline && <p className="portal-welcome-tagline">{dashboard.portal.tagline}</p>}
                </div>
                {isManager && (
                  <button type="button" className="btn-primary" onClick={() => openProjectModal()}>
                    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                    New Project
                  </button>
                )}
              </div>
            </section>
          )}

          <div className="page-header">
            <h1>Impact Overview</h1>
            <p>Key metrics and activity across your programs and projects.</p>
          </div>
          <div className="kpi-grid">
            <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('projects')}>
              <div className="kpi-top"><div><div className="kpi-label">Active Projects</div><div className="kpi-value">{dashboard.kpis.activeProjects}</div></div>
                <div className="kpi-icon blue"><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path d="M3 7a2 2 0 012-2h14a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg></div></div>
              <div className="kpi-delta">{dashboard.kpis.activeProjectsDelta}</div>
            </div>
            <div className="kpi-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate?.('projects')}>
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
            <div className="card chart-card">
              <div className="card-header">
                <div>
                  <span className="card-title">Task Status Overview</span>
                  <p className="chart-subtitle">Current breakdown of tasks by status across all projects</p>
                </div>
                {dashboard.chart.overdueTasks > 0 && (
                  <span className="chart-overdue-badge">{dashboard.chart.overdueTasks} overdue tasks</span>
                )}
              </div>
              <div className="chart-area chart-area-tall"><canvas ref={chartRef} height="180"></canvas></div>
              <div className="chart-stats-row">
                <div className="chart-stat-pill">
                  <span className="chart-stat-val">{dashboard.chart.summary?.todo ?? 0}</span>
                  <span className="chart-stat-label">To Do</span>
                </div>
                <div className="chart-stat-pill">
                  <span className="chart-stat-val">{dashboard.chart.summary?.inProgress ?? 0}</span>
                  <span className="chart-stat-label">In Progress</span>
                </div>
                <div className="chart-stat-pill">
                  <span className="chart-stat-val">{dashboard.chart.summary?.completed ?? 0}</span>
                  <span className="chart-stat-label">Completed</span>
                </div>
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
                    <div className="status-dot" style={{ background: i === 0 ? '#1E75E5' : i === 1 ? '#f59e0b' : '#ef4444' }}></div>
                    {s.status} — {s.count} ({s.pct}%)
                  </div>
                ))}
              </div></div>
            </div>
            <div className="card">
              <div className="card-header">
                <span className="card-title">Upcoming Tasks</span>
                <span className="card-action" onClick={() => onNavigate?.('projects')}>View All</span>
              </div>
              {dashboard.upcomingTasks.map((task, i) => (
                <div key={i} className="task-item">
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
      {currentPage === 'projects' && projectView === 'list' && (
        <>
          <div className="page-header page-header-row">
            <div>
              <h1>Projects</h1>
              <p>Manage and track all your projects.</p>
            </div>
            {isManager && (
              <button className="btn-primary" onClick={() => openProjectModal()}><svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="14" height="14"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg> New Project</button>
            )}
          </div>
          <div className="filter-row">
            <select className="filter-select" value={projectFilter} onChange={(e) => setProjectFilter(e.target.value)}>
              <option value="all">All Status</option><option value="on-track">On Track</option><option value="at-risk">At Risk</option><option value="delayed">Delayed</option>
            </select>
            <input className="search-inline" type="text" placeholder="Search projects..." value={projectSearch} onChange={(e) => { setProjectSearch(e.target.value); onTopbarSearchSync?.(e.target.value); }} />
          </div>
          {loading ? <Loading /> : (
            <div className="projects-table">
              <div className="table-head"><span>Project</span><span>Status</span><span>Progress</span><span>Budget</span><span>Start Date</span><span></span></div>
              {projects.map((proj) => (
                <div
                  key={proj.id}
                  className={`table-row${proj.hasAccess === false ? ' table-row-restricted' : ''}`}
                  onClick={() => openProjectDetail(proj)}
                >
                  <div className="proj-name-cell">
                    <ProjectIcon variant={proj.icon} />
                    <span className="proj-name">{proj.name}</span>
                    {proj.hasAccess === false && <span className="proj-restricted-badge">View only</span>}
                  </div>
                  <span><span className={`status-badge ${proj.status}`}><span className="status-dot"></span>{statusLabel(proj.status)}</span></span>
                  <span><div className="prog-wrap"><div className="prog-bar"><div className={`prog-fill${proj.status === 'at-risk' ? ' amber' : proj.status === 'delayed' ? ' red' : ''}`} style={{ width: `${proj.progress}%` }}></div></div><span className="prog-pct">{proj.progress}%</span></div></span>
                  <span className="tbl-budget">{proj.budget}</span>
                  <span className="tbl-date">{proj.date}</span>
                  <span style={{ position: 'relative' }}>
                    <button className="more-btn" onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === proj.id ? null : proj.id); }}>⋯</button>
                    {menuOpen === proj.id && (
                      <div className="dropdown-menu" onClick={(e) => e.stopPropagation()}>
                        <button onClick={() => { openProjectDetail(proj); setMenuOpen(null); }} disabled={proj.hasAccess === false}>View</button>
                        {isManager && <button onClick={() => { openProjectModal(proj); setMenuOpen(null); }}>Edit</button>}
                        <button onClick={async () => {
                          const pinned = pinnedProjects.some((p) => p.projectId === proj.id);
                          if (pinned) await api.unpinProject(proj.id); else await api.pinProject(proj.id);
                          onPinsChange?.();
                          setMenuOpen(null);
                          showToast(pinned ? 'Unpinned' : 'Pinned to sidebar');
                        }}>{pinnedProjects.some((p) => p.projectId === proj.id) ? 'Unpin' : 'Pin to Sidebar'}</button>
                        {isManager && <button className="danger" onClick={() => handleDeleteProject(proj.id)}>Delete</button>}
                      </div>
                    )}
                  </span>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {currentPage === 'projects' && projectView === 'detail' && selectedProject && projectDetail && selectedTask && (
        <TaskDetailView
          task={selectedTask}
          project={{
            id: selectedProject.id,
            name: projectDetail.name,
            status: selectedProject.status,
            progress: selectedProject.progress,
            startDate: projectDetail.startDate,
          }}
          currentUser={user}
          onBack={() => setSelectedTask(null)}
          onNotify={() => {}}
        />
      )}

      {currentPage === 'projects' && projectView === 'detail' && selectedProject && projectDetail && !selectedTask && (
        <div className="project-detail-page">
          <button type="button" className="project-detail-back" onClick={closeProjectDetail}>
            ← Back to Projects
          </button>
          <div className="project-detail-header">
            <div>
              <h1>{projectDetail.name}</h1>
              <p>{projectDetail.description}</p>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexShrink: 0 }}>
              <button className={`btn-secondary pin-btn${isPinned ? ' pinned' : ''}`} onClick={handleTogglePin}>
                {isPinned ? '★ Pinned' : '☆ Pin Project'}
              </button>
              {isManager && <button className="btn-secondary" onClick={() => openProjectModal(selectedProject)}>Edit Project</button>}
              {activeTab === 'tasks' && (
                <button className="btn-primary" onClick={() => openTaskModal({ projectId: selectedProject.id, project: selectedProject.name })}>
                  + New Task
                </button>
              )}
            </div>
          </div>
          <div className="project-detail-tabs">
            {['overview', 'tasks', 'budget', 'documents'].map((tab) => (
              <button
                key={tab}
                type="button"
                className={`project-detail-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'overview' && (
            <>
              <div className="project-detail-overview">
                <div className="project-detail-stat"><label>Status</label><span><span className={`status-badge ${selectedProject.status}`}><span className="status-dot"></span>{statusLabel(selectedProject.status)}</span></span></div>
                <div className="project-detail-stat"><label>Manager</label><span>{projectDetail.manager}</span></div>
                <div className="project-detail-stat"><label>Project Lead</label><span>{projectDetail.lead || projectDetail.manager}</span></div>
                <div className="project-detail-stat"><label>Donor</label><span>{projectDetail.donorName || '—'}</span></div>
                <div className="project-detail-stat"><label>Progress</label><span>{selectedProject.progress}%</span></div>
                <div className="project-detail-stat"><label>Budget</label><span>{projectDetail.spent} / {selectedProject.budget}</span></div>
                <div className="project-detail-stat"><label>Income</label><span>{projectDetail.income || '—'}</span></div>
                <div className="project-detail-stat"><label>Utilization</label><span>{projectDetail.utilization}</span></div>
                <div className="project-detail-stat"><label>Due Date</label><span>{projectDetail.dueDate}</span></div>
                <div className="project-detail-stat"><label>Location</label><span>{[projectDetail.town, projectDetail.woreda, projectDetail.region].filter(Boolean).join(', ') || '—'}</span></div>
                <div className="project-detail-stat"><label>Site Type</label><span>{projectDetail.locationType?.replace('_', ' ') || '—'}</span></div>
              </div>
              {(projectDetail.assumptions || projectDetail.risks || projectDetail.indicators || projectDetail.outcomes) && (
                <div className="project-planning-grid">
                  {projectDetail.assumptions && <div className="planning-card"><h4>Assumptions</h4><p>{projectDetail.assumptions}</p></div>}
                  {projectDetail.risks && <div className="planning-card"><h4>Risks</h4><p>{projectDetail.risks}</p></div>}
                  {projectDetail.indicators && <div className="planning-card"><h4>Indicators</h4><p>{projectDetail.indicators}</p></div>}
                  {projectDetail.outcomes && <div className="planning-card"><h4>Outcomes</h4><p>{projectDetail.outcomes}</p></div>}
                  {projectDetail.mitigationStrategies && <div className="planning-card full"><h4>Mitigation Strategies</h4><p>{projectDetail.mitigationStrategies}</p></div>}
                </div>
              )}
              {projectDetail.members?.length > 0 && (
                <div className="project-team-section">
                  <div className="project-detail-section-title">Team Members</div>
                  <div className="team-chips">
                    {projectDetail.members.map((m) => (
                      <span key={m.id} className="team-chip">{m.name} <small>({m.staffRole || m.role})</small></span>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === 'tasks' && (
            <>
              <p style={{ fontSize: '12px', color: 'var(--gray-500)', marginBottom: '16px' }}>
                Drag cards between columns to update task status for this project.
              </p>
              <KanbanBoard
                tasks={projectTasks}
                draggedTask={draggedTask}
                dropTarget={dropTarget}
                showProject={false}
                onDragStart={setDraggedTask}
                onDragOver={(e, key) => { e.preventDefault(); setDropTarget(key); }}
                onDragLeave={() => setDropTarget(null)}
                onDrop={(e, key) => { e.preventDefault(); handleTaskDrop(key); }}
                onTaskClick={(task) => {
                  const full = projectDetail?.tasks?.find((t) => t.id === task.id);
                  setSelectedTask(full || { ...task, title: task.title });
                }}
              />
            </>
          )}

          {activeTab === 'budget' && (
            <div>
              <div className="project-detail-section-title">Budget Breakdown</div>
              {projectDetail.budgetCategories.map((b, i) => (
                <div key={i} style={{ padding: '12px 0', fontSize: '13px', borderBottom: '1px solid var(--gray-100)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span>{b.category}</span>
                    <span style={{ color: 'var(--gray-500)' }}>{b.spent} / {b.allocated}</span>
                  </div>
                  <div className="bar-track"><div className="bar-fill" style={{ width: `${b.pct}%` }}></div></div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'documents' && (
            <div>
              <div className="project-detail-section-title">Project Documents</div>
              {projectDetail.documents?.length ? projectDetail.documents.map((d, i) => (
                <div key={i} style={{ fontSize: '13px', padding: '10px 0', borderBottom: '1px solid var(--gray-100)' }}>{d.name}</div>
              )) : (
                <p style={{ fontSize: '13px', color: 'var(--gray-400)' }}>No documents yet</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── CALENDAR ── */}
      {currentPage === 'calendar' && calendar && (
        <>
          <div className="page-header page-header-row">
            <div>
              <h1>Calendar</h1>
              <p>Plan events, deadlines, and project milestones.</p>
            </div>
            <button className="btn-primary" onClick={async () => { await loadLookup(); setEventForm({ ...EMPTY_EVENT, date: new Date().toISOString().slice(0, 10) }); setModal('event'); }}>+ Add Event</button>
          </div>
          <div className="cal-grid">
            <div className="cal-main">
              <div className="cal-header">
                <div className="cal-month-block">
                  <span className="cal-month-label">{calendar.monthLabel}</span>
                  <span className="cal-year-label">{calYear}</span>
                </div>
                <div className="cal-nav">
                  <button type="button" className="cal-nav-btn" aria-label="Previous month" onClick={() => { const m = calMonth === 1 ? 12 : calMonth - 1; setCalYear(calMonth === 1 ? calYear - 1 : calYear); setCalMonth(m); }}>‹</button>
                  <button type="button" className="cal-nav-btn cal-nav-today" onClick={() => { const now = new Date(); setCalYear(now.getFullYear()); setCalMonth(now.getMonth() + 1); }}>Today</button>
                  <button type="button" className="cal-nav-btn" aria-label="Next month" onClick={() => { const m = calMonth === 12 ? 1 : calMonth + 1; setCalYear(calMonth === 12 ? calYear + 1 : calYear); setCalMonth(m); }}>›</button>
                </div>
              </div>
              <div className="cal-days-head"><span>Sun</span><span>Mon</span><span>Tue</span><span>Wed</span><span>Thu</span><span>Fri</span><span>Sat</span></div>
              <div className="cal-days">
                {calendar.days.map((day, i) => {
                  const dateStr = `${calYear}-${String(calMonth).padStart(2, '0')}-${String(day.num).padStart(2, '0')}`;
                  const todayStr = new Date().toISOString().slice(0, 10);
                  const isPast = !day.otherMonth && dateStr < todayStr;
                  return (
                  <div
                    key={i}
                    className={`cal-day${day.today ? ' today' : ''}${day.otherMonth ? ' other-month' : ''}${day.events?.length ? ' has-events' : ''}${isPast ? ' past-day' : ''}`}
                    onClick={() => {
                      if (day.otherMonth || isPast) return;
                      setEventForm({ ...EMPTY_EVENT, date: dateStr });
                      setModal('event');
                    }}
                  >
                    <div className="cal-day-num">{day.num}</div>
                    <div className="cal-day-events">
                      {day.events?.map((evt, j) => (<div key={j} className={`cal-event ${evt.c}`}>{evt.t}</div>))}
                    </div>
                  </div>
                  );
                })}
              </div>
            </div>
            <aside className="upcoming-events cal-sidebar">
              <h3 className="cal-sidebar-title">Upcoming Events</h3>
              <p className="cal-sidebar-sub">Next on your schedule</p>
              {calendar.upcoming.length ? calendar.upcoming.map((evt, i) => (
                <div key={i} className="event-item">
                  <div className="event-dot" style={{ background: `var(--${evt.color})` }} />
                  <div className="event-body">
                    <div className="ev-title">{evt.title}</div>
                    <div className="ev-date">{evt.date}</div>
                  </div>
                </div>
              )) : (
                <p className="cal-empty-note">No upcoming events this month.</p>
              )}

              {calendar.overdue?.length > 0 && (
                <>
                  <h3 className="cal-sidebar-title cal-overdue-title">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                      <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                    </svg>
                    Overdue ({calendar.overdue.length})
                  </h3>
                  <p className="cal-sidebar-sub cal-overdue-sub">Deadlines that have passed</p>
                  {calendar.overdue.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="event-item event-item-overdue">
                      <div className="event-dot event-dot-warning" />
                      <div className="event-body">
                        <div className="ev-title">{item.title}</div>
                        <div className="ev-date">{item.date}{item.project ? ` · ${item.project}` : ''}</div>
                        <div className="ev-overdue-tag">{item.daysOverdue} day{item.daysOverdue !== 1 ? 's' : ''} overdue · {item.type === 'task' ? 'Task' : 'Event'}</div>
                      </div>
                    </div>
                  ))}
                </>
              )}
            </aside>
          </div>
        </>
      )}

      {/* ── BUDGET ── */}
      {currentPage === 'budget' && budget && (
        <>
          <div className="page-header page-header-row">
            <div>
              <h1>Budget</h1>
              <p>Track spending and utilization across active projects.</p>
            </div>
            {(isManager || user?.staffRole === 'finance_team') && (
              <button className="btn-primary" onClick={async () => { const data = await loadLookup(); setExpenseForm({ ...EMPTY_EXPENSE, projectId: data.projects[0]?.id || '' }); setModal('expense'); }}>+ Add Expense</button>
            )}
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
      {(currentPage === 'reports' || currentPage === 'reports-overview') && (
        <ReportsDashboard
          data={reportsDashboard}
          loading={loading && !reportsDashboard}
          isManager={isManager}
          onAddManualReport={() => openCreateReport('monthly')}
          onOpenReport={openReportDetail}
          onDeleteReport={handleDeleteReport}
        />
      )}

      {reportTypeFromPageId(currentPage) && (
        <ReportsManagement
          reportType={reportTypeFromPageId(currentPage)}
          reports={typedReports}
          loading={loading && !typedReports.length}
          isManager={isManager}
          onCreateReport={() => openCreateReport(reportTypeFromPageId(currentPage))}
          onOpenReport={openReportDetail}
          onDeleteReport={handleDeleteReport}
        />
      )}

      {currentPage === 'reports-approval' && (
        <ReportsApproval
          reports={typedReports}
          loading={loading && !typedReports.length}
          onOpenReport={openReportDetail}
          onApprove={handleApproveReport}
          onReject={(report) => {
            setRejectForm({ reportId: report.id, reason: '', requestRevision: true });
            setModal('reportReject');
          }}
        />
      )}

      {isConfigPage(currentPage) && (
        <ConfigurationHub
          configPage={currentPage}
          data={configData}
          loading={loading && !configData}
          canEdit={isManager}
          submitting={submitting}
          onRefresh={loadPageData}
          onSaveOrg={handleSaveConfigOrg}
          onCreateUnit={handleCreateConfigUnit}
          onDeleteUnit={handleDeleteConfigUnit}
          onCreateIndicator={handleCreateConfigIndicator}
          onDeleteIndicator={handleDeleteConfigIndicator}
          onCreateScope={handleCreateConfigScope}
          onDeleteScope={handleDeleteConfigScope}
          onSaveWorkflow={handleSaveReportWorkflow}
          showToast={showToast}
        />
      )}

      {isPlanningPage(currentPage) && (
        <PlanningModule
          planningPage={currentPage}
          data={planningData}
          loading={loading && !planningData}
          isManager={isManager}
          submitting={submitting}
          firstName={firstName}
          projects={projects}
          onNavigate={onNavigate}
          onOpenProject={openPlanningProject}
          onCreateProject={() => openProjectModal()}
          onRefresh={loadPageData}
          onCreateOutcome={handleCreatePlanningOutcome}
          onUpdateOutcome={handleUpdatePlanningOutcome}
          onDeleteOutcome={handleDeletePlanningOutcome}
          onCreateOutput={handleCreatePlanningOutput}
          onUpdateOutput={handleUpdatePlanningOutput}
          onDeleteOutput={handleDeletePlanningOutput}
          onCreateActivity={handleCreatePlanningActivity}
          onUpdateActivity={handleUpdatePlanningActivity}
          onDeleteActivity={handleDeletePlanningActivity}
        />
      )}

      {/* ── BENEFICIARIES ── */}
      {currentPage === 'beneficiaries' && beneficiaries && (
        <>
          <div className="page-header page-header-row">
            <div>
              <h1>Beneficiaries</h1>
              <p>Track program participants by region and status.</p>
            </div>
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
              {(beneficiaries.regions || []).map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
            <select className="filter-select" value={beneProgram} onChange={(e) => setBeneProgram(e.target.value)}>
              <option value="all">All Programs</option>
              {(beneficiaries.programs || []).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
            <select className="filter-select" value={beneStatus} onChange={(e) => setBeneStatus(e.target.value)}>
              <option value="all">All Statuses</option>
              {BENEFICIARY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
            <input className="search-inline" type="text" placeholder="Search by name..." value={beneSearch} onChange={(e) => { setBeneSearch(e.target.value); onTopbarSearchSync?.(e.target.value); }} />
          </div>
          <div className="bene-table">
            <div className="bene-table-head"><span>Name</span><span>Program</span><span>Region</span><span>Status</span><span>Enrolled</span></div>
            {beneficiaries.beneficiaries.map((bene) => (
              <div key={bene.id} className="bene-row"><span className="bene-name">{bene.name}</span><span className="bene-cell">{bene.program}</span><span className="bene-cell">{bene.region}</span><span><span className={`status-badge status-${bene.statusBadge}`}>{bene.statusLabel}</span></span><span className="bene-cell">{bene.date}</span></div>
            ))}
          </div>
        </>
      )}

      {/* ── DOCUMENTS ── */}
      {currentPage === 'documents' && (
        <DocumentsLibrary
          documents={documents}
          categories={DOC_CATEGORIES}
          activeCategory={docCategory}
          onCategoryChange={setDocCategory}
          searchQuery={docSearch}
          onSearchChange={setDocSearch}
          isManager={isManager}
          onView={(doc) => { setViewDocument(doc); setModal('documentView'); }}
          onDownload={downloadDocument}
          onDelete={handleDeleteDocument}
          onUpload={async () => {
            await loadLookup();
            setDocumentForm({ ...EMPTY_DOCUMENT, projectId: lookup.projects[0]?.id || '' });
            setModal('document');
          }}
        />
      )}

      {/* ── LOGISTICS ── */}
      {currentPage === 'logistics' && (
        <LogisticsPage
          data={logistics}
          loading={loading && !logistics}
          isManager={isManager}
          submitting={submitting}
          onRefresh={() => loadPageData(false)}
          onSave={async (form) => {
            setSubmitting(true);
            try {
              const body = { ...form };
              delete body.id;
              if (form.id) {
                await api.updateLogistics(form.id, body);
                showToast('Shipment updated');
              } else {
                await api.createLogistics(body);
                showToast('Shipment created');
              }
              loadPageData(false);
              return true;
            } catch (err) {
              showToast(err.message, 'error');
              return false;
            } finally {
              setSubmitting(false);
            }
          }}
          onDelete={async (id) => {
            try {
              await api.deleteLogistics(id);
              showToast('Shipment deleted');
              loadPageData(false);
            } catch (err) {
              showToast(err.message, 'error');
            }
          }}
        />
      )}

      {/* ── PARTNERS ── */}
      {currentPage === 'partners' && (
        <>
          <div className="page-header page-header-row">
            <div>
              <h1>Partners</h1>
              <p>Manage institutional and community partners.</p>
            </div>
            <button className="btn-primary" onClick={() => { setPartnerForm(EMPTY_PARTNER); setModal('partner'); }}>+ Add Partner</button>
          </div>
          <div className="partner-grid">
            {partners.map((partner) => (
              <div key={partner.id} className="partner-card">
                <div className="partner-card-name">{partner.name}</div>
                <div className="partner-card-type">{partner.type}</div>
                <div className="partner-card-desc">{partner.desc || partner.description}</div>
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
      {currentPage === 'messages' && (
        <MessagesInbox
          user={user}
          isManager={isManager}
          lookup={lookup}
          onNavigate={onNavigate}
          initialSelection={msgInitialSelection}
          onInitialSelectionHandled={() => setMsgInitialSelection(null)}
        />
      )}

      {/* ── AUDIT LOG ── */}
      {currentPage === 'audit-log' && (
        user?.role === 'admin' ? (
          <AuditLogPage
            logs={auditLogs}
            loading={loading && !auditLogs.length}
            onRefresh={loadPageData}
          />
        ) : (
          <div className="page-error-banner">
            <div className="page-error-copy">
              <strong>Access restricted</strong>
              <p>Audit logs are available to administrators only.</p>
            </div>
          </div>
        )
      )}

      {/* ── SETTINGS ── */}
      {currentPage === 'settings' && (
        <>
          <div className="page-header">
            <h1>User Management</h1>
            <p>Manage your profile, organization settings, and staff accounts.</p>
          </div>
          <ProfileSettings />
          <div className="settings-admin-wrap">
            {user?.role === 'admin' && organization && (
              <div className="settings-row">
                <div className="settings-card">
                  <div className="settings-card-title">Organization Info</div>
                  <p className="profile-settings-hint">Only administrators can edit organization details.</p>
                  {['name', 'country', 'email', 'phone', 'location'].map((field) => (
                    <div key={field} className="form-field">
                      <label>{field.charAt(0).toUpperCase() + field.slice(1)}</label>
                      <input value={orgForm[field] || ''} onChange={(e) => setOrgForm({ ...orgForm, [field]: e.target.value })} />
                    </div>
                  ))}
                  <div className="form-field"><label>Description</label><textarea value={orgForm.description || ''} onChange={(e) => setOrgForm({ ...orgForm, description: e.target.value })} /></div>
                  <button className="btn-primary" onClick={handleSaveOrg} disabled={submitting}>{submitting ? 'Saving...' : 'Save Changes'}</button>
                </div>
                <div className="settings-card">
                  <div className="settings-card-title">Date &amp; Time Configuration</div>
                  <div className="form-field">
                    <label>Date Format</label>
                    <select value={orgForm.dateFormat} onChange={(e) => setOrgForm({ ...orgForm, dateFormat: e.target.value })}>
                      <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                      <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                      <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Timezone</label>
                    <select value={orgForm.timezone} onChange={(e) => setOrgForm({ ...orgForm, timezone: e.target.value })}>
                      <option value="Africa/Addis_Ababa">Africa/Addis Ababa (EAT)</option>
                      <option value="Africa/Nairobi">Africa/Nairobi (EAT)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                  <div className="form-field">
                    <label>Fiscal Year Start</label>
                    <select value={orgForm.fiscalYearStart} onChange={(e) => setOrgForm({ ...orgForm, fiscalYearStart: e.target.value })}>
                      {['January', 'April', 'July', 'October'].map((m) => <option key={m} value={m}>{m}</option>)}
                    </select>
                  </div>
                  <button className="btn-primary" onClick={handleSaveOrg} disabled={submitting}>{submitting ? 'Saving...' : 'Save Date Settings'}</button>
                </div>
              </div>
            )}
            {canManageUsers(user) && (
              <div className="settings-row">
                <div className="settings-card">
                  <div className="settings-card-title">Add Staff Member</div>
                  <form onSubmit={handleAddStaff}>
                    <div className="form-row">
                      <div className="form-field"><label>Name *</label><input required value={newStaffForm.name} onChange={(e) => setNewStaffForm({ ...newStaffForm, name: e.target.value })} /></div>
                      <div className="form-field"><label>Email *</label><input required type="email" value={newStaffForm.email} onChange={(e) => setNewStaffForm({ ...newStaffForm, email: e.target.value })} /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-field"><label>Password *</label><input required type="password" value={newStaffForm.password} onChange={(e) => setNewStaffForm({ ...newStaffForm, password: e.target.value })} /></div>
                      <div className="form-field">
                        <label>Staff Role *</label>
                        <select value={newStaffForm.staffRole} onChange={(e) => setNewStaffForm({ ...newStaffForm, staffRole: e.target.value })}>
                          {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                        </select>
                      </div>
                    </div>
                    <button className="btn-primary" type="submit" disabled={submitting}>{submitting ? 'Adding...' : 'Add Staff'}</button>
                  </form>
                </div>
                <div className="settings-card">
                  <div className="settings-card-title">Manage Users &amp; Roles</div>
                  <div className="settings-users-table">
                    <div className="settings-users-head"><span>NAME</span><span>ROLE</span><span>STATUS</span></div>
                    {users.map((u) => (
                      <div key={u.id} className="settings-users-row" onClick={() => { setEditUser({ ...u }); setModal('user'); }}>
                        <span>{u.name}</span><span className="settings-role">{u.roleLabel}</span><span className={u.isActive ? 'settings-active' : 'settings-inactive'}>{u.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ── MODALS ── */}
      <ProjectFormModal
        open={modal === 'project'}
        form={projectForm}
        setForm={setProjectForm}
        users={lookup.users}
        onSubmit={handleSaveProject}
        onClose={closeModal}
        submitting={submitting}
        isManager={isManager}
      />

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
            {taskForm.id && (
              <button
                type="button"
                className="btn-danger"
                onClick={async () => {
                  const ok = await confirmToast('Delete this task?', {
                    description: 'This task will be permanently removed.',
                    confirmLabel: 'Delete',
                  });
                  if (!ok) return;
                  await api.deleteTask(taskForm.id);
                  showToast('Task deleted');
                  closeModal();
                  loadPageData();
                }}
              >
                Delete
              </button>
            )}
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Save Task'}</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'event'} title="Add Event" onClose={closeModal}>
        <form onSubmit={handleSaveEvent}>
          <div className="form-field"><label>Title *</label><input required value={eventForm.title} onChange={(e) => setEventForm({ ...eventForm, title: e.target.value })} /></div>
          <div className="form-row">
            <div className="form-field"><label>Date *</label><input type="date" required min={new Date().toISOString().slice(0, 10)} value={eventForm.date} onChange={(e) => setEventForm({ ...eventForm, date: e.target.value })} /></div>
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
            <div className="form-field"><label>Status</label><select value={beneficiaryForm.status} onChange={(e) => setBeneficiaryForm({ ...beneficiaryForm, status: e.target.value })}>{BENEFICIARY_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}</select></div>
          </div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting}>Add Beneficiary</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'document'} title="Upload Document" onClose={closeModal}>
        <form onSubmit={handleSaveDocument}>
          <input
            ref={fileInputRef}
            type="file"
            className="file-input-hidden"
            accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.png,.jpg,.jpeg"
            onChange={(e) => handleDocumentFileSelect(e.target.files?.[0])}
          />
          <div
            className={`file-drop-zone${documentFile ? ' has-file' : ''}`}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); e.currentTarget.classList.add('drag-over'); }}
            onDragLeave={(e) => e.currentTarget.classList.remove('drag-over')}
            onDrop={(e) => {
              e.preventDefault();
              e.currentTarget.classList.remove('drag-over');
              handleDocumentFileSelect(e.dataTransfer.files?.[0]);
            }}
          >
            <div className="file-drop-icon">📁</div>
            {documentFile ? (
              <>
                <div className="file-drop-title">{documentFile.name}</div>
                <div className="file-drop-hint">{documentForm.size || ''} · Click to choose a different file</div>
              </>
            ) : (
              <>
                <div className="file-drop-title">Choose a file from your computer</div>
                <div className="file-drop-hint">Click to browse or drag and drop · PDF, Word, Excel, CSV, ZIP, images · Max 10 MB</div>
              </>
            )}
          </div>
          <div className="form-row">
            <div className="form-field"><label>Category</label><select value={documentForm.category} onChange={(e) => setDocumentForm({ ...documentForm, category: e.target.value })}>{DOC_CATEGORIES.filter((c) => c !== 'all').map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div className="form-field"><label>Project</label><select value={documentForm.projectId} onChange={(e) => setDocumentForm({ ...documentForm, projectId: e.target.value })}><option value="">All Projects</option>{lookup.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          </div>
          <div className="form-actions"><button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button><button type="submit" className="btn-primary" disabled={submitting || !documentFile}>{submitting ? 'Uploading…' : 'Upload'}</button></div>
        </form>
      </Modal>

      <Modal open={modal === 'documentView'} title={viewDocument?.name || 'Document'} onClose={closeModal} width={560}>
        {viewDocument && (<>
          <p className="detail-meta"><strong>Project:</strong> {viewDocument.project || 'All Projects'}</p>
          <p className="detail-meta"><strong>Category:</strong> {viewDocument.category}</p>
          <p className="detail-meta"><strong>Type:</strong> {viewDocument.fileType}</p>
          <p className="detail-meta"><strong>Uploaded:</strong> {viewDocument.uploaded}</p>
          <div className="form-actions">
            <button className="btn-primary" type="button" onClick={() => downloadDocument(viewDocument)}>Download</button>
            {isManager && <button className="btn-danger" type="button" onClick={() => handleDeleteDocument(viewDocument.id)}>Delete</button>}
          </div>
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

      <Modal open={modal === 'report'} title={reportForm.id ? 'Edit Report' : `New ${getReportTypeMeta(reportForm.type).shortLabel} Report`} onClose={closeModal} width={760}>
        <form onSubmit={(e) => handleSaveReport(e, false)}>
          <div className="form-row">
            <div className="form-field">
              <label>Report Title *</label>
              <input required value={reportForm.name} onChange={(e) => setReportForm({ ...reportForm, name: e.target.value })} />
            </div>
            <div className="form-field">
              <label>Report Type</label>
              <select value={reportForm.type} onChange={(e) => setReportForm({ ...reportForm, type: e.target.value })}>
                {['daily', 'weekly', 'monthly', 'quarterly', 'biannual', 'annual', 'incident'].map((t) => (
                  <option key={t} value={t}>{getReportTypeMeta(t).label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field">
              <label>Project (optional)</label>
              <select value={reportForm.projectId} onChange={(e) => setReportForm({ ...reportForm, projectId: e.target.value })}>
                <option value="">Organization-wide</option>
                {lookup.projects.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Report Date</label>
              <input type="date" value={reportForm.reportDate} onChange={(e) => setReportForm({ ...reportForm, reportDate: e.target.value })} />
            </div>
          </div>
          {reportForm.type !== 'incident' && (
            <div className="form-row">
              <div className="form-field">
                <label>Period Start</label>
                <input type="date" value={reportForm.periodStart} onChange={(e) => setReportForm({ ...reportForm, periodStart: e.target.value })} />
              </div>
              <div className="form-field">
                <label>Period End</label>
                <input type="date" value={reportForm.periodEnd} onChange={(e) => setReportForm({ ...reportForm, periodEnd: e.target.value })} />
              </div>
            </div>
          )}
          {reportForm.type === 'incident' && (
            <div className="form-row">
              <div className="form-field">
                <label>Severity</label>
                <select value={reportForm.incidentSeverity} onChange={(e) => setReportForm({ ...reportForm, incidentSeverity: e.target.value })}>
                  <option value="">Select severity…</option>
                  {INCIDENT_SEVERITIES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Location</label>
                <input value={reportForm.incidentLocation} onChange={(e) => setReportForm({ ...reportForm, incidentLocation: e.target.value })} placeholder="Site, region, or facility" />
              </div>
            </div>
          )}
          <div className="form-field">
            <label>Executive Summary</label>
            <textarea rows={3} value={reportForm.description} onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })} placeholder="Brief overview for reviewers and leadership…" />
          </div>
          <div className="form-field">
            <label>{reportForm.type === 'incident' ? 'Incident Details & Response' : 'Activities, Outcomes & Narrative'}</label>
            <textarea rows={6} value={reportForm.content} onChange={(e) => setReportForm({ ...reportForm, content: e.target.value })} placeholder="Document activities, challenges, outcomes, lessons learned, and next steps…" />
          </div>
          {reportForm.type === 'incident' && (
            <div className="form-field">
              <label>Actions Taken</label>
              <textarea rows={3} value={reportForm.actionsTaken} onChange={(e) => setReportForm({ ...reportForm, actionsTaken: e.target.value })} placeholder="Immediate actions, referrals, follow-up plan…" />
            </div>
          )}
          <div className="form-field">
            <label>Attach File (optional)</label>
            <input ref={reportFileInputRef} type="file" className="file-input-hidden" accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.zip,.png,.jpg,.jpeg" onChange={(e) => handleReportFileSelect(e.target.files?.[0])} />
            <div className={`file-drop-zone${reportFile ? ' has-file' : ''}`} onClick={() => reportFileInputRef.current?.click()}>
              {reportFile ? (
                <div className="file-drop-selected">
                  <span className="file-drop-name">{reportFile.name}</span>
                  <button type="button" className="file-drop-remove" onClick={(e) => { e.stopPropagation(); setReportFile(null); if (reportFileInputRef.current) reportFileInputRef.current.value = ''; }}>Remove</button>
                </div>
              ) : (
                <p className="file-drop-hint">Click to attach supporting documents (PDF, DOCX, XLSX, images)</p>
              )}
            </div>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
            <button type="submit" className="btn-secondary" disabled={submitting}>Save Draft</button>
            <button type="button" className="btn-primary" disabled={submitting} onClick={(e) => handleSaveReport(e, true)}>Submit for Approval</button>
          </div>
        </form>
      </Modal>

      <Modal open={modal === 'reportView'} title={viewReport?.name || 'Report'} onClose={closeModal} width={760}>
        {viewReport && (<>
          <div className="ngo-report-view-meta">
            <span className={`ngo-report-status status-${viewReport.status}`}>{viewReport.statusLabel || viewReport.status}</span>
            <span>{viewReport.typeLabel || viewReport.type}</span>
            <span>{viewReport.date}</span>
            {viewReport.project?.name && <span>Project: {viewReport.project.name}</span>}
          </div>
          {viewReport.periodLabel && <p className="detail-meta">Reporting period: {viewReport.periodLabel}</p>}
          {viewReport.submittedBy && <p className="detail-meta">Submitted by: {viewReport.submittedBy.name}</p>}
          {viewReport.incidentSeverity && <p className="detail-meta">Severity: {viewReport.incidentSeverity} · Location: {viewReport.incidentLocation || '—'}</p>}
          <div className="report-detail-body">
            <h4 className="report-detail-heading">Executive Summary</h4>
            <div className="report-detail-content">{viewReport.description || 'No summary provided.'}</div>
          </div>
          {(viewReport.content || viewReport.actionsTaken) && (
            <div className="report-detail-body">
              <h4 className="report-detail-heading">{viewReport.type === 'incident' ? 'Incident Details' : 'Report Content'}</h4>
              <div className="report-detail-content">{viewReport.content || viewReport.actionsTaken}</div>
            </div>
          )}
          {viewReport.rejectionReason && (
            <div className="ngo-report-rejection-note">
              <strong>Reviewer feedback:</strong> {viewReport.rejectionReason}
            </div>
          )}
          {viewReport.fileName && (
            <p className="detail-meta report-attachment">
              <strong>Attachment:</strong> {viewReport.fileName} {viewReport.fileSize ? `(${viewReport.fileSize})` : ''}
            </p>
          )}
          <div className="report-actions">
            <button type="button" onClick={() => downloadReport(viewReport)}>Download{viewReport.fileUrl ? ' File' : ''}</button>
            <button type="button" onClick={() => shareReport(viewReport)}>Share</button>
            {['draft', 'revision_requested', 'rejected'].includes(viewReport.status) && (
              <button type="button" className="btn-primary" onClick={() => handleSubmitReport(viewReport.id)} disabled={submitting}>Submit for Approval</button>
            )}
            {isManager && ['submitted', 'pending_approval'].includes(viewReport.status) && (
              <>
                <button type="button" className="btn-primary" onClick={() => handleApproveReport(viewReport)} disabled={submitting}>Approve</button>
                <button type="button" className="btn-danger-outline" onClick={() => { setRejectForm({ reportId: viewReport.id, reason: '', requestRevision: true }); setModal('reportReject'); }} disabled={submitting}>Return for Revision</button>
              </>
            )}
            {isManager && <button type="button" className="danger-text" onClick={() => handleDeleteReport(viewReport.id)}>Delete</button>}
          </div>
        </>)}
      </Modal>

      <Modal open={modal === 'reportReject'} title="Return Report for Revision" onClose={() => { setModal('reportView'); }} width={520}>
        <form onSubmit={handleRejectReport}>
          <p className="profile-settings-hint">Provide clear feedback so the author can revise and resubmit.</p>
          <div className="form-field">
            <label>Reason *</label>
            <textarea required rows={4} value={rejectForm.reason} onChange={(e) => setRejectForm({ ...rejectForm, reason: e.target.value })} placeholder="Explain what needs to be corrected or added…" />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => setModal('reportView')}>Cancel</button>
            <button type="submit" className="btn-danger-outline" disabled={submitting}>Return to Author</button>
          </div>
        </form>
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
            <div className="form-field">
              <label>Role</label>
              <select value={editUser.role} onChange={(e) => setEditUser({ ...editUser, role: e.target.value })} disabled={!canManageUsers(user)}>
                <option value="admin">Administrator</option>
                <option value="project_manager">Project Manager</option>
                <option value="manager">Project Manager</option>
                <option value="staff">Staff</option>
                <option value="donor">Donor</option>
              </select>
            </div>
            {editUser.role === 'staff' && canManageUsers(user) && (
              <div className="form-field">
                <label>Staff Type</label>
                <select value={editUser.staffRole || 'program_staff'} onChange={(e) => setEditUser({ ...editUser, staffRole: e.target.value })}>
                  {STAFF_ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                </select>
              </div>
            )}
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
