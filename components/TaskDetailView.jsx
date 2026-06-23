'use client';

import { useState, useEffect, useRef } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { confirmToast } from '@/lib/confirmToast';

const PRIORITY_LABELS = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
const STATUS_LABELS = { todo: 'TODO', in_progress: 'IN PROGRESS', completed: 'DONE' };

export default function TaskDetailView({ task, project, onBack, currentUser, onNotify }) {
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const [deliverables, setDeliverables] = useState([]);
  const [deliverableCount, setDeliverableCount] = useState(0);
  const [deliverableLoading, setDeliverableLoading] = useState(true);
  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [deliverableDesc, setDeliverableDesc] = useState('');
  const [deliverableFile, setDeliverableFile] = useState(null);
  const [savingDeliverable, setSavingDeliverable] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!task?.id) return;
    setLoading(true);
    api.taskComments(task.id)
      .then((data) => {
        setComments(data.comments || []);
        setCommentCount(data.count || 0);
      })
      .catch(() => setComments([]))
      .finally(() => setLoading(false));
  }, [task?.id]);

  useEffect(() => {
    if (!task?.id) return;
    setDeliverableLoading(true);
    api.taskDeliverables(task.id)
      .then((data) => {
        setDeliverables(data.deliverables || []);
        setDeliverableCount(data.count || 0);
      })
      .catch(() => setDeliverables([]))
      .finally(() => setDeliverableLoading(false));
  }, [task?.id]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!input.trim() || !currentUser) return;
    setSubmitting(true);
    try {
      const result = await api.postTaskComment({
        content: input.trim(),
        taskId: task.id,
        projectId: project.id,
      });
      setComments((prev) => [...prev, {
        id: result.id,
        content: result.content,
        senderName: result.senderName,
        initials: result.initials,
        color: '#1E75E5',
        time: result.time,
      }]);
      setCommentCount(result.count || commentCount + 1);
      setInput('');
      onNotify?.();
    } catch (err) {
      toast.error(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveDeliverable = async (e) => {
    e.preventDefault();
    if (!deliverableDesc.trim() && !deliverableFile) {
      toast.error('Add a description or attach a document');
      return;
    }
    setSavingDeliverable(true);
    try {
      let fileMeta = {};
      if (deliverableFile) {
        const uploaded = await api.uploadDocumentFile(deliverableFile);
        fileMeta = {
          fileUrl: uploaded.url,
          fileName: uploaded.name,
          fileType: uploaded.fileType,
          fileSize: uploaded.size,
        };
      }
      const result = await api.postTaskDeliverable({
        taskId: task.id,
        title: deliverableTitle.trim() || null,
        description: deliverableDesc.trim() || null,
        ...fileMeta,
      });
      setDeliverables((prev) => [{
        id: result.id,
        title: result.title,
        description: result.description,
        fileUrl: result.fileUrl,
        fileName: result.fileName,
        fileType: result.fileType,
        fileSize: result.fileSize,
        creatorName: result.creatorName,
        time: result.time,
      }, ...prev]);
      setDeliverableCount(result.count || deliverableCount + 1);
      setDeliverableTitle('');
      setDeliverableDesc('');
      setDeliverableFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      toast.success('Work record saved');
    } catch (err) {
      toast.error(err.message || 'Failed to save work record');
    } finally {
      setSavingDeliverable(false);
    }
  };

  const handleDeleteDeliverable = async (id) => {
    const ok = await confirmToast('Remove this work record?', { confirmLabel: 'Remove' });
    if (!ok) return;
    try {
      await api.deleteTaskDeliverable(id);
      setDeliverables((prev) => prev.filter((d) => d.id !== id));
      setDeliverableCount((c) => Math.max(0, c - 1));
      toast.success('Work record removed');
    } catch (err) {
      toast.error(err.message || 'Failed to remove');
    }
  };

  const formatDate = (d) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const statusLabel = (s) => STATUS_LABELS[s] || s?.toUpperCase();
  const priorityLabel = (p) => PRIORITY_LABELS[p] || p?.toUpperCase();

  return (
    <div className="task-detail-page">
      <button type="button" className="project-detail-back" onClick={onBack}>
        ← Back to Tasks
      </button>
      <div className="task-detail-layout">
        <div className="task-detail-main">
          <div className="task-deliverables-card">
            <div className="task-discussion-header">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>Work Done ({deliverableCount})</span>
            </div>
            <div className="task-deliverables-body">
              {deliverableLoading ? (
                <p className="task-discussion-empty">Loading work records...</p>
              ) : deliverables.length ? (
                deliverables.map((d) => (
                  <div key={d.id} className="task-deliverable-item">
                    <div className="task-deliverable-top">
                      <div>
                        {d.title && <strong className="task-deliverable-title">{d.title}</strong>}
                        <div className="task-deliverable-meta">
                          {d.creatorName} · {d.time}
                        </div>
                      </div>
                      <button
                        type="button"
                        className="task-deliverable-delete"
                        onClick={() => handleDeleteDeliverable(d.id)}
                        aria-label="Remove work record"
                      >
                        ✕
                      </button>
                    </div>
                    {d.description && <p className="task-deliverable-desc">{d.description}</p>}
                    {d.fileUrl && (
                      <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="task-deliverable-file">
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                          <path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" />
                          <polyline points="13 2 13 9 20 9" />
                        </svg>
                        {d.fileName || 'Attached document'}
                        {d.fileSize ? ` · ${d.fileSize}` : ''}
                      </a>
                    )}
                  </div>
                ))
              ) : (
                <p className="task-discussion-empty">No work recorded yet. Document what was done for this task.</p>
              )}
            </div>
            <form className="task-deliverables-form" onSubmit={handleSaveDeliverable}>
              <input
                type="text"
                placeholder="Title (optional)"
                value={deliverableTitle}
                onChange={(e) => setDeliverableTitle(e.target.value)}
                className="task-deliverable-input"
              />
              <textarea
                placeholder="Describe what was done for this task..."
                value={deliverableDesc}
                onChange={(e) => setDeliverableDesc(e.target.value)}
                rows={3}
              />
              <div className="task-deliverables-actions">
                <label className="task-deliverable-upload">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={(e) => setDeliverableFile(e.target.files?.[0] || null)}
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg"
                  />
                  {deliverableFile ? deliverableFile.name : 'Attach document'}
                </label>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={savingDeliverable || (!deliverableDesc.trim() && !deliverableFile)}
                >
                  {savingDeliverable ? 'Saving...' : 'Save work'}
                </button>
              </div>
            </form>
          </div>

          <div className="task-discussion-card">
            <div className="task-discussion-header">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
              <span>Task Discussion ({commentCount})</span>
            </div>
            <div className="task-discussion-body">
              {loading ? (
                <p className="task-discussion-empty">Loading comments...</p>
              ) : comments.length ? (
                comments.map((c) => (
                  <div key={c.id} className="task-comment">
                    <div className="msg-avatar" style={{ background: c.color || '#1E75E5' }}>{c.initials}</div>
                    <div>
                      <div className="task-comment-meta">
                        <strong>{c.senderName}</strong>
                        <span>{c.time}</span>
                      </div>
                      <p>{c.content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="task-discussion-empty">No comments yet. Be the first!</p>
              )}
            </div>
            <form className="task-discussion-compose" onSubmit={handlePost}>
              <textarea
                placeholder="Write a comment..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                rows={2}
              />
              <button type="submit" className="btn-primary" disabled={submitting || !input.trim()}>
                {submitting ? 'Posting...' : 'Post'}
              </button>
            </form>
          </div>
        </div>

        <div className="task-detail-sidebar">
          <div className="task-info-card">
            <h3>{task.title}</h3>
            <div className="task-badges">
              <span className={`task-badge status-${task.status}`}>{statusLabel(task.status)}</span>
              <span className="task-badge type">{task.priority === 'high' ? 'URGENT' : 'OTHER'}</span>
              <span className={`task-badge priority-${task.priority}`}>{priorityLabel(task.priority)}</span>
            </div>
            {task.description && <p className="task-desc">{task.description}</p>}
            <div className="task-meta-row">
              <span className="task-meta-label">Assignee</span>
              <span className="task-meta-val">
                <span className="task-assignee-dot" />
                {task.assignee || 'Unassigned'}
              </span>
            </div>
            <div className="task-meta-row">
              <span className="task-meta-label">Start</span>
              <span className="task-meta-val">📅 {formatDate(task.startDate)}</span>
            </div>
            <div className="task-meta-row">
              <span className="task-meta-label">End</span>
              <span className="task-meta-val">📅 {formatDate(task.endDate || task.dueDate)}</span>
            </div>
          </div>

          <div className="task-project-card">
            <h4>Project Details</h4>
            <div className="task-project-name">
              {project.name}
              <button type="button" className="task-edit-icon" aria-label="Edit project">✎</button>
            </div>
            <p className="task-project-start">Project Start Date: {project.startDate || formatDate(project.startDateRaw)}</p>
            <div className="task-project-stats">
              <span>Status: <strong>{(project.status || 'on-track').replace('-', ' ').toUpperCase()}</strong></span>
              <span>Priority: <strong>HIGH</strong></span>
              <span>Progress: <strong>{project.progress || 0}%</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
