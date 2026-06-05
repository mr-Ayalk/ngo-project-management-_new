export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody } from '@/lib/api-utils';

export async function GET() {
  try {
    const org = await prisma.organization.findFirst();
    if (!org) return json({ name: 'Engage Now Africa', country: 'Ethiopia' });
    return json(org);
  } catch (err) {
    return error('Failed to load organization', 500);
  }
}

export async function PUT(req) {
  try {
    const body = await parseBody(req);
    const existing = await prisma.organization.findFirst();

    const data = {};
    if (body.name) data.name = body.name;
    if (body.email !== undefined) data.email = body.email;
    if (body.phone !== undefined) data.phone = body.phone;
    if (body.country !== undefined) data.country = body.country;
    if (body.location !== undefined) data.location = body.location;
    if (body.description !== undefined) data.description = body.description;
    if (body.dateFormat !== undefined) data.dateFormat = body.dateFormat;
    if (body.timezone !== undefined) data.timezone = body.timezone;
    if (body.fiscalYearStart !== undefined) data.fiscalYearStart = body.fiscalYearStart;

    let org;
    if (existing) {
      org = await prisma.organization.update({ where: { id: existing.id }, data });
    } else {
      org = await prisma.organization.create({ data: { name: body.name || 'Engage Now Africa', ...data } });
    }

    return json(org);
  } catch (err) {
    return error('Failed to update organization', 500);
  }
}
