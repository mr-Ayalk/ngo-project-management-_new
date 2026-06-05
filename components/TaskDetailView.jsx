'use client';

import { useState, useEffect } from 'react';
import api from '@/lib/api';

const PRIORITY_LABELS = { low: 'LOW', medium: 'MEDIUM', high: 'HIGH' };
const STATUS_LABELS = { todo: 'TODO', in_progress: 'IN PROGRESS', completed: 'DONE' };

export default function TaskDetailView({ task, project, onBack, currentUser, onNotify }) {
  const [comments, setComments] = useState([]);
  const [commentCount, setCommentCount] = useState(0);
  const [input, setInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

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
      alert(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
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
              <span className="task-meta-label">Due</span>
              <span className="task-meta-val">📅 {formatDate(task.dueDate)}</span>
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
