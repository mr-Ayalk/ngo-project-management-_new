export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireManager } from '@/lib/api-utils';

export async function GET() {
  try {
    const units = await prisma.orgUnit.findMany({ orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }] });
    return json(units);
  } catch {
    return error('Failed to load units', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const body = await parseBody(req);
    if (!body?.name?.trim()) return error('Unit name is required');

    const unit = await prisma.orgUnit.create({
      data: {
        name: body.name.trim(),
        code: body.code?.trim() || null,
        description: body.description?.trim() || null,
        isActive: body.isActive !== false,
        sortOrder: body.sortOrder || 0,
      },
    });
    return json(unit, 201);
  } catch {
    return error('Failed to create unit', 500);
  }
}
