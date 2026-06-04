'use client';

import { useState } from 'react';

export default function BudgetPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('all');

  const budgets = [
    { id: 1, name: 'Community Health Project', allocated: 12000, spent: 8500, color: 'green' },
    { id: 2, name: 'Education for All', allocated: 13000, spent: 9200, color: 'green' },
    { id: 3, name: 'Clean Water Initiative', allocated: 7000, spent: 4800, color: 'amber' },
    { id: 4, name: 'Women Empowerment', allocated: 7000, spent: 4000, color: 'red' },
    { id: 5, name: 'Youth Skills Training', allocated: 9500, spent: 5700, color: 'green' },
  ];

  const totals = {
    allocated: budgets.reduce((sum, b) => sum + b.allocated, 0),
    spent: budgets.reduce((sum, b) => sum + b.spent, 0),
  };

  const remaining = totals.allocated - totals.spent;
  const percentageUsed = Math.round((totals.spent / totals.allocated) * 100);

  return (
    <>
      <div className="page-header">
        <h1>Budget</h1>
        <p>Monitor project budgets and spending across all initiatives.</p>
      </div>

      <div className="budget-overview-grid">
        <div className="budget-big-card">
          <div className="budget-big-label">Total Allocated</div>
          <div className="budget-big-val">${(totals.allocated / 1000).toFixed(0)}k</div>
          <div className="budget-big-sub">across {budgets.length} projects</div>
        </div>
        <div className="budget-big-card">
          <div className="budget-big-label">Total Spent</div>
          <div className="budget-big-val">${(totals.spent / 1000).toFixed(1)}k</div>
          <div className="budget-big-sub">{percentageUsed}% utilized</div>
        </div>
        <div className="budget-big-card">
          <div className="budget-big-label">Remaining Balance</div>
          <div className="budget-big-val">${(remaining / 1000).toFixed(1)}k</div>
          <div className="budget-big-sub">Available to spend</div>
        </div>
      </div>

      <div className="budget-list">
        <div className="card-header" style={{ padding: '16px 0 12px 0' }}>
          <span className="card-title">Budget by Project</span>
          <select
            className="card-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="all">All Time</option>
            <option value="month">This Month</option>
            <option value="quarter">This Quarter</option>
          </select>
        </div>

        {budgets.map((budget) => {
          const percentage = (budget.spent / budget.allocated) * 100;
          return (
            <div key={budget.id} className="budget-list-row">
              <div className="budget-list-name">{budget.name}</div>
              <div className="budget-list-bar">
                <div className="budget-list-pcts">
                  <span>${budget.spent.toLocaleString()}</span>
                  <span>{Math.round(percentage)}%</span>
                </div>
                <div className="bar-track">
                  <div className={`bar-fill ${budget.color === 'green' ? '' : budget.color}`} style={{ width: `${percentage}%` }} />
                </div>
              </div>
              <div className="budget-list-amt">${budget.allocated.toLocaleString()}</div>
            </div>
          );
        })}
      </div>
    </>
  );
}
