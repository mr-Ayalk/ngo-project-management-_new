export const dynamic = 'force-dynamic';

import { json } from '@/lib/api-utils';
import { REGIONS, ZONES, TOWNS, KEBELES, WOREDAS, WOREDA_BUDGETS, filterLocations } from '@/lib/ethiopia-locations';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'regions';
  const q = searchParams.get('q') || '';

  const lists = {
    regions: REGIONS,
    zones: ZONES,
    towns: TOWNS,
    kebeles: KEBELES,
    woredas: WOREDAS,
  };

  const list = lists[type] || REGIONS;
  const results = filterLocations(list, q);

  if (type === 'woreda_budgets') {
    const budgets = WOREDA_BUDGETS.filter((w) =>
      !q || w.woreda.toLowerCase().includes(q.toLowerCase())
    ).slice(0, 15);
    return json({ results: budgets });
  }

  return json({ results });
}
