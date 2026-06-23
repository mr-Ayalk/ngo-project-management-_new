'use client';

function coverImage(doc) {
  if (doc.thumbnailUrl) return doc.thumbnailUrl;
  const type = (doc.fileType || '').toUpperCase();
  if (['PNG', 'JPEG', 'JPG', 'WEBP'].includes(type) && doc.url && doc.url !== '#') return doc.url;
  return null;
}

function FileTypeBadge({ type }) {
  const t = (type || 'FILE').toUpperCase();
  return <span className="docs-card-type">{t === 'DOCX' ? 'DOC' : t === 'XLSX' ? 'XLS' : t}</span>;
}

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
              {cat === 'all' ? 'All Files' : cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
        <div className="docs-search-wrap">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input type="text" placeholder="Search documents..." value={searchQuery} onChange={(e) => onSearchChange?.(e.target.value)} spellCheck lang="en" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="docs-empty">
          <div className="docs-empty-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
          </div>
          <h3>No documents yet</h3>
          <p>Upload your first file to get started.</p>
          <button type="button" className="btn-primary" onClick={onUpload}>Upload Document</button>
        </div>
      ) : (
        <div className="docs-masonry">
          {filtered.map((doc) => {
            const cover = coverImage(doc);
            return (
              <article key={doc.id} className="docs-card">
                <div className={`docs-card-preview${cover ? ' has-cover' : ''}`}>
                  {cover ? (
                    <img src={cover} alt="" className="docs-cover-img" loading="lazy" />
                  ) : (
                    <div className="docs-card-fallback">
                      <span className="docs-card-icon">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                          <polyline points="14 2 14 8 20 8" />
                        </svg>
                      </span>
                    </div>
                  )}
                  <FileTypeBadge type={doc.fileType} />
                </div>
                <div className="docs-card-body">
                  <h3 className="docs-card-title" title={doc.name}>{doc.name}</h3>
                  <div className="docs-card-meta">
                    {doc.category && <span className="docs-tag">{doc.category}</span>}
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
