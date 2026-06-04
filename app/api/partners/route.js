export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody } from '@/lib/api-utils';

function formatPartner(p) {
  return {
    id: p.id,
    name: p.name,
    type: p.type,
    desc: p.description,
    description: p.description,
    contact: p.contact,
    email: p.email,
    phone: p.phone,
    since: p.since,
    amount: p.amount,
  };
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');

    const where = {};
    if (type && type !== 'all') where.type = type;

    const partners = await prisma.partner.findMany({ where, orderBy: { name: 'asc' } });
    return json(partners.map(formatPartner));
  } catch (err) {
    console.error('Partners GET error:', err);
    return error('Failed to load partners', 500);
  }
}

export async function POST(req) {
  try {
    const body = await parseBody(req);
    if (!body?.name || !body?.type) return error('Name and type are required');

    const partner = await prisma.partner.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        contact: body.contact,
        email: body.email,
        phone: body.phone,
        since: body.since,
        amount: body.amount,
      },
    });

    return json(formatPartner(partner), 201);
  } catch (err) {
    return error('Failed to create partner', 500);
  }
}
