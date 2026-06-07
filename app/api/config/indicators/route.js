export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const body = await parseBody(req);
    if (!body?.name?.trim()) return error('Indicator name is required');

    const indicator = await prisma.programIndicator.create({
      data: {
        name: body.name.trim(),
        code: body.code?.trim() || null,
        category: body.category?.trim() || null,
        unit: body.unit?.trim() || null,
        target: body.target != null ? Number(body.target) : null,
        baseline: body.baseline != null ? Number(body.baseline) : null,
        description: body.description?.trim() || null,
        isActive: body.isActive !== false,
      },
    });
    return json(indicator, 201);
  } catch {
    return error('Failed to create indicator', 500);
  }
}
