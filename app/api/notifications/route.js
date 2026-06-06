export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, requireAuth, timeAgo } from '@/lib/api-utils';

function isDbUnavailable(err) {
  return err?.code === 'P1001' || err?.code === 'P1017' || err?.code === 'P2024';
}

const EMPTY_NOTIFICATIONS = { unreadCount: 0, notifications: [] };

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const notifications = await prisma.notification.findMany({
      where: { userId: auth.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId: auth.user.id, isRead: false },
    });

    return json({
      unreadCount,
      notifications: notifications.map((n) => ({
        id: n.id,
        title: n.title,
        message: n.message,
        type: n.type,
        projectId: n.projectId,
        taskId: n.taskId,
        linkType: n.linkType,
        isRead: n.isRead,
        time: timeAgo(n.createdAt),
        createdAt: n.createdAt,
      })),
    });
  } catch (err) {
    if (isDbUnavailable(err)) {
      console.warn('Notifications unavailable — database unreachable');
      return json(EMPTY_NOTIFICATIONS);
    }
    console.error('Notifications GET error:', err);
    return error('Failed to load notifications', 500);
  }
}

export async function PUT(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);

    if (body?.markAllRead) {
      await prisma.notification.updateMany({
        where: { userId: auth.user.id, isRead: false },
        data: { isRead: true },
      });
      return json({ success: true });
    }

    if (body?.id) {
      await prisma.notification.update({
        where: { id: body.id },
        data: { isRead: true },
      });
      return json({ success: true });
    }

    return error('Invalid request');
  } catch (err) {
    console.error('Notifications PUT error:', err);
    return error('Failed to update notifications', 500);
  }
}
