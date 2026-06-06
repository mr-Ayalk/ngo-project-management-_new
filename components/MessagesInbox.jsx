'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import api from '@/lib/api';
import toast from '@/lib/toast';
import { confirmToast } from '@/lib/confirmToast';

export default function MessagesInbox({
  user,
  isManager,
  lookup,
  onNavigate,
  onNotificationOpen,
  initialSelection,
  onInitialSelectionHandled,
}) {
  const [tab, setTab] = useState('messages');
  const [notifications, setNotifications] = useState({ unreadCount: 0, notifications: [] });
  const [tasksByProject, setTasksByProject] = useState({});
  const [expandedProjects, setExpandedProjects] = useState({});
  const [loadingTasks, setLoadingTasks] = useState({});
  const [msgProjectId, setMsgProjectId] = useState('');
  const [msgTaskId, setMsgTaskId] = useState('');
  const [selectedTaskTitle, setSelectedTaskTitle] = useState('');
  const [messages, setMessages] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const messagesEndRef = useRef(null);

  const loadNotifications = useCallback(async () => {
    try {
      const data = await api.notifications();
      setNotifications(data);
    } catch {
      setNotifications({ unreadCount: 0, notifications: [] });
    }
  }, []);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const loadProjectTasks = useCallback(async (projectId) => {
    if (tasksByProject[projectId]) return tasksByProject[projectId];
    setLoadingTasks((prev) => ({ ...prev, [projectId]: true }));
    try {
      const data = await api.tasks({ projectId });
      const list = data.tasks || [];
      setTasksByProject((prev) => ({ ...prev, [projectId]: list }));
      return list;
    } catch {
      setTasksByProject((prev) => ({ ...prev, [projectId]: [] }));
      return [];
    } finally {
      setLoadingTasks((prev) => ({ ...prev, [projectId]: false }));
    }
  }, [tasksByProject]);

  const toggleProject = (projectId) => {
    const next = !expandedProjects[projectId];
    setExpandedProjects((prev) => ({ ...prev, [projectId]: next }));
    if (next) loadProjectTasks(projectId);
  };

  const selectTask = (projectId, task) => {
    setMsgProjectId(projectId);
    setMsgTaskId(task.id);
    setSelectedTaskTitle(task.title);
    setTab('messages');
  };

  const loadTaskMessages = useCallback(async (projectId, taskId) => {
    if (!projectId || !taskId) return;
    try {
      setMessages(await api.messages({ projectId, taskId }));
    } catch {
      setMessages({ messages: [] });
    }
  }, []);

  useEffect(() => {
    if (msgProjectId && msgTaskId) {
      loadTaskMessages(msgProjectId, msgTaskId);
    }
  }, [msgProjectId, msgTaskId, loadTaskMessages]);

  useEffect(() => {
    if (!msgProjectId || !msgTaskId) return undefined;
    const interval = setInterval(() => loadTaskMessages(msgProjectId, msgTaskId), 10000);
    return () => clearInterval(interval);
  }, [msgProjectId, msgTaskId, loadTaskMessages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages?.messages]);

  const unreadNotifications = useMemo(
    () => notifications.notifications.filter((n) => !n.isRead),
    [notifications.notifications]
  );

  useEffect(() => {
    if (!initialSelection?.projectId) return;
    const apply = async () => {
      setTab('messages');
      setExpandedProjects((prev) => ({ ...prev, [initialSelection.projectId]: true }));
      const tasks = await loadProjectTasks(initialSelection.projectId);
      const taskId = initialSelection.taskId || tasks[0]?.id;
      if (taskId) {
        const task = tasks.find((t) => t.id === taskId) || { id: taskId, title: 'Task discussion' };
        setMsgProjectId(initialSelection.projectId);
        setMsgTaskId(taskId);
        setSelectedTaskTitle(task.title);
      }
      onInitialSelectionHandled?.();
    };
    apply();
  }, [initialSelection, loadProjectTasks, onInitialSelectionHandled]);

  const handleNotificationClick = async (n) => {
    try {
      await api.markNotificationRead(n.id);
      loadNotifications();
    } catch { /* ignore */ }
    if (n.projectId && n.taskId) {
      setTab('messages');
      setExpandedProjects((prev) => ({ ...prev, [n.projectId]: true }));
      const tasks = await loadProjectTasks(n.projectId);
      const task = tasks.find((t) => t.id === n.taskId) || { id: n.taskId, title: n.title };
      selectTask(n.projectId, task);
      onNotificationOpen?.(n);
    } else if (n.projectId) {
      onNavigate?.('projects');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() || !msgProjectId || !msgTaskId) return;
    setSubmitting(true);
    try {
      await api.sendMessage({
        content: messageInput,
        projectId: msgProjectId,
        taskId: msgTaskId,
      });
      setMessageInput('');
      await loadTaskMessages(msgProjectId, msgTaskId);
      toast.success('Message sent');
    } catch (err) {
      toast.error(err.message || 'Failed to send message');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMessage = async (msgId) => {
    const ok = await confirmToast('Delete this message?', {
      description: 'This message will be removed from the conversation.',
      confirmLabel: 'Delete',
    });
    if (!ok) return;
    try {
      await api.deleteMessage(msgId);
      await loadTaskMessages(msgProjectId, msgTaskId);
      toast.success('Message deleted');
    } catch (err) {
      toast.error(err.message || 'Failed to delete message');
    }
  };

  const selectedProjectName = lookup.projects.find((p) => p.id === msgProjectId)?.name || '';

  return (
    <div className="inbox-page">
      <div className="page-header">
        <h1>Inbox</h1>
        <p>Centralized communications hub for field operations and project updates.</p>
      </div>

      <div className="inbox-tabs">
        <button
          type="button"
          className={`inbox-tab${tab === 'unread' ? ' active' : ''}`}
          onClick={() => setTab('unread')}
        >
          Unread
          {notifications.unreadCount > 0 && (
            <span className="inbox-tab-badge">{notifications.unreadCount}</span>
          )}
        </button>
        <button
          type="button"
          className={`inbox-tab${tab === 'messages' ? ' active' : ''}`}
          onClick={() => setTab('messages')}
        >
          Messages
        </button>
      </div>

      {tab === 'unread' && (
        <div className="inbox-unread-panel">
          <div className="inbox-section-head">
            <svg className="inbox-bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
            </svg>
            <h3>Unread ({unreadNotifications.length})</h3>
          </div>
          {unreadNotifications.length ? unreadNotifications.map((n) => (
            <div key={n.id} className="inbox-alert-card">
              <span className="inbox-unread-dot" aria-hidden="true" />
              <div className="inbox-alert-body">
                <div className="inbox-alert-title">{n.title}</div>
                <div className="inbox-alert-msg">{n.message}</div>
                <div className="inbox-alert-time">{n.time}</div>
              </div>
              <button
                type="button"
                className="inbox-alert-action"
                onClick={() => handleNotificationClick(n)}
              >
                {n.taskId ? 'View Task' : 'View Project'}
              </button>
            </div>
          )) : (
            <p className="inbox-empty">You&apos;re all caught up — no unread notifications.</p>
          )}
        </div>
      )}

      {tab === 'messages' && (
        <div className="inbox-messages-layout">
          <aside className="inbox-sidebar">
            <div className="inbox-sidebar-label">Projects & Tasks</div>
            <div className="inbox-project-list">
              {lookup.projects.length ? lookup.projects.map((project) => (
                <div key={project.id} className="inbox-project-group">
                  <button
                    type="button"
                    className={`inbox-project-row${expandedProjects[project.id] ? ' expanded' : ''}`}
                    onClick={() => toggleProject(project.id)}
                  >
                    <svg className={`inbox-chevron${expandedProjects[project.id] ? ' open' : ''}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 18l6-6-6-6" />
                    </svg>
                    <span className="inbox-project-name">{project.name}</span>
                  </button>
                  {expandedProjects[project.id] && (
                    <div className="inbox-task-list">
                      {loadingTasks[project.id] && (
                        <div className="inbox-task-loading">Loading tasks…</div>
                      )}
                      {!loadingTasks[project.id] && (tasksByProject[project.id] || []).map((task) => (
                        <button
                          key={task.id}
                          type="button"
                          className={`inbox-task-row${msgTaskId === task.id && msgProjectId === project.id ? ' active' : ''}`}
                          onClick={() => selectTask(project.id, task)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                          </svg>
                          <span>{task.title}</span>
                        </button>
                      ))}
                      {!loadingTasks[project.id] && !(tasksByProject[project.id] || []).length && (
                        <div className="inbox-task-empty">No tasks</div>
                      )}
                    </div>
                  )}
                </div>
              )) : (
                <p className="inbox-empty">No projects available.</p>
              )}
            </div>
          </aside>

          <div className="inbox-chat-panel">
            <div className="inbox-chat-header">
              {msgTaskId ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                    <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                  </svg>
                  <div>
                    <div className="inbox-chat-title">{selectedTaskTitle}</div>
                    <div className="inbox-chat-sub">{selectedProjectName}</div>
                  </div>
                </>
              ) : (
                <div className="inbox-chat-title muted">Select a task to start messaging</div>
              )}
            </div>

            <div className="inbox-chat-messages">
              {msgTaskId && messages?.messages?.length ? messages.messages.map((msg) => (
                <div key={msg.id} className={`message-bubble${msg.isOwn ? ' own' : ''}`}>
                  {!msg.isOwn && <div className="msg-avatar" style={{ background: msg.color }}>{msg.initials}</div>}
                  <div className="msg-body">
                    <div className="msg-sender">
                      {msg.isOwn ? 'You' : msg.senderName}
                      <span className="msg-time">{msg.time}</span>
                    </div>
                    <div className="msg-content">{msg.content}</div>
                    {(msg.isOwn || isManager) && (
                      <button type="button" className="msg-delete-btn" onClick={() => handleDeleteMessage(msg.id)} aria-label="Delete message">
                        Delete
                      </button>
                    )}
                  </div>
                  {msg.isOwn && <div className="msg-avatar own" style={{ background: msg.color }}>{msg.initials}</div>}
                </div>
              )) : (
                <p className="messages-empty inbox-chat-empty">
                  {msgTaskId
                    ? 'No messages in this task yet. Start a conversation!'
                    : 'Choose a project and task from the sidebar to view messages.'}
                </p>
              )}
              <div ref={messagesEndRef} />
            </div>

            <form className="inbox-compose" onSubmit={handleSendMessage}>
              <input
                type="text"
                placeholder="Type your message..."
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                disabled={!msgProjectId || !msgTaskId || submitting}
              />
              <button type="submit" className="inbox-send-btn" disabled={submitting || !msgProjectId || !msgTaskId || !messageInput.trim()} aria-label="Send message">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
