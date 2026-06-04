'use client';

import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';
import DashboardPages from '../components/DashboardPages';

export default function DashboardPage() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <div className="main-container">
        <Topbar />
        <DashboardPages currentPage={currentPage} />
      </div>
    </div>
  );
}
