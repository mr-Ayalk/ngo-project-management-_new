'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { normalizeOptions, resolveOptionFromQuery } from '@/lib/searchable-select-utils';

/**
 * Searchable dropdown — type to filter, blur/Enter commits selection.
 */
export default function SearchableSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Type to search…',
  label,
  required = false,
  disabled = false,
  name,
  className = '',
  allowCustom = false,
}) {
  const normalized = useMemo(() => normalizeOptions(options), [options]);

  const selected = normalized.find((o) => o.value === value);
  const [query, setQuery] = useState(selected?.label || '');
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const skipSyncRef = useRef(false);

  useEffect(() => {
    if (skipSyncRef.current) {
      skipSyncRef.current = false;
      return;
    }
    const match = normalized.find((o) => o.value === value);
    setQuery(match?.label || (allowCustom && value ? String(value) : ''));
  }, [value, normalized, allowCustom]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return normalized;
    return normalized.filter((o) => o.label.toLowerCase().includes(q));
  }, [query, normalized]);

  const pick = (opt) => {
    skipSyncRef.current = true;
    onChange(opt.value);
    setQuery(opt.label);
    setOpen(false);
  };

  const commitQuery = () => {
    const resolved = resolveOptionFromQuery(query, normalized);
    if (resolved) {
      if (resolved.value !== value) {
        skipSyncRef.current = true;
        onChange(resolved.value);
      }
      setQuery(resolved.label);
      return;
    }
    if (allowCustom && query.trim()) {
      skipSyncRef.current = true;
      onChange(query.trim());
      return;
    }
    if (value) {
      const match = normalized.find((o) => o.value === value);
      setQuery(match?.label || '');
    } else {
      setQuery('');
    }
  };

  return (
    <div className={`form-field searchable-select-wrap ${className}`} ref={wrapRef}>
      {label && <label>{label}{required ? ' *' : ''}</label>}
      <div className="searchable-select">
        <input
          type="text"
          className="searchable-select-input smart-field"
          value={query}
          placeholder={placeholder}
          disabled={disabled}
          required={required && !value && !query.trim()}
          name={name}
          autoComplete="off"
          spellCheck={false}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            if (!e.target.value.trim()) onChange('');
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => {
            setTimeout(() => {
              commitQuery();
              setOpen(false);
            }, 150);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && open && filtered.length > 0) {
              e.preventDefault();
              pick(filtered[0]);
            }
            if (e.key === 'Escape') {
              setOpen(false);
              const match = normalized.find((o) => o.value === value);
              setQuery(match?.label || '');
            }
          }}
        />
        <button
          type="button"
          className="searchable-select-chevron"
          tabIndex={-1}
          disabled={disabled}
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => setOpen((s) => !s)}
          aria-label="Toggle options"
        >
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" width="16" height="16">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        {open && filtered.length > 0 && (
          <ul className="searchable-select-list" role="listbox">
            {filtered.map((opt) => (
              <li key={opt.value}>
                <button
                  type="button"
                  className={opt.value === value ? 'active' : ''}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => pick(opt)}
                >
                  {opt.label}
                </button>
              </li>
            ))}
          </ul>
        )}
        {open && filtered.length === 0 && query.trim() && (
          <div className="searchable-select-empty">No matches for &ldquo;{query}&rdquo;</div>
        )}
      </div>
    </div>
  );
}
