'use client';

import { useMemo, useState } from 'react';
import { USER_GUIDE_SECTIONS } from '@/lib/user-guide';

export default function UserGuidePage({ onNavigate }) {
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState(USER_GUIDE_SECTIONS[0]?.id || '');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return USER_GUIDE_SECTIONS;
    return USER_GUIDE_SECTIONS.map((section) => ({
      ...section,
      items: section.items.filter(
        (item) => item.title.toLowerCase().includes(q) || item.body.toLowerCase().includes(q),
      ),
    })).filter((section) => section.items.length > 0);
  }, [query]);

  return (
    <div className="help-page help-page-v2">
      <div className="help-hero">
        <div>
          <p className="page-section-label">Help & Support</p>
          <h1>User Guide</h1>
          <p>Everything you need to work confidently in the Engage Now Africa project management system.</p>
        </div>
        <div className="help-search-wrap">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="search"
            placeholder="Search help topics…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
      </div>

      <div className="help-quick-links">
        {[
          { label: 'Dashboard', page: 'dashboard' },
          { label: 'Projects', page: 'projects' },
          { label: 'Reports', page: 'reports-daily' },
          { label: 'Staff', page: 'staff-management' },
          { label: 'Settings', page: 'settings' },
        ].map((link) => (
          <button key={link.page} type="button" className="help-quick-link" onClick={() => onNavigate?.(link.page)}>
            {link.label}
          </button>
        ))}
      </div>

      <div className="help-sections">
        {filtered.map((section) => (
          <section key={section.id} className="help-section-card">
            <button
              type="button"
              className={`help-section-toggle${openId === section.id ? ' open' : ''}`}
              onClick={() => setOpenId(openId === section.id ? '' : section.id)}
            >
              <span className="help-section-icon">{section.icon}</span>
              <span>
                <strong>{section.title}</strong>
                <small>{section.subtitle}</small>
              </span>
              <svg className="help-chevron" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {openId === section.id && (
              <div className="help-section-body">
                {section.items.map((item) => (
                  <article key={item.title} className="help-topic">
                    <h3>{item.title}</h3>
                    <p>{item.body}</p>
                    {item.tips?.length > 0 && (
                      <ul className="help-tips">
                        {item.tips.map((tip) => <li key={tip}>{tip}</li>)}
                      </ul>
                    )}
                  </article>
                ))}
              </div>
            )}
          </section>
        ))}
      </div>

      <div className="help-contact-card">
        <h3>Still need help?</h3>
        <p>Contact your General Country Dean or Project Manager for account access, training, or workflow questions.</p>
      </div>
    </div>
  );
}
