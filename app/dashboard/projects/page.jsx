'use client';

import { useState } from 'react';

export default function ProjectsPage() {
  const [selectedProject, setSelectedProject] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const projects = [
    { id: 1, name: 'Community Health Project', status: 'on-track', progress: 72, dueDate: 'May 15, 2024', budget: '$12,000', icon: 'green' },
    { id: 2, name: 'Education for All', status: 'on-track', progress: 85, dueDate: 'Jun 20, 2024', budget: '$13,000', icon: 'blue' },
    { id: 3, name: 'Clean Water Initiative', status: 'at-risk', progress: 45, dueDate: 'Jul 10, 2024', budget: '$7,000', icon: 'amber' },
    { id: 4, name: 'Women Empowerment', status: 'delayed', progress: 38, dueDate: 'May 30, 2024', budget: '$7,000', icon: 'red' },
    { id: 5, name: 'Youth Skills Training', status: 'on-track', progress: 60, dueDate: 'Aug 5, 2024', budget: '$9,500', icon: 'green' },
  ];

  const filteredProjects = projects.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusLabels = {
    'on-track': 'On Track',
    'at-risk': 'At Risk',
    'delayed': 'Delayed',
  };

  return (
    <>
      <div className="page-header">
        <h1>Projects</h1>
        <p>Manage and track all your ongoing projects in one place.</p>
      </div>

      <div className="projects-topbar">
        <h1></h1>
        <button className="btn-primary">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
            <path d="M12 4v16m8-8H4" />
          </svg>
          New Project
        </button>
      </div>

      <div className="filter-row">
        <input
          type="text"
          placeholder="Search projects..."
          className="search-inline"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select
          className="filter-select"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All Status</option>
          <option value="on-track">On Track</option>
          <option value="at-risk">At Risk</option>
          <option value="delayed">Delayed</option>
        </select>
      </div>

      <div className="projects-table">
        <div className="table-head">
          <span>Project Name</span>
          <span>Status</span>
          <span>Progress</span>
          <span>Due Date</span>
          <span>Budget</span>
          <span></span>
        </div>
        {filteredProjects.map((project) => (
          <div key={project.id} className="table-row" onClick={() => setSelectedProject(project)}>
            <div className="proj-name-cell">
              <div className={`proj-icon ${project.icon}`}>
                <svg fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2H3V4zm0 5h14v9a1 1 0 01-1 1H4a1 1 0 01-1-1V9z" />
                </svg>
              </div>
              <div className="proj-name">{project.name}</div>
            </div>
            <div>
              <span className={`status-badge ${project.status}`}>
                <span>●</span>
                {statusLabels[project.status]}
              </span>
            </div>
            <div className="prog-wrap">
              <div className="prog-bar">
                <div className="prog-fill" style={{ width: `${project.progress}%` }} />
              </div>
              <div className="prog-pct">{project.progress}%</div>
            </div>
            <div className="tbl-date">{project.dueDate}</div>
            <div className="tbl-budget">{project.budget}</div>
            <button className="more-btn">⋮</button>
          </div>
        ))}
      </div>

      {selectedProject && (
        <div className="proj-detail open">
          <div className="proj-detail-header">
            <div>
              <button className="back-btn" onClick={() => setSelectedProject(null)}>
                ← Back
              </button>
              <div className="proj-detail-title">{selectedProject.name}</div>
            </div>
          </div>

          <div className="proj-tabs">
            <button className={`proj-tab ${activeTab === 'overview' ? 'active' : ''}`} onClick={() => setActiveTab('overview')}>
              Overview
            </button>
            <button className={`proj-tab ${activeTab === 'tasks' ? 'active' : ''}`} onClick={() => setActiveTab('tasks')}>
              Tasks
            </button>
            <button className={`proj-tab ${activeTab === 'budget' ? 'active' : ''}`} onClick={() => setActiveTab('budget')}>
              Budget
            </button>
            <button className={`proj-tab ${activeTab === 'documents' ? 'active' : ''}`} onClick={() => setActiveTab('documents')}>
              Documents
            </button>
          </div>

          {activeTab === 'overview' && (
            <div className="proj-overview">
              <div className="proj-summary">
                <h4>Project Details</h4>
                <p>{selectedProject.name} is a community-focused initiative aimed at improving living standards and creating sustainable development impact.</p>
                <div className="proj-meta-row">
                  <span className="proj-meta-label">Status:</span>
                  <span className="proj-meta-val">{statusLabels[selectedProject.status]}</span>
                </div>
                <div className="proj-meta-row">
                  <span className="proj-meta-label">Due Date:</span>
                  <span className="proj-meta-val">{selectedProject.dueDate}</span>
                </div>
                <div className="proj-meta-row">
                  <span className="proj-meta-label">Manager:</span>
                  <span className="proj-meta-val">Jane Smith</span>
                </div>
              </div>
              <div className="proj-summary">
                <h4>Progress</h4>
                <div className="progress-circle">
                  <svg viewBox="0 0 90 90">
                    <circle cx="45" cy="45" r="35" fill="none" stroke="#e5e7eb" strokeWidth="5" />
                    <circle cx="45" cy="45" r="35" fill="none" stroke="#1a6b3c" strokeWidth="5" strokeDasharray={`${selectedProject.progress * 2.2} ${220}`} transform="rotate(-90 45 45)" strokeLinecap="round" />
                  </svg>
                  <div className="progress-circle-text">
                    <div className="pct-big">{selectedProject.progress}%</div>
                    <div className="pct-small">Complete</div>
                  </div>
                </div>
              </div>
              <div className="proj-summary">
                <h4>Budget</h4>
                <div className="budget-util">
                  <div className="budget-big">$8,500</div>
                  <div className="budget-total">of {selectedProject.budget}</div>
                  <div className="bar-track" style={{ marginTop: 8 }}>
                    <div className="bar-fill" style={{ width: '71%' }} />
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 6 }}>71% utilized</div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tasks' && (
            <div className="detail-tasks">
              <div className="detail-task-row">
                <div>
                  <div className="detail-task-name">Complete baseline survey</div>
                  <div className="detail-task-assign">Assigned to: Samuel</div>
                </div>
                <span className="status-badge on-track">● Completed</span>
              </div>
              <div className="detail-task-row">
                <div>
                  <div className="detail-task-name">Recruit and train volunteers</div>
                  <div className="detail-task-assign">Assigned to: Ruth</div>
                </div>
                <span className="status-badge on-track">● In Progress</span>
              </div>
              <div className="detail-task-row">
                <div>
                  <div className="detail-task-name">Set up health centers</div>
                  <div className="detail-task-assign">Assigned to: James</div>
                </div>
                <span className="status-badge at-risk">● At Risk</span>
              </div>
            </div>
          )}

          {activeTab === 'budget' && (
            <div className="detail-tasks">
              <div style={{ padding: '16px 20px' }}>
                <div className="budget-item">
                  <div className="budget-row">
                    <span className="budget-name">Personnel</span>
                    <span className="budget-pct">75%</span>
                  </div>
                  <div className="budget-vals">$4,500 / $6,000</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '75%' }} />
                  </div>
                </div>
                <div className="budget-item">
                  <div className="budget-row">
                    <span className="budget-name">Operations</span>
                    <span className="budget-pct">65%</span>
                  </div>
                  <div className="budget-vals">$2,600 / $4,000</div>
                  <div className="bar-track">
                    <div className="bar-fill" style={{ width: '65%' }} />
                  </div>
                </div>
                <div className="budget-item">
                  <div className="budget-row">
                    <span className="budget-name">Materials</span>
                    <span className="budget-pct">50%</span>
                  </div>
                  <div className="budget-vals">$1,000 / $2,000</div>
                  <div className="bar-track">
                    <div className="bar-fill amber" style={{ width: '50%' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="detail-tasks">
              <div style={{ padding: '16px 20px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>
                No documents uploaded yet
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
