'use client';

import { useState } from 'react';

export default function TasksPage() {
  const [tasks, setTasks] = useState({
    todo: [
      { id: 1, title: 'Prepare donor report', project: 'Community Health Project', priority: 'high', dueDate: '2024-05-08' },
      { id: 2, title: 'Review field survey data', project: 'Education for All', priority: 'medium', dueDate: '2024-05-10' },
      { id: 3, title: 'Coordinate with partners', project: 'Clean Water Initiative', priority: 'low', dueDate: '2024-05-15' },
    ],
    inProgress: [
      { id: 4, title: 'Conduct training session', project: 'Women Empowerment', priority: 'high', dueDate: '2024-05-05' },
      { id: 5, title: 'Set up monitoring system', project: 'Community Health Project', priority: 'medium', dueDate: '2024-05-12' },
    ],
    completed: [
      { id: 6, title: 'Submit quarterly report', project: 'Education for All', priority: 'high', dueDate: '2024-04-30' },
      { id: 7, title: 'Finalize vendor contracts', project: 'Clean Water Initiative', priority: 'medium', dueDate: '2024-04-25' },
      { id: 8, title: 'Approve beneficiary list', project: 'Women Empowerment', priority: 'low', dueDate: '2024-04-20' },
    ],
  });

  const [draggedTask, setDraggedTask] = useState(null);

  const handleDragStart = (e, columnKey, taskId) => {
    setDraggedTask({ columnKey, taskId });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, newColumnKey) => {
    e.preventDefault();
    if (draggedTask) {
      const { columnKey, taskId } = draggedTask;
      if (columnKey !== newColumnKey) {
        const task = tasks[columnKey].find(t => t.id === taskId);
        if (task) {
          setTasks({
            ...tasks,
            [columnKey]: tasks[columnKey].filter(t => t.id !== taskId),
            [newColumnKey]: [...tasks[newColumnKey], task],
          });
        }
      }
      setDraggedTask(null);
    }
  };

  const priorityBadgeClass = {
    high: 'high',
    medium: 'medium',
    low: 'low',
  };

  const TaskCard = ({ task, columnKey }) => (
    <div
      className="kanban-card"
      draggable
      onDragStart={(e) => handleDragStart(e, columnKey, task.id)}
    >
      <div className="kanban-card-title">{task.title}</div>
      <div className="kanban-card-project">{task.project}</div>
      <div className="kanban-card-footer">
        <span className={`priority-badge ${priorityBadgeClass[task.priority]}`}>
          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
        </span>
        <div className="card-due">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          {new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>
    </div>
  );

  const KanbanColumn = ({ title, columnKey, count }) => (
    <div className="kanban-col">
      <div className="kanban-col-header">
        <div className="col-title">{title}</div>
        <div className="col-count">{count}</div>
      </div>
      <div
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, columnKey)}
        style={{ minHeight: '400px' }}
      >
        {tasks[columnKey].map(task => (
          <TaskCard key={task.id} task={task} columnKey={columnKey} />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="page-header">
        <h1>Tasks</h1>
        <p>Organize and manage your project tasks using the Kanban board.</p>
      </div>

      <div className="kanban">
        <KanbanColumn title="To Do" columnKey="todo" count={tasks.todo.length} />
        <KanbanColumn title="In Progress" columnKey="inProgress" count={tasks.inProgress.length} />
        <KanbanColumn title="Completed" columnKey="completed" count={tasks.completed.length} />
      </div>
    </>
  );
}
