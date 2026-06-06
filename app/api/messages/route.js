export const dynamic = 'force-dynamic';

import prisma from '@/lib/db';
import { json, error, parseBody, timeAgo, getInitials, AVATAR_COLORS, requireAuth } from '@/lib/api-utils';

export async function GET(req) {
  try {
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const { searchParams } = new URL(req.url);
    const projectId = searchParams.get('projectId');
    const taskId = searchParams.get('taskId');

    const where = {};
    if (projectId) where.projectId = projectId;
    if (taskId) where.taskId = taskId;

    const messages = await prisma.message.findMany({
      where,
      take: 100,
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
        projectId: m.projectId,
        taskId: m.taskId,
        initials: getInitials(m.sender.name),
        color: AVATAR_COLORS[i % AVATAR_COLORS.length],
        isOwn: m.senderId === auth.user.id,
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
    const auth = await requireAuth(req);
    if (auth.error) return auth.error;

    const body = await parseBody(req);
    if (!body?.content) return error('Content is required');

    const message = await prisma.message.create({
      data: {
        content: body.content.trim(),
        senderId: auth.user.id,
        recipientId: body.recipientId || null,
        projectId: body.projectId || null,
        taskId: body.taskId || null,
      },
      include: { sender: { select: { id: true, name: true } } },
    });

    if (body.projectId && body.taskId) {
      const task = await prisma.task.findUnique({
        where: { id: body.taskId },
        select: { title: true, assigneeId: true, projectId: true },
      });
      const [members, project, admins] = await Promise.all([
        prisma.projectMember.findMany({
          where: { projectId: body.projectId },
          select: { userId: true },
        }),
        prisma.project.findUnique({
          where: { id: body.projectId },
          select: { name: true, managerId: true, leadId: true },
        }),
        prisma.user.findMany({
          where: { role: { in: ['admin', 'manager', 'project_manager'] }, isActive: true },
          select: { id: true },
        }),
      ]);

      const recipientIds = new Set();
      members.forEach((m) => { if (m.userId !== auth.user.id) recipientIds.add(m.userId); });
      if (project?.managerId && project.managerId !== auth.user.id) recipientIds.add(project.managerId);
      if (project?.leadId && project.leadId !== auth.user.id) recipientIds.add(project.leadId);
      if (task?.assigneeId && task.assigneeId !== auth.user.id) recipientIds.add(task.assigneeId);
      admins.forEach((a) => { if (a.id !== auth.user.id) recipientIds.add(a.id); });

      if (recipientIds.size > 0) {
        await prisma.notification.createMany({
          data: [...recipientIds].map((userId) => ({
            userId,
            title: `New message on "${task?.title || 'task'}"`,
            message: `${message.sender.name} in ${project?.name || 'project'}: ${body.content.trim().slice(0, 100)}`,
            type: 'task_message',
            projectId: body.projectId,
            taskId: body.taskId,
            linkType: 'task_message',
          })),
        });
      }
    }

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
