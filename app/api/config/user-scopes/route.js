export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const body = await parseBody(req);
    if (!body?.userId) return error('Staff member is required');

    const mapping = await prisma.userScopeMapping.create({
      data: {
        userId: body.userId,
        region: body.region?.trim() || null,
        zone: body.zone?.trim() || null,
        woreda: body.woreda?.trim() || null,
        kebele: body.kebele?.trim() || null,
      },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return json({
      id: mapping.id,
      userId: mapping.userId,
      userName: mapping.user.name,
      region: mapping.region,
      zone: mapping.zone,
      woreda: mapping.woreda,
      kebele: mapping.kebele,
    }, 201);
  } catch {
    return error('Failed to create mapping', 500);
  }
}
