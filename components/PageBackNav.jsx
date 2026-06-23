'use client';

export default function PageBackNav({ onBack, label = 'Back' }) {
  if (!onBack) return null;

  return (
    <button type="button" className="page-back-nav" onClick={onBack} aria-label="Go back to previous page">
      <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5" width="18" height="18" aria-hidden="true">
        <polyline points="15 18 9 12 15 6" />
      </svg>
      <span>{label}</span>
    </button>
  );
}
