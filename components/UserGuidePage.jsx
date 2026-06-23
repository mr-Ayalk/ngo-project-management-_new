'use client';

import { useMemo, useState } from 'react';
import toast from '@/lib/toast';
import SearchableSelect from '@/components/SearchableSelect';
import {
  HELP_CATEGORIES,
  HELP_FAQ,
  SUPPORT_TICKET_CATEGORIES,
  HQ_CONTACT,
} from '@/lib/user-guide';

const CATEGORY_ICONS = {
  rocket: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 00-2.91-.09z" />
      <path d="M12 15l-3-3a22 22 0 012-3.95A12.88 12.88 0 0122 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 01-4 2z" />
      <path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5" />
    </svg>
  ),
  folder: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
    </svg>
  ),
  truck: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <rect x="1" y="3" width="15" height="13" rx="1" />
      <path d="M16 8h4l3 5v5h-7V8z" />
      <circle cx="5.5" cy="18.5" r="2.5" />
      <circle cx="18.5" cy="18.5" r="2.5" />
    </svg>
  ),
  chart: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
      <path d="M18 20V10M12 20V4M6 20v-6" />
    </svg>
  ),
};

export default function UserGuidePage({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState('feed');
  const [openFaq, setOpenFaq] = useState(null);
  const [ticket, setTicket] = useState({ category: 'General Support', subject: '', message: '' });
  const [submitting, setSubmitting] = useState(false);

  const filteredCategories = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return HELP_CATEGORIES;
    return HELP_CATEGORIES.filter(
      (c) => c.title.toLowerCase().includes(q)
        || c.description.toLowerCase().includes(q)
        || c.subtopics.some((s) => s.toLowerCase().includes(q)),
    );
  }, [search]);

  const filteredFaq = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return HELP_FAQ;
    return HELP_FAQ.filter(
      (f) => f.question.toLowerCase().includes(q) || f.answer.toLowerCase().includes(q),
    );
  }, [search]);

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!ticket.subject.trim() || !ticket.message.trim()) {
      toast.error('Please fill in subject and description');
      return;
    }
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 600));
    toast.success('Support ticket submitted — HQ will respond shortly');
    setTicket({ category: 'General Support', subject: '', message: '' });
    setSubmitting(false);
  };

  return (
    <div className="help-hub">
      <div className="help-hub-banner">
        <div className="help-hub-banner-inner">
          <div className="help-hub-banner-icon" aria-hidden="true">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          </div>
          <div>
            <h1>Knowledge Base &amp; HQ Support</h1>
            <p>Find answers, browse guides, or submit a support ticket to headquarters.</p>
          </div>
          <div className="help-hub-banner-search">
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="search"
              placeholder="Search help topics or articles…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="help-hub-tabs">
        <button type="button" className={activeTab === 'feed' ? 'active' : ''} onClick={() => setActiveTab('feed')}>
          Feed
        </button>
        <button type="button" className={activeTab === 'notifications' ? 'active' : ''} onClick={() => setActiveTab('notifications')}>
          Notifications
        </button>
      </div>

      <div className="help-hub-layout">
        <div className="help-hub-main">
          {activeTab === 'feed' ? (
            <>
              <div className="help-hub-section-head">
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                  <ellipse cx="12" cy="5" rx="9" ry="3" />
                  <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
                  <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
                </svg>
                <h2>Help Categories</h2>
              </div>

              <div className="help-category-grid">
                {filteredCategories.map((cat) => (
                  <article key={cat.id} className="help-category-card">
                    <div className="help-category-card-head">
                      <span className="help-category-icon">{CATEGORY_ICONS[cat.icon]}</span>
                      <div>
                        <h3>{cat.title}</h3>
                        <p>{cat.description}</p>
                      </div>
                    </div>
                    <div className="help-category-subtopics">
                      <span className="help-subtopics-label">SUBTOPICS</span>
                      <ul>
                        {cat.subtopics.map((topic) => (
                          <li key={topic}>
                            <button type="button" onClick={() => setSearch(topic)}>{topic}</button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </article>
                ))}
              </div>

              <div className="help-faq-section">
                <div className="help-hub-section-head">
                  <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="18" height="18">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  <h2>Frequently Asked Questions (FAQ)</h2>
                </div>
                <div className="help-faq-list">
                  {filteredFaq.map((item) => (
                    <div key={item.id} className={`help-faq-item${openFaq === item.id ? ' open' : ''}`}>
                      <button type="button" className="help-faq-question" onClick={() => setOpenFaq(openFaq === item.id ? null : item.id)}>
                        <span>{item.question}</span>
                        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <polyline points="6 9 12 15 18 9" />
                        </svg>
                      </button>
                      {openFaq === item.id && <div className="help-faq-answer">{item.answer}</div>}
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="help-notifications-panel">
              <h2>Notifications</h2>
              <p>System alerts and HQ responses to your support tickets will appear here.</p>
              <button type="button" className="btn-secondary" onClick={() => onNavigate?.('messages')}>Open Inbox</button>
            </div>
          )}
        </div>

        <aside className="help-hub-sidebar">
          <div className="help-ticket-card">
            <div className="help-ticket-head">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="20" height="20">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <div>
                <h3>Contact IT / HQ Support</h3>
                <p>Send a support ticket directly to headquarters.</p>
              </div>
            </div>
            <form onSubmit={handleSubmitTicket}>
              <SearchableSelect
                label="Ticket Category"
                value={ticket.category}
                onChange={(category) => setTicket({ ...ticket, category })}
                options={SUPPORT_TICKET_CATEGORIES}
                placeholder="Select or type category…"
              />
              <div className="form-field">
                <label>Subject Line</label>
                <input
                  required
                  value={ticket.subject}
                  onChange={(e) => setTicket({ ...ticket, subject: e.target.value })}
                  placeholder="Brief summary of your issue…"
                />
              </div>
              <div className="form-field">
                <label>Describe the Issue</label>
                <textarea
                  required
                  rows={5}
                  value={ticket.message}
                  onChange={(e) => setTicket({ ...ticket, message: e.target.value })}
                  placeholder="Please provide as much detail as possible…"
                />
              </div>
              <button type="submit" className="btn-primary help-ticket-submit" disabled={submitting}>
                <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
                  <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {submitting ? 'Sending…' : 'Submit HQ Ticket'}
              </button>
            </form>
          </div>

          <div className="help-contact-info">
            <h4>HQ Email</h4>
            <p>{HQ_CONTACT.email}</p>
            <h4>Admin Phone</h4>
            <p>{HQ_CONTACT.phone}</p>
            <h4>Operating Hours</h4>
            <p>{HQ_CONTACT.hours}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
