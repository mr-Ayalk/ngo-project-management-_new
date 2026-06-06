'use client';

import UserAvatar from '@/components/UserAvatar';

const FILE_TYPE_STYLES = {
  PDF: { bg: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', label: 'PDF' },
  DOC: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', label: 'DOC' },
  DOCX: { bg: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)', label: 'DOC' },
  XLS: { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', label: 'XLS' },
  XLSX: { bg: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', label: 'XLS' },
  IMG: { bg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', label: 'IMG' },
  PNG: { bg: 'linear-gradient(135deg, #a855f7 0%, #9333ea 100%)', label: 'IMG' },
  JPG: { bg: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)', label: 'IMG' },
};

function getFileStyle(doc) {
  const type = (doc.fileType || '').toUpperCase();
  return FILE_TYPE_STYLES[type] || { bg: 'linear-gradient(135deg, #64748b 0%, #475569 100%)', label: type || 'FILE' };
}

const CATEGORY_ICONS = {
  all: '📁',
  reports: '📊',
  budget: '💰',
  data: '📈',
  contracts: '📝',
  media: '🎬',
  training: '🎓',
  feedback: '💬',
};

export default function DocumentsLibrary({
  documents = [],
  categories = [],
  activeCategory = 'all',
  onCategoryChange,
  onView,
  onDownload,
  onDelete,
  onUpload,
  isManager = false,
  searchQuery = '',
  onSearchChange,
}) {
  const filtered = searchQuery.trim()
    ? documents.filter((d) =>
        d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (d.project || '').toLowerCase().includes(searchQuery.toLowerCase())
      )
    : documents;

  const totalSize = documents.length;

  return (
    <div className="docs-library">
      <div className="docs-hero">
        <div className="docs-hero-content">
          <div className="docs-hero-badge">Document Center</div>
          <h1 className="docs-hero-title">Knowledge & Files</h1>
          <p className="docs-hero-sub">
            {totalSize} document{totalSize !== 1 ? 's' : ''} across programs — reports, contracts, media, and more.
          </p>
        </div>
        <button type="button" className="btn-primary docs-upload-btn" onClick={onUpload}>
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
            <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
          </svg>
          Upload Document
        </button>
      </div>

      <div className="docs-toolbar">
        <div className="docs-categories">
          {(categories.length ? categories : ['all', 'reports', 'budget', 'data', 'contracts', 'media', 'training', 'feedback']).map((cat) => (
            <button
              key={cat}
              type="button"
              className={`docs-cat-pill${activeCategory === cat ? ' active' : ''}`}
              onClick={() => onCategoryChange?.(cat)}
            >
              <span className="docs-cat-icon">{CATEGORY_ICONS[cat] || '📄'}</span>
              {cat === 'all' ? 'All Files' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="docs-search-wrap">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="docs-empty">
          <div className="docs-empty-icon">📂</div>
          <h3>No documents yet</h3>
          <p>Upload your first file to get started.</p>
          <button type="button" className="btn-primary" onClick={onUpload}>Upload Document</button>
        </div>
      ) : (
        <div className="docs-masonry">
          {filtered.map((doc) => {
            const style = getFileStyle(doc);
            return (
              <article key={doc.id} className="docs-card">
                <div className="docs-card-preview" style={{ background: style.bg }}>
                  <span className="docs-card-type">{style.label}</span>
                  <span className="docs-card-emoji">{doc.icon || '📄'}</span>
                </div>
                <div className="docs-card-body">
                  <h3 className="docs-card-title" title={doc.name}>{doc.name}</h3>
                  <div className="docs-card-meta">
                    {doc.category && (
                      <span className="docs-tag">{doc.category}</span>
                    )}
                    {doc.size && <span className="docs-size">{doc.size}</span>}
                  </div>
                  <p className="docs-card-date">{doc.date}</p>
                  <div className="docs-card-actions">
                    <button type="button" className="docs-action primary" onClick={() => onView?.(doc)}>View</button>
                    <button type="button" className="docs-action" onClick={() => onDownload?.(doc)}>Download</button>
                    {isManager && (
                      <button type="button" className="docs-action danger" onClick={() => onDelete?.(doc.id)}>Delete</button>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}
