export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, formatDate, requireAuth, requireManager } from '@/lib/api-utils';
import { logAudit, getClientIp } from '@/lib/audit';

const STATUSES = ['pending', 'in_transit', 'delivered', 'delayed', 'cancelled'];

function formatShipment(s) {
  return {
    id: s.id,
    reference: s.reference,
    description: s.description,
    origin: s.origin || '—',
    destination: s.destination,
    carrier: s.carrier || '—',
    status: s.status,
    statusLabel: s.status.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase()),
    priority: s.priority,
    items: s.items,
    quantity: s.quantity,
    expectedDate: s.expectedDate ? s.expectedDate.toISOString().slice(0, 10) : '',
    expectedLabel: s.expectedDate ? formatDate(s.expectedDate) : '—',
    deliveredDate: s.deliveredDate ? s.deliveredDate.toISOString().slice(0, 10) : '',
    deliveredLabel: s.deliveredDate ? formatDate(s.deliveredDate) : '—',
    notes: s.notes,
    projectId: s.projectId,
    createdAt: formatDate(s.createdAt),
  };
}

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    const search = searchParams.get('search');

    const where = {};
    if (status && status !== 'all') where.status = status;
    if (search) {
      where.OR = [
        { reference: { contains: search, mode: 'insensitive' } },
        { destination: { contains: search, mode: 'insensitive' } },
        { items: { contains: search, mode: 'insensitive' } },
      ];
    }

    const shipments = await prisma.logisticsShipment.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
    });

    const counts = {};
    for (const st of STATUSES) {
      counts[st] = await prisma.logisticsShipment.count({ where: { status: st } });
    }

    return json({
      shipments: shipments.map(formatShipment),
      stats: {
        total: shipments.length,
        pending: counts.pending,
        inTransit: counts.in_transit,
        delivered: counts.delivered,
        delayed: counts.delayed,
        cancelled: counts.cancelled,
      },
      statuses: STATUSES,
    });
  } catch (err) {
    console.error('Logistics GET error:', err);
    return error('Failed to load logistics', 500);
  }
}

export async function POST(req) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    if (!body?.reference?.trim()) return error('Reference is required');
    if (!body?.destination?.trim()) return error('Destination is required');

    const shipment = await prisma.logisticsShipment.create({
      data: {
        reference: body.reference.trim(),
        description: body.description?.trim() || null,
        origin: body.origin?.trim() || null,
        destination: body.destination.trim(),
        carrier: body.carrier?.trim() || null,
        status: STATUSES.includes(body.status) ? body.status : 'pending',
        priority: body.priority || 'normal',
        items: body.items?.trim() || null,
        quantity: parseInt(body.quantity, 10) || 1,
        expectedDate: body.expectedDate ? new Date(body.expectedDate) : null,
        deliveredDate: body.deliveredDate ? new Date(body.deliveredDate) : null,
        notes: body.notes?.trim() || null,
        projectId: body.projectId || null,
        createdById: user.id,
      },
    });

    await logAudit({
      userId: user.id,
      action: 'created',
      resource: 'logistics',
      details: { shipmentId: shipment.id, reference: shipment.reference },
      ipAddress: getClientIp(req),
    });

    return json(formatShipment(shipment), 201);
  } catch (err) {
    console.error('Logistics POST error:', err);
    return error('Failed to create shipment', 500);
  }
}
