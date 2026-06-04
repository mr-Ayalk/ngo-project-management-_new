export const dynamic = 'force-dynamic';

import { json } from '@/lib/api-utils';

export async function GET() {
  return json({
    enabled: false,
    message: 'In-app messaging module — coming in next sprint.',
    messages: [],
  });
}
