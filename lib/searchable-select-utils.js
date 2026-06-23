/** Normalize options to { value, label } */
export function normalizeOptions(options) {
  return options.map((o) => (typeof o === 'string' ? { value: o, label: o } : o));
}

/** Pick the best matching option from typed text (exact → single partial → single prefix). */
export function resolveOptionFromQuery(query, options) {
  const q = query.trim().toLowerCase();
  if (!q) return null;
  const normalized = normalizeOptions(options);

  const exact = normalized.find((o) => o.label.toLowerCase() === q);
  if (exact) return exact;

  const partial = normalized.filter((o) => o.label.toLowerCase().includes(q));
  if (partial.length === 1) return partial[0];

  const prefix = normalized.filter((o) => o.label.toLowerCase().startsWith(q));
  if (prefix.length === 1) return prefix[0];

  return null;
}
