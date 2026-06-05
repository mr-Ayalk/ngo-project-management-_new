'use client';

import { useState, useRef, useEffect } from 'react';

export default function AutocompleteInput({ value, onChange, options = [], placeholder = '', label, onSelect }) {
  const [open, setOpen] = useState(false);
  const [filtered, setFiltered] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    const q = (value || '').toLowerCase().trim();
    const results = q
      ? options.filter((o) => o.toLowerCase().includes(q)).slice(0, 12)
      : options.slice(0, 12);
    setFiltered(results);
  }, [value, options]);

  useEffect(() => {
    function handleClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const pick = (item) => {
    onChange(item);
    onSelect?.(item);
    setOpen(false);
  };

  return (
    <div className="form-field autocomplete-wrap" ref={wrapRef}>
      {label && <label>{label}</label>}
      <input
        type="text"
        value={value || ''}
        placeholder={placeholder}
        onChange={(e) => { onChange(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        autoComplete="off"
      />
      {open && filtered.length > 0 && (
        <ul className="autocomplete-list">
          {filtered.map((item) => (
            <li key={item}>
              <button type="button" onClick={() => pick(item)}>{item}</button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
