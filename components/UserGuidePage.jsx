'use client';

import { USER_GUIDE_ITEMS } from '@/lib/user-guide';

export default function UserGuidePage() {
  return (
    <div className="help-page">
      <div className="page-header">
        <p className="page-section-label">Help</p>
        <h1>User Guide</h1>
        <p>Staff onboarding and system usage documentation.</p>
      </div>
      <div className="config-guide-grid">
        {USER_GUIDE_ITEMS.map((item) => (
          <article key={item.title} className="config-guide-card partner-card">
            <h3>{item.title}</h3>
            <p>{item.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
