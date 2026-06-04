export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, timeAgo, getInitials, AVATAR_COLORS } from '@/lib/api-utils';

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: { sender: { select: { id: true, name: true } } },
    });

    return json({
      enabled: true,
      messages: messages.reverse().map((m, i) => ({
        id: m.id,
        content: m.content,
        senderId: m.senderId,
        senderName: m.sender.name,
        initials: getInitials(m.sender.name),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        time: timeAgo(m.createdAt),
        createdAt: m.createdAt,
      })),
    });
  } catch (err) {
    console.error('Messages GET error:', err);
    return error('Failed to load messages', 500);
  }
}

export async function POST(req) {
  try {
    const body = await parseBody(req);
    if (!body?.content || !body?.senderId) return error('Content and sender are required');

    const message = await prisma.message.create({
      data: {
        content: body.content.trim(),
        senderId: body.senderId,
        recipientId: body.recipientId || null,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    return json(
      {
        id: message.id,
        content: message.content,
        senderName: message.sender.name,
        initials: getInitials(message.sender.name),
        time: 'Just now',
      },
      201
    );
  } catch (err) {
    console.error('Messages POST error:', err);
    return error('Failed to send message', 500);
  }
}
