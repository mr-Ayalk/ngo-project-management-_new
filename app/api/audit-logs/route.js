export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAdmin } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;

    const logs = await prisma.auditLog.findMany({
      take: 100,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    return json(
      logs.map((log) => ({
        id: log.id,
        action: log.action,
        resource: log.resource,
        details: log.details ? JSON.parse(log.details) : null,
        ipAddress: log.ipAddress,
        createdAt: log.createdAt,
        userId: log.userId,
        userName: log.user.name,
        userEmail: log.user.email,
      }))
    );
  } catch (err) {
    console.error('Audit logs GET error:', err);
    return error('Failed to load audit logs', 500);
  }
}
