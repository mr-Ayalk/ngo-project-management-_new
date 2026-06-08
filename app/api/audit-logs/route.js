export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, requireAdmin } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAdmin(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const resource = searchParams.get('resource');
    const search = searchParams.get('search');
    const limit = Math.min(parseInt(searchParams.get('limit') || '200', 10), 500);

    const where = {};
    if (action && action !== 'all') where.action = action;
    if (resource && resource !== 'all') where.resource = resource;

    const logs = await prisma.auditLog.findMany({
      where,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    let result = logs;
    if (search) {
      const q = search.toLowerCase();
      result = logs.filter(
        (log) => log.user.name.toLowerCase().includes(q)
          || log.user.email.toLowerCase().includes(q)
          || log.action.toLowerCase().includes(q)
          || log.resource.toLowerCase().includes(q)
      );
    }

    return json(
      result.map((log) => ({
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
