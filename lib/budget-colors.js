/** Budget bar color: green ≤75%, yellow >75%, red >90% */
export function budgetBarClass(pct) {
  const n = Number(pct) || 0;
  if (n > 90) return 'red';
  if (n > 75) return 'amber';
  return '';
}

export function budgetBarColor(pct) {
  const n = Number(pct) || 0;
  if (n > 90) return '#ef4444';
  if (n > 75) return '#f59e0b';
  return '#059669';
}
