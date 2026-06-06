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

export async function PUT(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const body = await parseBody(req);
    const existing = await prisma.logisticsShipment.findUnique({ where: { id: params.id } });
    if (!existing) return error('Shipment not found', 404);

    const data = {};
    if (body.reference !== undefined) data.reference = String(body.reference).trim();
    if (body.description !== undefined) data.description = body.description?.trim() || null;
    if (body.origin !== undefined) data.origin = body.origin?.trim() || null;
    if (body.destination !== undefined) data.destination = String(body.destination).trim();
    if (body.carrier !== undefined) data.carrier = body.carrier?.trim() || null;
    if (body.status !== undefined && STATUSES.includes(body.status)) data.status = body.status;
    if (body.priority !== undefined) data.priority = body.priority;
    if (body.items !== undefined) data.items = body.items?.trim() || null;
    if (body.quantity !== undefined) data.quantity = parseInt(body.quantity, 10) || 1;
    if (body.expectedDate !== undefined) data.expectedDate = body.expectedDate ? new Date(body.expectedDate) : null;
    if (body.deliveredDate !== undefined) data.deliveredDate = body.deliveredDate ? new Date(body.deliveredDate) : null;
    if (body.notes !== undefined) data.notes = body.notes?.trim() || null;
    if (body.projectId !== undefined) data.projectId = body.projectId || null;

    const shipment = await prisma.logisticsShipment.update({
      where: { id: params.id },
      data,
    });

    await logAudit({
      userId: user.id,
      action: 'updated',
      resource: 'logistics',
      details: { shipmentId: shipment.id },
      ipAddress: getClientIp(req),
    });

    return json(formatShipment(shipment));
  } catch (err) {
    console.error('Logistics PUT error:', err);
    return error('Failed to update shipment', 500);
  }
}

export async function DELETE(req, { params }) {
  try {
    const auth = await requireManager(req);
    if (auth.error) return auth.error;
    const user = auth.user;

    const existing = await prisma.logisticsShipment.findUnique({ where: { id: params.id } });
    if (!existing) return error('Shipment not found', 404);

    await prisma.logisticsShipment.delete({ where: { id: params.id } });

    await logAudit({
      userId: user.id,
      action: 'deleted',
      resource: 'logistics',
      details: { reference: existing.reference },
      ipAddress: getClientIp(req),
    });

    return json({ message: 'Shipment deleted' });
  } catch (err) {
    console.error('Logistics DELETE error:', err);
    return error('Failed to delete shipment', 500);
  }
}
