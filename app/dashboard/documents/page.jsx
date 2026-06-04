'use client';

import { useState } from 'react';

export default function DocumentsPage() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const documents = [
    { id: 1, name: 'Quarterly Impact Report Q1', type: 'PDF', category: 'reports', project: 'Community Health', uploaded: '2024-04-15', size: '2.4 MB' },
    { id: 2, name: 'Project Budget 2024', type: 'XLSX', category: 'budget', project: 'Education for All', uploaded: '2024-04-10', size: '1.2 MB' },
    { id: 3, name: 'Beneficiary Survey Data', type: 'CSV', category: 'data', project: 'Women Empowerment', uploaded: '2024-04-08', size: '856 KB' },
    { id: 4, name: 'Donor Agreement - Version 3', type: 'PDF', category: 'contracts', project: 'Clean Water Initiative', uploaded: '2024-03-25', size: '1.8 MB' },
    { id: 5, name: 'Field Visit Photos', type: 'ZIP', category: 'media', project: 'Community Health', uploaded: '2024-04-20', size: '18.5 MB' },
    { id: 6, name: 'Staff Training Materials', type: 'PPTX', category: 'training', project: 'Youth Skills Training', uploaded: '2024-04-12', size: '5.3 MB' },
    { id: 7, name: 'Partnership MOU', type: 'PDF', category: 'contracts', project: 'Education for All', uploaded: '2024-02-14', size: '932 KB' },
    { id: 8, name: 'Community Feedback Form', type: 'DOCX', category: 'feedback', project: 'Clean Water Initiative', uploaded: '2024-04-18', size: '256 KB' },
  ];

  const categories = ['all', 'reports', 'budget', 'data', 'contracts', 'media', 'training', 'feedback'];
  const categoryLabels = {
    all: 'All Documents',
    reports: 'Reports',
    budget: 'Budget',
    data: 'Data',
    contracts: 'Contracts',
    media: 'Media',
    training: 'Training',
    feedback: 'Feedback',
  };

  const filteredDocs = selectedCategory === 'all' 
    ? documents 
    : documents.filter(d => d.category === selectedCategory);

  const getFileIcon = (type) => {
    const icons = {
      PDF: '📄',
      XLSX: '📊',
      CSV: '📋',
      ZIP: '🗂️',
      PPTX: '🎨',
      DOCX: '📝',
    };
    return icons[type] || '📦';
  };

  const handleDownload = (docName) => {
    alert(`Downloading: ${docName}`);
  };

  const handleShare = (docName) => {
    alert(`Sharing: ${docName}`);
  };

  return (
    <>
      <div className="page-header">
        <h1>Documents</h1>
        <p>Access and manage all your project documents and files.</p>
      </div>

      <div style={{ marginBottom: 20, display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 8 }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            style={{
              padding: '6px 14px',
              background: selectedCategory === cat ? '#1a6b3c' : '#fff',
              color: selectedCategory === cat ? '#fff' : '#6b7280',
              border: selectedCategory === cat ? 'none' : '1px solid #e5e7eb',
              borderRadius: 20,
              fontSize: 12,
              fontWeight: 500,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
            }}
          >
            {categoryLabels[cat]}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
        {filteredDocs.map((doc) => (
          <div
            key={doc.id}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: 10,
              padding: 14,
              cursor: 'pointer',
              transition: 'box-shadow 0.15s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)',
            }}
            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04)'}
            onMouseLeave={(e) => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.07), 0 1px 2px rgba(0,0,0,0.04)'}
          >
            <div style={{ fontSize: 32, marginBottom: 8 }}>
              {getFileIcon(doc.type)}
            </div>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#111827', marginBottom: 3 }}>
              {doc.name}
            </div>
            <div style={{ fontSize: 11, color: '#9ca3af', marginBottom: 1 }}>
              {doc.type} • {doc.size}
            </div>
            <div style={{ fontSize: 10, color: '#d1d5db', marginBottom: 10 }}>
              {doc.project}
            </div>
            <div style={{ fontSize: 10, color: '#9ca3af', marginBottom: 10 }}>
              {new Date(doc.uploaded).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={() => handleDownload(doc.name)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: '#1a6b3c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Download
              </button>
              <button
                onClick={() => handleShare(doc.name)}
                style={{
                  flex: 1,
                  padding: '4px 8px',
                  background: '#f9fafb',
                  color: '#6b7280',
                  border: '1px solid #e5e7eb',
                  borderRadius: 6,
                  fontSize: 10,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Share
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
