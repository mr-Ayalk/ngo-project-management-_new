'use client';

import { useState, useEffect, useRef } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardPages from '../components/DashboardPages';
import Chart from 'chart.js/auto';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const chartRef = useRef(null);
  const chartInstance = useRef(null);

  useEffect(() => {
    if (currentPage !== 'dashboard') return;
    
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
  }, [currentPage]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentPage={currentPage} onPageChange={(p) => { setCurrentPage(p); setSidebarOpen(false); }} isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-container">
        <Topbar onMenuToggle={() => setSidebarOpen((s) => !s)} />
        <DashboardPages currentPage={currentPage} chartRef={chartRef} />
      </div>
      {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}></div>}
    </div>
  );
}
